import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { generateAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

// Mock dos novos services de pagamento
vi.mock('../services/mercadopago.service', () => ({
    createPixPaymentForResource: vi.fn(),
    handleWebhook: vi.fn(),
}));

vi.mock('../services/stripe.service', () => ({
    createCardPaymentForResource: vi.fn(),
    handleWebhook: vi.fn(),
}));

import * as mercadopagoService from '../services/mercadopago.service';
import * as stripeService from '../services/stripe.service';

// IDs MongoDB válidos (24 chars hex)
const USER_ID = '507f1f77bcf86cd799439000';
const MSG_ID = '507f1f77bcf86cd799439011';
const PAGE_ID = '507f1f77bcf86cd799439022';

function makeToken(userId = USER_ID) {
    return generateAccessToken(userId);
}

const mockMessage = {
    id: MSG_ID,
    userId: USER_ID,
    recipient: 'Ana',
    message: 'Você é especial!',
    theme: 'classic',
    status: 'draft',
    visibility: 'public',
    publishedAt: null,
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
        vi.mocked(mercadopagoService.createPixPaymentForResource).mockResolvedValue({
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
        vi.mocked(stripeService.createCardPaymentForResource).mockResolvedValue({
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

    it('200 — cria pagamento Pix para pagina (resourceType/resourceId)', async () => {
        vi.mocked(mercadopagoService.createPixPaymentForResource).mockResolvedValue({
            paymentId: '987654321',
            status: 'pending',
            pixQrCode: 'pix_qr_code_page',
            pixQrCodeBase64: null,
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ resourceType: 'page', resourceId: PAGE_ID, paymentMethod: 'pix' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('paymentId', '987654321');
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

    it('400 — messageId inválido (não é ObjectId)', async () => {
        const token = makeToken(USER_ID);
        const res = await request(app)
            .post('/api/payments/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ messageId: 'editor', paymentMethod: 'pix' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/messageId inválido/i);
        expect(mercadopagoService.createPixPaymentForResource).not.toHaveBeenCalled();
        expect(stripeService.createCardPaymentForResource).not.toHaveBeenCalled();
    });

    it('404 — mensagem não encontrada', async () => {
        vi.mocked(mercadopagoService.createPixPaymentForResource).mockRejectedValue(
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
        vi.mocked(mercadopagoService.createPixPaymentForResource).mockRejectedValue(
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
        vi.mocked(mercadopagoService.createPixPaymentForResource).mockRejectedValue(
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

describe('GET /api/payments/status/:resourceType/:resourceId', () => {
    it('200 — retorna status paid para pagina', async () => {
        vi.mocked(prisma.page.findUnique).mockResolvedValue({
            id: PAGE_ID,
            userId: USER_ID,
            content: {
                blocks: [],
                version: 1,
            },
            status: 'draft',
            visibility: 'public',
            publishedAt: null,
            paymentStatus: 'paid',
            paymentId: 'pi_page_123',
            paymentProvider: 'stripe',
            paymentMethod: 'credit_card',
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/page/${PAGE_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('paid');
        expect(res.body.paymentId).toBe('pi_page_123');
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

    it('400 — sem header stripe-signature', async () => {
        const res = await request(app)
            .post('/api/payments/webhook/stripe')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ type: 'checkout.session.completed' }));

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/stripe-signature/i);
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

    it('400 — sem header x-signature', async () => {
        const res = await request(app)
            .post('/api/payments/webhook/mercadopago')
            .set('x-request-id', 'req-test-123')
            .set('Content-Type', 'application/json')
            .send({ type: 'payment', data: { id: '123456789' } });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/x-signature/i);
    });

    it('400 — sem header x-request-id', async () => {
        const res = await request(app)
            .post('/api/payments/webhook/mercadopago')
            .set('x-signature', 'ts=12345,v1=hashvalid')
            .set('Content-Type', 'application/json')
            .send({ type: 'payment', data: { id: '123456789' } });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/x-request-id/i);
    });
});

describe('GET /api/payments/status/:resourceType/:resourceId — validação de resourceType', () => {
    it('400 — resourceType inválido', async () => {
        const token = makeToken(USER_ID);
        const res = await request(app)
            .get(`/api/payments/status/invalid/${PAGE_ID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/resourceType invalido/i);
    });
});
