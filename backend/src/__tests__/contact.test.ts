import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';
import { generateAccessToken } from '../utils/jwt';

function makeToken(userId = '507f1f77bcf86cd799439000') {
  return generateAccessToken(userId);
}

describe('Contact & Support Ticket Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    it('deve registrar um novo chamado de suporte com sucesso e retornar protocolo', async () => {
      const mockTicket = {
        id: '507f1f77bcf86cd799439123',
        protocol: 'TKT-123456',
        name: 'Maria Silva',
        email: 'maria@example.com',
        subject: 'Problema com Pagamento',
        orderRef: 'order-999',
        message: 'Olá, fiz o pagamento via PIX e gostaria de confirmar a liberação.',
        status: 'open',
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.supportTicket, 'create').mockResolvedValueOnce(mockTicket as any);

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Maria Silva',
          email: 'maria@example.com',
          subject: 'Problema com Pagamento',
          orderRef: 'order-999',
          message: 'Olá, fiz o pagamento via PIX e gostaria de confirmar a liberação.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket).toBeDefined();
      expect(res.body.ticket.protocol).toBe('TKT-123456');
      expect(res.body.ticket.name).toBe('Maria Silva');
      expect(res.body.ticket.email).toBe('maria@example.com');
    });

    it('deve retornar erro 400 se o e-mail for inválido', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Maria Silva',
          email: 'email-invalido',
          subject: 'Dúvida Geral',
          message: 'Esta é uma mensagem válida com mais de 10 caracteres.',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('E-mail em formato inválido');
    });
  });

  describe('GET /api/contact/tickets (Admin Only)', () => {
    it('deve listar os chamados para usuário administrador', async () => {
      const token = makeToken();
      const mockTickets = [
        {
          id: '507f1f77bcf86cd799439123',
          protocol: 'TKT-123456',
          name: 'Maria Silva',
          email: 'maria@example.com',
          subject: 'Dúvida',
          status: 'open',
          replies: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: '507f1f77bcf86cd799439000',
        email: 'admin@example.com',
      } as any);
      vi.spyOn(prisma.supportTicket, 'count').mockResolvedValueOnce(1);
      vi.spyOn(prisma.supportTicket, 'findMany').mockResolvedValueOnce(mockTickets as any);

      const res = await request(app)
        .get('/api/contact/tickets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tickets).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('deve retornar 403 Forbidden para usuário comum não administrador', async () => {
      const token = makeToken();

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: '507f1f77bcf86cd799439000',
        email: 'usuario_comum@gmail.com',
      } as any);

      const res = await request(app)
        .get('/api/contact/tickets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Acesso restrito a administradores');
    });

    it('deve retornar 401 se não estiver autenticado', async () => {
      const res = await request(app).get('/api/contact/tickets');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/contact/tickets/:id/reply (Admin Only)', () => {
    it('deve registrar resposta ao chamado e enviar e-mail para administrador', async () => {
      const token = makeToken();
      const ticketId = '507f1f77bcf86cd799439123';

      const mockTicket = {
        id: ticketId,
        protocol: 'TKT-123456',
        name: 'Maria Silva',
        email: 'maria@example.com',
        subject: 'Dúvida sobre PIX',
        message: 'Gostaria de saber como funciona o PIX.',
        status: 'open',
      };

      const mockReply = {
        id: '507f1f77bcf86cd799439999',
        ticketId,
        message: 'Olá Maria, seu PIX foi liberado!',
        sentBy: 'support',
        createdAt: new Date(),
      };

      const mockUpdatedTicket = {
        ...mockTicket,
        status: 'resolved',
        replies: [mockReply],
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: '507f1f77bcf86cd799439000',
        email: 'admin@example.com',
      } as any);
      vi.spyOn(prisma.supportTicket, 'findUnique').mockResolvedValueOnce(mockTicket as any);
      vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([mockReply, mockUpdatedTicket] as any);

      const res = await request(app)
        .post(`/api/contact/tickets/${ticketId}/reply`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          replyMessage: 'Olá Maria, seu PIX foi liberado com sucesso!',
          status: 'resolved',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBeDefined();
    });
  });
});
