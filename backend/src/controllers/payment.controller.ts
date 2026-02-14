import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

// Placeholder for Mercado Pago integration
// Configure with real credentials in production
export async function createPayment(req: AuthRequest, res: Response): Promise<void> {
  const { messageId } = req.body;
  const userId = req.userId!;

  const message = await prisma.message.findUnique({ where: { id: messageId } });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }
  if (message.userId !== userId) {
    throw new AppError('Sem permissão', 403);
  }
  if (message.paymentStatus === 'paid') {
    throw new AppError('Pagamento já realizado', 400);
  }

  // TODO: Integrate Mercado Pago SDK
  // const payment = new MercadoPago.Payment();
  // const result = await payment.create({ ... });

  // Simulated response for development
  const paymentId = `PAY-${Date.now()}`;
  const qrCodeBase64 = 'data:image/png;base64,PLACEHOLDER_QR_CODE';
  const qrCode = `00020126580014br.gov.bcb.pix0136${paymentId}5204000053039865802BR`;

  await prisma.message.update({
    where: { id: messageId },
    data: { paymentId },
  });

  res.json({
    paymentId,
    qrCode,
    qrCodeBase64,
    status: 'pending',
  });
}

export async function webhookHandler(req: Request, res: Response): Promise<void> {
  // TODO: Validate Mercado Pago webhook signature
  const { action, data } = req.body;

  if (action === 'payment.updated' || action === 'payment.created') {
    const paymentId = data?.id?.toString();

    if (paymentId) {
      const message = await prisma.message.findFirst({
        where: { paymentId },
      });

      if (message) {
        await prisma.message.update({
          where: { id: message.id },
          data: { paymentStatus: 'paid' },
        });
      }
    }
  }

  res.status(200).json({ received: true });
}

export async function getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  const messageId = req.params.messageId as string;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { paymentStatus: true, paymentId: true },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  res.json({ status: message.paymentStatus, paymentId: message.paymentId });
}
