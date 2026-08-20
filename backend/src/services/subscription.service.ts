import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const SUBSCRIPTION_PLAN_ID = 'monthly_unlimited';
export const SUBSCRIPTION_PRICE = 15.00;
export const SUBSCRIPTION_PRICE_CENTS = 1500;
export const SUBSCRIPTION_DURATION_DAYS = 30;
const PIX_EXPIRATION_MINUTES = Number(process.env.PIX_EXPIRATION_MINUTES) || 30;

function getMercadoPagoClient(): MercadoPagoConfig {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN (ou MP_ACCESS_TOKEN) não configurada');
  }
  return new MercadoPagoConfig({ accessToken: token });
}

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
  provider: 'mercadopago' | 'stripe' | 'system';
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

export async function createSubscriptionPixPayment(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const rawEmail = user.email?.trim() || '';
  const isSandbox = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-');
  const isSellerEmail = rawEmail.toLowerCase() === 'thicosta1432@gmail.com' || rawEmail.toLowerCase() === 'thiagocostabr74@gmail.com';
  const isTestUserDomain = rawEmail.toLowerCase().includes('@testuser.com');
  const payerEmail = isSandbox
    ? (isTestUserDomain ? rawEmail : 'test_user_comprador@testuser.com')
    : ((!rawEmail || isSellerEmail) ? 'comprador_correio@example.com' : rawEmail);

  const expiresAt = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);
  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL || process.env.MP_NOTIFICATION_URL;

  const client = getMercadoPagoClient();
  const payment = new Payment(client);

  const paymentBody: Record<string, unknown> = {
    transaction_amount: SUBSCRIPTION_PRICE,
    description: 'Correio Elegante Ilimitado - 1 Mês',
    payment_method_id: 'pix',
    statement_descriptor: 'CORREIOILIM',
    date_of_expiration: expiresAt.toISOString(),
    external_reference: `subscription:${userId}`,
    payer: {
      email: payerEmail,
      first_name: 'Assinante',
      last_name: 'Elegante',
      identification: {
        type: 'CPF',
        number: '19119119100',
      },
    },
    metadata: {
      resource_type: 'subscription',
      user_id: userId,
      plan_id: SUBSCRIPTION_PLAN_ID,
    },
  };

  if (notificationUrl) {
    paymentBody.notification_url = notificationUrl;
  }

  let result;
  try {
    result = await payment.create({
      body: paymentBody,
      requestOptions: {
        idempotencyKey: `pix_sub_${userId}_${Date.now()}`,
      },
    });
  } catch (mpErr) {
    console.error('Mercado Pago Pix Subscription error:', mpErr);
    throw new AppError(
      'Não foi possível gerar o Pix da assinatura no momento. Tente novamente.',
      502,
      'SUBSCRIPTION_PIX_FAILED',
    );
  }

  if (result && result.id && result.point_of_interaction?.transaction_data?.qr_code) {
    const pixData = result.point_of_interaction.transaction_data;
    return {
      paymentId: String(result.id),
      status: result.status ?? 'pending',
      pixQrCode: pixData.qr_code ?? null,
      pixQrCodeBase64: pixData.qr_code_base64 ?? null,
      pixExpiresAt: expiresAt.toISOString(),
      amount: SUBSCRIPTION_PRICE,
      planId: SUBSCRIPTION_PLAN_ID,
    };
  }

  throw new AppError(
    'Não foi possível carregar os dados do Pix da assinatura.',
    502,
    'PAYMENT_DATA_UNAVAILABLE',
  );
}

export async function createSubscriptionMercadoPagoPreference(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const rawEmail = user.email?.trim() || '';
  const isSandbox = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST-');
  const isSellerEmail = rawEmail.toLowerCase() === 'thicosta1432@gmail.com' || rawEmail.toLowerCase() === 'thiagocostabr74@gmail.com';
  const isTestUserDomain = rawEmail.toLowerCase().includes('@testuser.com');

  const client = getMercadoPagoClient();
  const preference = new Preference(client);

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const isHttps = baseUrl.startsWith('https://');

  const successUrl = isHttps
    ? `${baseUrl}/planos/sucesso`
    : 'https://correioelegante.studio/planos/sucesso';

  const cancelUrl = isHttps
    ? `${baseUrl}/planos`
    : 'https://correioelegante.studio/planos';

  const prefBody: Record<string, unknown> = {
    items: [
      {
        id: SUBSCRIPTION_PLAN_ID,
        title: 'Correio Elegante Ilimitado - 1 Mês',
        description: 'Acesso ilimitado por 30 dias para criar e enviar cartas e páginas.',
        unit_price: SUBSCRIPTION_PRICE,
        quantity: 1,
        currency_id: 'BRL',
      },
    ],
    back_urls: {
      success: successUrl,
      pending: successUrl,
      failure: cancelUrl,
    },
    auto_return: 'approved',
    metadata: {
      resource_type: 'subscription',
      user_id: userId,
      plan_id: SUBSCRIPTION_PLAN_ID,
    },
    external_reference: `subscription:${userId}`,
  };

  if (!isSandbox && user.email && !isSellerEmail) {
    prefBody.payer = { email: user.email };
  } else if (isSandbox && user.email && isTestUserDomain) {
    prefBody.payer = { email: user.email };
  }

  const prefResult = await preference.create({
    body: prefBody as Parameters<typeof preference.create>[0]['body'],
  });

  if (prefResult && prefResult.id) {
    const checkoutUrl = isSandbox && prefResult.sandbox_init_point
      ? prefResult.sandbox_init_point
      : (prefResult.init_point || prefResult.sandbox_init_point);

    return {
      paymentId: String(prefResult.id),
      status: 'pending',
      preferenceId: String(prefResult.id),
      checkoutUrl,
      amount: SUBSCRIPTION_PRICE,
      planId: SUBSCRIPTION_PLAN_ID,
    };
  }

  throw new AppError('Não foi possível gerar o Checkout de assinatura.', 502);
}

export async function createSubscriptionStripeSession(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const stripe = getStripe();
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

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
