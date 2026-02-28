import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as paymentService from '../services/payment.service';

export async function createPayment(req: AuthRequest, res: Response): Promise<void> {
  const { messageId } = req.body;
  const result = await paymentService.createPixPayment(messageId, req.userId!);
  res.json(result);
}

export async function webhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  // req.body aqui é um Buffer raw (middleware express.raw configurado na rota)
  const result = await paymentService.handleWebhook(req.body as Buffer, sig);
  res.status(200).json(result);
}

export async function getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  const result = await paymentService.getPaymentStatus(req.params.messageId as string, req.userId!);
  res.json(result);
}
