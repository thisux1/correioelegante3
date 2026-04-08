import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import * as mercadopagoService from '../services/mercadopago.service';
import * as stripeService from '../services/stripe.service';
import { prisma } from '../utils/prisma';

type PaymentResourceType = 'message' | 'page';
type RefundReasonType = 'service_failure' | 'within_7_days';

interface PaymentTarget {
  resourceType: PaymentResourceType;
  resourceId: string;
}

function resolvePaymentTarget(body: {
  messageId?: string;
  resourceType?: PaymentResourceType;
  resourceId?: string;
}): PaymentTarget {
  if (body.resourceType && body.resourceId) {
    return {
      resourceType: body.resourceType,
      resourceId: body.resourceId,
    };
  }

  if (body.messageId) {
    return {
      resourceType: 'message',
      resourceId: body.messageId,
    };
  }

  throw new AppError('resourceType/resourceId ou messageId sao obrigatorios', 400);
}

async function getResourcePaymentStatus(params: {
  resourceType: PaymentResourceType;
  resourceId: string;
  userId: string;
}) {
  if (params.resourceType === 'message') {
    const message = await prisma.message.findUnique({
      where: { id: params.resourceId },
      select: { paymentStatus: true, paymentId: true, userId: true, paymentProvider: true, paymentMethod: true },
    });

    if (!message) {
      throw new AppError('Mensagem não encontrada', 404);
    }
    if (message.userId !== params.userId) {
      throw new AppError('Sem permissão', 403);
    }

    return {
      status: message.paymentStatus,
      paymentId: message.paymentId,
      paymentProvider: message.paymentProvider,
      paymentMethod: message.paymentMethod,
    };
  }

  const page = await prisma.page.findUnique({
    where: { id: params.resourceId },
    select: { paymentStatus: true, paymentId: true, userId: true, paymentProvider: true, paymentMethod: true },
  });

  if (!page) {
    throw new AppError('Pagina nao encontrada', 404);
  }
  if (page.userId !== params.userId) {
    throw new AppError('Sem permissao', 403);
  }

  return {
    status: page.paymentStatus,
    paymentId: page.paymentId,
    paymentProvider: page.paymentProvider,
    paymentMethod: page.paymentMethod,
  };
}

export async function createPayment(req: AuthRequest, res: Response): Promise<void> {
  const { paymentMethod } = req.body as { paymentMethod: 'pix' | 'credit_card' };
  const target = resolvePaymentTarget(req.body as {
    messageId?: string;
    resourceType?: PaymentResourceType;
    resourceId?: string;
  });

  if (paymentMethod === 'pix') {
    const result = await mercadopagoService.createPixPaymentForResource(target, req.userId!);
    res.json(result);
    return;
  }

  if (paymentMethod === 'credit_card') {
    const result = await stripeService.createCardPaymentForResource(target, req.userId!);
    res.json(result);
    return;
  }

  throw new AppError('Método de pagamento inválido. Use "pix" ou "credit_card".', 400);
}

export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) {
    throw new AppError('Header stripe-signature obrigatorio', 400);
  }
  const result = await stripeService.handleWebhook(req.body as Buffer, sig);
  res.status(200).json(result);
}

export async function mercadopagoWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-signature'] as string;
  const requestId = req.headers['x-request-id'] as string;
  if (!signature || !requestId) {
    throw new AppError('Headers x-signature e x-request-id obrigatorios', 400);
  }
  const result = await mercadopagoService.handleWebhook(
    req.body as Record<string, unknown>,
    signature,
    requestId,
  );
  res.status(200).json(result);
}

export async function getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  const { messageId } = req.params as Record<string, string>;
  const status = await getResourcePaymentStatus({
    resourceType: 'message',
    resourceId: messageId,
    userId: req.userId!,
  });
  res.json(status);
}

export async function getPaymentStatusByResource(req: AuthRequest, res: Response): Promise<void> {
  const { resourceType, resourceId } = req.params as {
    resourceType: PaymentResourceType;
    resourceId: string;
  };

  if (resourceType !== 'message' && resourceType !== 'page') {
    throw new AppError('resourceType invalido. Use "message" ou "page".', 400);
  }

  const status = await getResourcePaymentStatus({
    resourceType,
    resourceId,
    userId: req.userId!,
  });

  res.json(status);
}

function isWithinDays(date: Date, days: number): boolean {
  const now = Date.now();
  const diffMs = now - date.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

export async function requestRefund(req: AuthRequest, res: Response): Promise<void> {
  const { resourceType, resourceId, reasonType, reason } = req.body as {
    resourceType: PaymentResourceType;
    resourceId: string;
    reasonType: RefundReasonType;
    reason?: string;
  };

  if (resourceType !== 'message' && resourceType !== 'page') {
    throw new AppError('resourceType invalido. Use "message" ou "page".', 400);
  }

  const existingOpenRequest = await prisma.refundRequest.findFirst({
    where: {
      userId: req.userId!,
      resourceType,
      resourceId,
      status: {
        in: ['requested', 'in_review'],
      },
    },
  });

  if (existingOpenRequest) {
    throw new AppError('Ja existe solicitacao de reembolso em aberto para este recurso.', 409, 'REFUND_DUPLICATE_OPEN_REQUEST');
  }

  let paymentStatus: string;
  let eligibilityDate: Date | null;

  if (resourceType === 'message') {
    const message = await prisma.message.findUnique({
      where: { id: resourceId },
      select: {
        userId: true,
        paymentStatus: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    if (!message) {
      throw new AppError('Mensagem não encontrada', 404);
    }

    if (message.userId !== req.userId) {
      throw new AppError('Sem permissão', 403);
    }

    paymentStatus = message.paymentStatus;
    eligibilityDate = message.publishedAt ?? message.updatedAt;
  } else {
    const page = await prisma.page.findUnique({
      where: { id: resourceId },
      select: {
        userId: true,
        paymentStatus: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    if (!page) {
      throw new AppError('Pagina nao encontrada', 404);
    }

    if (page.userId !== req.userId) {
      throw new AppError('Sem permissao', 403);
    }

    paymentStatus = page.paymentStatus;
    eligibilityDate = page.publishedAt ?? page.updatedAt;
  }

  if (paymentStatus !== 'paid') {
    throw new AppError('Reembolso so pode ser solicitado para pagamento concluido.', 400, 'REFUND_NOT_PAID');
  }

  const eligible = reasonType === 'service_failure'
    ? true
    : Boolean(eligibilityDate && isWithinDays(eligibilityDate, 7));

  if (!eligible) {
    throw new AppError('Reembolso fora da janela de 7 dias para este recurso.', 400, 'REFUND_NOT_ELIGIBLE');
  }

  const refundRequest = await prisma.refundRequest.create({
    data: {
      userId: req.userId!,
      resourceType,
      resourceId,
      reasonType,
      reason: reason?.trim() ? reason.trim() : null,
      status: 'requested',
    },
  });

  res.status(201).json({ refundRequest });
}
