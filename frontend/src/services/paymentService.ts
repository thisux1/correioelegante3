import api from './api'

export type PaymentMethod = 'pix' | 'credit_card'
export type PaymentResourceType = 'message' | 'page'

export interface PaymentTarget {
  resourceType: PaymentResourceType
  resourceId: string
}

export interface PixPaymentResponse {
  paymentMethod: 'pix'
  paymentProvider?: 'pagbank' | 'mercadopago' | string
  paymentId: string
  status: string
  pixQrCode: string | null
  pixQrCodeBase64: string | null
  pixQrCodeUrl?: string | null
  pixExpiresAt?: string | null
  preferenceId?: string | null
  checkoutUrl?: string | null
  amount?: number
}

export interface CardPaymentResponse {
  paymentMethod: 'credit_card'
  sessionId: string
  checkoutUrl: string | null
}

export type PaymentCreateResponse = PixPaymentResponse | CardPaymentResponse

export interface PaymentStatusResponse {
  status: 'pending' | 'paid'
  paymentId: string | null
  paymentProvider: 'pagbank' | 'stripe' | 'mercadopago' | null
  paymentMethod: PaymentMethod | null
}


function buildCreatePayload(target: PaymentTarget, paymentMethod: PaymentMethod, turnstileToken?: string) {
  const base: Record<string, unknown> = {
    paymentMethod,
    resourceType: target.resourceType,
    resourceId: target.resourceId,
  }

  if (turnstileToken) {
    base.turnstileToken = turnstileToken
  }

  if (target.resourceType === 'message') {
    base.messageId = target.resourceId
  }

  return base
}

export interface SubscriptionStatusResponse {
  isSubscribed: boolean
  status: string
  plan: string | null
  expiresAt: string | null
  daysRemaining: number
  history?: Array<{
    id: string
    planId: string
    status: string
    amount: number
    startsAt: string
    expiresAt: string
  }>
}

export const paymentService = {
  createPix(target: PaymentTarget, turnstileToken?: string) {
    const payload = buildCreatePayload(target, 'pix', turnstileToken)
    return turnstileToken
      ? api.post<PixPaymentResponse>('/payments/create', payload, { headers: { 'cf-turnstile-response': turnstileToken } })
      : api.post<PixPaymentResponse>('/payments/create', payload)
  },

  createCard(target: PaymentTarget, turnstileToken?: string) {
    const payload = buildCreatePayload(target, 'credit_card', turnstileToken)
    return turnstileToken
      ? api.post<CardPaymentResponse>('/payments/create', payload, { headers: { 'cf-turnstile-response': turnstileToken } })
      : api.post<CardPaymentResponse>('/payments/create', payload)
  },

  createMercadoPagoCheckout(target: PaymentTarget, turnstileToken?: string) {
    const payload: Record<string, unknown> = {
      paymentMethod: 'mercadopago_checkout',
      resourceType: target.resourceType,
      resourceId: target.resourceId,
      messageId: target.resourceType === 'message' ? target.resourceId : undefined,
    }
    if (turnstileToken) {
      payload.turnstileToken = turnstileToken
    }

    return turnstileToken
      ? api.post<{
          paymentId: string
          status: string
          checkoutUrl: string | null
          preferenceId: string | null
        }>('/payments/create', payload, { headers: { 'cf-turnstile-response': turnstileToken } })
      : api.post<{
          paymentId: string
          status: string
          checkoutUrl: string | null
          preferenceId: string | null
        }>('/payments/create', payload)
  },

  getStatus(target: PaymentTarget) {
    return api.get<PaymentStatusResponse>(`/payments/status/${target.resourceType}/${target.resourceId}`)
  },

  simulateApproval(target: PaymentTarget) {
    return api.post<{ success: boolean; message: string }>('/payments/simulate-approval', {
      resourceType: target.resourceType,
      resourceId: target.resourceId,
    })
  },

  createSubscriptionPix(turnstileToken?: string) {
    const payload: Record<string, unknown> = {
      paymentMethod: 'pix',
      planId: 'monthly_unlimited',
    }
    if (turnstileToken) {
      payload.turnstileToken = turnstileToken
    }

    return turnstileToken
      ? api.post<PixPaymentResponse & { amount: number; planId: string }>(
          '/payments/subscription/checkout',
          payload,
          { headers: { 'cf-turnstile-response': turnstileToken } }
        )
      : api.post<PixPaymentResponse & { amount: number; planId: string }>(
          '/payments/subscription/checkout',
          payload
        )
  },

  createSubscriptionCard(turnstileToken?: string) {
    const payload: Record<string, unknown> = {
      paymentMethod: 'credit_card',
      planId: 'monthly_unlimited',
    }
    if (turnstileToken) {
      payload.turnstileToken = turnstileToken
    }

    return turnstileToken
      ? api.post<{ sessionId: string; checkoutUrl: string | null; amount: number; planId: string }>(
          '/payments/subscription/checkout',
          payload,
          { headers: { 'cf-turnstile-response': turnstileToken } }
        )
      : api.post<{ sessionId: string; checkoutUrl: string | null; amount: number; planId: string }>(
          '/payments/subscription/checkout',
          payload
        )
  },

  createSubscriptionMercadoPagoCheckout(turnstileToken?: string) {
    const payload: Record<string, unknown> = {
      paymentMethod: 'mercadopago_checkout',
      planId: 'monthly_unlimited',
    }
    if (turnstileToken) {
      payload.turnstileToken = turnstileToken
    }

    return turnstileToken
      ? api.post<{
          paymentId: string
          status: string
          checkoutUrl: string | null
          preferenceId: string | null
          amount: number
          planId: string
        }>('/payments/subscription/checkout', payload, { headers: { 'cf-turnstile-response': turnstileToken } })
      : api.post<{
          paymentId: string
          status: string
          checkoutUrl: string | null
          preferenceId: string | null
          amount: number
          planId: string
        }>('/payments/subscription/checkout', payload)
  },



  getSubscriptionStatus() {
    return api.get<SubscriptionStatusResponse>('/payments/subscription/status')
  },

  simulateSubscriptionApproval() {
    return api.post<{ success: boolean; message: string; isSubscribed: boolean; expiresAt: string; daysRemaining: number }>(
      '/payments/simulate-subscription',
      {}
    )
  },
}
