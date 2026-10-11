import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as responseService from '../services/response.service';
import type { CreatePageResponseInput } from '../utils/validation';

export async function createPageResponse(req: AuthRequest, res: Response): Promise<void> {
  const input = req.body as CreatePageResponseInput;
  const response = await responseService.createPageResponse(req.params.pageId as string, input);
  res.status(201).json({ response });
}

export async function getPageResponses(req: AuthRequest, res: Response): Promise<void> {
  const responses = await responseService.getPageResponses(
    req.params.pageId as string,
    req.userId!,
  );
  res.json({ responses });
}
