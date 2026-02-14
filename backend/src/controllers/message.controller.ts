import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export async function createMessage(req: AuthRequest, res: Response): Promise<void> {
  const { message, recipient, theme } = req.body;
  const userId = req.userId!;

  const newMessage = await prisma.message.create({
    data: {
      message,
      recipient,
      theme,
      userId,
    },
  });

  res.status(201).json({ message: newMessage });
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ messages });
}

export async function getMessage(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  res.json({ message });
}

export async function getPublicCard(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;

  const message = await prisma.message.findUnique({
    where: { id, paymentStatus: 'paid' },
    select: {
      id: true,
      message: true,
      recipient: true,
      mediaUrl: true,
      theme: true,
      createdAt: true,
    },
  });

  if (!message) {
    throw new AppError('Cartão não encontrado ou pagamento pendente', 404);
  }

  res.json({ card: message });
}

export async function deleteMessage(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const userId = req.userId!;

  const message = await prisma.message.findUnique({ where: { id } });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }
  if (message.userId !== userId) {
    throw new AppError('Sem permissão', 403);
  }

  await prisma.message.delete({ where: { id } });
  res.json({ message: 'Mensagem deletada' });
}
