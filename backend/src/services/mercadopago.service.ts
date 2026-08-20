import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { activateUserSubscription } from './subscription.service';

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
    const rawEmail = user?.email?.trim() || '';
    const isSandbox = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-');
    const isSellerEmail = rawEmail.toLowerCase() === 'thicosta1432@gmail.com' || rawEmail.toLowerCase() === 'thiagocostabr74@gmail.com';
    const isTestUserDomain = rawEmail.toLowerCase().includes('@testuser.com');
    const payerEmail = isSandbox
        ? (isTestUserDomain ? rawEmail : 'test_user_comprador@testuser.com')
        : ((!rawEmail || isSellerEmail) ? 'comprador_correio@example.com' : rawEmail);

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
                idempotencyKey: crypto.randomBytes(16).toString('hex'),
            },
        });
    } catch (mpErr) {
        console.warn('Mercado Pago Pix direct API unavailable or live credentials unverified. Falling back to Mercado Pago Checkout Preference:', mpErr);
        try {
            return await createMercadoPagoPreferenceForResource(target, userId);
        } catch (prefErr) {
            console.error('Mercado Pago Preference fallback error:', prefErr);
            throw new AppError(
                'Não foi possível gerar o pagamento Pix no momento. Tente novamente em instantes.',
                502,
                'PAYMENT_CREATION_FAILED',
            );
        }
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

    // Se não retornou QR code direto, tenta fallback para Preference
    try {
        return await createMercadoPagoPreferenceForResource(target, userId);
    } catch {
        throw new AppError(
            'Não foi possível carregar os dados do Pix no momento. Tente novamente em instantes.',
            502,
            'PAYMENT_DATA_UNAVAILABLE',
        );
    }
}

export async function createMercadoPagoPreferenceForResource(target: PaymentTarget, userId: string) {
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
    const rawEmail = user?.email?.trim() || '';
    const isSandbox = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-');
    const isSellerEmail = rawEmail.toLowerCase() === 'thicosta1432@gmail.com' || rawEmail.toLowerCase() === 'thiagocostabr74@gmail.com';
    const isTestUserDomain = rawEmail.toLowerCase().includes('@testuser.com');

    const client = getMercadoPagoClient();
    const preference = new Preference(client);

    const rawBaseUrl = (process.env.FRONTEND_URL || '').trim();
    const baseUrl = (!rawBaseUrl || rawBaseUrl.includes('correioelegantevercel.app'))
        ? (process.env.NODE_ENV === 'production' ? 'https://www.correioelegante.studio' : 'http://localhost:5173')
        : rawBaseUrl.replace(/\/+$/, '');

    const isHttps = baseUrl.startsWith('https://');

    const successUrl = isHttps
        ? (target.resourceType === 'message'
            ? `${baseUrl}/payment/${target.resourceId}/success`
            : `${baseUrl}/payment/page/${target.resourceId}/success`)
        : 'https://www.correioelegante.studio/payment/success';

    const cancelUrl = isHttps
        ? (target.resourceType === 'message'
            ? `${baseUrl}/payment/${target.resourceId}`
            : `${baseUrl}/payment/page/${target.resourceId}`)
        : 'https://www.correioelegante.studio/payment/cancel';

    const notificationUrl = isHttps
        ? `${baseUrl}/api/payment/webhook/mercadopago`
        : undefined;

    const prefBody: Record<string, unknown> = {
        items: [
            {
                id: target.resourceId,
                title: resolveDescription(target.resourceType),
                description: 'Correio Elegante Digital - Envio e personalização de mensagem/página',
                category_id: 'services',
                unit_price: AMOUNT,
                quantity: 1,
                currency_id: 'BRL',
            },
        ],
        back_urls: {
            success: successUrl,
            pending: successUrl,
            failure: cancelUrl,
        },
        auto_return: 'approved',
        statement_descriptor: 'CORREIOELEGAN',
        notification_url: notificationUrl,
        metadata: {
            resource_type: target.resourceType,
            resource_id: target.resourceId,
            message_id: target.resourceType === 'message' ? target.resourceId : undefined,
            page_id: target.resourceType === 'page' ? target.resourceId : undefined,
            user_id: userId,
        },
        external_reference: `${target.resourceType}:${target.resourceId}`,
    };

    // Em Sandbox, não enviamos email real de usuário como pagador para evitar conflito de ambientes
    if (!isSandbox && user?.email && !isSellerEmail) {
        prefBody.payer = {
            email: user.email,
        };
    } else if (isSandbox && user?.email && isTestUserDomain) {
        prefBody.payer = {
            email: user.email,
        };
    }

    const prefResult = await preference.create({
        body: prefBody as Parameters<typeof preference.create>[0]['body'],
    });

    if (prefResult && prefResult.id) {
        await markResourcePaymentPending({
            resourceType: target.resourceType,
            resourceId: target.resourceId,
            paymentId: String(prefResult.id),
        });

        const checkoutUrl = prefResult.init_point || prefResult.sandbox_init_point;

        return {
            paymentId: String(prefResult.id),
            status: 'pending',
            pixQrCode: null,
            pixQrCodeBase64: null,
            pixExpiresAt: null,
            preferenceId: String(prefResult.id),
            checkoutUrl,
        };
    }

    throw new AppError('Não foi possível gerar o Checkout do Mercado Pago no momento. Tente novamente em instantes.', 502);
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
        try {
            const client = getMercadoPagoClient();
            const paymentClient = new Payment(client);
            const result = await paymentClient.get({ id: dataId });

            if (result.status === 'approved') {
                const resourceType = (result.metadata?.resource_type ?? result.metadata?.resourceType) as string | undefined;
                const resourceId = (result.metadata?.resource_id ?? result.metadata?.resourceId) as string | undefined;
                const messageId = (result.metadata?.message_id ?? result.metadata?.messageId) as string | undefined;
                const metaUserId = (result.metadata?.user_id ?? result.metadata?.userId) as string | undefined;

                // Tratamento de Assinatura Ilimitada
                const externalReference = result.external_reference as string | undefined;
                if (resourceType === 'subscription' || externalReference?.startsWith('subscription:')) {
                    const subUserId = metaUserId || (externalReference?.startsWith('subscription:') ? externalReference.split(':')[1] : undefined);
                    if (subUserId) {
                        await activateUserSubscription({
                            userId: subUserId,
                            provider: 'mercadopago',
                            providerPaymentId: String(result.id),
                            paymentMethod: result.payment_method_id ?? 'pix',
                        });
                    }
                    return { received: true };
                }

                // Fallback via external_reference (formato "resourceType:resourceId")
                let externalTarget: PaymentTarget | null = null;
                if (externalReference?.includes(':') && !externalReference.startsWith('subscription:')) {
                    const [extType, extId] = externalReference.split(':');
                    if ((extType === 'message' || extType === 'page') && extId) {
                        externalTarget = { resourceType: extType, resourceId: extId };
                    }
                }

                const target: PaymentTarget | null = (resourceType === 'message' || resourceType === 'page') && resourceId
                    ? { resourceType, resourceId }
                    : messageId
                        ? { resourceType: 'message', resourceId: messageId }
                        : externalTarget;

                if (target) {
                    await markResourcePaymentPaid(target);
                }
            }
        } catch {
            // Ignorar falha de busca para IDs simulados ou expirados
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
