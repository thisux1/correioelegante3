import { prisma } from '../utils/prisma';
import { CreateSupportTicketInput } from '../contracts/contact.contract';
import { AppError } from '../utils/AppError';
import {
  sendTicketConfirmationEmail,
  sendNewTicketNotificationToAdmin,
  sendTicketReplyEmail,
} from './email.service';

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

  // Dispara confirmação ao cliente e alerta à equipe aguardando a conclusão
  // para evitar que o ambiente serverless da Vercel congele antes do envio de rede
  try {
    await Promise.allSettled([
      sendTicketConfirmationEmail({
        to: ticket.email,
        recipientName: ticket.name,
        protocol: ticket.protocol,
        subject: ticket.subject,
        message: ticket.message,
      }),
      sendNewTicketNotificationToAdmin({
        protocol: ticket.protocol,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        orderRef: ticket.orderRef,
      }),
    ]);
  } catch (err) {
    console.error('[ContactService] Erro ao disparar e-mails do chamado:', err);
  }

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

export interface ListTicketsFilters {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listTickets(filters: ListTicketsFilters = {}) {
  const { status, search, limit = 50, offset = 0 } = filters;

  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { protocol: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  ]);

  return {
    total,
    tickets,
  };
}

export async function getTicketById(id: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    throw new AppError('Chamado de suporte não encontrado.', 404, 'TICKET_NOT_FOUND');
  }

  return ticket;
}

export interface ReplyTicketInput {
  replyMessage: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'keep';
  sentBy?: string;
}

export async function replyToTicket(ticketId: string, input: ReplyTicketInput) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new AppError('Chamado de suporte não encontrado.', 404, 'TICKET_NOT_FOUND');
  }

  const sanitizedReply = input.replyMessage.replace(/<[^>]*>/g, '').trim();
  if (!sanitizedReply || sanitizedReply.length < 5) {
    throw new AppError('A resposta deve ter no mínimo 5 caracteres.', 400, 'INVALID_REPLY');
  }

  const nextStatus = input.status && input.status !== 'keep' ? input.status : ticket.status;

  // Grava resposta e atualiza status
  const [reply, updatedTicket] = await prisma.$transaction([
    prisma.supportTicketReply.create({
      data: {
        ticketId: ticket.id,
        message: sanitizedReply,
        sentBy: input.sentBy || 'support',
      },
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: nextStatus,
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  ]);

  // Envia e-mail formatado via Resend
  const emailResult = await sendTicketReplyEmail({
    to: ticket.email,
    recipientName: ticket.name,
    protocol: ticket.protocol,
    subject: ticket.subject,
    originalMessage: ticket.message,
    replyMessage: sanitizedReply,
  });

  return {
    ticket: updatedTicket,
    reply,
    emailSent: emailResult.success,
    emailError: emailResult.error,
  };
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Status de chamado inválido.', 400, 'INVALID_STATUS');
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return ticket;
}
