import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { EnvelopeBlock } from './EnvelopeBlock'
import type { Block, BlockComponentProps } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('EnvelopeBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza envelope lacrado no modo preview sem formulários ou inputs', async () => {
    const block: Block = {
      id: 'env-1',
      type: 'envelope',
      version: 1,
      props: {
        recipientName: 'Para o amor da minha vida',
        senderName: 'Com amor, Thiago',
        sealInitial: 'T',
        sealColor: '#e11d48',
        messageSnippet: 'Você é a razão do meu melhor sorriso todos os dias.',
        isOpen: false,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(EnvelopeBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Para o amor da minha vida')
    expect(container.textContent).toContain('Com amor, Thiago')
    expect(container.textContent).toContain('Carta Selada')
    // No input or textarea in preview mode
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('textarea')).toBeNull()
  })

  it('permite edição direta click-to-type de destinatário e remetente na capa do envelope', async () => {
    const block: Block = {
      id: 'env-1',
      type: 'envelope',
      version: 1,
      props: {
        recipientName: 'Helena',
        senderName: 'Thiago',
        sealInitial: 'H',
        sealColor: '#e11d48',
        messageSnippet: 'Mensagem secreta',
        isOpen: false,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(EnvelopeBlock, { block, mode: 'edit', onUpdate }))
    })

    const recipientInput = container.querySelector(
      'input[aria-label="Nome do destinatário no envelope"]',
    ) as HTMLInputElement
    expect(recipientInput).not.toBeNull()
    expect(recipientInput.value).toBe('Helena')

    await act(async () => {
      setInputValue(recipientInput, 'Minha Princesa')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'envelope') {
      expect(updatedBlock.props.recipientName).toBe('Minha Princesa')
    }
  })

  it('ao clicar no selo de cera em modo edição, abre o popover com inicial e cores', async () => {
    const block: Block = {
      id: 'env-1',
      type: 'envelope',
      version: 1,
      props: {
        recipientName: 'Helena',
        senderName: 'Thiago',
        sealInitial: 'C',
        sealColor: '#e11d48',
        messageSnippet: 'Mensagem carinhosa',
        isOpen: false,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(EnvelopeBlock, { block, mode: 'edit', onUpdate }))
    })

    const sealBtn = container.querySelector(
      'button[aria-label="Personalizar selo de cera"]',
    ) as HTMLButtonElement
    expect(sealBtn).not.toBeNull()

    // Clica no selo para abrir o popover
    await act(async () => {
      sealBtn.click()
    })

    expect(container.textContent).toContain('Selo de Cera')
    expect(container.textContent).toContain('Inicial / Monograma')

    // Altera a inicial do selo
    const initialInput = container.querySelector(
      'input[aria-label="Inicial do lacre"]',
    ) as HTMLInputElement
    expect(initialInput).not.toBeNull()

    await act(async () => {
      setInputValue(initialInput, 'M')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'envelope') {
      expect(updatedBlock.props.sealInitial).toBe('M')
    }

    // Altera a cor da cera no popover
    const goldColorBtn = container.querySelector(
      'button[aria-label="Cor da cera: Ouro Vintage"]',
    ) as HTMLButtonElement
    expect(goldColorBtn).not.toBeNull()

    await act(async () => {
      goldColorBtn.click()
    })

    if (updatedBlock.type === 'envelope') {
      expect(updatedBlock.props.sealColor).toBe('#d97706')
    }
  })

  it('permite abrir a carta e editar a mensagem interna diretamente na folha', async () => {
    const block: Block = {
      id: 'env-1',
      type: 'envelope',
      version: 1,
      props: {
        recipientName: 'Helena',
        senderName: 'Thiago',
        sealInitial: 'C',
        sealColor: '#e11d48',
        messageSnippet: 'Texto inicial da carta',
        isOpen: false,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(EnvelopeBlock, { block, mode: 'edit', onUpdate }))
    })

    const openLetterBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Ver Carta Aberta'),
    ) as HTMLButtonElement
    expect(openLetterBtn).toBeDefined()

    await act(async () => {
      openLetterBtn.click()
    })

    const textarea = container.querySelector(
      'textarea[aria-label="Mensagem interna da carta"]',
    ) as HTMLTextAreaElement
    expect(textarea).not.toBeNull()
    expect(textarea.value).toBe('Texto inicial da carta')

    await act(async () => {
      setInputValue(textarea, 'Minha declaração de amor eterna.')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'envelope') {
      expect(updatedBlock.props.messageSnippet).toBe('Minha declaração de amor eterna.')
    }
  })
})
