import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

// Helper: cria um token de acesso válido para usar nas rotas protegidas
function makeToken(userId = '507f1f77bcf86cd799439000') {
    return generateAccessToken(userId);
}

// ── Tipos para facilitar os mocks ────────────────────────────────────────────
const mockUser = {
    id: '507f1f77bcf86cd799439000',
    email: 'test@correio.com',
    password: '$2b$12$exampleHashedPasswordForTests123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
    it('201 — cria usuário com dados válidos', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'novo@teste.com', password: 'Senha1234' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.email).toBe('test@correio.com');
    });

    it('409 — email já cadastrado', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@correio.com', password: 'Senha1234' });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/cadastrado/i);
    });

    it('400 — email inválido', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'nao-e-um-email', password: 'Senha1234' });

        expect(res.status).toBe(400);
    });

    it('400 — senha muito curta', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'novo@teste.com', password: '123' });

        expect(res.status).toBe(400);
    });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
    it('200 — login com credenciais válidas', async () => {
        // Simulamos um hash real de 'Senha1234' para bcrypt.compare funcionar
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash('Senha1234', 12);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, password: hash });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@correio.com', password: 'Senha1234' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('401 — usuário não encontrado', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'naoexiste@teste.com', password: 'Senha1234' });

        expect(res.status).toBe(401);
    });

    it('401 — senha incorreta', async () => {
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash('OutraSenha', 12);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, password: hash });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@correio.com', password: 'SenhaErrada' });

        expect(res.status).toBe(401);
    });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
    it('200 — retorna dados do usuário autenticado', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            ...mockUser,
            id: 'user_test_123',
        } as typeof mockUser);

        const token = makeToken('user_test_123');
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('email');
    });

    it('401 — sem token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('401 — token inválido', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer token_invalido_aqui');
        expect(res.status).toBe(401);
    });
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
describe('POST /api/auth/refresh', () => {
    it('200 — renova tokens com cookie válido', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

        const refreshToken = generateRefreshToken(mockUser.id);
        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('401 — sem cookie de refresh token', async () => {
        const res = await request(app).post('/api/auth/refresh');
        expect(res.status).toBe(401);
    });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
    it('200 — realiza logout e limpa cookie', async () => {
        const res = await request(app).post('/api/auth/logout');

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logout/i);
    });
});

// ── PUT /api/auth/password ────────────────────────────────────────────────────
describe('PUT /api/auth/password', () => {
    it('200 — altera senha com dados válidos', async () => {
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash('SenhaAtual1', 12);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, password: hash });
        vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

        const token = makeToken(mockUser.id);
        const res = await request(app)
            .put('/api/auth/password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'SenhaAtual1', newPassword: 'NovaSenha1' });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/atualizada/i);
    });

    it('400 — senha atual incorreta', async () => {
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash('OutraSenha', 12);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, password: hash });

        const token = makeToken(mockUser.id);
        const res = await request(app)
            .put('/api/auth/password')
            .set('Authorization', `Bearer ${token}`)
            .send({ oldPassword: 'SenhaErrada', newPassword: 'NovaSenha1' });

        expect(res.status).toBe(400);
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app)
            .put('/api/auth/password')
            .send({ oldPassword: 'SenhaAtual1', newPassword: 'NovaSenha1' });

        expect(res.status).toBe(401);
    });
});

// ── DELETE /api/auth/account ──────────────────────────────────────────────────
describe('DELETE /api/auth/account', () => {
    it('200 — exclui conta do usuário autenticado', async () => {
        vi.mocked(prisma.user.delete).mockResolvedValue(mockUser);

        const token = makeToken(mockUser.id);
        const res = await request(app)
            .delete('/api/auth/account')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/exclu/i);
    });

    it('401 — sem autenticação', async () => {
        const res = await request(app).delete('/api/auth/account');
        expect(res.status).toBe(401);
    });
});
