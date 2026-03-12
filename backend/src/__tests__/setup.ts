// Setup global para todos os testes: define variáveis de ambiente e mocka o Prisma.
import { vi, beforeEach } from 'vitest';

// ── Variáveis de ambiente ────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-jwt-secret-32chars-minimum!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32chars-min!!';
process.env.NODE_ENV = 'test';

// ── Mock global do Prisma ────────────────────────────────────────────────────
// Intercepta o módulo antes de qualquer import nos testes.
vi.mock('../utils/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));


// ── Limpa todos os mocks entre cada teste ───────────────────────────────────
beforeEach(() => {
    vi.clearAllMocks();
});
