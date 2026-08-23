import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const SUBSCRIPTION_PLAN_ID = 'monthly_unlimited';
export const SUBSCRIPTION_PRICE = 15.00;
export const SUBSCRIPTION_PRICE_CENTS = 1500;
export const SUBSCRIPTION_DURATION_DAYS = 30;
const PIX_EXPIRATION_MINUTES = Number(process.env.PIX_EXPIRATION_MINUTES) || 30;

// Mercado Pago desativado — SDK removido das dependências (ver mercadopago.service.ts).

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }
  return new Stripe(key);
}

export async function isUserSubscribed(userOrId: string | { subscriptionStatus?: string | null; subscriptionExpiresAt?: Date | null }): Promise<boolean> {
  if (typeof userOrId === 'string') {
    const user = await prisma.user.findUnique({
      where: { id: userOrId },
      select: { subscriptionStatus: true, subscriptionExpiresAt: true },
    });
    if (!user) return false;
    return Boolean(
      user.subscriptionStatus === 'active' &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt).getTime() > Date.now()
    );
  }

  return Boolean(
    userOrId.subscriptionStatus === 'active' &&
    userOrId.subscriptionExpiresAt &&
    new Date(userOrId.subscriptionExpiresAt).getTime() > Date.now()
  );
}

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      subscriptionProvider: true,
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const isSubscribed = Boolean(
    user.subscriptionStatus === 'active' &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() > Date.now()
  );

  const daysRemaining = user.subscriptionExpiresAt && isSubscribed
    ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    isSubscribed,
    status: isSubscribed ? 'active' : (user.subscriptionStatus || 'none'),
    plan: user.subscriptionPlan || (isSubscribed ? SUBSCRIPTION_PLAN_ID : null),
    expiresAt: user.subscriptionExpiresAt,
    daysRemaining,
    history: user.subscriptions,
  };
}

export async function activateUserSubscription(params: {
  userId: string;
  provider: 'pagbank' | 'mercadopago' | 'stripe' | 'system';
  providerPaymentId?: string;
  paymentMethod?: string;
  durationDays?: number;
}) {
  const durationDays = params.durationDays ?? SUBSCRIPTION_DURATION_DAYS;
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { subscriptionExpiresAt: true, subscriptionStatus: true },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Verificação de idempotência por providerPaymentId
  if (params.providerPaymentId) {
    const existingActiveSub = await prisma.subscription.findFirst({
      where: {
        userId: params.userId,
        providerPaymentId: params.providerPaymentId,
        status: 'active',
      },
    });
    if (existingActiveSub) {
      const now = Date.now();
      const expiresAt = existingActiveSub.expiresAt;
      return {
        success: true,
        isSubscribed: true,
        expiresAt,
        daysRemaining: Math.max(0, Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24))),
      };
    }
  }

  const now = Date.now();
  let baseTimestamp = now;

  // Se já tem assinatura ativa no futuro, estende o prazo
  if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt) {
    const currentExpiry = new Date(user.subscriptionExpiresAt).getTime();
    if (currentExpiry > now) {
      baseTimestamp = currentExpiry;
    }
  }

  const expiresAt = new Date(baseTimestamp + durationDays * 24 * 60 * 60 * 1000);

  // Atualiza usuário e registra no histórico de assinaturas
  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: SUBSCRIPTION_PLAN_ID,
        subscriptionExpiresAt: expiresAt,
        subscriptionProvider: params.provider,
        subscriptionId: params.providerPaymentId,
      },
    }),
    prisma.subscription.create({
      data: {
        userId: params.userId,
        planId: SUBSCRIPTION_PLAN_ID,
        status: 'active',
        amount: SUBSCRIPTION_PRICE,
        provider: params.provider,
        providerPaymentId: params.providerPaymentId,
        paymentMethod: params.paymentMethod,
        startsAt: new Date(now),
        expiresAt,
      },
    }),
    // Auto-aprova rascunhos pendentes do usuário para published
    prisma.page.updateMany({
      where: { userId: params.userId, paymentStatus: 'pending' },
      data: {
        paymentStatus: 'paid',
        status: 'published',
        publishedAt: new Date(now),
      },
    }),
    prisma.message.updateMany({
      where: { userId: params.userId, paymentStatus: 'pending' },
      data: {
        paymentStatus: 'paid',
        status: 'published',
        publishedAt: new Date(now),
      },
    }),
  ]);

  return {
    success: true,
    isSubscribed: true,
    expiresAt,
    daysRemaining: Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24)),
  };
}

// Mercado Pago desativado — SDK removido das dependências (ver mercadopago.service.ts).
export async function createSubscriptionPixPayment(_userId: string): Promise<never> {
  throw new AppError('Mercado Pago não está mais disponível. Use Pix (PagBank) ou cartão (Stripe).', 410, 'PROVIDER_DISABLED');
}

// Mercado Pago desativado — SDK removido das dependências (ver mercadopago.service.ts).
export async function createSubscriptionMercadoPagoPreference(_userId: string): Promise<never> {
  throw new AppError('Mercado Pago não está mais disponível. Use Pix (PagBank) ou cartão (Stripe).', 410, 'PROVIDER_DISABLED');
}

export async function createSubscriptionStripeSession(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const stripe = getStripe();
  const rawBaseUrl = (process.env.FRONTEND_URL || '').trim();
  const baseUrl = (!rawBaseUrl || rawBaseUrl.includes('correioelegantevercel.app'))
    ? (process.env.NODE_ENV === 'production' ? 'https://www.correioelegante.studio' : 'http://localhost:5173')
    : rawBaseUrl.replace(/\/+$/, '');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Correio Elegante Ilimitado (1 Mês)',
            description: 'Acesso ilimitado para criação e envio de cartas e páginas por 30 dias.',
          },
          unit_amount: SUBSCRIPTION_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/planos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/planos`,
    customer_email: user.email,
    metadata: {
      resource_type: 'subscription',
      userId,
      planId: SUBSCRIPTION_PLAN_ID,
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    amount: SUBSCRIPTION_PRICE,
    planId: SUBSCRIPTION_PLAN_ID,
  };
}
