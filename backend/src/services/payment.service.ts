import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

function getStripe(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY não configurada');
    }
    return new Stripe(key);
}

export async function createPixPayment(messageId: string, userId: string) {
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

    // Valor fixo em centavos (R$ 4,99 = 499). Adapte conforme a lógica de preço do produto.
    const AMOUNT_CENTS = 499;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: AMOUNT_CENTS,
        currency: 'brl',
        payment_method_types: ['pix'],
        metadata: {
            messageId,
            userId,
        },
    });

    // Salva o paymentId no banco assim que o intent é criado
    await prisma.message.update({
        where: { id: messageId },
        data: { paymentId: paymentIntent.id },
    });

    const pixData = paymentIntent.next_action?.pix_display_qr_code;

    return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        // Estes campos são populados após o client confirmar o PaymentIntent com método PIX
        pixQrCode: pixData?.data ?? null,
        pixQrCodeImageUrl: pixData?.image_url_png ?? null,
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

export async function getPaymentStatus(messageId: string) {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { paymentStatus: true, paymentId: true },
    });

    if (!message) {
        throw new AppError('Mensagem não encontrada', 404);
    }

    return { status: message.paymentStatus, paymentId: message.paymentId };
}
