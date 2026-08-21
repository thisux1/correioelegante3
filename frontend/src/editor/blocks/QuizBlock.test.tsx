import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { QuizBlock } from './QuizBlock'
import type { Block, BlockComponentProps } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('QuizBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza a pergunta e botões no modo preview sem formulários inferiores', async () => {
    const block: Block = {
      id: 'quiz-1',
      type: 'quiz',
      version: 1,
      props: {
        question: 'Quer namorar comigo?',
        yesButtonText: 'Sim, claro!',
        noButtonText: 'Não',
        successMessage: 'Eu sabia! Te amo muito.',
        isPlayfulNo: true,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(QuizBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Quer namorar comigo?')
    expect(container.textContent).toContain('Sim, claro!')
    expect(container.textContent).toContain('Não')
    // No input or textarea in preview mode
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('textarea')).toBeNull()
  })

  it('ao clicar em SIM no preview, exibe reação humana sem frases clichês de IA', async () => {
    const block: Block = {
      id: 'quiz-1',
      type: 'quiz',
      version: 1,
      props: {
        question: 'Aceita casar comigo?',
        yesButtonText: 'Sim, mil vezes sim!',
        noButtonText: 'Não',
        successMessage: 'Melhor decisão da minha vida! Te amo infinitamente.',
        isPlayfulNo: true,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(QuizBlock, { block, mode: 'preview' }))
    })

    const yesButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Sim, mil vezes sim!'),
    ) as HTMLButtonElement
    expect(yesButton).toBeDefined()

    await act(async () => {
      yesButton.click()
    })

    expect(container.textContent).toContain('Melhor decisão da minha vida! Te amo infinitamente.')
    // Verify removal of AI clichés
    expect(container.textContent).not.toContain('Resposta Inesquecível')
    expect(container.textContent).not.toContain('Uma decisão cheia de afeto')
  })

  it('permite edição direta click-to-type de pergunta, botão SIM e botão NÃO', async () => {
    const block: Block = {
      id: 'quiz-1',
      type: 'quiz',
      version: 1,
      props: {
        question: 'Quer viajar comigo?',
        yesButtonText: 'Sim!',
        noButtonText: 'Não',
        successMessage: 'Partiu!',
        isPlayfulNo: true,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(QuizBlock, { block, mode: 'edit', onUpdate }))
    })

    // Edita a pergunta
    const questionInput = container.querySelector(
      'input[aria-label="Pergunta principal"]',
    ) as HTMLInputElement
    expect(questionInput).not.toBeNull()
    expect(questionInput.value).toBe('Quer viajar comigo?')

    await act(async () => {
      setInputValue(questionInput, 'Quer morar comigo?')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'quiz') {
      expect(updatedBlock.props.question).toBe('Quer morar comigo?')
    }

    // Edita o botão SIM
    const yesInput = container.querySelector(
      'input[aria-label="Texto do botão sim"]',
    ) as HTMLInputElement
    expect(yesInput).not.toBeNull()

    await act(async () => {
      setInputValue(yesInput, 'Sim, com certeza!')
    })

    if (updatedBlock.type === 'quiz') {
      expect(updatedBlock.props.yesButtonText).toBe('Sim, com certeza!')
    }

    // Edita o botão NÃO
    const noInput = container.querySelector(
      'input[aria-label="Texto do botão não"]',
    ) as HTMLInputElement
    expect(noInput).not.toBeNull()

    await act(async () => {
      setInputValue(noInput, 'Nunca')
    })

    if (updatedBlock.type === 'quiz') {
      expect(updatedBlock.props.noButtonText).toBe('Nunca')
    }
  })

  it('permite alternar para visualização e edição da mensagem de sucesso', async () => {
    const block: Block = {
      id: 'quiz-1',
      type: 'quiz',
      version: 1,
      props: {
        question: 'Quer namorar comigo?',
        yesButtonText: 'Sim!',
        noButtonText: 'Não',
        successMessage: 'Prometo te fazer a pessoa mais feliz do mundo.',
        isPlayfulNo: true,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(QuizBlock, { block, mode: 'edit', onUpdate }))
    })

    const testSimBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Ver Reação do \'SIM\''),
    ) as HTMLButtonElement
    expect(testSimBtn).toBeDefined()

    await act(async () => {
      testSimBtn.click()
    })

    const successTextarea = container.querySelector(
      'textarea[aria-label="Mensagem de sucesso"]',
    ) as HTMLTextAreaElement
    expect(successTextarea).not.toBeNull()
    expect(successTextarea.value).toBe('Prometo te fazer a pessoa mais feliz do mundo.')

    await act(async () => {
      setInputValue(successTextarea, 'Eu sabia! Te amo demais.')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'quiz') {
      expect(updatedBlock.props.successMessage).toBe('Eu sabia! Te amo demais.')
    }
  })
})
