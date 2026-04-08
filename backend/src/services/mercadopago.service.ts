import MercadoPagoConfig, { Payment } from 'mercadopago';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

// R$ 4,99
const AMOUNT = 4.99;

type PaymentResourceType = 'message' | 'page';

interface PaymentTarget {
    resourceType: PaymentResourceType;
    resourceId: string;
}

function getMercadoPagoClient(): MercadoPagoConfig {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurada');
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

    const client = getMercadoPagoClient();
    const payment = new Payment(client);

    const result = await payment.create({
        body: {
            transaction_amount: AMOUNT,
            description: resolveDescription(target.resourceType),
            payment_method_id: 'pix',
            payer: {
                // Endereço de e-mail genérico para pagamentos sem identificação do pagador
                email: 'pagador@correioelegante.com.br',
            },
            metadata: {
                resource_type: target.resourceType,
                resource_id: target.resourceId,
                message_id: target.resourceType === 'message' ? target.resourceId : undefined,
                page_id: target.resourceType === 'page' ? target.resourceId : undefined,
                user_id: userId,
            },
        },
    });

    if (!result.id) {
        throw new AppError('Erro ao criar pagamento no Mercado Pago', 500);
    }

    await markResourcePaymentPending({
        resourceType: target.resourceType,
        resourceId: target.resourceId,
        paymentId: String(result.id),
    });

    const pixData = result.point_of_interaction?.transaction_data;

    return {
        paymentId: String(result.id),
        status: result.status ?? 'pending',
        pixQrCode: pixData?.qr_code ?? null,
        pixQrCodeBase64: pixData?.qr_code_base64 ?? null,
    };
}

export async function handleWebhook(body: Record<string, unknown>, signature: string, requestId: string) {
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new AppError('MERCADOPAGO_WEBHOOK_SECRET não configurado', 500);
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

            const target = resourceType && resourceId
                ? { resourceType, resourceId }
                : messageId
                    ? { resourceType: 'message' as const, resourceId: messageId }
                    : null;

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
