import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { generateAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

// Mock COMPLETO do serviço de pagamento — nenhum método chamar Stripe ou Prisma real
vi.mock('../services/payment.service', () => ({
    createPixPayment: vi.fn(),
    handleWebhook: vi.fn(),
    getPaymentStatus: vi.fn(),
}));

import * as paymentService from '../services/payment.service';

// IDs MongoDB válidos (24 chars hex)
const USER_ID = '507f1f77bcf86cd799439000';
const MSG_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439099';

function makeToken(userId = USER_ID) {
    return generateAccessToken(userId);
}

// ── POST /api/payments/create ─────────────────────────────────────────────────
describe('POST /api/payments/create', () => {
    it('200 — cria pagamento para mensagem pendente', async () => {
        vi.mocked(paymentService.createPixPayment).mockResolvedValue({
            paymentIntentId: 'pi_test_123',
            clientSecret: 'pi_test_123_secret',
            status: 'requires_action',
            pixQrCode: 'pix_qr_code_data',
            pixQrCodeImageUrl: 'https://example.com/qr.png',
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('paymentIntentId', 'pi_test_123');
    });

    it('404 — mensagem não encontrada', async () => {
        vi.mocked(paymentService.createPixPayment).mockRejectedValue(
            new AppError('Mensagem não encontrada', 404)
        );

        const token = makeToken();
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID });

        expect(res.status).toBe(404);
    });

    it('403 — mensagem de outro usuário', async () => {
        vi.mocked(paymentService.createPixPayment).mockRejectedValue(
            new AppError('Sem permissão', 403)
        );

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID });

        expect(res.status).toBe(403);
    });

    it('400 — mensagem já paga', async () => {
        vi.mocked(paymentService.createPixPayment).mockRejectedValue(
            new AppError('Pagamento já realizado', 400)
        );

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: MSG_ID });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/já realizado/i);
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app)
            .post('/api/payments/create')
            .send({ messageId: MSG_ID });

        expect(res.status).toBe(401);
    });
});

// ── GET /api/payments/status/:messageId ───────────────────────────────────────
describe('GET /api/payments/status/:messageId', () => {
    it('200 — retorna status pending', async () => {
        vi.mocked(paymentService.getPaymentStatus).mockResolvedValue({
            status: 'pending',
            paymentId: null,
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('pending');
    });

    it('200 — retorna status paid', async () => {
        vi.mocked(paymentService.getPaymentStatus).mockResolvedValue({
            status: 'paid',
            paymentId: 'pi_test_123',
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('paid');
    });

    it('403 — acessar status de mensagem de outro usuário', async () => {
        vi.mocked(paymentService.getPaymentStatus).mockRejectedValue(
            new AppError('Sem permissão', 403)
        );

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
        vi.mocked(paymentService.getPaymentStatus).mockRejectedValue(
            new AppError('Mensagem não encontrada', 404)
        );

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/${MSG_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

// ── POST /api/payments/webhook ────────────────────────────────────────────────
describe('POST /api/payments/webhook', () => {
    it('200 — processa webhook com assinatura válida', async () => {
        vi.mocked(paymentService.handleWebhook).mockResolvedValue({ received: true });

        const res = await request(app)
            .post('/api/payments/webhook')
            .set('stripe-signature', 'sig_test_valid')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('received', true);
    });

    it('400 — assinatura inválida do webhook', async () => {
        vi.mocked(paymentService.handleWebhook).mockRejectedValue(
            new AppError('Assinatura do webhook inválida', 400)
        );

        const res = await request(app)
            .post('/api/payments/webhook')
            .set('stripe-signature', 'sig_invalid')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

        expect(res.status).toBe(400);
    });
});
