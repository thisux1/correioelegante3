import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { contactService } from './contactService'

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve enviar payload para /contact e retornar os dados do ticket', async () => {
    const mockTicket = {
      id: '507f1f77bcf86cd799439123',
      protocol: 'TKT-987654',
      name: 'João',
      email: 'joao@example.com',
      subject: 'Dúvida',
      status: 'open',
      createdAt: new Date().toISOString(),
    }

    vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Chamado registrado com sucesso.',
        ticket: mockTicket,
      },
    })

    const res = await contactService.createTicket({
      name: 'João',
      email: 'joao@example.com',
      subject: 'Dúvida',
      message: 'Gostaria de saber como funciona o QR code.',
    })

    expect(api.post).toHaveBeenCalledWith('/contact', {
      name: 'João',
      email: 'joao@example.com',
      subject: 'Dúvida',
      message: 'Gostaria de saber como funciona o QR code.',
    })
    expect(res.protocol).toBe('TKT-987654')
  })
})
