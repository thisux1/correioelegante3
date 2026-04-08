import api from './api'
import type { PageStatus, PageVisibility } from '@/editor/types'

export interface CreateMessageData {
  message: string
  recipient: string
  theme?: string
  status?: PageStatus
  visibility?: PageVisibility
  publishedAt?: string | null
}

export interface Message {
  id: string
  message: string
  recipient: string
  mediaUrl?: string
  theme: string
  status: PageStatus
  visibility: PageVisibility
  publishedAt: string | null
  paymentStatus: 'pending' | 'paid'
  paymentId?: string | null
  createdAt: string
}


export const messageService = {
  create: (data: CreateMessageData) => api.post<{ message: Message }>('/messages', data),
  getAll: () => api.get<{ messages: Message[] }>('/messages'),
  getById: (id: string) => api.get<{ message: Message }>(`/messages/${id}`),
  getPublicCard: (id: string) => api.get<{ message: Message }>(`/messages/card/${id}`),
  delete: (id: string) => api.delete<{ message: string }>(`/messages/${id}`),
}
