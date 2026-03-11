import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

// R$ 4,99 em centavos
const AMOUNT_CENTS = 499;

function getStripe(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY não configurada');
    }
    return new Stripe(key);
}

export async function createCardPayment(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
        throw new AppError('Mensagem não encontrada', 404);
    }
    if (message.userId !== userId) {
        throw new AppError('Sem permissão', 403);
    }
    if (message.paymentStatus === 'paid') {
        throw new AppError('Pagamento já realizado', 400);
    }

    const stripe = getStripe();

    const successUrl = (process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? 'http://localhost:5173/payment/{messageId}/success')
        .replace('{messageId}', messageId);
    const cancelUrl = (process.env.STRIPE_CHECKOUT_CANCEL_URL ?? 'http://localhost:5173/payment/{messageId}')
        .replace('{messageId}', messageId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: 'Correio Elegante',
                        description: `Para: ${message.recipient}`,
                    },
                    unit_amount: AMOUNT_CENTS,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            messageId,
            userId,
        },
    });

    await prisma.message.update({
        where: { id: messageId },
        data: {
            paymentId: session.id,
            paymentProvider: 'stripe',
            paymentMethod: 'credit_card',
        },
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

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
        throw new AppError('Assinatura do webhook inválida', 400);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const messageId = session.metadata?.messageId;

        if (messageId && session.payment_status === 'paid') {
            await prisma.message.update({
                where: { id: messageId },
                data: { paymentStatus: 'paid' },
            });
        }
    }

    // Manter compatibilidade com payment_intent.succeeded para outros fluxos
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        const messageId = intent.metadata?.messageId;

        if (messageId) {
            await prisma.message.update({
                where: { id: messageId },
                data: { paymentStatus: 'paid' },
            });
        }
    }

    return { received: true };
}
