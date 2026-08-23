import { prisma } from '../utils/prisma';
import { CreateSupportTicketInput } from '../contracts/contact.contract';
import { AppError } from '../utils/AppError';

function generateProtocol(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TKT-${randomNum}`;
}

export async function createTicket(data: CreateSupportTicketInput, userId?: string) {
  const protocol = generateProtocol();

  // Basic HTML sanitization to prevent injection
  const sanitizedMessage = data.message.replace(/<[^>]*>/g, '').trim();
  const sanitizedName = data.name.replace(/<[^>]*>/g, '').trim();
  const sanitizedSubject = data.subject.replace(/<[^>]*>/g, '').trim();
  const sanitizedOrderRef = data.orderRef ? data.orderRef.replace(/<[^>]*>/g, '').trim() : null;

  if (!sanitizedMessage || sanitizedMessage.length < 10) {
    throw new AppError('Mensagem inválida ou muito curta.', 400, 'INVALID_MESSAGE');
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      protocol,
      name: sanitizedName,
      email: data.email.toLowerCase().trim(),
      subject: sanitizedSubject,
      orderRef: sanitizedOrderRef,
      message: sanitizedMessage,
      status: 'open',
      userId: userId || null,
    },
  });

  return {
    id: ticket.id,
    protocol: ticket.protocol,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
}
