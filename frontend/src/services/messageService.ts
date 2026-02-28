import api from './api'

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

export interface PaymentCreateResponse {
  paymentIntentId: string
  clientSecret: string | null
  status: string
  pixQrCode: string | null
  pixQrCodeImageUrl: string | null
}

export interface PaymentStatusResponse {
  status: 'pending' | 'paid'
  paymentId: string | null
}

export const messageService = {
  create: (data: CreateMessageData) => api.post<{ message: Message }>('/messages', data),
  getAll: () => api.get<{ messages: Message[] }>('/messages'),
  getById: (id: string) => api.get<{ message: Message }>(`/messages/${id}`),
  getPublicCard: (id: string) => api.get<{ message: Message }>(`/messages/card/${id}`),
  delete: (id: string) => api.delete<{ message: string }>(`/messages/${id}`),
}

export const paymentService = {
  create: (messageId: string) => api.post<PaymentCreateResponse>('/payments/create', { messageId }),
  getStatus: (messageId: string) => api.get<PaymentStatusResponse>(`/payments/status/${messageId}`),
}
