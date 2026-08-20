import api from './api'

export type PaymentMethod = 'pix' | 'credit_card'
export type PaymentResourceType = 'message' | 'page'

export interface PaymentTarget {
  resourceType: PaymentResourceType
  resourceId: string
}

export interface PixPaymentResponse {
  paymentMethod: 'pix'
  paymentId: string
  status: string
  pixQrCode: string | null
  pixQrCodeBase64: string | null
  pixExpiresAt?: string | null
  preferenceId?: string | null
  checkoutUrl?: string | null
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
  paymentProvider: 'stripe' | 'mercadopago' | null
  paymentMethod: PaymentMethod | null
}

function buildCreatePayload(target: PaymentTarget, paymentMethod: PaymentMethod) {
  if (target.resourceType === 'message') {
    return {
      paymentMethod,
      resourceType: target.resourceType,
      resourceId: target.resourceId,
      messageId: target.resourceId,
    }
  }

  return {
    paymentMethod,
    resourceType: target.resourceType,
    resourceId: target.resourceId,
  }
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
  createPix(target: PaymentTarget) {
    return api.post<PixPaymentResponse>('/payments/create', buildCreatePayload(target, 'pix'))
  },

  createCard(target: PaymentTarget) {
    return api.post<CardPaymentResponse>('/payments/create', buildCreatePayload(target, 'credit_card'))
  },

  createMercadoPagoCheckout(target: PaymentTarget) {
    return api.post<{
      paymentId: string
      status: string
      checkoutUrl: string | null
      preferenceId: string | null
    }>('/payments/create', {
      paymentMethod: 'mercadopago_checkout',
      resourceType: target.resourceType,
      resourceId: target.resourceId,
      messageId: target.resourceType === 'message' ? target.resourceId : undefined,
    })
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

  createSubscriptionPix() {
    return api.post<PixPaymentResponse & { amount: number; planId: string }>('/payments/subscription/checkout', {
      paymentMethod: 'pix',
      planId: 'monthly_unlimited',
    })
  },

  createSubscriptionCard() {
    return api.post<{ sessionId: string; checkoutUrl: string | null; amount: number; planId: string }>('/payments/subscription/checkout', {
      paymentMethod: 'credit_card',
      planId: 'monthly_unlimited',
    })
  },

  createSubscriptionMercadoPagoCheckout() {
    return api.post<{
      paymentId: string
      status: string
      checkoutUrl: string | null
      preferenceId: string | null
      amount: number
      planId: string
    }>('/payments/subscription/checkout', {
      paymentMethod: 'mercadopago_checkout',
      planId: 'monthly_unlimited',
    })
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
