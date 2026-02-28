import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export async function createMessage(
    userId: string,
    data: { message: string; recipient: string; theme: string }
) {
    return prisma.message.create({
        data: { ...data, userId },
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

export async function getPublicCard(id: string) {
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

    return message;
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
