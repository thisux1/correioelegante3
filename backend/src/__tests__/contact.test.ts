import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';

describe('Contact & Support Ticket Routes (POST /api/contact)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('deve retornar erro 400 se a mensagem for muito curta', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Maria Silva',
        email: 'maria@example.com',
        subject: 'Dúvida Geral',
        message: 'Curto',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Mensagem deve ter no mínimo 10 caracteres');
  });
});
