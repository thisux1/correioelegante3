import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';
import { generateRsvpToken } from '../utils/rsvpToken';

const ownerUserId = '507f1f77bcf86cd799439000';
const otherUserId = '507f1f77bcf86cd799439999';
const pageId = '507f1f77bcf86cd799439111';
const rsvpBlockId = 'rsvp-block-1';

function makeToken(userId = ownerUserId) {
  return generateAccessToken(userId);
}

function makePage(overrides: Record<string, unknown> = {}) {
  return {
    id: pageId,
    userId: ownerUserId,
    content: {
      blocks: [
        {
          id: rsvpBlockId,
          type: 'ticketRsvp',
          version: 1,
          props: {
            title: 'Topa sair comigo?',
            evento: { data: '2026-02-14', lugar: 'Café Rosa' },
          },
          meta: { createdAt: Date.now(), updatedAt: Date.now() },
        },
        {
          id: 'text-block-1',
          type: 'text',
          version: 1,
          props: { text: 'Oi' },
          meta: { createdAt: Date.now(), updatedAt: Date.now() },
        },
      ],
      sections: [{ id: 'main', layout: 'stack' }],
      theme: 'romantic-sunset',
      version: 1,
    },
    status: 'published',
    visibility: 'public',
    publishedAt: new Date() as Date | null,
    paymentStatus: 'paid',
    paymentId: null,
    paymentProvider: null,
    paymentMethod: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { email: 'dono@example.com' },
    ...overrides,
  };
}

function p2002Error() {
  return Object.assign(new Error('Unique constraint failed'), {
    name: 'PrismaClientKnownRequestError',
    code: 'P2002',
  });
}

function validResponseBody(overrides: Record<string, unknown> = {}) {
  return {
    blockId: rsvpBlockId,
    choice: 'yes',
    text: 'Te vejo lá',
    respondentName: 'Fulana',
    token: generateRsvpToken(pageId, rsvpBlockId),
    ...overrides,
  };
}

describe('GET /api/pages/:id — injeção do token RSVP', () => {
  it('injeta responseToken apenas em blocos ticketRsvp', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);

    const res = await request(app).get(`/api/pages/${pageId}`);

    expect(res.status).toBe(200);
    const blocks = res.body.page.content.blocks as Array<{
      id: string;
      type: string;
      props: Record<string, unknown>;
    }>;
    const rsvpBlock = blocks.find((block) => block.id === rsvpBlockId);
    const textBlock = blocks.find((block) => block.id === 'text-block-1');

    expect(rsvpBlock?.type).toBe('ticketRsvp');
    expect(rsvpBlock?.props.responseToken).toBe(generateRsvpToken(pageId, rsvpBlockId));
    expect(textBlock?.props.responseToken).toBeUndefined();
  });
});

describe('POST /api/pages/:pageId/responses', () => {
  it('201 — cria resposta com token válido', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);
    const createdAt = new Date('2026-02-10T12:00:00.000Z');
    vi.mocked(prisma.pageResponse.create).mockResolvedValue({
      id: '507f1f77bcf86cd799439222',
      pageId,
      blockId: rsvpBlockId,
      choice: 'yes',
      text: 'Te vejo lá',
      respondentName: 'Fulana',
      createdAt,
    } as never);

    const res = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody());

    expect(res.status).toBe(201);
    expect(res.body.response.id).toBe('507f1f77bcf86cd799439222');
    expect(res.body.response.choice).toBe('yes');
    expect(res.body.response.createdAt).toBe(createdAt.toISOString());

    expect(prisma.pageResponse.create).toHaveBeenCalledWith({
      data: {
        pageId,
        blockId: rsvpBlockId,
        choice: 'yes',
        text: 'Te vejo lá',
        respondentName: 'Fulana',
      },
    });
  });

  it('403 — token inválido', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);

    const res = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody({ token: 'token-forjado-qualquer' }));

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INVALID_TOKEN');
    expect(prisma.pageResponse.create).not.toHaveBeenCalled();
  });

  it('404 — bloco inexistente ou não ticketRsvp', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);

    const res = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody({
        blockId: 'text-block-1',
        token: generateRsvpToken(pageId, 'text-block-1'),
      }));

    expect(res.status).toBe(404);
    expect(prisma.pageResponse.create).not.toHaveBeenCalled();
  });

  it('409 — segunda resposta no mesmo bloco', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);
    vi.mocked(prisma.pageResponse.create)
      .mockResolvedValueOnce({
        id: '507f1f77bcf86cd799439222',
        pageId,
        blockId: rsvpBlockId,
        choice: 'yes',
        text: null,
        respondentName: null,
        createdAt: new Date(),
      } as never)
      .mockRejectedValueOnce(p2002Error());

    const first = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody());
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody({ choice: 'no' }));

    expect(second.status).toBe(409);
    expect(second.body.code).toBe('ALREADY_RESPONDED');
  });

  it('404 — página não paga', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(
      makePage({ paymentStatus: 'pending' }) as never,
    );

    const res = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody());

    expect(res.status).toBe(404);
    expect(prisma.pageResponse.create).not.toHaveBeenCalled();
  });

  it('400 — texto acima de 300 caracteres', async () => {
    const res = await request(app)
      .post(`/api/pages/${pageId}/responses`)
      .send(validResponseBody({ text: 'x'.repeat(301) }));

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/pages/:pageId/responses', () => {
  it('200 — dono lista respostas ordenadas por createdAt', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);
    const createdAt = new Date('2026-02-10T12:00:00.000Z');
    vi.mocked(prisma.pageResponse.findMany).mockResolvedValue([
      {
        id: '507f1f77bcf86cd799439222',
        pageId,
        blockId: rsvpBlockId,
        choice: 'yes',
        text: 'Te vejo lá',
        respondentName: 'Fulana',
        createdAt,
      },
    ] as never);

    const res = await request(app)
      .get(`/api/pages/${pageId}/responses`)
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.responses).toEqual([
      {
        blockId: rsvpBlockId,
        choice: 'yes',
        text: 'Te vejo lá',
        respondentName: 'Fulana',
        createdAt: createdAt.toISOString(),
      },
    ]);
    expect(prisma.pageResponse.findMany).toHaveBeenCalledWith({
      where: { pageId },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('404 — não-dono não enxerga respostas (não vaza existência)', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(makePage() as never);

    const res = await request(app)
      .get(`/api/pages/${pageId}/responses`)
      .set('Authorization', `Bearer ${makeToken(otherUserId)}`);

    expect(res.status).toBe(404);
    expect(prisma.pageResponse.findMany).not.toHaveBeenCalled();
  });

  it('401 — sem autenticação', async () => {
    const res = await request(app).get(`/api/pages/${pageId}/responses`);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/pages — nunca persiste responseToken forjado', () => {
  it('sanitizer remove props.responseToken de bloco ticketRsvp', async () => {
    vi.mocked(prisma.page.create).mockResolvedValue(makePage() as never);

    const res = await request(app)
      .post('/api/pages')
      .set('Authorization', `Bearer ${makeToken(ownerUserId)}`)
      .send({
        content: {
          blocks: [
            {
              id: rsvpBlockId,
              type: 'ticketRsvp',
              version: 1,
              props: {
                title: 'Topa?',
                responseToken: 'token-forjado-pelo-cliente',
              },
              meta: { createdAt: Date.now(), updatedAt: Date.now() },
            },
          ],
          sections: [{ id: 'main', layout: 'stack' }],
          version: 1,
        },
        status: 'draft',
        visibility: 'private',
      });

    expect(res.status).toBe(201);
    const createCall = vi.mocked(prisma.page.create).mock.calls.at(0);
    const payload = (createCall?.[0] as { data?: { content?: unknown } })?.data?.content as {
      blocks: Array<{ type: string; props: Record<string, unknown> }>;
    };
    const rsvpBlock = payload.blocks.find((block) => block.type === 'ticketRsvp');

    expect(rsvpBlock?.props.responseToken).toBeUndefined();
    expect(rsvpBlock?.props.title).toBe('Topa?');
  });
});
