import { Request, Response } from 'express';
import { generateFromBrief } from '../services/generate.service';

export async function generatePage(req: Request, res: Response): Promise<void> {
  const result = generateFromBrief(req.body.brief);
  res.status(200).json(result);
}
