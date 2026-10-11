import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { IntimacyGateBlock } from './IntimacyGateBlock'
import type { Block, BlockComponentProps, IntimacyGateBlockProps } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeBlock(props: Partial<IntimacyGateBlockProps> = {}): Block {
  return {
    id: 'gate-1',
    type: 'intimacyGate',
    version: 1,
    props: {
      question: 'O que tinha na xícara que você pegou emprestada?',
      answers: ['São Paulo', 'coração'],
      hint: 'Pense no nosso primeiro café juntos.',
      successMessage: 'Você lembra. É claro que lembra.',
      ...props,
    },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

function gateForm(container: HTMLElement): HTMLFormElement {
  return container.querySelector(
    'form[aria-label="Responder à pergunta secreta"]',
  ) as HTMLFormElement
}

function submitGateForm(container: HTMLElement) {
  const form = gateForm(container)
  expect(form).not.toBeNull()
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

describe('IntimacyGateBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza pergunta, input e os dois botões de segurança no preview', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block: makeBlock(), mode: 'preview' }))
    })

    expect(container.textContent).toContain('O que tinha na xícara que você pegou emprestada?')
    expect(gateForm(container)).not.toBeNull()
    expect(container.querySelector('input[type="text"]')).not.toBeNull()

    const buttonTexts = Array.from(container.querySelectorAll('button')).map(
      (btn) => btn.textContent ?? '',
    )
    expect(buttonTexts.some((t) => t.includes('Responder'))).toBe(true)
    expect(buttonTexts.some((t) => t.includes('Dica'))).toBe(true)
    expect(buttonTexts.some((t) => t.includes('Seguir sem acertar'))).toBe(true)

    // Região aria-live para anúncios de leitores de tela
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()

    await act(async () => {
      root.unmount()
    })
  })

  it('resposta correta desbloqueia a mensagem (normaliza acento e maiúsculas)', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block: makeBlock(), mode: 'preview' }))
    })

    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    await act(async () => {
      // "São Paulo" cadastrado deve casar com "sao paulo" digitado
      setInputValue(input, '  SAO PAULO  ')
    })

    await act(async () => {
      submitGateForm(container)
      // Aguarda a animação de saída do portão (~0.25s) terminar
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(container.textContent).toContain('Você lembra. É claro que lembra.')
    // Portão some após desbloquear
    expect(gateForm(container)).toBeNull()

    await act(async () => {
      root.unmount()
    })
  })

  it('resposta errada não desbloqueia e mostra incentivo gentil', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block: makeBlock(), mode: 'preview' }))
    })

    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'não faço ideia')
    })

    await act(async () => {
      submitGateForm(container)
    })

    expect(container.textContent).not.toContain('Você lembra. É claro que lembra.')
    expect(container.textContent).toContain('Ainda não é essa. Tenta de novo, com calma.')
    expect(gateForm(container)).not.toBeNull()

    await act(async () => {
      root.unmount()
    })
  })

  it('botão Dica revela a dica em linha', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block: makeBlock(), mode: 'preview' }))
    })

    expect(container.textContent).not.toContain('Pense no nosso primeiro café juntos.')

    const hintButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Dica'),
    ) as HTMLButtonElement
    expect(hintButton).toBeDefined()

    await act(async () => {
      hintButton.click()
    })

    expect(container.textContent).toContain('Pense no nosso primeiro café juntos.')
    expect(hintButton.getAttribute('aria-expanded')).toBe('true')

    await act(async () => {
      root.unmount()
    })
  })

  it('"Seguir sem acertar" também revela a mensagem com texto mais suave', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block: makeBlock(), mode: 'preview' }))
    })

    const skipButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Seguir sem acertar'),
    ) as HTMLButtonElement
    expect(skipButton).toBeDefined()

    await act(async () => {
      skipButton.click()
    })

    // Mensagem de sucesso aparece junto do acolhimento de quem pulou
    expect(container.textContent).toContain('Você lembra. É claro que lembra.')
    expect(container.textContent).toContain('Tudo bem — o que importa é você estar aqui.')

    await act(async () => {
      root.unmount()
    })
  })

  it('sem respostas cadastradas, qualquer tentativa abre o portão', async () => {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(IntimacyGateBlock, {
          block: makeBlock({ answers: [] }),
          mode: 'preview',
        }),
      )
    })

    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'qualquer coisa')
    })

    await act(async () => {
      submitGateForm(container)
    })

    expect(container.textContent).toContain('Você lembra. É claro que lembra.')

    await act(async () => {
      root.unmount()
    })
  })

  it('no modo edição, editar pergunta, dica e respostas dispara onUpdate', async () => {
    const block = makeBlock()
    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block, mode: 'edit', onUpdate }))
    })

    // Edita a pergunta
    const questionInput = container.querySelector(
      'input[aria-label="Pergunta do portão"]',
    ) as HTMLInputElement
    expect(questionInput).not.toBeNull()

    await act(async () => {
      setInputValue(questionInput, 'Qual foi o primeiro filme que vimos juntos?')
    })
    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'intimacyGate') {
      expect(updatedBlock.props.question).toBe('Qual foi o primeiro filme que vimos juntos?')
    }

    // Edita uma resposta existente
    const answerInput = container.querySelector(
      'input[aria-label="Resposta aceita 1"]',
    ) as HTMLInputElement
    expect(answerInput).not.toBeNull()

    await act(async () => {
      setInputValue(answerInput, 'Rio de Janeiro')
    })
    if (updatedBlock.type === 'intimacyGate') {
      expect(updatedBlock.props.answers[0]).toBe('Rio de Janeiro')
    }

    // Adiciona nova resposta aceita
    const newAnswerInput = container.querySelector(
      'input[aria-label="Nova resposta aceita"]',
    ) as HTMLInputElement
    expect(newAnswerInput).not.toBeNull()

    await act(async () => {
      setInputValue(newAnswerInput, 'praia')
    })

    const addForm = container.querySelector(
      'form[aria-label="Adicionar resposta aceita"]',
    ) as HTMLFormElement
    await act(async () => {
      addForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    if (updatedBlock.type === 'intimacyGate') {
      expect(updatedBlock.props.answers).toContain('praia')
    }

    // Remove uma resposta
    const removeButton = container.querySelector(
      'button[aria-label="Remover resposta 2"]',
    ) as HTMLButtonElement
    expect(removeButton).not.toBeNull()

    await act(async () => {
      removeButton.click()
    })
    if (updatedBlock.type === 'intimacyGate') {
      expect(updatedBlock.props.answers).not.toContain('coração')
    }

    // Edita a dica
    const hintInput = Array.from(container.querySelectorAll('input')).find(
      (input) => input.placeholder === 'Uma pista para ajudar quem recebe',
    ) as HTMLInputElement
    expect(hintInput).toBeDefined()

    await act(async () => {
      setInputValue(hintInput, 'Tem a ver com cinema.')
    })
    if (updatedBlock.type === 'intimacyGate') {
      expect(updatedBlock.props.hint).toBe('Tem a ver com cinema.')
    }

    await act(async () => {
      root.unmount()
    })
  })

  it('no modo edição, "Ver revelação" mostra textarea de mensagem de sucesso editável', async () => {
    const block = makeBlock()
    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(IntimacyGateBlock, { block, mode: 'edit', onUpdate }))
    })

    const revealButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Ver revelação'),
    ) as HTMLButtonElement
    expect(revealButton).toBeDefined()

    await act(async () => {
      revealButton.click()
    })

    const successTextarea = container.querySelector(
      'textarea[aria-label="Mensagem revelada ao abrir o portão"]',
    ) as HTMLTextAreaElement
    expect(successTextarea).not.toBeNull()
    expect(successTextarea.value).toBe('Você lembra. É claro que lembra.')

    await act(async () => {
      setInputValue(successTextarea, 'Claro que você lembra. Te amo.')
    })
    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'intimacyGate') {
      expect(updatedBlock.props.successMessage).toBe('Claro que você lembra. Te amo.')
    }

    // Reiniciar volta ao portão fechado
    const resetButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Reiniciar teste'),
    ) as HTMLButtonElement
    expect(resetButton).toBeDefined()

    await act(async () => {
      resetButton.click()
    })
    expect(gateForm(container)).not.toBeNull()

    await act(async () => {
      root.unmount()
    })
  })
})
