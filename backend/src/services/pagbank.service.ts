import axios, { AxiosInstance } from 'axios';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { activateUserSubscription } from './subscription.service';
import { sendCriticalAlert } from './alert.service';

export const AMOUNT_AVULSO_CENTS = 499; // R$ 4,99
export const AMOUNT_AVULSO = 4.99;
export const AMOUNT_SUBSCRIPTION_CENTS = 1500; // R$ 15,00
export const AMOUNT_SUBSCRIPTION = 15.00;

// Expiração do QR Code Pix em minutos (padrão PagBank: 30 a 60 min)
const PIX_EXPIRATION_MINUTES = Number(process.env.PIX_EXPIRATION_MINUTES) || 30;

export function formatIsoWithoutMs(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function extractPagBankErrorMessage(errorData: unknown): string {
  if (typeof errorData === 'object' && errorData !== null && 'error_messages' in errorData) {
    const messages = (errorData as { error_messages?: Array<{ code?: string; description?: string; parameter_name?: string }> }).error_messages;
    if (Array.isArray(messages) && messages.length > 0) {
      return messages
        .map((m) => {
          const parts: string[] = [];
          if (m.code) parts.push(`[${m.code}]`);
          if (m.description) parts.push(m.description);
          if (m.parameter_name) parts.push(`(campo: ${m.parameter_name})`);
          return parts.join(' ');
        })
        .join('; ');
    }
  }
  return '';
}

export interface ExtractedQrCode {
  id?: string;
  text: string;
  links?: Array<{ rel: string; href: string; media?: string; type?: string }>;
  expiration_date?: string;
}

export interface PagBankCharge {
  id: string;
  reference_id?: string;
  status: 'PAID' | 'AUTHORIZED' | 'IN_ANALYSIS' | 'DECLINED' | 'CANCELED' | 'WAITING';
  amount: { value: number; currency: string };
  payment_method?: {
    type: string;
    pix?: {
      expiration_date?: string;
    };
  };
  payment_response?: {
    code: string;
    message: string;
  };
  qr_code?: {
    id?: string;
    text: string;
  };
  links?: Array<{
    rel: string;
    href: string;
    media?: string;
    type?: string;
  }>;
}

export function extractQrCodeFromOrder(order: PagBankOrderResponse): ExtractedQrCode | null {
  if (order.qr_codes && order.qr_codes.length > 0 && order.qr_codes[0]?.text) {
    return order.qr_codes[0];
  }

  const charge = order.charges?.[0];
  if (charge?.qr_code?.text) {
    return {
      id: charge.qr_code.id || charge.id || order.id,
      text: charge.qr_code.text,
      links: charge.links || order.links || [],
      expiration_date: charge.payment_method?.pix?.expiration_date,
    };
  }

  return null;
}

export type PaymentResourceType = 'message' | 'page';

export interface PaymentTarget {
  resourceType: PaymentResourceType;
  resourceId: string;
}

export interface PagBankCustomer {
  name: string;
  email: string;
  tax_id: string; // CPF (11 dígitos) ou CNPJ (14 dígitos)
  phones?: Array<{
    country?: string;
    area: string;
    number: string;
    type?: string;
  }>;
}

export interface PagBankPaymentMethod {
  type: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  installments?: number;
  capture?: boolean;
  card?: {
    encrypted: string; // Gerado no frontend com a Public Key do PagBank
    holder: {
      name: string;
    };
  };
}

export interface PagBankOrderPayload {
  reference_id: string;
  customer: PagBankCustomer;
  items: Array<{
    reference_id?: string;
    name: string;
    quantity: number;
    unit_amount: number; // Em centavos (Ex: R$ 4,99 = 499)
  }>;
  qr_codes?: Array<{
    amount: {
      value: number;
    };
    expiration_date?: string;
  }>;
  charges?: Array<{
    reference_id?: string;
    description?: string;
    amount: {
      value: number;
      currency: 'BRL';
    };
    payment_method: PagBankPaymentMethod;
    notification_urls?: string[];
  }>;
  notification_urls?: string[];
}

export interface PagBankOrderResponse {
  id: string;
  reference_id: string;
  created_at: string;
  customer?: PagBankCustomer;
  items?: Array<{
    reference_id?: string;
    name: string;
    quantity: number;
    unit_amount: number;
  }>;
  qr_codes?: Array<{
    id: string;
    amount: { value: number };
    text: string; // Código Pix Copia e Cola
    links?: Array<{
      rel: string;
      href: string;
      media?: string;
      type?: string;
    }>;
    expiration_date?: string;
  }>;
  charges?: PagBankCharge[];
  notification_urls?: string[];
  links?: Array<{
    rel: string;
    href: string;
    media?: string;
    type?: string;
  }>;
}

export function getPagBankBaseUrl(): string {
  const env = (process.env.PAGBANK_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  const customUrl = process.env.PAGBANK_BASE_URL || process.env.PAGSEGURO_BASE_URL;
  if (customUrl) return customUrl.replace(/\/+$/, '');

  if (env === 'production') {
    return 'https://api.pagseguro.com';
  }
  return 'https://sandbox.api.pagseguro.com';
}

export function getPagBankClient(): AxiosInstance {
  const token = process.env.PAGBANK_TOKEN || process.env.PAGSEGURO_TOKEN || process.env.PAGBANK_KEY;
  if (!token) {
    throw new AppError(
      'PAGBANK_TOKEN (ou PAGSEGURO_TOKEN / PAGBANK_KEY) não configurado no ambiente.',
      500,
      'PAGBANK_CONFIG_ERROR',
    );
  }

  return axios.create({
    baseURL: getPagBankBaseUrl(),
    timeout: 20000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  });
}

async function resolveResource(target: PaymentTarget) {
  if (target.resourceType === 'message') {
    const message = await prisma.message.findUnique({ where: { id: target.resourceId } });
    return {
      resourceType: 'message' as const,
      data: message,
    };
  }

  const page = await prisma.page.findUnique({ where: { id: target.resourceId } });
  return {
    resourceType: 'page' as const,
    data: page,
  };
}

async function markResourcePaymentPending(params: {
  resourceType: PaymentResourceType;
  resourceId: string;
  paymentId: string;
}) {
  if (params.resourceType === 'message') {
    await prisma.message.update({
      where: { id: params.resourceId },
      data: {
        paymentId: params.paymentId,
        paymentProvider: 'pagbank',
        paymentMethod: 'pix',
      },
    });
    return;
  }

  await prisma.page.update({
    where: { id: params.resourceId },
    data: {
      paymentId: params.paymentId,
      paymentProvider: 'pagbank',
      paymentMethod: 'pix',
    },
  });
}

export async function markResourcePaymentPaid(target: PaymentTarget) {
  if (target.resourceType === 'message') {
    await prisma.message.updateMany({
      where: {
        id: target.resourceId,
        paymentStatus: { not: 'paid' },
      },
      data: {
        paymentStatus: 'paid',
        status: 'published',
        publishedAt: new Date(),
      },
    });
    return;
  }

  await prisma.page.updateMany({
    where: {
      id: target.resourceId,
      paymentStatus: { not: 'paid' },
    },
    data: {
      paymentStatus: 'paid',
      status: 'published',
      publishedAt: new Date(),
    },
  });
}

function resolveNotificationUrl(): string {
  const rawBaseUrl = (process.env.FRONTEND_URL || '').trim();
  const baseUrl = (!rawBaseUrl || rawBaseUrl.includes('correioelegantevercel.app'))
    ? (process.env.NODE_ENV === 'production' ? 'https://www.correioelegante.studio' : 'http://localhost:5173')
    : rawBaseUrl.replace(/\/+$/, '');

  return `${baseUrl}/api/payments/webhook/pagbank`;
}

function formatCustomerData(user: { email: string }, customerInput?: Partial<PagBankCustomer>): PagBankCustomer {
  const merchantEmail = (process.env.PAGBANK_EMAIL || '').trim().toLowerCase();
  let userEmail = (customerInput?.email || user.email || '').trim();

  // PagBank rejeita pedidos se o e-mail do comprador for idêntico ao da conta do vendedor (erro 40002)
  if (merchantEmail && userEmail.toLowerCase() === merchantEmail) {
    userEmail = userEmail.includes('@')
      ? userEmail.replace('@', '+comprador@')
      : 'comprador@correioelegante.studio';
  }

  const emailPrefix = userEmail ? userEmail.split('@')[0].split('+')[0] : '';
  const defaultName = emailPrefix
    ? (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)) + ' Elegante'
    : 'Cliente Correio Elegante';

  // CPF padrão para checkout quando não fornecido pelo usuário (11 dígitos válidos)
  const defaultTaxId = '19119119100';

  return {
    name: customerInput?.name?.trim() || defaultName,
    email: userEmail || 'cliente@correioelegante.studio',
    tax_id: (customerInput?.tax_id || defaultTaxId).replace(/\D/g, ''),
  };
}



export async function createPixPaymentForResource(
  target: PaymentTarget,
  userId: string,
  customerInput?: Partial<PagBankCustomer>,
) {
  const resource = await resolveResource(target);

  if (!resource.data) {
    throw new AppError(
      target.resourceType === 'message' ? 'Mensagem não encontrada' : 'Página não encontrada',
      404,
    );
  }
  if (resource.data.userId !== userId) {
    throw new AppError('Sem permissão', 403);
  }
  if (resource.data.paymentStatus === 'paid') {
    throw new AppError('Pagamento já realizado', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const customer = formatCustomerData(user, customerInput);
  const expirationDate = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);
  const formattedExpirationDate = formatIsoWithoutMs(expirationDate);
  const notificationUrl = resolveNotificationUrl();

  const orderPayload: PagBankOrderPayload = {
    reference_id: `${target.resourceType}:${target.resourceId}`,
    customer,
    items: [
      {
        reference_id: target.resourceId,
        name: target.resourceType === 'message' ? 'Correio Elegante - Carta Digital' : 'Correio Elegante - Página Personalizada',
        quantity: 1,
        unit_amount: AMOUNT_AVULSO_CENTS,
      },
    ],
    qr_codes: [
      {
        amount: {
          value: AMOUNT_AVULSO_CENTS,
        },
        expiration_date: formattedExpirationDate,
      },
    ],
    notification_urls: [notificationUrl],
  };

  const client = getPagBankClient();
  let response;

  try {
    response = await client.post<PagBankOrderResponse>('/orders', orderPayload);
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: unknown; status?: number }; message?: string };
    const status = axiosError.response?.status;
    const errorDetails = extractPagBankErrorMessage(axiosError.response?.data);
    const rawData = JSON.stringify(axiosError.response?.data || axiosError.message);

    console.error(
      `[PAGBANK] Erro ao gerar Pix (HTTP ${status ?? 'desconhecido'}): ${errorDetails || rawData}`,
    );

    void sendCriticalAlert({
      context: 'pagbank_order',
      title: `Falha ao gerar Pix no PagBank (HTTP ${status ?? 'desconhecido'})`,
      detail: `recurso=${target.resourceType}:${target.resourceId}, usuario=${userId}, erro=${errorDetails || rawData}`,
      error: err,
    });

    throw new AppError(
      'Não foi possível gerar o pagamento Pix no PagBank. Tente novamente em instantes.',
      502,
      'PAGBANK_ORDER_FAILED',
    );
  }

  const order = response.data;
  const qrCodeData = extractQrCodeFromOrder(order);

  if (!qrCodeData || !qrCodeData.text) {
    throw new AppError(
      'Resposta do PagBank não continha o QR Code Pix esperado.',
      502,
      'PAGBANK_INVALID_RESPONSE',
    );
  }

  await markResourcePaymentPending({
    resourceType: target.resourceType,
    resourceId: target.resourceId,
    paymentId: order.id,
  });

  // Link para PNG do QR code se fornecido pela API
  const qrCodePngLink = qrCodeData.links?.find((l) => l.rel === 'QRCODE.PNG' || l.media === 'image/png')?.href || null;

  return {
    paymentMethod: 'pix' as const,
    paymentProvider: 'pagbank' as const,
    paymentId: order.id,
    status: 'pending',
    pixQrCode: qrCodeData.text, // Código Copia e Cola
    pixQrCodeBase64: null,
    pixQrCodeUrl: qrCodePngLink,
    pixExpiresAt: qrCodeData.expiration_date || formattedExpirationDate,
    amount: AMOUNT_AVULSO,
  };
}

export async function createCreditCardPaymentForResource(
  target: PaymentTarget,
  userId: string,
  cardData: {
    encrypted: string;
    holderName: string;
    installments?: number;
    customer?: Partial<PagBankCustomer>;
  },
) {
  const resource = await resolveResource(target);

  if (!resource.data) {
    throw new AppError(
      target.resourceType === 'message' ? 'Mensagem não encontrada' : 'Página não encontrada',
      404,
    );
  }
  if (resource.data.userId !== userId) {
    throw new AppError('Sem permissão', 403);
  }
  if (resource.data.paymentStatus === 'paid') {
    throw new AppError('Pagamento já realizado', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const customer = formatCustomerData(user, cardData.customer);
  const notificationUrl = resolveNotificationUrl();

  const orderPayload: PagBankOrderPayload = {
    reference_id: `${target.resourceType}:${target.resourceId}`,
    customer,
    items: [
      {
        reference_id: target.resourceId,
        name: target.resourceType === 'message' ? 'Correio Elegante - Carta Digital' : 'Correio Elegante - Página Personalizada',
        quantity: 1,
        unit_amount: AMOUNT_AVULSO_CENTS,
      },
    ],
    charges: [
      {
        reference_id: `${target.resourceType}:${target.resourceId}`,
        description: 'Correio Elegante Digital',
        amount: {
          value: AMOUNT_AVULSO_CENTS,
          currency: 'BRL',
        },
        payment_method: {
          type: 'CREDIT_CARD',
          installments: cardData.installments || 1,
          capture: true,
          card: {
            encrypted: cardData.encrypted,
            holder: {
              name: cardData.holderName,
            },
          },
        },
        notification_urls: [notificationUrl],
      },
    ],
    notification_urls: [notificationUrl],
  };

  const client = getPagBankClient();
  let response;

  try {
    response = await client.post<PagBankOrderResponse>('/orders', orderPayload);
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: unknown; status?: number }; message?: string };
    const status = axiosError.response?.status;
    const errorDetails = extractPagBankErrorMessage(axiosError.response?.data);
    const rawData = JSON.stringify(axiosError.response?.data || axiosError.message);

    console.error(
      `[PAGBANK] Erro ao processar cartão (HTTP ${status ?? 'desconhecido'}): ${errorDetails || rawData}`,
    );

    void sendCriticalAlert({
      context: 'pagbank_order',
      title: `Falha ao processar cartão no PagBank (HTTP ${status ?? 'desconhecido'})`,
      detail: `recurso=${target.resourceType}:${target.resourceId}, usuario=${userId}, erro=${errorDetails || rawData}`,
      error: err,
    });

    throw new AppError(
      'Não foi possível processar o cartão no PagBank. Verifique os dados digitados.',
      400,
      'PAGBANK_CARD_FAILED',
    );
  }

  const order = response.data;
  const charge = order.charges?.[0];
  const isPaid = charge?.status === 'PAID' || charge?.status === 'AUTHORIZED';

  if (isPaid) {
    await markResourcePaymentPaid(target);
    return {
      paymentMethod: 'credit_card' as const,
      paymentProvider: 'pagbank' as const,
      paymentId: order.id,
      status: 'paid',
      message: 'Pagamento com cartão aprovado com sucesso!',
    };
  }

  if (charge?.status === 'DECLINED' || charge?.status === 'CANCELED') {
    throw new AppError(
      charge.payment_response?.message || 'Pagamento recusado pela operadora do cartão.',
      400,
      'PAGBANK_CARD_DECLINED',
    );
  }

  await markResourcePaymentPending({
    resourceType: target.resourceType,
    resourceId: target.resourceId,
    paymentId: order.id,
  });

  return {
    paymentMethod: 'credit_card' as const,
    paymentProvider: 'pagbank' as const,
    paymentId: order.id,
    status: charge?.status?.toLowerCase() || 'pending',
    message: 'Pagamento em processamento.',
  };
}

export async function createSubscriptionPagBankPixPayment(
  userId: string,
  customerInput?: Partial<PagBankCustomer>,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const customer = formatCustomerData(user, customerInput);
  const expirationDate = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);
  const formattedExpirationDate = formatIsoWithoutMs(expirationDate);
  const notificationUrl = resolveNotificationUrl();

  const orderPayload: PagBankOrderPayload = {
    reference_id: `subscription:${userId}`,
    customer,
    items: [
      {
        reference_id: 'monthly_unlimited',
        name: 'Correio Elegante Ilimitado - 1 Mês',
        quantity: 1,
        unit_amount: AMOUNT_SUBSCRIPTION_CENTS,
      },
    ],
    qr_codes: [
      {
        amount: {
          value: AMOUNT_SUBSCRIPTION_CENTS,
        },
        expiration_date: formattedExpirationDate,
      },
    ],
    notification_urls: [notificationUrl],
  };

  const client = getPagBankClient();
  let response;

  try {
    response = await client.post<PagBankOrderResponse>('/orders', orderPayload);
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: unknown; status?: number }; message?: string };
    const status = axiosError.response?.status;
    const errorDetails = extractPagBankErrorMessage(axiosError.response?.data);
    const rawData = JSON.stringify(axiosError.response?.data || axiosError.message);

    console.error(
      `[PAGBANK] Erro ao gerar Pix de assinatura (HTTP ${status ?? 'desconhecido'}): ${errorDetails || rawData}`,
    );

    void sendCriticalAlert({
      context: 'pagbank_order',
      title: `Falha ao gerar Pix de assinatura no PagBank (HTTP ${status ?? 'desconhecido'})`,
      detail: `usuario=${userId}, erro=${errorDetails || rawData}`,
      error: err,
    });

    throw new AppError(
      'Não foi possível gerar o Pix da assinatura no PagBank.',
      502,
      'PAGBANK_SUBSCRIPTION_PIX_FAILED',
    );
  }

  const order = response.data;
  const qrCodeData = extractQrCodeFromOrder(order);

  if (!qrCodeData || !qrCodeData.text) {
    throw new AppError(
      'Resposta do PagBank não continha o QR Code Pix de assinatura esperado.',
      502,
      'PAGBANK_INVALID_RESPONSE',
    );
  }

  const qrCodePngLink = qrCodeData.links?.find((l) => l.rel === 'QRCODE.PNG' || l.media === 'image/png')?.href || null;

  return {
    paymentMethod: 'pix' as const,
    paymentProvider: 'pagbank' as const,
    paymentId: order.id,
    status: 'pending',
    pixQrCode: qrCodeData.text,
    pixQrCodeBase64: null,
    pixQrCodeUrl: qrCodePngLink,
    pixExpiresAt: qrCodeData.expiration_date || formattedExpirationDate,
    amount: AMOUNT_SUBSCRIPTION,
    planId: 'monthly_unlimited',
  };
}

export async function syncPagBankPaymentStatus(target: PaymentTarget, orderId: string): Promise<string> {
  try {
    if (!orderId) return 'pending';

    const client = getPagBankClient();
    const response = await client.get<PagBankOrderResponse>(`/orders/${orderId}`);
    const order = response.data;

    const hasPaidCharge = order.charges?.some(
      (c) => c.status === 'PAID' || c.status === 'AUTHORIZED',
    );

    if (hasPaidCharge) {
      await markResourcePaymentPaid(target);
      return 'paid';
    }

    return 'pending';
  } catch (err) {
    console.warn('[PAGBANK] Falha ao sincronizar status do pedido:', err);
    return 'pending';
  }
}

export interface PagBankWebhookResult {
  received: boolean;
  status?: 'ignored_no_order_id' | 'ignored_order_lookup_failed' | 'ignored_unpaid';
  type?: string;
  resourceId?: string;
}

export async function handleWebhook(payload: Record<string, unknown>): Promise<PagBankWebhookResult> {
  // Segurança: NUNCA confiar no corpo do webhook (forjável).
  // Extrair apenas o ID do pedido e confirmar o status real via API autenticada.
  const orderId = (payload.id || payload.order_id) as string | undefined;

  if (!orderId || typeof orderId !== 'string') {
    return { received: true, status: 'ignored_no_order_id' };
  }

  let order: PagBankOrderResponse;
  try {
    const client = getPagBankClient();
    const response = await client.get<PagBankOrderResponse>(`/orders/${orderId}`);
    order = response.data;
  } catch (err) {
    console.warn('[PAGBANK] Webhook: falha ao consultar pedido na API:', err);
    return { received: true, status: 'ignored_order_lookup_failed' };
  }

  // reference_id confiável vem da resposta da API, não do payload recebido
  const referenceId = order.reference_id;
  const charges = order.charges || [];

  const isPaid = charges.some((c) => c.status === 'PAID' || c.status === 'AUTHORIZED');

  if (!isPaid) {
    return { received: true, status: 'ignored_unpaid' };
  }

  // 1. Assinatura
  if (referenceId?.startsWith('subscription:')) {
    const userId = referenceId.split(':')[1];
    if (userId) {
      await activateUserSubscription({
        userId,
        provider: 'pagbank' as unknown as 'mercadopago', // provider salvo como pagbank
        providerPaymentId: order.id || `pagbank_${Date.now()}`,
        paymentMethod: 'pix',
      });
    }
    return { received: true, type: 'subscription' };
  }

  // 2. Recurso (message ou page)
  if (referenceId?.includes(':')) {
    const [resourceType, resourceId] = referenceId.split(':');
    if ((resourceType === 'message' || resourceType === 'page') && resourceId) {
      await markResourcePaymentPaid({
        resourceType: resourceType as PaymentResourceType,
        resourceId,
      });
      return { received: true, type: resourceType, resourceId };
    }
  }

  return { received: true };
}
