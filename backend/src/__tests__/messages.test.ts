import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

// Helper: gera token válido
function makeToken(userId = '507f1f77bcf86cd799439000') {
    return generateAccessToken(userId);
}

type MockMessageRecord = {
    id: string;
    userId: string;
    recipient: string;
    message: string;
    theme: string;
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'private' | 'unlisted';
    publishedAt: Date | null;
    mediaUrl: string | null;
    paymentStatus: 'pending' | 'paid';
    paymentId: string | null;
    paymentProvider: string | null;
    paymentMethod: string | null;
    createdAt: Date;
    updatedAt: Date;
};

const mockMessage: MockMessageRecord = {
    id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439000',
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

// ── POST /api/messages ────────────────────────────────────────────────────────
describe('POST /api/messages', () => {
    it('201 — cria mensagem com dados válidos', async () => {
        vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);

        const token = makeToken();
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({ recipient: 'Ana', message: 'Você é especial!', theme: 'classic' });

        expect(res.status).toBe(201);
        expect(res.body.message).toHaveProperty('id');
        expect(res.body.message.recipient).toBe('Ana');
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app)
            .post('/api/messages')
            .send({ recipient: 'Ana', message: 'Olá!', theme: 'classic' });

        expect(res.status).toBe(401);
    });

    it('400 — recipient ausente', async () => {
        const token = makeToken();
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({ message: 'Olá!', theme: 'classic' });

        expect(res.status).toBe(400);
    });

    it('400 — message ausente', async () => {
        const token = makeToken();
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({ recipient: 'Ana', theme: 'classic' });

        expect(res.status).toBe(400);
    });

    it('400 — published sem publishedAt', async () => {
        const token = makeToken();
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({
                recipient: 'Ana',
                message: 'Mensagem pronta',
                theme: 'classic',
                status: 'published',
                visibility: 'public',
            });

        expect(res.status).toBe(400);
    });

    it('400 — draft com publishedAt', async () => {
        const token = makeToken();
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({
                recipient: 'Ana',
                message: 'Rascunho com data inválida',
                theme: 'classic',
                status: 'draft',
                visibility: 'public',
                publishedAt: '2026-03-19T12:00:00.000Z',
            });

        expect(res.status).toBe(400);
    });
});

// ── GET /api/messages ─────────────────────────────────────────────────────────
describe('GET /api/messages', () => {
    it('200 — lista mensagens do usuário autenticado', async () => {
        vi.mocked(prisma.message.findMany).mockResolvedValue([mockMessage]);

        const token = makeToken();
        const res = await request(app)
            .get('/api/messages')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.messages).toHaveLength(1);
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app).get('/api/messages');
        expect(res.status).toBe(401);
    });
});

// ── GET /api/messages/:id ─────────────────────────────────────────────────────
describe('GET /api/messages/:id', () => {
    it('200 — retorna mensagem do próprio usuário', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(mockMessage);

        const token = makeToken('507f1f77bcf86cd799439000');
        const res = await request(app)
            .get(`/api/messages/${mockMessage.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message.id).toBe('507f1f77bcf86cd799439011');
    });

    it('403 — tentar acessar mensagem de outro usuário', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...mockMessage,
            userId: '507f1f77bcf86cd799439099',
        });

        const token = makeToken('507f1f77bcf86cd799439000');
        const res = await request(app)
            .get(`/api/messages/${mockMessage.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it('404 — mensagem não encontrada', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

        const token = makeToken();
        const res = await request(app)
            .get(`/api/messages/507f1f77bcf86cd799439fff`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

// ── DELETE /api/messages/:id ──────────────────────────────────────────────────
describe('DELETE /api/messages/:id', () => {
    it('200 — deleta mensagem do próprio usuário', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(mockMessage);
        vi.mocked(prisma.message.delete).mockResolvedValue(mockMessage);

        const token = makeToken('507f1f77bcf86cd799439000');
        const res = await request(app)
            .delete(`/api/messages/${mockMessage.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

    it('403 — tentar deletar mensagem de outro usuário', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...mockMessage,
            userId: '507f1f77bcf86cd799439099',
        });

        const token = makeToken('507f1f77bcf86cd799439000');
        const res = await request(app)
            .delete(`/api/messages/${mockMessage.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});

// ── GET /api/messages/card/:id ────────────────────────────────────────────────
describe('GET /api/messages/card/:id', () => {
    const paidMessage: MockMessageRecord = {
        id: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439000',
        message: 'Você é especial!',
        recipient: 'Ana',
        mediaUrl: null,
        theme: 'classic',
        status: 'published',
        visibility: 'public',
        publishedAt: new Date(),
        paymentStatus: 'paid',
        paymentId: 'payment-123',
        paymentProvider: 'mercadopago',
        paymentMethod: 'pix',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('200 — retorna cartão público de mensagem paga', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(paidMessage);

        const res = await request(app)
            .get(`/api/messages/card/${paidMessage.id}`);

        expect(res.status).toBe(200);
        expect(res.body.message.recipient).toBe('Ana');
    });

    it('404 — cartão não encontrado ou pagamento pendente', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

        const res = await request(app)
            .get(`/api/messages/card/507f1f77bcf86cd799439011`);

        expect(res.status).toBe(404);
    });

    it('404 — cartão privado sem autenticação', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...paidMessage,
            visibility: 'private',
        });

        const res = await request(app)
            .get(`/api/messages/card/${paidMessage.id}`);

        expect(res.status).toBe(404);
    });

    it('200 — cartão privado para dono autenticado', async () => {
        const ownerId = '507f1f77bcf86cd799439000';
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...paidMessage,
            visibility: 'private',
            userId: ownerId,
        });

        const token = makeToken(ownerId);
        const res = await request(app)
            .get(`/api/messages/card/${paidMessage.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message.id).toBe(paidMessage.id);
    });

    it('404 — cartão arquivado não é público', async () => {
        vi.mocked(prisma.message.findUnique).mockResolvedValue({
            ...paidMessage,
            status: 'archived',
        });

        const res = await request(app)
            .get(`/api/messages/card/${paidMessage.id}`);

        expect(res.status).toBe(404);
    });
});
