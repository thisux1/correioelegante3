import api from './api'

export interface CreateMessageData {
  message: string
  recipient: string
  theme?: string
}

export interface PaymentCreateResponse {
  paymentId: string
  qrCode: string
  qrCodeBase64: string
  status: 'pending' | 'paid'
}

export interface PaymentStatusResponse {
  status: 'pending' | 'paid'
  paymentId: string | null
}

export const messageService = {
  create: (data: CreateMessageData) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  getById: (id: string) => api.get(`/messages/${id}`),
  getPublicCard: (id: string) => api.get(`/messages/card/${id}`),
  delete: (id: string) => api.delete(`/messages/${id}`),
}

export const paymentService = {
  create: (messageId: string) => api.post<PaymentCreateResponse>('/payments/create', { messageId }),
  getStatus: (messageId: string) => api.get<PaymentStatusResponse>(`/payments/status/${messageId}`),
}
