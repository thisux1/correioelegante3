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

export const paymentService = {
  createPix(target: PaymentTarget) {
    return api.post<PixPaymentResponse>('/payments/create', buildCreatePayload(target, 'pix'))
  },

  createCard(target: PaymentTarget) {
    return api.post<CardPaymentResponse>('/payments/create', buildCreatePayload(target, 'credit_card'))
  },

  getStatus(target: PaymentTarget) {
    return api.get<PaymentStatusResponse>(`/payments/status/${target.resourceType}/${target.resourceId}`)
  },
}
