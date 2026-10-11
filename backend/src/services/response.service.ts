import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { verifyRsvpToken } from '../utils/rsvpToken';
import { sendRsvpResponseEmail } from './email.service';
import type { CreatePageResponseInput } from '../utils/validation';

type UnknownRecord = Record<string, unknown>;

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === 'PrismaClientKnownRequestError' &&
    (error as Error & { code?: string }).code === 'P2002'
  );
}

function findRsvpBlock(content: unknown, blockId: string): UnknownRecord | undefined {
  const record = (content ?? {}) as UnknownRecord;
  const blocks = Array.isArray(record.blocks) ? record.blocks : [];

  return blocks.find((item): item is UnknownRecord => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      return false;
    }
    const block = item as UnknownRecord;
    return block.id === blockId && block.type === 'ticketRsvp';
  });
}

/**
 * POST /api/pages/:pageId/responses — público. A página precisa estar paga
 * (mesmo 404 do getPageById), o bloco precisa ser um ticketRsvp existente e o
 * token precisa conferir com o HMAC derivado de `${pageId}.${blockId}`.
 */
export async function createPageResponse(pageId: string, input: CreatePageResponseInput) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { user: { select: { email: true } } },
  });

  if (!page) {
    throw new AppError('Pagina nao encontrada', 404);
  }
  if (page.paymentStatus !== 'paid') {
    throw new AppError('Página não encontrada ou com pagamento pendente', 404);
  }

  const block = findRsvpBlock(page.content, input.blockId);
  if (!block) {
    throw new AppError('Bloco de RSVP não encontrado', 404, 'BLOCK_NOT_FOUND');
  }

  if (!verifyRsvpToken(pageId, input.blockId, input.token)) {
    throw new AppError('Token inválido', 403, 'INVALID_TOKEN');
  }

  let response;
  try {
    response = await prisma.pageResponse.create({
      data: {
        pageId,
        blockId: input.blockId,
        choice: input.choice,
        text: input.text,
        respondentName: input.respondentName,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError('Este convite já foi respondido', 409, 'ALREADY_RESPONDED');
    }
    throw error;
  }

  // Notificação ao dono: fire-and-forget — erro de e-mail nunca estoura a resposta.
  const ownerEmail = page.user?.email;
  if (ownerEmail) {
    void sendRsvpResponseEmail({
      to: ownerEmail,
      respondentName: input.respondentName,
      choice: input.choice,
      text: input.text,
    }).catch((err: unknown) => {
      console.error('[ResponseService] Falha ao enviar notificação de RSVP:', err);
    });
  }

  return {
    id: response.id,
    choice: response.choice,
    createdAt: response.createdAt,
  };
}

/**
 * GET /api/pages/:pageId/responses — autenticado, somente o dono.
 * 404 para não-dono: não vaza a existência da página.
 */
export async function getPageResponses(pageId: string, userId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });

  if (!page || page.userId !== userId) {
    throw new AppError('Pagina nao encontrada', 404);
  }

  const responses = await prisma.pageResponse.findMany({
    where: { pageId },
    orderBy: { createdAt: 'asc' },
  });

  return responses.map((response) => ({
    blockId: response.blockId,
    choice: response.choice,
    text: response.text,
    respondentName: response.respondentName,
    createdAt: response.createdAt,
  }));
}
