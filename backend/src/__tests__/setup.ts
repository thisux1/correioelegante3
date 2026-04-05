// Setup global para todos os testes: define variáveis de ambiente e mocka o Prisma.
import { vi, beforeEach } from 'vitest';

// ── Variáveis de ambiente ────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-jwt-secret-32chars-minimum!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32chars-min!!';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing_only';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake_webhook_secret_for_tests';
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
        userConsent: {
            findMany: vi.fn(),
        },
        message: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        page: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        asset: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
        },
        mediaJob: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
        },
        refundRequest: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({
            mediaJob: {
                update: vi.fn(),
            },
            asset: {
                update: vi.fn(),
            },
        })),
    },
}));

// ── Mock do Stripe ───────────────────────────────────────────────────────────
vi.mock('stripe', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            paymentIntents: {
                create: vi.fn().mockResolvedValue({
                    id: 'pi_test_123',
                    client_secret: 'pi_test_123_secret',
                    status: 'requires_action',
                    next_action: {
                        pix_display_qr_code: {
                            data: 'pix_qr_code_data',
                            image_url_png: 'https://example.com/qr.png',
                        },
                    },
                }),
            },
            webhooks: {
                constructEvent: vi.fn(),
            },
        })),
    };
});

// ── Limpa todos os mocks entre cada teste ───────────────────────────────────
beforeEach(() => {
    vi.clearAllMocks();
});
