import api from './api';

export interface CreateTicketPayload {
  name: string;
  email: string;
  subject: string;
  orderRef?: string;
  message: string;
}

export interface SupportTicketReply {
  id: string;
  ticketId: string;
  message: string;
  sentBy: string;
  createdAt: string;
}

export interface SupportTicketResponse {
  id: string;
  protocol: string;
  name: string;
  email: string;
  subject: string;
  orderRef?: string | null;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  replies?: SupportTicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketApiResponse {
  success: boolean;
  message: string;
  ticket: SupportTicketResponse;
}

export interface ListTicketsApiResponse {
  success: boolean;
  total: number;
  tickets: SupportTicketResponse[];
}

export interface ReplyTicketApiResponse {
  success: boolean;
  message: string;
  ticket: SupportTicketResponse;
  reply: SupportTicketReply;
  emailSent: boolean;
}

export const contactService = {
  async createTicket(payload: CreateTicketPayload): Promise<SupportTicketResponse> {
    const response = await api.post<CreateTicketApiResponse>('/contact', payload);
    return response.data.ticket;
  },

  async listTickets(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<ListTicketsApiResponse> {
    const response = await api.get<ListTicketsApiResponse>('/contact/tickets', { params });
    return response.data;
  },

  async getTicketById(id: string): Promise<SupportTicketResponse> {
    const response = await api.get<{ success: boolean; ticket: SupportTicketResponse }>(`/contact/tickets/${id}`);
    return response.data.ticket;
  },

  async replyToTicket(id: string, replyMessage: string, status?: string): Promise<ReplyTicketApiResponse> {
    const response = await api.post<ReplyTicketApiResponse>(`/contact/tickets/${id}/reply`, {
      replyMessage,
      status,
    });
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<SupportTicketResponse> {
    const response = await api.patch<{ success: boolean; ticket: SupportTicketResponse }>(`/contact/tickets/${id}/status`, {
      status,
    });
    return response.data.ticket;
  },
};
