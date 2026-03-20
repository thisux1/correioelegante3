import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as pageService from '../services/page.service';

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
  const { content, status, visibility, publishedAt } = req.body;
  const page = await pageService.createPage(req.userId!, {
    content,
    status,
    visibility,
    publishedAt,
  });

  res.status(201).json({ page });
}

export async function updatePage(req: AuthRequest, res: Response): Promise<void> {
  const headerVersion = parseIfMatchHeader(req.header('if-match'));
  const bodyVersion = typeof req.body.version === 'number' ? req.body.version : undefined;

  const page = await pageService.updatePage(req.params.id as string, req.userId!, {
    content: req.body.content,
    status: req.body.status,
    visibility: req.body.visibility,
    publishedAt: req.body.publishedAt,
    expectedVersion: bodyVersion ?? headerVersion,
  });

  res.json({ page });
}

export async function getPage(req: AuthRequest, res: Response): Promise<void> {
  const page = await pageService.getPageById(req.params.id as string, req.userId);
  res.json({ page });
}

export async function getPages(req: AuthRequest, res: Response): Promise<void> {
  const pages = await pageService.getPagesByUser(req.userId!);
  res.json({ pages });
}

export async function deletePage(req: AuthRequest, res: Response): Promise<void> {
  await pageService.deletePage(req.params.id as string, req.userId!);
  res.json({ message: 'Pagina deletada' });
}
