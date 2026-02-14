import api from './api'

export interface CreateMessageData {
  message: string
  recipient: string
  theme?: string
}

export const messageService = {
  create: (data: CreateMessageData) => api.post('/messages', data),
  getAll: () => api.get('/messages'),
  getById: (id: string) => api.get(`/messages/${id}`),
  getPublicCard: (id: string) => api.get(`/messages/card/${id}`),
  delete: (id: string) => api.delete(`/messages/${id}`),
}

export const paymentService = {
  create: (messageId: string) => api.post('/payments/create', { messageId }),
  getStatus: (messageId: string) => api.get(`/payments/status/${messageId}`),
}
