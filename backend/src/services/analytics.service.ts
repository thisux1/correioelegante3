import { createHash } from 'crypto';
import type { Request } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

// Janela de dedupe de views (SPEC §4.7): mesmo (resourceId, viewerHash) em até 60min conta 1x.
const VIEW_DEDUPE_WINDOW_MS = 60 * 60 * 1000;

// Preços usados apenas como estimativa (SPEC §4.6): não há ledger histórico de pagamentos avulsos.
const ONE_OFF_PRICE = 4.99;
const MRR_PER_SUBSCRIPTION = 15.0;

export const ALLOWED_TIME_RANGES = [7, 30, 90] as const;
export type TimeRange = (typeof ALLOWED_TIME_RANGES)[number];

function daysAgoUtc(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function toDateKey(date: Date): string {
  // "YYYY-MM-DD" sempre em UTC
  return date.toISOString().slice(0, 10);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function assertTimeRange(days: number): asserts days is TimeRange {
  if (!(ALLOWED_TIME_RANGES as readonly number[]).includes(days)) {
    throw new AppError('Parâmetro days inválido. Use 7, 30 ou 90.', 400, 'VALIDATION_ERROR');
  }
}

/**
 * Agrupa eventos por dia UTC produzindo série contínua (dias sem eventos = 0).
 * Estratégia de agregação: varredura simples por campos indexados (createdAt/startsAt)
 * com bucketing em memória — dado o volume atual, $runCommandRaw/$unwind não compensa.
 */
function buildContinuousSeries(
  days: number,
  events: Date[]
): Array<{ date: string; count: number }> {
  const countsByDay = new Map<string, number>();
  for (const event of events) {
    const key = toDateKey(event);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const series: Array<{ date: string; count: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = toDateKey(new Date(todayUtc - i * 24 * 60 * 60 * 1000));
    series.push({ date: key, count: countsByDay.get(key) ?? 0 });
  }
  return series;
}

function toCountedList(entries: Map<string, number>): Array<{ type: string; count: number }> {
  return [...entries.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));
}

export async function getOverview() {
  const now = new Date();
  const since7d = daysAgoUtc(7);
  const since30d = daysAgoUtc(30);

  const [
    totalUsers,
    usersLast7d,
    usersLast30d,
    verifiedUsers,
    activeSubscriptions,
    newSubscriptions30d,
    totalMessages,
    totalPages,
    paidMessages,
    paidPages,
    views30d,
    openTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.user.count({ where: { createdAt: { gte: since30d } } }),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.subscription.count({ where: { status: 'active', expiresAt: { gt: now } } }),
    prisma.subscription.count({ where: { startsAt: { gte: since30d } } }),
    prisma.message.count(),
    prisma.page.count(),
    prisma.message.count({ where: { paymentStatus: 'paid' } }),
    prisma.page.count({ where: { paymentStatus: 'paid' } }),
    prisma.pageView.count({ where: { createdAt: { gte: since30d } } }),
    prisma.supportTicket.count({ where: { status: 'open' } }),
  ]);

  return {
    users: {
      total: totalUsers,
      last7d: usersLast7d,
      last30d: usersLast30d,
      verified: verifiedUsers,
    },
    subscriptions: {
      active: activeSubscriptions,
      newLast30d: newSubscriptions30d,
    },
    content: {
      messages: totalMessages,
      pages: totalPages,
      paidResources: paidMessages + paidPages,
      views30d,
    },
    support: {
      open: openTickets,
    },
  };
}

export async function getTimeseries(days: number) {
  assertTimeRange(days);
  const since = daysAgoUtc(days);

  const [signups, letters, paidLetters, paidPages, subscriptionStarts, views] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.message.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.message.findMany({
      where: { createdAt: { gte: since }, paymentStatus: 'paid' },
      select: { createdAt: true },
    }),
    prisma.page.findMany({
      where: { createdAt: { gte: since }, paymentStatus: 'paid' },
      select: { createdAt: true },
    }),
    prisma.subscription.findMany({ where: { startsAt: { gte: since } }, select: { startsAt: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  // Pagamentos concluídos = recursos pagos no período + assinaturas iniciadas
  // (não existe evento dedicado de pagamento; publishedAt/startsAt são os proxies disponíveis).
  const paymentsCompleted = buildContinuousSeries(days, [
    ...paidLetters.map((item) => item.createdAt),
    ...paidPages.map((item) => item.createdAt),
    ...subscriptionStarts.map((item) => item.startsAt),
  ]);

  return {
    signups: buildContinuousSeries(days, signups.map((item) => item.createdAt)),
    lettersCreated: buildContinuousSeries(days, letters.map((item) => item.createdAt)),
    paymentsCompleted,
    views: buildContinuousSeries(days, views.map((item) => item.createdAt)),
  };
}

interface ScannedPageContent {
  blocks?: unknown;
  theme?: unknown;
}

// Varredura paginada por cursor lendo apenas `content` — alternativa simples ao
// aggregate nativo ($unwind via $runCommandRaw), suficiente para o volume atual.
const CONTENT_SCAN_BATCH_SIZE = 500;

export async function getContentInsights() {
  const blockTypeCounts = new Map<string, number>();
  const themeCounts = new Map<string, number>();
  let pageCount = 0;
  let blockTotal = 0;

  let cursor: string | undefined;
  do {
    const batch = await prisma.page.findMany({
      select: { id: true, content: true },
      orderBy: { id: 'asc' },
      take: CONTENT_SCAN_BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    for (const page of batch) {
      pageCount += 1;
      const content = page.content as ScannedPageContent | null;

      if (typeof content?.theme === 'string') {
        themeCounts.set(content.theme, (themeCounts.get(content.theme) ?? 0) + 1);
      }

      const blocks = Array.isArray(content?.blocks) ? content.blocks : [];
      for (const block of blocks) {
        const blockType = (block as { type?: unknown })?.type;
        if (typeof blockType === 'string') {
          blockTotal += 1;
          blockTypeCounts.set(blockType, (blockTypeCounts.get(blockType) ?? 0) + 1);
        }
      }
    }

    cursor =
      batch.length === CONTENT_SCAN_BATCH_SIZE ? batch[batch.length - 1]!.id : undefined;
  } while (cursor);

  return {
    blockTypes: toCountedList(blockTypeCounts),
    themes: toCountedList(themeCounts),
    avgBlocksPerPage: pageCount === 0 ? 0 : round2(blockTotal / pageCount),
  };
}

export async function getFunnel() {
  const now = new Date();

  const [registered, messageOwners, pageOwners, paidMessageOwners, paidPageOwners, subscribers] =
    await Promise.all([
      prisma.user.count(),
      prisma.message.findMany({ select: { userId: true } }),
      prisma.page.findMany({ select: { userId: true } }),
      prisma.message.findMany({ where: { paymentStatus: 'paid' }, select: { userId: true } }),
      prisma.page.findMany({ where: { paymentStatus: 'paid' }, select: { userId: true } }),
      prisma.subscription.findMany({
        where: { status: 'active', expiresAt: { gt: now } },
        select: { userId: true },
      }),
    ]);

  const distinctUserIds = (rows: Array<{ userId: string }>, ...others: Array<Array<{ userId: string }>>): Set<string> => {
    const ids = new Set<string>();
    for (const group of [rows, ...others]) {
      for (const row of group) ids.add(row.userId);
    }
    return ids;
  };

  return {
    registered,
    createdContent: distinctUserIds(messageOwners, pageOwners).size,
    paidOnce: distinctUserIds(paidMessageOwners, paidPageOwners).size,
    subscribed: distinctUserIds(subscribers).size,
  };
}

export async function getRevenue(days: number) {
  assertTimeRange(days);
  const since = daysAgoUtc(days);
  const now = new Date();

  const [amountAgg, periodSubscriptions, activeSubscriptions, paidMessages, paidPages, refundRequests] =
    await Promise.all([
      prisma.subscription.aggregate({
        _sum: { amount: true },
        where: { startsAt: { gte: since } },
      }),
      prisma.subscription.count({ where: { startsAt: { gte: since } } }),
      prisma.subscription.count({ where: { status: 'active', expiresAt: { gt: now } } }),
      prisma.message.count({ where: { paymentStatus: 'paid' } }),
      prisma.page.count({ where: { paymentStatus: 'paid' } }),
      prisma.refundRequest.count({}),
    ]);

  const paidResources = paidMessages + paidPages;

  return {
    subscriptionRevenue: round2(amountAgg._sum.amount ?? 0),
    subscriptionCount: periodSubscriptions,
    oneOffEstimate: round2(paidResources * ONE_OFF_PRICE),
    refundRequests,
    mrrEstimate: round2(activeSubscriptions * MRR_PER_SUBSCRIPTION),
  };
}

/**
 * Registra view pseudonimizada (LGPD): viewerHash = SHA-256(ip + userAgent + dia UTC).
 * Dedupe por (resourceId, viewerHash) dentro da janela de 60min; nunca armazena IP bruto.
 */
export async function recordResourceView(resourceId: string, req: Request): Promise<void> {
  if (!resourceId) return;

  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const userAgent = req.headers['user-agent'] ?? '';
  const utcDay = new Date().toISOString().slice(0, 10);
  const viewerHash = createHash('sha256').update(`${ip}|${userAgent}|${utcDay}`).digest('hex');

  const windowStart = new Date(Date.now() - VIEW_DEDUPE_WINDOW_MS);
  const recentView = await prisma.pageView.findFirst({
    where: { resourceId, viewerHash, createdAt: { gt: windowStart } },
    select: { id: true },
  });
  if (recentView) return;

  await prisma.pageView.create({ data: { resourceId, viewerHash } });
}
