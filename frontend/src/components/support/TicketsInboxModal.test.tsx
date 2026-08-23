import { describe, it, expect, vi, beforeEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { TicketsInboxModal } from './TicketsInboxModal'
import { contactService } from '@/services/contactService'

vi.mock('@/services/contactService', () => ({
  contactService: {
    listTickets: vi.fn(),
    replyToTicket: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

describe('TicketsInboxModal', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  it('renderiza lista de chamados de suporte quando aberto', async () => {
    const mockTickets = [
      {
        id: '507f1f77bcf86cd799439123',
        protocol: 'TKT-112233',
        name: 'Carlos Santos',
        email: 'carlos@example.com',
        subject: 'Dúvida sobre link',
        message: 'O link está funcionando perfeitamente.',
        status: 'open' as const,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    vi.mocked(contactService.listTickets).mockResolvedValueOnce({
      success: true,
      total: 1,
      tickets: mockTickets,
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(<TicketsInboxModal isOpen={true} onClose={vi.fn()} />)
    })

    expect(contactService.listTickets).toHaveBeenCalled()
    expect(container.textContent).toContain('TKT-112233')
    expect(container.textContent).toContain('Carlos Santos')
  })
})
