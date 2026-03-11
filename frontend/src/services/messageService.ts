import api from './api'

export type PaymentMethod = 'pix' | 'credit_card'

export interface CreateMessageData {
  message: string
  recipient: string
  theme?: string
}

export interface Message {
  id: string
  message: string
  recipient: string
  mediaUrl?: string
  theme: string
  paymentStatus: 'pending' | 'paid'
  paymentId?: string | null
  createdAt: string
}

/** Resposta para pagamento via Pix (Mercado Pago) */
export interface PixPaymentResponse {
  paymentMethod: 'pix'
  paymentId: string
  status: string
  pixQrCode: string | null
  pixQrCodeBase64: string | null
}

/** Resposta para pagamento via cartão (Stripe Checkout) */
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

export const messageService = {
  create: (data: CreateMessageData) => api.post<{ message: Message }>('/messages', data),
  getAll: () => api.get<{ messages: Message[] }>('/messages'),
  getById: (id: string) => api.get<{ message: Message }>(`/messages/${id}`),
  getPublicCard: (id: string) => api.get<{ message: Message }>(`/messages/card/${id}`),
  delete: (id: string) => api.delete<{ message: string }>(`/messages/${id}`),
}

export const paymentService = {
  createPix: (messageId: string) =>
    api.post<PixPaymentResponse>('/payments/create', { messageId, paymentMethod: 'pix' }),
  createCard: (messageId: string) =>
    api.post<CardPaymentResponse>('/payments/create', { messageId, paymentMethod: 'credit_card' }),
  getStatus: (messageId: string) => api.get<PaymentStatusResponse>(`/payments/status/${messageId}`),
}
