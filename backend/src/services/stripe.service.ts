import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

// R$ 4,99 em centavos
const AMOUNT_CENTS = 499;

type PaymentResourceType = 'message' | 'page';

interface PaymentTarget {
    resourceType: PaymentResourceType;
    resourceId: string;
}

function getStripe(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY não configurada');
    }
    return new Stripe(key);
}

export async function createCardPayment(messageId: string, userId: string) {
    return createCardPaymentForResource({ resourceType: 'message', resourceId: messageId }, userId);
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
                paymentProvider: 'stripe',
                paymentMethod: 'credit_card',
            },
        });
        return;
    }

    await prisma.page.update({
        where: { id: params.resourceId },
        data: {
            paymentId: params.paymentId,
            paymentProvider: 'stripe',
            paymentMethod: 'credit_card',
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

function resolveSuccessUrl(resourceType: PaymentResourceType, resourceId: string) {
    if (resourceType === 'page') {
        const template = process.env.STRIPE_CHECKOUT_SUCCESS_URL_PAGE
            ?? 'http://localhost:5173/payment/page/{pageId}/success';
        return template.replace('{pageId}', resourceId).replace('{resourceId}', resourceId);
    }

    const template = process.env.STRIPE_CHECKOUT_SUCCESS_URL
        ?? 'http://localhost:5173/payment/{messageId}/success';
    return template
        .replace('{messageId}', resourceId)
        .replace('{resourceId}', resourceId);
}

function resolveCancelUrl(resourceType: PaymentResourceType, resourceId: string) {
    if (resourceType === 'page') {
        const template = process.env.STRIPE_CHECKOUT_CANCEL_URL_PAGE
            ?? 'http://localhost:5173/payment/page/{pageId}';
        return template.replace('{pageId}', resourceId).replace('{resourceId}', resourceId);
    }

    const template = process.env.STRIPE_CHECKOUT_CANCEL_URL
        ?? 'http://localhost:5173/payment/{messageId}';
    return template
        .replace('{messageId}', resourceId)
        .replace('{resourceId}', resourceId);
}

function resolveProductDescription(params: {
    resourceType: PaymentResourceType;
    recipient?: string;
}) {
    if (params.resourceType === 'message') {
        return `Para: ${params.recipient ?? 'destinatario'}`;
    }

    return 'Publicacao de pagina personalizada';
}

export async function createCardPaymentForResource(target: PaymentTarget, userId: string) {
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

    const stripe = getStripe();

    const successUrl = resolveSuccessUrl(target.resourceType, target.resourceId);
    const cancelUrl = resolveCancelUrl(target.resourceType, target.resourceId);
    const metadata: Record<string, string> = {
        resourceType: target.resourceType,
        resourceId: target.resourceId,
        userId,
    };

    if (target.resourceType === 'message') {
        metadata.messageId = target.resourceId;
    }
    if (target.resourceType === 'page') {
        metadata.pageId = target.resourceId;
    }

    const recipient = target.resourceType === 'message' && 'recipient' in resource.data
        ? resource.data.recipient
        : undefined;

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: 'Correio Elegante',
                        description: resolveProductDescription({
                            resourceType: target.resourceType,
                            recipient,
                        }),
                    },
                    unit_amount: AMOUNT_CENTS,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
    };

    const session = await stripe.checkout.sessions.create(sessionPayload);

    await markResourcePaymentPending({
        resourceType: target.resourceType,
        resourceId: target.resourceId,
        paymentId: session.id,
    });

    return {
        sessionId: session.id,
        checkoutUrl: session.url,
    };
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new AppError('STRIPE_WEBHOOK_SECRET não configurado', 500);
    }
    if (!signature) {
        throw new AppError('Header stripe-signature obrigatorio', 400);
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
        throw new AppError('Assinatura do webhook inválida', 400);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const resourceType = session.metadata?.resourceType as PaymentResourceType | undefined;
        const resourceId = session.metadata?.resourceId;
        const messageId = session.metadata?.messageId;

        const target = resourceType && resourceId
            ? { resourceType, resourceId }
            : messageId
                ? { resourceType: 'message' as const, resourceId: messageId }
                : null;

        if (target && session.payment_status === 'paid') {
            await markResourcePaymentPaid(target);
        }
    }

    // Manter compatibilidade com payment_intent.succeeded para outros fluxos
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const resourceType = intent.metadata?.resourceType as PaymentResourceType | undefined;
        const resourceId = intent.metadata?.resourceId;
        const messageId = intent.metadata?.messageId;

        const target = resourceType && resourceId
            ? { resourceType, resourceId }
            : messageId
                ? { resourceType: 'message' as const, resourceId: messageId }
                : null;

        if (target) {
            await markResourcePaymentPaid(target);
        }
    }

    return { received: true };
}
