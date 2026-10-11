import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { TicketRsvpBlock } from './TicketRsvpBlock'
import { PageRuntimeProvider } from '@/editor/context'
import { pageService } from '@/services/pageService'
import type { Block, TicketRsvpBlockProps } from '@/editor/types'

vi.mock('@/services/pageService', () => ({
  pageService: {
    submitRsvpResponse: vi.fn(),
  },
}))

const submitMock = vi.mocked(pageService.submitRsvpResponse)

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeBlock(props: Partial<TicketRsvpBlockProps> = {}): Block {
  return {
    id: 'rsvp-1',
    type: 'ticketRsvp',
    version: 1,
    props: {
      title: 'te convido:',
      evento: {
        data: 'sábado, 14 de março',
        lugar: 'sorveteria da praça',
        descricao: 'sorvete e passeio no fim de tarde',
      },
      allowText: true,
      ...props,
    },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

function rsvpForm(container: HTMLElement): HTMLFormElement | null {
  return container.querySelector('form[aria-label="Responder ao convite"]')
}

function submitRsvpForm(container: HTMLElement) {
  const form = rsvpForm(container)
  expect(form).not.toBeNull()
  form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

// AnimatePresence mantém o form no DOM durante o exit (~200ms) — espera
// antes de afirmar que ele saiu de cena.
function waitForExitAnimation() {
  return new Promise((resolve) => setTimeout(resolve, 400))
}

function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((btn) =>
    btn.textContent?.includes(label),
  )
  expect(button, `botão "${label}" não encontrado`).toBeDefined()
  return button as HTMLButtonElement
}

describe('TicketRsvpBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    submitMock.mockReset()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza título, linha do evento e as três escolhas no preview', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TicketRsvpBlock, { block: makeBlock(), mode: 'preview' }))
    })

    expect(container.textContent).toContain('te convido:')
    expect(container.textContent).toContain('sábado, 14 de março')
    expect(container.textContent).toContain('sorveteria da praça')
    expect(container.textContent).toContain('sorvete e passeio no fim de tarde')

    // Três escolhas com aria-pressed desligado e alvo de toque ≥44px
    for (const label of ['Aceito', 'Não posso', 'Sugerir outro dia']) {
      const button = findButton(container, label)
      expect(button.getAttribute('aria-pressed')).toBe('false')
      expect(button.className).toContain('min-h-11')
    }

    // Campo de recado (allowText), nome e confirmação presentes
    expect(container.querySelector('textarea')).not.toBeNull()
    expect(container.querySelector('input[type="text"]')).not.toBeNull()
    expect(rsvpForm(container)).not.toBeNull()
    expect(findButton(container, 'Confirmar resposta')).toBeDefined()

    // Região aria-live para o resultado e barra de status do ticket
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
    expect(container.textContent).toContain('aguardando sua resposta')

    await act(async () => {
      root.unmount()
    })
  })

  it('escolha + confirmar chama o service com o token injetado nos props', async () => {
    const block = makeBlock({ responseToken: 'token-assinado.abc' })
    submitMock.mockResolvedValue({ id: 'resp-1', choice: 'yes', createdAt: '2026-02-10T12:00:00.000Z' })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(
          PageRuntimeProvider,
          { value: { pageId: 'page-9' } },
          React.createElement(TicketRsvpBlock, { block, mode: 'preview' }),
        ),
      )
    })

    const yesButton = findButton(container, 'Aceito')
    await act(async () => {
      yesButton.click()
    })
    expect(yesButton.getAttribute('aria-pressed')).toBe('true')

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement
    await act(async () => {
      setInputValue(textarea, 'Te vejo lá')
      setInputValue(nameInput, 'Fulana')
    })

    await act(async () => {
      submitRsvpForm(container)
      // Flush da promise do service
      await Promise.resolve()
    })

    expect(submitMock).toHaveBeenCalledTimes(1)
    expect(submitMock).toHaveBeenCalledWith('page-9', {
      blockId: 'rsvp-1',
      choice: 'yes',
      text: 'Te vejo lá',
      respondentName: 'Fulana',
      token: 'token-assinado.abc',
    })

    expect(container.textContent).toContain('resposta registrada')
    expect(container.textContent).toContain('Você aceitou o convite.')
    // Form sai de cena após o envio (espera o exit do AnimatePresence)
    await act(async () => {
      await waitForExitAnimation()
    })
    expect(rsvpForm(container)).toBeNull()

    await act(async () => {
      root.unmount()
    })
  })

  it('409 do backend mostra o estado "esse convite já tem resposta"', async () => {
    const block = makeBlock({ responseToken: 'token-assinado.abc' })
    submitMock.mockRejectedValue({ response: { status: 409, data: { error: 'Este convite já foi respondido' } } })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(
          PageRuntimeProvider,
          { value: { pageId: 'page-9' } },
          React.createElement(TicketRsvpBlock, { block, mode: 'preview' }),
        ),
      )
    })

    await act(async () => {
      findButton(container, 'Não posso').click()
    })
    await act(async () => {
      submitRsvpForm(container)
      await Promise.resolve()
    })

    expect(container.textContent).toContain('esse convite já tem resposta')
    expect(container.textContent).toContain('convite já respondido')
    await act(async () => {
      await waitForExitAnimation()
    })
    expect(rsvpForm(container)).toBeNull()

    await act(async () => {
      root.unmount()
    })
  })

  it('erro genérico entra em estado de erro e permite tentar de novo', async () => {
    const block = makeBlock({ responseToken: 'token-assinado.abc' })
    submitMock.mockRejectedValue({ response: { status: 500 } })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(
          PageRuntimeProvider,
          { value: { pageId: 'page-9' } },
          React.createElement(TicketRsvpBlock, { block, mode: 'preview' }),
        ),
      )
    })

    await act(async () => {
      findButton(container, 'Aceito').click()
    })
    await act(async () => {
      submitRsvpForm(container)
      await Promise.resolve()
    })

    expect(container.textContent).toContain('Não foi possível enviar sua resposta.')
    // Form continua interativo com o botão virando "Tentar novamente"
    expect(rsvpForm(container)).not.toBeNull()
    expect(findButton(container, 'Tentar novamente')).toBeDefined()

    // Segunda tentativa com sucesso registra a resposta
    submitMock.mockResolvedValue({ id: 'resp-2', choice: 'yes', createdAt: '2026-02-10T12:05:00.000Z' })
    await act(async () => {
      submitRsvpForm(container)
      await Promise.resolve()
    })

    expect(container.textContent).toContain('resposta registrada')
    expect(submitMock).toHaveBeenCalledTimes(2)

    await act(async () => {
      root.unmount()
    })
  })

  it('modo demonstração (sem pageId/token) simula sucesso local sem chamar a API', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TicketRsvpBlock, { block: makeBlock(), mode: 'preview' }))
    })

    await act(async () => {
      findButton(container, 'Sugerir outro dia').click()
    })
    await act(async () => {
      submitRsvpForm(container)
    })

    expect(submitMock).not.toHaveBeenCalled()
    expect(container.textContent).toContain('resposta registrada')
    expect(container.textContent).toContain('Você sugeriu outro dia.')
    expect(container.textContent).toContain('Demonstração')
    // A simulação pode ser desfeita para testar de novo
    expect(findButton(container, 'Refazer simulação')).toBeDefined()

    await act(async () => {
      root.unmount()
    })
  })

  it('sem escolha, confirmar mostra validação e não envia nada', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TicketRsvpBlock, { block: makeBlock(), mode: 'preview' }))
    })

    await act(async () => {
      submitRsvpForm(container)
    })

    expect(container.textContent).toContain('Escolha uma das respostas antes de confirmar.')
    expect(submitMock).not.toHaveBeenCalled()
    expect(rsvpForm(container)).not.toBeNull()

    await act(async () => {
      root.unmount()
    })
  })

  it('allowText false esconde o campo de recado', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(TicketRsvpBlock, {
          block: makeBlock({ allowText: false }),
          mode: 'preview',
        }),
      )
    })

    expect(container.querySelector('textarea')).toBeNull()
    // Nome continua disponível
    expect(container.querySelector('input[type="text"]')).not.toBeNull()

    await act(async () => {
      root.unmount()
    })
  })
})
