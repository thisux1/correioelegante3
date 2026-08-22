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

  it('renderiza o ritual de abertura com nome do destinatário e botão de abrir', async () => {
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

    expect(container.textContent).toContain('Uma carta especial para Mariana')
    expect(container.textContent).toContain('Toque no lacre para abrir')
    expect(container.textContent).toContain('Pular abertura')
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
      (btn) => btn.textContent?.includes('Pular abertura')
    ) as HTMLButtonElement

    expect(skipButton).toBeDefined()

    await act(async () => {
      skipButton.click()
    })

    expect(onOpenComplete).toHaveBeenCalledTimes(1)
  })

  it('inicia a quebra do lacre e animação ao clicar no botão de abrir', async () => {
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

    const openButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Toque no lacre para abrir')
    ) as HTMLButtonElement

    expect(openButton).toBeDefined()

    await act(async () => {
      openButton.click()
    })

    // Avança timers da animação
    await act(async () => {
      vi.advanceTimersByTime(2200)
    })

    expect(onOpenComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
