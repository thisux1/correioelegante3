import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import {
  canAccessPageByLifecycle,
  type PageStatus,
  type PageVisibility,
} from '../contracts/page.contract';
import { logModerationEvent } from '../utils/observability';
import type { CreatePageReportInput } from '../utils/validation';

/**
 * POST /api/pages/:pageId/report — público (destinatária não é usuária).
 * Só aceita página publicamente acessível (paga + publicada): mesma régua
 * da leitura — assim o endpoint não vaza a existência de drafts.
 */
export async function createPageReport(pageId: string, input: CreatePageReportInput) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });

  const publiclyVisible =
    page !== null &&
    canAccessPageByLifecycle({
      status: page.status as PageStatus,
      visibility: page.visibility as PageVisibility,
      ownerUserId: page.userId,
      paymentStatus: page.paymentStatus,
    });

  if (!publiclyVisible) {
    throw new AppError('Pagina nao encontrada', 404);
  }

  const report = await prisma.pageReport.create({
    data: {
      pageId,
      reason: input.reason,
      details: input.details,
    },
  });

  logModerationEvent({
    event: 'page_report',
    pageId,
    verdict: 'flagged',
    flags: [`report:${input.reason}`],
  });

  return { id: report.id };
}

/**
 * GET /api/admin/reports — fila de revisão. `resolved` default false:
 * o admin vê primeiro o que ainda pede ação.
 */
export async function listPageReports(includeResolved = false) {
  return prisma.pageReport.findMany({
    where: includeResolved ? {} : { resolved: false },
    orderBy: { createdAt: 'desc' },
  });
}

/** POST /api/admin/reports/:id/resolve — fecha a denúncia sem mexer na página. */
export async function resolvePageReport(reportId: string) {
  const report = await prisma.pageReport.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new AppError('Denúncia não encontrada', 404);
  }
  return prisma.pageReport.update({
    where: { id: reportId },
    data: { resolved: true },
  });
}

/**
 * POST /api/admin/pages/:id/unpublish — bloqueio real: a página sai do ar
 * (status draft + publishedAt nulo). Idempotente em página já draft.
 */
export async function unpublishPage(pageId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) {
    throw new AppError('Pagina nao encontrada', 404);
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: { status: 'draft', publishedAt: null, version: page.version + 1 },
  });

  logModerationEvent({
    event: 'admin_unpublish',
    pageId,
    verdict: 'blocked',
    flags: ['admin_unpublish'],
  });

  return { id: updated.id, status: updated.status };
}
