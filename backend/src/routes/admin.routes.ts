import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middlewares/auth';
import * as analyticsService from '../services/analytics.service';
import { AppError } from '../utils/AppError';

export const adminAnalyticsRouter = Router();

// Validação inline (SPEC §4.6): days aceita apenas 7|30|90; ausente assume 30.
const daysSchema = z.coerce
  .number()
  .int()
  .refine((value) => value === 7 || value === 30 || value === 90);

function parseDays(query: Request['query']): number {
  const raw = query.days;
  if (raw === undefined) {
    return 30;
  }
  const parsed = daysSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError('Parâmetro days inválido. Use 7, 30 ou 90.', 400, 'VALIDATION_ERROR');
  }
  return parsed.data;
}

adminAnalyticsRouter.get(
  '/analytics/overview',
  authenticate,
  requireAdmin,
  async (_req, res: Response) => {
    res.json(await analyticsService.getOverview());
  }
);

async function handleTimeseries(req: Request, res: Response): Promise<void> {
  const days = parseDays(req.query);
  res.json(await analyticsService.getTimeseries(days));
}

async function handleContent(_req: Request, res: Response): Promise<void> {
  res.json(await analyticsService.getContentInsights());
}

async function handleFunnel(_req: Request, res: Response): Promise<void> {
  res.json(await analyticsService.getFunnel());
}

async function handleRevenue(req: Request, res: Response): Promise<void> {
  const days = parseDays(req.query);
  res.json(await analyticsService.getRevenue(days));
}

// Express 5 encaminha rejeições de handlers async ao errorHandler central.
adminAnalyticsRouter.get('/analytics/timeseries', authenticate, requireAdmin, handleTimeseries);
adminAnalyticsRouter.get('/analytics/content', authenticate, requireAdmin, handleContent);
adminAnalyticsRouter.get('/analytics/funnel', authenticate, requireAdmin, handleFunnel);
adminAnalyticsRouter.get('/analytics/revenue', authenticate, requireAdmin, handleRevenue);
