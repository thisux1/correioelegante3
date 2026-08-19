import MercadoPagoConfig, { Payment } from 'mercadopago';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

// R$ 4,99
const AMOUNT = 4.99;

// Expiração do QR Code Pix em minutos (padrão recomendado pelo Mercado Pago: 30 min)
const PIX_EXPIRATION_MINUTES = Number(process.env.PIX_EXPIRATION_MINUTES) || 30;

type PaymentResourceType = 'message' | 'page';

interface PaymentTarget {
    resourceType: PaymentResourceType;
    resourceId: string;
}

function getMercadoPagoClient(): MercadoPagoConfig {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
    if (!token) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN (ou MP_ACCESS_TOKEN) não configurada');
    }
    return new MercadoPagoConfig({ accessToken: token });
}

export async function createPixPayment(messageId: string, userId: string) {
    return createPixPaymentForResource({ resourceType: 'message', resourceId: messageId }, userId);
}

async function resolveResource(target: PaymentTarget) {
    if (target.resourceType === 'message') {
        const message = await prisma.message.findUnique({ where: { id: target.resourceId } });
        return {
            resourceType: 'message' as const,
            data: message,
        };
    }

    const page = await prisma.page.findUnique({ where: { id: target.resourceId } });
    return {
        resourceType: 'page' as const,
        data: page,
    };
}

async function markResourcePaymentPending(params: {
    resourceType: PaymentResourceType;
    resourceId: string;
    paymentId: string;
}) {
    if (params.resourceType === 'message') {
        await prisma.message.update({
            where: { id: params.resourceId },
            data: {
                paymentId: params.paymentId,
                paymentProvider: 'mercadopago',
                paymentMethod: 'pix',
            },
        });
        return;
    }

    await prisma.page.update({
        where: { id: params.resourceId },
        data: {
            paymentId: params.paymentId,
            paymentProvider: 'mercadopago',
            paymentMethod: 'pix',
        },
    });
}

async function markResourcePaymentPaid(target: PaymentTarget) {
    if (target.resourceType === 'message') {
        await prisma.message.updateMany({
            where: {
                id: target.resourceId,
                paymentStatus: { not: 'paid' },
            },
            data: {
                paymentStatus: 'paid',
                status: 'published',
                publishedAt: new Date(),
            },
        });
        return;
    }

    await prisma.page.updateMany({
        where: {
            id: target.resourceId,
            paymentStatus: { not: 'paid' },
        },
        data: {
            paymentStatus: 'paid',
            status: 'published',
            publishedAt: new Date(),
        },
    });
}

function resolveDescription(resourceType: PaymentResourceType) {
    return resourceType === 'message' ? 'Correio Elegante' : 'Correio Elegante - Pagina personalizada';
}

export async function createPixPaymentForResource(target: PaymentTarget, userId: string) {
    const resource = await resolveResource(target);

    if (!resource.data) {
        throw new AppError(
            target.resourceType === 'message' ? 'Mensagem não encontrada' : 'Pagina nao encontrada',
            404,
        );
    }
    if (resource.data.userId !== userId) {
        throw new AppError('Sem permissão', 403);
    }
    if (resource.data.paymentStatus === 'paid') {
        throw new AppError('Pagamento já realizado', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const payerEmail = user?.email && user.email.includes('@')
        ? user.email
        : 'contato@correioelegante.com.br';

    const expiresAt = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);
    const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL || process.env.MP_NOTIFICATION_URL;

    const client = getMercadoPagoClient();
    const payment = new Payment(client);

    const paymentBody: Record<string, unknown> = {
        transaction_amount: AMOUNT,
        description: resolveDescription(target.resourceType),
        payment_method_id: 'pix',
        statement_descriptor: 'CORREIOELEG',
        date_of_expiration: expiresAt.toISOString(),
        external_reference: `${target.resourceType}:${target.resourceId}`,
        payer: {
            email: payerEmail,
            first_name: 'Cliente',
            last_name: 'Elegante',
            identification: {
                type: 'CPF',
                number: '19119119100',
            },
        },
        metadata: {
            resource_type: target.resourceType,
            resource_id: target.resourceId,
            message_id: target.resourceType === 'message' ? target.resourceId : undefined,
            page_id: target.resourceType === 'page' ? target.resourceId : undefined,
            user_id: userId,
        },
    };

    if (notificationUrl) {
        paymentBody.notification_url = notificationUrl;
    }

    let result;
    try {
        result = await payment.create({
            body: paymentBody,
            requestOptions: {
                idempotencyKey: `pix_${target.resourceType}_${target.resourceId}`,
            },
        });
    } catch (mpErr) {
        console.error('Mercado Pago Pix payment creation error:', mpErr);
        throw new AppError(
            'Não foi possível gerar o pagamento Pix no momento. Tente novamente em instantes.',
            502,
            'PAYMENT_CREATION_FAILED',
        );
    }

    if (result && result.id && result.point_of_interaction?.transaction_data?.qr_code) {
        await markResourcePaymentPending({
            resourceType: target.resourceType,
            resourceId: target.resourceId,
            paymentId: String(result.id),
        });

        const pixData = result.point_of_interaction.transaction_data;
        return {
            paymentId: String(result.id),
            status: result.status ?? 'pending',
            pixQrCode: pixData.qr_code ?? null,
            pixQrCodeBase64: pixData.qr_code_base64 ?? null,
            pixExpiresAt: expiresAt.toISOString(),
            preferenceId: null,
            checkoutUrl: null,
        };
    }

    throw new AppError(
        'Não foi possível carregar os dados do Pix no momento. Tente novamente em instantes.',
        502,
        'PAYMENT_DATA_UNAVAILABLE',
    );
}

export async function handleWebhook(body: Record<string, unknown>, signature: string, requestId: string) {
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new AppError('MERCADOPAGO_WEBHOOK_SECRET (ou MP_WEBHOOK_SECRET) não configurado', 500);
    }
    if (!signature) {
        throw new AppError('Header x-signature obrigatorio', 400);
    }
    if (!requestId) {
        throw new AppError('Header x-request-id obrigatorio', 400);
    }

    // Validação de assinatura do Mercado Pago
    // Formato: ts=<timestamp>,v1=<hash>
    const parts = signature.split(',').map(part => part.trim());
    const tsPart = parts.find(p => p.startsWith('ts='));
    const v1Part = parts.find(p => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
        throw new AppError('Assinatura do webhook inválida', 400);
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];

    // Template: id:<data.id>;request-id:<x-request-id>;ts:<ts>
    const rawDataId = (body.data as Record<string, unknown> | undefined)?.id;
    const dataId = typeof rawDataId === 'string' || typeof rawDataId === 'number'
        ? String(rawDataId)
        : undefined;
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts}`;
    const expectedHash = crypto
        .createHmac('sha256', webhookSecret)
        .update(manifest)
        .digest('hex');

    if (expectedHash !== v1) {
        throw new AppError('Assinatura do webhook inválida', 400);
    }

    // Processar eventos de pagamento
    if (body.type === 'payment' && dataId) {
        const client = getMercadoPagoClient();
        const paymentClient = new Payment(client);
        const result = await paymentClient.get({ id: dataId });

        if (result.status === 'approved') {
            const resourceType = result.metadata?.resource_type as PaymentResourceType | undefined;
            const resourceId = result.metadata?.resource_id as string | undefined;
            const messageId = result.metadata?.message_id as string | undefined;

            // Fallback via external_reference (formato "resourceType:resourceId")
            let externalTarget: PaymentTarget | null = null;
            const externalReference = result.external_reference as string | undefined;
            if (externalReference?.includes(':')) {
                const [extType, extId] = externalReference.split(':');
                if ((extType === 'message' || extType === 'page') && extId) {
                    externalTarget = { resourceType: extType, resourceId: extId };
                }
            }

            const target = resourceType && resourceId
                ? { resourceType, resourceId }
                : messageId
                    ? { resourceType: 'message' as const, resourceId: messageId }
                    : externalTarget;

            if (target) {
                await markResourcePaymentPaid(target);
            }
        }
    }

    return { received: true };
}

export async function getPaymentStatus(paymentId: string): Promise<string> {
    const client = getMercadoPagoClient();
    const paymentClient = new Payment(client);
    const result = await paymentClient.get({ id: paymentId });
    return result.status ?? 'pending';
}
