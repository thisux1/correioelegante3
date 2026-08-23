import { describe, expect, it, vi } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AdminTickets } from './AdminTickets'

vi.mock('@/services/contactService', () => ({
  contactService: {
    listTickets: vi.fn().mockResolvedValue({
      total: 1,
      tickets: [
        {
          id: 'ticket-1',
          protocol: 'TKT-123456',
          name: 'Maria Clara',
          email: 'maria@example.com',
          subject: 'Dúvida sobre entrega',
          message: 'Gostaria de saber quando a carta chega.',
          status: 'open',
          createdAt: new Date().toISOString(),
          replies: [],
        },
      ],
    }),
    replyToTicket: vi.fn().mockResolvedValue({
      ticket: {
        id: 'ticket-1',
        protocol: 'TKT-123456',
        name: 'Maria Clara',
        email: 'maria@example.com',
        subject: 'Dúvida sobre entrega',
        message: 'Gostaria de saber quando a carta chega.',
        status: 'resolved',
        createdAt: new Date().toISOString(),
        replies: [],
      },
      emailSent: true,
    }),
    updateStatus: vi.fn().mockResolvedValue({
      id: 'ticket-1',
      protocol: 'TKT-123456',
      status: 'resolved',
    }),
  },
}))

describe('AdminTickets Page', () => {
  it('renderiza a página da central de atendimento', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = ReactDOM.createRoot(host)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminTickets />
        </MemoryRouter>
      )
    })

    expect(host.textContent).toContain('Central de Atendimento')
    expect(host.querySelector('input[placeholder*="Buscar"]')).not.toBeNull()

    act(() => {
      root.unmount()
    })
    host.remove()
  })
})
