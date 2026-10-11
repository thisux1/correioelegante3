import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

const ownerUserId = '507f1f77bcf86cd799439000';
const adminUserId = '507f1f77bcf86cd799439777';
const pageId = '507f1f77bcf86cd799439111';
const reportId = '507f1f77bcf86cd799439333';
const ADMIN_EMAIL = 'admin@correioelegante.studio';

function makeToken(userId = ownerUserId) {
  return generateAccessToken(userId);
}

function makePage(overrides: Record<string, unknown> = {}) {
  return {
    id: pageId,
    userId: ownerUserId,
    content: { blocks: [], sections: [], theme: 'romantic-sunset', version: 1 },
    status: 'published',
    visibility: 'public',
    publishedAt: new Date() as Date | null,
    paymentStatus: 'paid',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function mockAdmin() {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: ADMIN_EMAIL } as never);
}

describe('POST /api/pages/:pageId/report', () => {
  it('201 — denúncia em página pública publicada e paga', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);
    vi.mocked(prisma.pageReport.create).mockResolvedValue({
      id: reportId,
      pageId,
      reason: 'assedio',
      details: 'conteúdo me expõe sem consentimento',
      resolved: false,
      createdAt: new Date(),
    } as never);

    const res = await request(app)
      .post(`/api/pages/${pageId}/report`)
      .send({ reason: 'assedio', details: 'conteúdo me expõe sem consentimento' });

    expect(res.status).toBe(201);
    expect(res.body.report.id).toBe(reportId);
    expect(prisma.pageReport.create).toHaveBeenCalledWith({
      data: { pageId, reason: 'assedio', details: 'conteúdo me expõe sem consentimento' },
    });
  });

  it('404 — draft/não paga/privada não vazam existência', async () => {
    for (const overrides of [
      { status: 'draft' },
      { paymentStatus: 'pending' },
      { visibility: 'private' },
    ]) {
      vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage(overrides) as never);

      const res = await request(app)
        .post(`/api/pages/${pageId}/report`)
        .send({ reason: 'spam' });

      expect(res.status).toBe(404);
    }
    expect(prisma.pageReport.create).not.toHaveBeenCalled();
  });

  it('404 — página inexistente', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(null as never);

    const res = await request(app)
      .post(`/api/pages/${pageId}/report`)
      .send({ reason: 'outro' });

    expect(res.status).toBe(404);
  });

  it('400 — reason fora do enum', async () => {
    const res = await request(app)
      .post(`/api/pages/${pageId}/report`)
      .send({ reason: 'nao-gostei' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/admin/reports', () => {
  it('200 — admin lista denúncias abertas por padrão', async () => {
    mockAdmin();
    vi.mocked(prisma.pageReport.findMany).mockResolvedValue([
      {
        id: reportId,
        pageId,
        reason: 'assedio',
        details: null,
        resolved: false,
        createdAt: new Date('2026-02-10T12:00:00.000Z'),
      },
    ] as never);

    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${makeToken(adminUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.reports).toHaveLength(1);
    expect(prisma.pageReport.findMany).toHaveBeenCalledWith({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('403 — não-admin é barrado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: 'user@example.com' } as never);

    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN_ADMIN_ONLY');
  });

  it('401 — sem autenticação', async () => {
    const res = await request(app).get('/api/admin/reports');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/pages/:id/unpublish', () => {
  it('200 — admin tira a página do ar (draft + publishedAt null)', async () => {
    mockAdmin();
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);
    vi.mocked(prisma.page.update).mockResolvedValue(
      makePage({ status: 'draft', publishedAt: null, version: 2 }) as never,
    );

    const res = await request(app)
      .post(`/api/admin/pages/${pageId}/unpublish`)
      .set('Authorization', `Bearer ${makeToken(adminUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.page.status).toBe('draft');
    expect(prisma.page.update).toHaveBeenCalledWith({
      where: { id: pageId },
      data: { status: 'draft', publishedAt: null, version: 2 },
    });
  });

  it('404 — página inexistente', async () => {
    mockAdmin();
    vi.mocked(prisma.page.findUnique).mockResolvedValue(null as never);

    const res = await request(app)
      .post(`/api/admin/pages/${pageId}/unpublish`)
      .set('Authorization', `Bearer ${makeToken(adminUserId)}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/reports/:id/resolve', () => {
  it('200 — marca denúncia como resolvida', async () => {
    mockAdmin();
    vi.mocked(prisma.pageReport.findUnique).mockResolvedValue({
      id: reportId,
      pageId,
      reason: 'spam',
      resolved: false,
    } as never);
    vi.mocked(prisma.pageReport.update).mockResolvedValue({
      id: reportId,
      resolved: true,
    } as never);

    const res = await request(app)
      .post(`/api/admin/reports/${reportId}/resolve`)
      .set('Authorization', `Bearer ${makeToken(adminUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.report.resolved).toBe(true);
  });

  it('404 — denúncia inexistente', async () => {
    mockAdmin();
    vi.mocked(prisma.pageReport.findUnique).mockResolvedValue(null as never);

    const res = await request(app)
      .post(`/api/admin/reports/${reportId}/resolve`)
      .set('Authorization', `Bearer ${makeToken(adminUserId)}`);

    expect(res.status).toBe(404);
  });
});
