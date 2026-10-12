import { Request, Response } from 'express';
import { generateFromBrief } from '../services/generate.service';
import { interpretFreeText } from '../services/interpret.service';

export async function generatePage(req: Request, res: Response): Promise<void> {
  const result = generateFromBrief(req.body.brief);
  res.status(200).json(result);
}

/** Texto livre → campos do brief. O form usa o resultado para pré-preencher. */
export async function interpretText(req: Request, res: Response): Promise<void> {
  const result = await interpretFreeText(req.body.texto);
  res.status(200).json(result);
}
