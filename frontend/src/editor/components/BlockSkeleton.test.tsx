import React, { act } from 'react'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { BlockSkeleton } from './BlockSkeleton'
import type { Block, BlockType } from '@/editor/types'

describe('BlockSkeleton', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza esqueleto de envelope com acessibilidade e atributos corretos', async () => {
    const block: Block = {
      id: 'env-1',
      type: 'envelope',
      version: 1,
      props: {
        recipientName: 'Para Meu Grande Amor',
        senderName: 'Thiago',
        sealInitial: 'T',
        sealColor: '#e11d48',
        messageSnippet: 'Mensagem secreta',
        isOpen: false,
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(BlockSkeleton, { block }))
    })

    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl).not.toBeNull()
    expect(statusEl?.getAttribute('data-block-skeleton')).toBe('envelope')
    expect(container.textContent).toContain('Para Meu Grande Amor')
    expect(container.textContent).toContain('Carregando bloco de envelope...')
  })

  it('renderiza esqueleto de polaroid com washi tape e foto', async () => {
    const block: Block = {
      id: 'pol-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(BlockSkeleton, { block }))
    })

    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl?.getAttribute('data-block-skeleton')).toBe('polaroid')
    expect(container.textContent).toContain('Carregando bloco de polaroid...')
  })

  it('renderiza esqueleto de timeline com linha vertical e nós de coração', async () => {
    const block: Block = {
      id: 'time-1',
      type: 'timeline',
      version: 1,
      props: {
        items: [],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(BlockSkeleton, { block }))
    })

    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl?.getAttribute('data-block-skeleton')).toBe('timeline')
    expect(container.textContent).toContain('Carregando bloco de timeline...')
  })

  it('renderiza esqueleto de quiz com botões de decisão e coração', async () => {
    const block: Block = {
      id: 'quiz-1',
      type: 'quiz',
      version: 1,
      props: {
        question: 'Quer namorar comigo?',
        yesButtonText: 'Sim',
        noButtonText: 'Não',
        successMessage: 'Te amo',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(BlockSkeleton, { block }))
    })

    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl?.getAttribute('data-block-skeleton')).toBe('quiz')
    expect(container.textContent).toContain('Carregando bloco de quiz...')
  })

  it('renderiza esqueleto de scratch com raspadinha metálica', async () => {
    const block: Block = {
      id: 'scr-1',
      type: 'scratch',
      version: 1,
      props: {
        coverText: 'Raspe aqui',
        secretType: 'text',
        secretText: 'Segredo',
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(BlockSkeleton, { block }))
    })

    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl?.getAttribute('data-block-skeleton')).toBe('scratch')
    expect(container.textContent).toContain('Carregando bloco de scratch...')
  })

  it('adapta o skeleton de text para cada categoria (title, quote, signature, body)', async () => {
    const categories: Array<'title' | 'quote' | 'signature' | 'body'> = [
      'title',
      'quote',
      'signature',
      'body',
    ]

    for (const category of categories) {
      const block: Block = {
        id: `txt-${category}`,
        type: 'text',
        version: 1,
        props: {
          text: 'Texto de teste',
          category,
        },
        meta: { createdAt: Date.now(), updatedAt: Date.now() },
      }

      const root = ReactDOM.createRoot(container)
      await act(async () => {
        root.render(React.createElement(BlockSkeleton, { block }))
      })

      const statusEl = container.querySelector('[role="status"]')
      expect(statusEl?.getAttribute('data-block-skeleton')).toBe('text')
      expect(container.textContent).toContain('Carregando bloco de text...')
    }
  })

  it('renderiza esqueletos para todos os outros tipos (image, gallery, timer, music, video)', async () => {
    const types: BlockType[] = ['image', 'gallery', 'timer', 'music', 'video']

    for (const type of types) {
      const root = ReactDOM.createRoot(container)
      await act(async () => {
        root.render(React.createElement(BlockSkeleton, { type }))
      })

      const statusEl = container.querySelector('[role="status"]')
      expect(statusEl?.getAttribute('data-block-skeleton')).toBe(type)
      expect(container.textContent).toContain(`Carregando bloco de ${type}...`)
    }
  })
})
