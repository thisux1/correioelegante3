import { Request, Response } from 'express';
import { rewriteText, type RewriteAction } from '../services/rewrite.service';

/** AI actions por bloco — reescrita de texto por tom (editor autenticado). */
export async function rewrite(req: Request, res: Response): Promise<void> {
  const text = await rewriteText(
    req.body.text as string,
    req.body.action as RewriteAction,
  );
  res.status(200).json({ text });
}
