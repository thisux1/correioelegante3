import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import * as mercadopagoService from '../services/mercadopago.service';
import * as stripeService from '../services/stripe.service';
import { prisma } from '../utils/prisma';

export async function createPayment(req: AuthRequest, res: Response): Promise<void> {
  const { messageId, paymentMethod } = req.body as { messageId: string; paymentMethod: 'pix' | 'credit_card' };

  if (paymentMethod === 'pix') {
    const result = await mercadopagoService.createPixPayment(messageId, req.userId!);
    res.json(result);
    return;
  }

  if (paymentMethod === 'credit_card') {
    const result = await stripeService.createCardPayment(messageId, req.userId!);
    res.json(result);
    return;
  }

  throw new AppError('Método de pagamento inválido. Use "pix" ou "credit_card".', 400);
}

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  const result = await stripeService.handleWebhook(req.body as Buffer, sig);
  res.status(200).json(result);
}

export async function mercadopagoWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-signature'] as string;
  const requestId = req.headers['x-request-id'] as string;
  const result = await mercadopagoService.handleWebhook(
    req.body as Record<string, unknown>,
    signature,
    requestId,
  );
  res.status(200).json(result);
}

export async function getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  const { messageId } = req.params as Record<string, string>;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { paymentStatus: true, paymentId: true, userId: true, paymentProvider: true, paymentMethod: true },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }
  if (message.userId !== req.userId!) {
    throw new AppError('Sem permissão', 403);
  }

  res.json({
    status: message.paymentStatus,
    paymentId: message.paymentId,
    paymentProvider: message.paymentProvider,
    paymentMethod: message.paymentMethod,
  });
}
