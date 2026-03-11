import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { generateAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

// Mock dos novos services de pagamento
vi.mock('../services/mercadopago.service', () => ({
    createPixPayment: vi.fn(),
    handleWebhook: vi.fn(),
}));

vi.mock('../services/stripe.service', () => ({
    createCardPayment: vi.fn(),
    handleWebhook: vi.fn(),
}));

import * as mercadopagoService from '../services/mercadopago.service';
import * as stripeService from '../services/stripe.service';

// IDs MongoDB válidos (24 chars hex)
const USER_ID = '507f1f77bcf86cd799439000';
const MSG_ID = '507f1f77bcf86cd799439011';

function makeToken(userId = USER_ID) {
    return generateAccessToken(userId);
}

const mockMessage = {
    id: MSG_ID,
    userId: USER_ID,
    recipient: 'Ana',
    message: 'Você é especial!',
    theme: 'classic',
    mediaUrl: null,
    paymentStatus: 'pending',
    paymentId: null,
    paymentProvider: null,
    paymentMethod: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

// ── POST /api/payments/create ─────────────────────────────────────────────────
describe('POST /api/payments/create', () => {
    it('200 — cria pagamento Pix para mensagem pendente', async () => {
        vi.mocked(mercadopagoService.createPixPayment).mockResolvedValue({
            paymentId: '123456789',
            status: 'pending',
            pixQrCode: 'pix_qr_code_data',
            pixQrCodeBase64: null,
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID, paymentMethod: 'pix' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('paymentId', '123456789');
    });

    it('200 — cria pagamento por cartão para mensagem pendente', async () => {
        vi.mocked(stripeService.createCardPayment).mockResolvedValue({
            sessionId: 'cs_test_123',
            checkoutUrl: 'https://checkout.stripe.com/cs_test_123',
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID, paymentMethod: 'credit_card' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('checkoutUrl');
    });

    it('400 — paymentMethod inválido', async () => {
        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID, paymentMethod: 'boleto_invalido' });

        expect(res.status).toBe(400);
    });

    it('400 — sem paymentMethod', async () => {
        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID });

        expect(res.status).toBe(400);
    });

    it('404 — mensagem não encontrada', async () => {
        vi.mocked(mercadopagoService.createPixPayment).mockRejectedValue(
            new AppError('Mensagem não encontrada', 404)
        );

        const token = makeToken();
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID, paymentMethod: 'pix' });

        expect(res.status).toBe(404);
    });

    it('403 — mensagem de outro usuário', async () => {
        vi.mocked(mercadopagoService.createPixPayment).mockRejectedValue(
            new AppError('Sem permissão', 403)
        );

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID, paymentMethod: 'pix' });

        expect(res.status).toBe(403);
    });

    it('400 — mensagem já paga', async () => {
        vi.mocked(mercadopagoService.createPixPayment).mockRejectedValue(
            new AppError('Pagamento já realizado', 400)
        );

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID, paymentMethod: 'pix' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/já realizado/i);
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app)
            .post('/api/payments/create')
            .send({ messageId: MSG_ID, paymentMethod: 'pix' });

        expect(res.status).toBe(401);
    });
});

// ── GET /api/payments/status/:messageId ───────────────────────────────────────
describe('GET /api/payments/status/:messageId', () => {
    it('200 — retorna status pending', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(mockMessage);

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('pending');
    });

    it('200 — retorna status paid', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...mockMessage,
            paymentStatus: 'paid',
            paymentId: '123456789',
            paymentProvider: 'mercadopago',
            paymentMethod: 'pix',
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('paid');
    });

    it('403 — acessar status de mensagem de outro usuário', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...mockMessage,
            userId: '507f1f77bcf86cd799439099', // outro usuário
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app).get(`/api/payments/status/${MSG_ID}`);
        expect(res.status).toBe(401);
    });

    it('404 — mensagem não encontrada', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

// ── POST /api/payments/webhook/stripe ────────────────────────────────────────
describe('POST /api/payments/webhook/stripe', () => {
    it('200 — processa webhook com assinatura válida', async () => {
        vi.mocked(stripeService.handleWebhook).mockResolvedValue({ received: true });

        const res = await request(app)
            .post('/api/payments/webhook/stripe')
            .set('stripe-signature', 'sig_test_valid')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ type: 'checkout.session.completed' }));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('received', true);
    });

    it('400 — assinatura inválida do webhook Stripe', async () => {
        vi.mocked(stripeService.handleWebhook).mockRejectedValue(
            new AppError('Assinatura do webhook inválida', 400)
        );

        const res = await request(app)
            .post('/api/payments/webhook/stripe')
            .set('stripe-signature', 'sig_invalid')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ type: 'checkout.session.completed' }));

        expect(res.status).toBe(400);
    });
});

// ── POST /api/payments/webhook/mercadopago ────────────────────────────────────
describe('POST /api/payments/webhook/mercadopago', () => {
    it('200 — processa webhook do Mercado Pago', async () => {
        vi.mocked(mercadopagoService.handleWebhook).mockResolvedValue({ received: true });

        const res = await request(app)
            .post('/api/payments/webhook/mercadopago')
            .set('x-signature', 'ts=12345,v1=hashvalid')
            .set('x-request-id', 'req-test-123')
            .set('Content-Type', 'application/json')
            .send({ type: 'payment', data: { id: '123456789' } });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('received', true);
    });
});
