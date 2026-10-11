import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

export async function createPageReport(req: Request, res: Response): Promise<void> {
  const report = await reportService.createPageReport(req.params.pageId as string, req.body);
  res.status(201).json({ report });
}

export async function listPageReports(req: Request, res: Response): Promise<void> {
  const includeResolved = req.query.all === 'true';
  const reports = await reportService.listPageReports(includeResolved);
  res.json({ reports });
}

export async function resolvePageReport(req: Request, res: Response): Promise<void> {
  const report = await reportService.resolvePageReport(req.params.id as string);
  res.json({ report: { id: report.id, resolved: report.resolved } });
}

export async function unpublishPage(req: Request, res: Response): Promise<void> {
  const page = await reportService.unpublishPage(req.params.id as string);
  res.json({ page });
}
