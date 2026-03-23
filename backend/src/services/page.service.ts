import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import {
  resolvePageLifecycle,
  type PageStatus,
  type PageVisibility,
} from '../contracts/page.contract';
import { sanitizePageContent } from './page.sanitizer';
import { migratePage } from './page.migration';

interface CreatePageInput {
  content: unknown;
  status?: PageStatus;
  visibility?: PageVisibility;
  publishedAt?: string | null;
}

interface UpdatePageInput {
  content: unknown;
  status?: PageStatus;
  visibility?: PageVisibility;
  publishedAt?: string | null;
  expectedVersion?: number;
}

function parsePublishedAt(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  return new Date(value);
}

function toPageResponse(page: {
  id: string;
  content: unknown;
  status: string;
  visibility: string;
  publishedAt: Date | null;
  paymentStatus: string;
  paymentId: string | null;
  paymentProvider: string | null;
  paymentMethod: string | null;
  version: number;
  updatedAt: Date;
  createdAt: Date;
}) {
  return {
    id: page.id,
    content: migratePage(page.content),
    status: page.status,
    visibility: page.visibility,
    publishedAt: page.publishedAt,
    paymentStatus: page.paymentStatus,
    paymentId: page.paymentId,
    paymentProvider: page.paymentProvider,
    paymentMethod: page.paymentMethod,
    version: page.version,
    updatedAt: page.updatedAt,
    createdAt: page.createdAt,
  };
}

function canAccessPage(params: {
  status: string;
  visibility: string;
  ownerUserId: string;
  requesterUserId?: string;
}): boolean {
  const isOwner = Boolean(params.requesterUserId) && params.requesterUserId === params.ownerUserId;
  if (isOwner) {
    return true;
  }

  if (params.status !== 'published') {
    return false;
  }

  if (params.visibility === 'private') {
    return false;
  }

  return true;
}

export async function createPage(userId: string, data: CreatePageInput) {
  const lifecycle = resolvePageLifecycle({
    status: data.status,
    visibility: data.visibility,
    publishedAt: parsePublishedAt(data.publishedAt),
  });

  const sanitizedContent = sanitizePageContent(data.content);

  const page = await prisma.page.create({
    data: {
      content: sanitizedContent as unknown as Prisma.InputJsonValue,
      status: lifecycle.status,
      visibility: lifecycle.visibility,
      publishedAt: lifecycle.publishedAt,
      paymentStatus: 'pending',
      version: 1,
      userId,
    },
  });

  return toPageResponse(page);
}

export async function getPagesByUser(userId: string) {
  const pages = await prisma.page.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return pages.map(toPageResponse);
}

export async function updatePage(pageId: string, userId: string, data: UpdatePageInput) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });

  if (!page) {
    throw new AppError('Pagina nao encontrada', 404);
  }
  if (page.userId !== userId) {
    throw new AppError('Sem permissao', 403);
  }
  if (!data.expectedVersion) {
    throw new AppError('Versao da pagina obrigatoria para atualizar', 400, 'PAGE_VERSION_REQUIRED');
  }
  if (data.expectedVersion !== page.version) {
    throw new AppError(
      `Conflito de versao. Atual=${page.version}, recebida=${data.expectedVersion}`,
      409,
      'PAGE_VERSION_CONFLICT',
    );
  }

  const lifecycle = resolvePageLifecycle({
    status: data.status ?? page.status,
    visibility: data.visibility ?? page.visibility,
    publishedAt: data.publishedAt !== undefined
      ? parsePublishedAt(data.publishedAt)
      : page.publishedAt,
    createdAt: page.createdAt,
  });

  const sanitizedContent = sanitizePageContent(data.content);

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: {
      content: sanitizedContent as unknown as Prisma.InputJsonValue,
      status: lifecycle.status,
      visibility: lifecycle.visibility,
      publishedAt: lifecycle.publishedAt,
      version: page.version + 1,
    },
  });

  return toPageResponse(updated);
}

export async function getPageById(pageId: string, requesterUserId?: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });

  if (!page) {
    throw new AppError('Pagina nao encontrada', 404);
  }

  const hasAccess = canAccessPage({
    status: page.status,
    visibility: page.visibility,
    ownerUserId: page.userId,
    requesterUserId,
  });

  if (!hasAccess) {
    throw new AppError('Pagina nao encontrada ou sem acesso', 404);
  }

  return toPageResponse(page);
}

export async function deletePage(pageId: string, userId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });

  if (!page) {
    throw new AppError('Pagina nao encontrada', 404);
  }
  if (page.userId !== userId) {
    throw new AppError('Sem permissao', 403);
  }

  await prisma.page.delete({ where: { id: pageId } });
}
