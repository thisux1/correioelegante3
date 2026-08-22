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

    expect(container.textContent).toContain('Uma carta para Mariana')
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

  it('permite tocar no lacre para abrir o envelope e puxar a carta', async () => {
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

    // 1. Avião voa e pousa no envelope
    await act(async () => {
      vi.advanceTimersByTime(3200)
    })

    // 2. Toca no botão de abrir o envelope
    const openEnvelopeBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Toque no lacre para abrir o envelope')
    ) as HTMLButtonElement

    expect(openEnvelopeBtn).toBeDefined()

    await act(async () => {
      openEnvelopeBtn.click()
    })

    // 3. Aguarda o lacre quebrar e a carta ficar pronta para ser puxada
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    // 4. Clica na carta para puxar e desdobrar
    const letterSheet = container.querySelector('.cursor-grab') as HTMLElement
    expect(letterSheet).not.toBeNull()

    await act(async () => {
      letterSheet.click()
    })

    // 5. Aguarda o desdobramento do papel longo e a revelação botânica
    await act(async () => {
      vi.advanceTimersByTime(2200)
    })

    expect(onOpenComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
