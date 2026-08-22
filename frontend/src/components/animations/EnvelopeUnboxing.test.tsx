import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { EnvelopeUnboxing } from './EnvelopeUnboxing'

describe('EnvelopeUnboxing', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza o ritual cinematográfico com o aviãozinho e botão de pular', async () => {
    const onOpenComplete = vi.fn()
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        React.createElement(EnvelopeUnboxing, {
          recipientName: 'Mariana',
          theme: 'rose-garden',
          onOpenComplete,
        })
      )
    })

    expect(container.textContent).toContain('Uma mensagem especial para Mariana')
    expect(container.textContent).toContain('Pular')
  })

  it('permite pular a abertura imediatamente ao clicar no botão de pular', async () => {
    const onOpenComplete = vi.fn()
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        React.createElement(EnvelopeUnboxing, {
          recipientName: 'Mariana',
          theme: 'rose-garden',
          onOpenComplete,
        })
      )
    })

    const skipButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Pular')
    ) as HTMLButtonElement

    expect(skipButton).toBeDefined()

    await act(async () => {
      skipButton.click()
    })

    expect(onOpenComplete).toHaveBeenCalledTimes(1)
  })

  it('executa a sequência automática e conclui com fadeout', async () => {
    vi.useFakeTimers()
    const onOpenComplete = vi.fn()
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        React.createElement(EnvelopeUnboxing, {
          recipientName: 'Lucas',
          senderName: 'Beatriz',
          theme: 'midnight-galaxy',
          onOpenComplete,
        })
      )
    })

    // Avança timers da animação cinematográfica completa
    await act(async () => {
      vi.advanceTimersByTime(5800)
    })

    expect(onOpenComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
