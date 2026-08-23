import api from './api';

export interface CreateTicketPayload {
  name: string;
  email: string;
  subject: string;
  orderRef?: string;
  message: string;
}

export interface SupportTicketResponse {
  id: string;
  protocol: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface CreateTicketApiResponse {
  success: boolean;
  message: string;
  ticket: SupportTicketResponse;
}

export const contactService = {
  async createTicket(payload: CreateTicketPayload): Promise<SupportTicketResponse> {
    const response = await api.post<CreateTicketApiResponse>('/contact', payload);
    return response.data.ticket;
  },
};
