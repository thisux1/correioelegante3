import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { TextBlock } from '@/editor/blocks/TextBlock'
import type { Block, BlockComponentProps } from '@/editor/types'

describe('TextBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza abas de categorias no modo edicao', async () => {
    const block: Block = {
      id: 'text-1',
      type: 'text',
      version: 1,
      props: {
        text: 'Mensagem de teste',
        category: 'body',
        align: 'left',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const onUpdate = vi.fn()
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(React.createElement(TextBlock, { block, mode: 'edit', onUpdate }))
    })

    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs).toHaveLength(4)
    expect(container.textContent).toContain('Título')
    expect(container.textContent).toContain('Mensagem')
    expect(container.textContent).toContain('Citação')
    expect(container.textContent).toContain('Assinatura')
  })

  it('permite trocar de categoria ao clicar nas abas', async () => {
    const block: Block = {
      id: 'text-1',
      type: 'text',
      version: 1,
      props: {
        text: 'Mensagem de teste',
        category: 'body',
        align: 'left',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TextBlock, { block, mode: 'edit', onUpdate }))
    })

    const titleTab = Array.from(container.querySelectorAll('button[role="tab"]')).find(
      (btn) => btn.textContent?.includes('Título'),
    ) as HTMLButtonElement

    expect(titleTab).toBeDefined()

    await act(async () => {
      titleTab.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    expect(updatedBlock.type).toBe('text')
    if (updatedBlock.type === 'text') {
      expect(updatedBlock.props.category).toBe('title')
    }
  })

  it('renderiza corretamente no modo preview para categoria citacao', async () => {
    const quoteBlock: Block = {
      id: 'quote-1',
      type: 'text',
      version: 1,
      props: {
        text: 'O amor tudo sofre, tudo crê.',
        html: '<p>O amor <strong>tudo sofre</strong>, tudo crê.</p>',
        category: 'quote',
        align: 'center',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TextBlock, { block: quoteBlock, mode: 'preview' }))
    })

    const blockquote = container.querySelector('blockquote')
    expect(blockquote).not.toBeNull()
    expect(blockquote?.innerHTML).toContain('<strong>tudo sofre</strong>')
    expect(blockquote?.textContent).toContain('“')
    expect(blockquote?.textContent).toContain('”')
  })

  it('renderiza modo preview para categoria assinatura com caligrafia fluida', async () => {
    const sigBlock: Block = {
      id: 'sig-1',
      type: 'text',
      version: 1,
      props: {
        text: 'Com amor, Thiago',
        html: '<span>Com amor, Thiago</span>',
        category: 'signature',
        align: 'right',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TextBlock, { block: sigBlock, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Com amor, Thiago')
    const cursiveEl = container.querySelector('.font-cursive')
    expect(cursiveEl).not.toBeNull()
  })

  it('renderiza modo preview para categoria título', async () => {
    const titleBlock: Block = {
      id: 'title-1',
      type: 'text',
      version: 1,
      props: {
        text: 'Para Sempre Juntos',
        category: 'title',
        align: 'center',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TextBlock, { block: titleBlock, mode: 'preview' }))
    })

    const heading = container.querySelector('h2')
    expect(heading).not.toBeNull()
    expect(heading?.textContent).toContain('Para Sempre Juntos')
  })

  it('renderiza controles de alinhamento e executa callback de atualizacao', async () => {
    const block: Block = {
      id: 'text-1',
      type: 'text',
      version: 1,
      props: {
        text: 'Texto de teste',
        category: 'body',
        align: 'left',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TextBlock, { block, mode: 'edit', onUpdate }))
    })

    const centerAlignBtn = container.querySelector('button[title="Centralizar"]') as HTMLButtonElement
    expect(centerAlignBtn).not.toBeNull()

    await act(async () => {
      centerAlignBtn.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'text') {
      expect(updatedBlock.props.align).toBe('center')
    }
  })
})
