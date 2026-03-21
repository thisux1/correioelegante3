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

  it('preserva novos campos de midia no payload sanitizado', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(makePage());

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          blocks: [
            {
              id: 'm1',
              type: 'music',
              version: 1,
              props: {
                src: 'https://cdn.example.com/audio.mp3',
                coverSrc: 'https://cdn.example.com/cover.jpg',
                coverAssetId: '507f1f77bcf86cd799439120',
                tracks: [{ src: 'https://cdn.example.com/audio.mp3' }],
              },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
            {
              id: 'g1',
              type: 'gallery',
              version: 1,
              props: {
                images: ['https://cdn.example.com/g1.jpg'],
                items: [{ src: 'https://cdn.example.com/g1.jpg', assetId: '507f1f77bcf86cd799439121' }],
              },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
            {
              id: 'i1',
              type: 'image',
              version: 1,
              props: {
                src: 'https://cdn.example.com/pic.jpg',
                assetId: '507f1f77bcf86cd799439122',
              },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
          ],
          theme: 'romantic-sunset',
          version: 1,
        },
      });

    expect(res.status).toBe(201);
    const createCall = vi.mocked(prisma.page.create).mock.calls.at(0);
    const payload = (createCall?.[0] as { data?: { content?: unknown } })?.data?.content as {
      blocks: Array<{ type: string; props: Record<string, unknown> }>;
    };
    const musicBlock = payload.blocks.find((item) => item.type === 'music');
    const galleryBlock = payload.blocks.find((item) => item.type === 'gallery');
    const imageBlock = payload.blocks.find((item) => item.type === 'image');

    expect(musicBlock?.props).toMatchObject({
      coverSrc: 'https://cdn.example.com/cover.jpg',
      coverAssetId: '507f1f77bcf86cd799439120',
    });
    expect(galleryBlock?.props).toMatchObject({
      images: ['https://cdn.example.com/g1.jpg'],
      items: [{ src: 'https://cdn.example.com/g1.jpg', assetId: '507f1f77bcf86cd799439121' }],
    });
    expect(imageBlock?.props).toMatchObject({
      src: 'https://cdn.example.com/pic.jpg',
      assetId: '507f1f77bcf86cd799439122',
    });
  });

  it('normaliza legacy->tracks, preserva ordem, limita em 30 e mantem capa por track', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(makePage());

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          blocks: [
            {
              id: 'm2',
              type: 'music',
              version: 1,
              props: {
                src: 'https://cdn.example.com/legacy.mp3',
                coverSrc: 'https://cdn.example.com/legacy-cover.jpg',
                coverAssetId: '507f1f77bcf86cd799439123',
                tracks: Array.from({ length: 34 }, (_, index) => ({
                  src: index === 5 ? '   ' : `https://cdn.example.com/song-${index}.mp3`,
                  coverSrc: `https://cdn.example.com/cover-${index}.jpg`,
                  coverAssetId: '507f1f77bcf86cd799439124',
                })),
              },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
          ],
          version: 1,
        },
      });

    expect(res.status).toBe(201);
    const createCall = vi.mocked(prisma.page.create).mock.calls.at(0);
    const payload = (createCall?.[0] as { data?: { content?: unknown } })?.data?.content as {
      blocks: Array<{ type: string; props: Record<string, unknown> }>;
    };
    const musicBlock = payload.blocks.find((item) => item.type === 'music');
    const tracks = (musicBlock?.props.tracks as Array<Record<string, unknown>>) ?? [];

    expect(musicBlock?.props.src).toBe('https://cdn.example.com/legacy.mp3');
    expect(tracks).toHaveLength(30);
    expect(tracks[0]?.src).toBe('https://cdn.example.com/song-0.mp3');
    expect(tracks[1]?.src).toBe('https://cdn.example.com/song-1.mp3');
    expect(tracks[5]?.src).toBe('https://cdn.example.com/song-6.mp3');
    expect(tracks[29]?.src).toBe('https://cdn.example.com/song-30.mp3');
    expect(tracks[0]?.coverSrc).toBe('https://cdn.example.com/cover-0.jpg');
    expect(tracks[0]?.coverAssetId).toBe('507f1f77bcf86cd799439124');
  });

  it('cria track a partir de campos legados quando tracks vier vazio', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(makePage());

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          blocks: [
            {
              id: 'm3',
              type: 'music',
              version: 1,
              props: {
                src: 'https://cdn.example.com/legacy-only.mp3',
                assetId: '507f1f77bcf86cd799439125',
                title: 'Faixa antiga',
                artist: 'Artista antigo',
                coverSrc: 'https://cdn.example.com/legacy-only-cover.jpg',
                coverAssetId: '507f1f77bcf86cd799439126',
                tracks: [],
              },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
          ],
          version: 1,
        },
      });

    expect(res.status).toBe(201);
    const createCall = vi.mocked(prisma.page.create).mock.calls.at(0);
    const payload = (createCall?.[0] as { data?: { content?: unknown } })?.data?.content as {
      blocks: Array<{ type: string; props: Record<string, unknown> }>;
    };
    const musicBlock = payload.blocks.find((item) => item.type === 'music');
    const tracks = (musicBlock?.props.tracks as Array<Record<string, unknown>>) ?? [];

    expect(tracks).toEqual([
      {
        src: 'https://cdn.example.com/legacy-only.mp3',
        assetId: '507f1f77bcf86cd799439125',
        title: 'Faixa antiga',
        artist: 'Artista antigo',
        coverSrc: 'https://cdn.example.com/legacy-only-cover.jpg',
        coverAssetId: '507f1f77bcf86cd799439126',
      },
    ]);
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
