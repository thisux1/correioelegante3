import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import type { Request } from 'express';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';
import { recordResourceView } from '../services/analytics.service';

// ── Extensão do mock global (setup.ts) ───────────────────────────────────────
// Métodos de leitura agregada (count/aggregate) e modelos PageView/RefundRequest
// são usados apenas pelo analytics e não existem no mock base do setup.
type MockFn = ReturnType<typeof vi.fn>;
type MockModel = Record<string, MockFn>;

function ensureModel(name: string): MockModel {
  const holder = prisma as unknown as Record<string, unknown>;
  if (!(holder[name] instanceof Object)) {
    holder[name] = {};
  }
  return holder[name] as MockModel;
}

function ensureMethod(model: object, method: string): MockFn {
  const holder = model as MockModel;
  if (!(holder[method] instanceof Function)) {
    holder[method] = vi.fn();
  }
  return holder[method];
}

const userCount = ensureMethod(prisma.user, 'count');
const userFindMany = ensureMethod(prisma.user, 'findMany');
const messageCount = ensureMethod(prisma.message, 'count');
const pageCount = ensureMethod(prisma.page, 'count');
const supportTicketCount = ensureMethod(prisma.supportTicket, 'count');
const subscriptionCount = ensureMethod(prisma.subscription, 'count');

// Modelo PageView não existe no mock base do setup.
const pageViewModel = ensureModel('pageView');
pageViewModel.count = vi.fn();
pageViewModel.findFirst = vi.fn();
pageViewModel.create = vi.fn();
pageViewModel.findMany = vi.fn();

function makeToken(userId = '507f1f77bcf86cd799439000') {
  return generateAccessToken(userId);
}

const commonUserId = '507f1f77bcf86cd799439000';

describe('GET /api/admin/analytics/overview', () => {
  it('403 — usuario comum nao acessa', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'comum@example.com',
    } as never);

    const res = await request(app)
      .get('/api/admin/analytics/overview')
      .set('Authorization', `Bearer ${makeToken(commonUserId)}`);

    expect(res.status).toBe(403);
  });

  it('200 — retorna shape completo do contrato', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'test@example.com',
    } as never);

    userCount
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(5) // last7d
      .mockResolvedValueOnce(20) // last30d
      .mockResolvedValueOnce(80); // verified
    subscriptionCount.mockResolvedValueOnce(10).mockResolvedValueOnce(4); // active, newLast30d
    messageCount.mockResolvedValueOnce(50).mockResolvedValueOnce(30); // messages, paid
    pageCount.mockResolvedValueOnce(25).mockResolvedValueOnce(15); // pages, paid
    (pageViewModel.count as MockFn).mockResolvedValueOnce(300); // views30d
    supportTicketCount.mockResolvedValueOnce(2); // open

    const res = await request(app)
      .get('/api/admin/analytics/overview')
      .set('Authorization', `Bearer ${makeToken(commonUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      users: { total: 100, last7d: 5, last30d: 20, verified: 80 },
      subscriptions: { active: 10, newLast30d: 4 },
      content: { messages: 50, pages: 25, paidResources: 45, views30d: 300 },
      support: { open: 2 },
    });
  });
});

describe('GET /api/admin/analytics/timeseries', () => {
  it('preenche dias zerados em serie continua de 7 dias', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'test@example.com',
    } as never);

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayUtcMidnight = new Date(`${todayKey}T12:00:00.000Z`);

    // Ordem das chamadas no service: user, message(letters), message(paid),
    // page(paid), subscription(startsAt), pageView(views).
    userFindMany.mockResolvedValue([{ createdAt: todayUtcMidnight }]);
    vi.mocked(prisma.message.findMany)
      .mockResolvedValueOnce([] as never) // lettersCreated
      .mockResolvedValueOnce([] as never); // paymentsCompleted (mensagens pagas)
    vi.mocked(prisma.page.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([] as never);
    vi.mocked(pageViewModel.findMany as MockFn).mockResolvedValue([]);

    const res = await request(app)
      .get('/api/admin/analytics/timeseries?days=7')
      .set('Authorization', `Bearer ${makeToken(commonUserId)}`);

    expect(res.status).toBe(200);

    for (const series of ['signups', 'lettersCreated', 'paymentsCompleted', 'views']) {
      const points = res.body[series] as Array<{ date: string; count: number }>;
      expect(points).toHaveLength(7);
      for (const point of points) {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof point.count).toBe('number');
      }
    }

    const signups = res.body.signups as Array<{ date: string; count: number }>;
    const nonZeroDays = signups.filter((point) => point.count > 0);
    expect(nonZeroDays).toHaveLength(1);
    expect(nonZeroDays[0]!.date).toBe(todayKey);
    expect(nonZeroDays[0]!.count).toBe(1);
  });

  it('400 — rejeita days fora de 7|30|90', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'test@example.com',
    } as never);

    const res = await request(app)
      .get('/api/admin/analytics/timeseries?days=15')
      .set('Authorization', `Bearer ${makeToken(commonUserId)}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('recordResourceView', () => {
  function fakeReq(ip: string): Request {
    return {
      ip,
      headers: { 'user-agent': 'vitest-agent' },
      socket: {},
    } as unknown as Request;
  }

  it('deduplica na janela de 60min — duas chamadas geram um create', async () => {
    pageViewModel.create = vi.fn();
    pageViewModel.findFirst = vi
      .fn()
      .mockResolvedValueOnce(null) // 1a chamada: sem view recente -> cria
      .mockResolvedValueOnce({ id: 'view-1' }); // 2a chamada: dentro da janela -> skip

    await recordResourceView('resource-1', fakeReq('127.0.0.1'));
    await recordResourceView('resource-1', fakeReq('127.0.0.1'));

    expect(pageViewModel.findFirst).toHaveBeenCalledTimes(2);
    expect(pageViewModel.create).toHaveBeenCalledTimes(1);

    const createArg = pageViewModel.create.mock.calls[0]![0] as {
      data: { resourceId: string; viewerHash: string };
    };
    expect(createArg.data.resourceId).toBe('resource-1');
    expect(createArg.data.viewerHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
