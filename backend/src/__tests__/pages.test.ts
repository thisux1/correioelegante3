import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

function makeToken(userId = '507f1f77bcf86cd799439000') {
  return generateAccessToken(userId);
}

const ownerUserId = '507f1f77bcf86cd799439000';
const pageId = '507f1f77bcf86cd799439111';

const basePage = {
  id: pageId,
  userId: ownerUserId,
  content: {
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        version: 1,
        props: { text: 'Oi' },
        meta: { createdAt: Date.now(), updatedAt: Date.now() },
      },
    ],
    version: 1,
  },
  status: 'published',
  visibility: 'public',
  publishedAt: new Date(),
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('POST /api/pages', () => {
  it('201 — cria pagina valida', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(basePage);

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: basePage.content,
        status: 'draft',
        visibility: 'private',
      });

    expect(res.status).toBe(201);
    expect(res.body.page.id).toBe(pageId);
  });

  it('400 — bloqueia URL insegura', async () => {
    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          blocks: [
            {
              id: 'block-1',
              type: 'image',
              version: 1,
              props: { src: 'javascript:alert(1)' },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
          ],
          version: 1,
        },
      });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/pages/:id', () => {
  it('409 — conflito de versao', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(basePage);

    const res = await request(app)
      .put(`/api/pages/${pageId}`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: basePage.content,
        version: 999,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('PAGE_VERSION_CONFLICT');
  });
});

describe('GET /api/pages/:id', () => {
  it('404 — draft nao publico', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue({
      ...basePage,
      status: 'draft',
    });

    const res = await request(app)
      .get(`/api/pages/${pageId}`);

    expect(res.status).toBe(404);
  });

  it('200 — private para dono autenticado', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue({
      ...basePage,
      visibility: 'private',
    });

    const res = await request(app)
      .get(`/api/pages/${pageId}`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.page.id).toBe(pageId);
  });
});

describe('GET /api/pages', () => {
  it('200 — lista paginas do usuario', async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([basePage]);

    const res = await request(app)
      .get('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.pages).toHaveLength(1);
  });
});

describe('DELETE /api/pages/:id', () => {
  it('403 — sem ownership', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue({
      ...basePage,
      userId: '507f1f77bcf86cd799439999',
    });

    const res = await request(app)
      .delete(`/api/pages/${pageId}`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(403);
  });
});
