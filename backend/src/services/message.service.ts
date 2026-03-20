import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import type { MessageInput } from '../utils/validation';
import {
  canAccessPageByLifecycle,
  resolvePageLifecycle,
} from '../contracts/page.contract';

export async function createMessage(
    userId: string,
    data: MessageInput
) {
    const lifecycle = resolvePageLifecycle({
        status: data.status,
        visibility: data.visibility,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    });

    return prisma.message.create({
        data: {
            message: data.message,
            recipient: data.recipient,
            theme: data.theme,
            status: lifecycle.status,
            visibility: lifecycle.visibility,
            publishedAt: lifecycle.publishedAt,
            userId,
        },
    });
}

export async function getMessagesByUser(userId: string) {
    return prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getMessageById(id: string, userId: string) {
    const message = await prisma.message.findUnique({ where: { id } });

    if (!message) {
        throw new AppError('Mensagem não encontrada', 404);
    }
    if (message.userId !== userId) {
        throw new AppError('Sem permissão', 403);
    }

    return message;
}

export async function getPublicCard(id: string, requesterUserId?: string) {
    const message = await prisma.message.findUnique({
        where: { id },
        select: {
            id: true,
            message: true,
            recipient: true,
            mediaUrl: true,
            theme: true,
            createdAt: true,
            status: true,
            visibility: true,
            userId: true,
            publishedAt: true,
            paymentStatus: true,
        },
    });

    if (!message || message.paymentStatus !== 'paid') {
        throw new AppError('Cartão não encontrado ou pagamento pendente', 404);
    }

    const lifecycle = resolvePageLifecycle({
        status: message.status,
        visibility: message.visibility,
        paymentStatus: message.paymentStatus,
        publishedAt: message.publishedAt,
        createdAt: message.createdAt,
    });

    const hasAccess = canAccessPageByLifecycle({
        status: lifecycle.status,
        visibility: lifecycle.visibility,
        ownerUserId: message.userId,
        requesterUserId,
    });

    if (!hasAccess) {
        throw new AppError('Cartão não encontrado ou sem acesso', 404);
    }

    return {
        id: message.id,
        message: message.message,
        recipient: message.recipient,
        mediaUrl: message.mediaUrl,
        theme: message.theme,
        createdAt: message.createdAt,
        status: lifecycle.status,
        visibility: lifecycle.visibility,
        publishedAt: lifecycle.publishedAt,
    };
}

export async function deleteMessage(id: string, userId: string) {
    const message = await prisma.message.findUnique({ where: { id } });

    if (!message) {
        throw new AppError('Mensagem não encontrada', 404);
    }
    if (message.userId !== userId) {
        throw new AppError('Sem permissão', 403);
    }

    await prisma.message.delete({ where: { id } });
}

export async function setMediaUrl(messageId: string, userId: string, mediaUrl: string) {
    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
        throw new AppError('Mensagem não encontrada', 404);
    }
    if (message.userId !== userId) {
        throw new AppError('Sem permissão', 403);
    }

    return prisma.message.update({
        where: { id: messageId },
        data: { mediaUrl },
    });
}
