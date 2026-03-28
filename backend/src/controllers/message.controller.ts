import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as messageService from '../services/message.service';

export async function createMessage(req: AuthRequest, res: Response): Promise<void> {
  const { message, recipient, theme, status, visibility, publishedAt } = req.body;
  const newMessage = await messageService.createMessage(req.userId!, {
    message,
    recipient,
    theme,
    status,
    visibility,
    publishedAt,
  });
  res.status(201).json({ message: newMessage });
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  const messages = await messageService.getMessagesByUser(req.userId!);
  res.json({ messages });
}

export async function getMessage(req: AuthRequest, res: Response): Promise<void> {
  const message = await messageService.getMessageById(req.params.id as string, req.userId!);
  res.json({ message });
}

export async function getPublicCard(req: AuthRequest, res: Response): Promise<void> {
  const message = await messageService.getPublicCard(req.params.id as string, req.userId);
  res.json({ message });
}

export async function deleteMessage(req: AuthRequest, res: Response): Promise<void> {
  await messageService.deleteMessage(req.params.id as string, req.userId!);
  res.json({ message: 'Mensagem deletada' });
}
