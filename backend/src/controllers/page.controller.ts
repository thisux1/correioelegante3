import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as pageService from '../services/page.service';
import { AppError } from '../utils/AppError';
import { logPageEvent } from '../utils/observability';

function parseIfMatchHeader(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().replace(/^W\//i, '').replaceAll('"', '');
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

export async function createPage(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  const { content, status, visibility, publishedAt } = req.body;
  try {
    const page = await pageService.createPage(req.userId!, {
      content,
      status,
      visibility,
      publishedAt,
    });

    const event = page.status === 'published' ? 'page_publish' : 'page_save';
    logPageEvent({
      event,
      userId: req.userId!,
      pageId: page.id,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 201,
    });

    res.status(201).json({ page });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    const event = status === 'published' ? 'page_publish' : 'page_save';
    logPageEvent({
      event,
      userId: req.userId!,
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function updatePage(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  const headerVersion = parseIfMatchHeader(req.header('if-match'));
  const bodyVersion = typeof req.body.version === 'number' ? req.body.version : undefined;

  try {
    const page = await pageService.updatePage(req.params.id as string, req.userId!, {
      content: req.body.content,
      status: req.body.status,
      visibility: req.body.visibility,
      publishedAt: req.body.publishedAt,
      expectedVersion: bodyVersion ?? headerVersion,
    });

    const event = page.status === 'published' ? 'page_publish' : 'page_save';
    logPageEvent({
      event,
      userId: req.userId!,
      pageId: page.id,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });

    res.json({ page });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    const event = req.body.status === 'published' ? 'page_publish' : 'page_save';
    logPageEvent({
      event,
      userId: req.userId!,
      pageId: String(req.params.id),
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function getPage(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  const requesterId = req.userId ?? 'anonymous';

  try {
    const page = await pageService.getPageById(req.params.id as string, req.userId);
    logPageEvent({
      event: 'page_load',
      userId: requesterId,
      pageId: page.id,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });
    res.json({ page });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logPageEvent({
      event: 'page_load',
      userId: requesterId,
      pageId: String(req.params.id),
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function getPages(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  try {
    const pages = await pageService.getPagesByUser(req.userId!);
    logPageEvent({
      event: 'page_load',
      userId: req.userId!,
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });
    res.json({ pages });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logPageEvent({
      event: 'page_load',
      userId: req.userId!,
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}

export async function deletePage(req: AuthRequest, res: Response): Promise<void> {
  const startedAt = Date.now();
  try {
    await pageService.deletePage(req.params.id as string, req.userId!);
    logPageEvent({
      event: 'page_delete',
      userId: req.userId!,
      pageId: String(req.params.id),
      durationMs: Date.now() - startedAt,
      result: 'success',
      statusCode: 200,
    });
    res.json({ message: 'Pagina deletada' });
  } catch (error) {
    const appError = error instanceof AppError ? error : undefined;
    logPageEvent({
      event: 'page_delete',
      userId: req.userId!,
      pageId: String(req.params.id),
      durationMs: Date.now() - startedAt,
      result: 'error',
      statusCode: appError?.statusCode,
      code: appError?.code,
    });
    throw error;
  }
}
