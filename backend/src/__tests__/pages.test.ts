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
const otherUserId = '507f1f77bcf86cd799439999';

const basePageShape = {
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
    theme: 'romantic-sunset',
    version: 1,
  },
  status: 'published',
  visibility: 'public',
  publishedAt: new Date(),
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makePage(overrides: Partial<typeof basePageShape> = {}) {
  return {
    ...basePageShape,
    ...overrides,
    content: {
      ...basePageShape.content,
      ...(overrides.content ?? {}),
    },
  };
}

describe('POST /api/pages', () => {
  it('201 — cria pagina valida', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(makePage());

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: basePageShape.content,
        status: 'draft',
        visibility: 'private',
      });

    expect(res.status).toBe(201);
    expect(res.body.page.id).toBe(pageId);
  });

  it('400 — rejeita payload invalido (zod)', async () => {
    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          blocks: [
            {
              id: 'block-1',
              type: 'invalid-type',
              version: 1,
              props: {},
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
          ],
          version: 1,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
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

  it('normaliza theme legacy para novo id no retorno', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(makePage({
      content: {
        ...basePageShape.content,
        theme: 'classic',
      },
    }));

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          ...basePageShape.content,
          theme: 'classic',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.page.content.theme).toBe('romantic-sunset');
  });
});

describe('PUT /api/pages/:id', () => {
  it('409 — conflito de versao', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage());

    const res = await request(app)
      .put(`/api/pages/${pageId}`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: basePageShape.content,
        version: 999,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('PAGE_VERSION_CONFLICT');
  });
});

describe('GET /api/pages/:id', () => {
  it('404 — draft public nao deve ser visivel para visitante', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage({
      status: 'draft',
    }));

    const res = await request(app)
      .get(`/api/pages/${pageId}`);

    expect(res.status).toBe(404);
  });

  it('404 — archived public nao deve ser visivel para visitante', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage({
      status: 'archived',
    }));

    const res = await request(app)
      .get(`/api/pages/${pageId}`);

    expect(res.status).toBe(404);
  });

  it('404 — published private bloqueia visitante sem auth', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage({
      visibility: 'private',
    }));

    const res = await request(app)
      .get(`/api/pages/${pageId}`);

    expect(res.status).toBe(404);
  });

  it('200 — published unlisted permite acesso por link', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage({
      visibility: 'unlisted',
    }));

    const res = await request(app)
      .get(`/api/pages/${pageId}`);

    expect(res.status).toBe(200);
    expect(res.body.page.id).toBe(pageId);
  });

  it('200 — private para dono autenticado (owner bypass)', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage({
      status: 'draft',
      visibility: 'private',
    }));

    const res = await request(app)
      .get(`/api/pages/${pageId}`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.page.id).toBe(pageId);
  });
});

describe('GET /api/pages', () => {
  it('200 — lista paginas do usuario', async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([makePage()]);

    const res = await request(app)
      .get('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.pages).toHaveLength(1);
  });
});

describe('DELETE /api/pages/:id', () => {
  it('403 — sem ownership', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage({ userId: otherUserId }));

    const res = await request(app)
      .delete(`/api/pages/${pageId}`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(403);
  });
});
