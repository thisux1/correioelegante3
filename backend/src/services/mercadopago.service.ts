import MercadoPagoConfig, { Payment } from 'mercadopago';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

// R$ 4,99
const AMOUNT = 4.99;

function getMercadoPagoClient(): MercadoPagoConfig {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurada');
    }
    return new MercadoPagoConfig({ accessToken: token });
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

    const client = getMercadoPagoClient();
    const payment = new Payment(client);

    const result = await payment.create({
        body: {
            transaction_amount: AMOUNT,
            description: 'Correio Elegante',
            payment_method_id: 'pix',
            payer: {
                // Endereço de e-mail genérico para pagamentos sem identificação do pagador
                email: 'pagador@correioelegante.com.br',
            },
            metadata: {
                message_id: messageId,
                user_id: userId,
            },
        },
    });

    if (!result.id) {
        throw new AppError('Erro ao criar pagamento no Mercado Pago', 500);
    }

    await prisma.message.update({
        where: { id: messageId },
        data: {
            paymentId: String(result.id),
            paymentProvider: 'mercadopago',
            paymentMethod: 'pix',
        },
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

    // Validação de assinatura do Mercado Pago
    // Formato: ts=<timestamp>,v1=<hash>
    const parts = signature.split(',');
    const tsPart = parts.find(p => p.startsWith('ts='));
    const v1Part = parts.find(p => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
        throw new AppError('Assinatura do webhook inválida', 400);
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];

    // Template: id:<data.id>;request-id:<x-request-id>;ts:<ts>
    const dataId = (body.data as Record<string, unknown>)?.id as string | undefined;
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
            const messageId = result.metadata?.message_id as string | undefined;
            if (messageId) {
                await prisma.message.update({
                    where: { id: messageId },
                    data: { paymentStatus: 'paid' },
                });
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
