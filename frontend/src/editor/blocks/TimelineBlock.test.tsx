import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { TimelineBlock } from './TimelineBlock'
import type { Block, BlockComponentProps } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('TimelineBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza marcos na linha do tempo no modo preview sem formulários ou inputs', async () => {
    const block: Block = {
      id: 'timeline-1',
      type: 'timeline',
      version: 1,
      props: {
        items: [
          {
            id: 'item-1',
            date: '12 de Junho',
            title: 'Primeiro Encontro',
            description: 'Aquele café que durou a tarde inteira.',
            image: 'https://example.com/photo.jpg',
          },
        ],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TimelineBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('12 de Junho')
    expect(container.textContent).toContain('Primeiro Encontro')
    expect(container.textContent).toContain('Aquele café que durou a tarde inteira.')
    expect(container.querySelector('img')).not.toBeNull()
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('textarea')).toBeNull()
  })

  it('permite edição direta inline nos campos do card (data, título, descrição)', async () => {
    const block: Block = {
      id: 'timeline-1',
      type: 'timeline',
      version: 1,
      props: {
        items: [
          {
            id: 'item-1',
            date: 'Data inicial',
            title: 'Título inicial',
            description: 'Descrição inicial',
            image: '',
          },
        ],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TimelineBlock, { block, mode: 'edit', onUpdate }))
    })

    // Edição de data
    const dateInput = container.querySelector('input[aria-label="Data do marco"]') as HTMLInputElement
    expect(dateInput).not.toBeNull()
    expect(dateInput.value).toBe('Data inicial')

    await act(async () => {
      setInputValue(dateInput, '20 de Outubro')
    })
    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'timeline') {
      expect(updatedBlock.props.items[0].date).toBe('20 de Outubro')
    }

    // Edição de título
    const titleInput = container.querySelector('input[aria-label="Título do marco"]') as HTMLInputElement
    expect(titleInput).not.toBeNull()
    expect(titleInput.value).toBe('Título inicial')

    await act(async () => {
      setInputValue(titleInput, 'Nosso Primeiro Beijo')
    })
    if (updatedBlock.type === 'timeline') {
      expect(updatedBlock.props.items[0].title).toBe('Nosso Primeiro Beijo')
    }

    // Edição de descrição
    const descTextarea = container.querySelector('textarea[aria-label="Descrição do marco"]') as HTMLTextAreaElement
    expect(descTextarea).not.toBeNull()
    expect(descTextarea.value).toBe('Descrição inicial')

    await act(async () => {
      setInputValue(descTextarea, 'Um momento inesquecível sob as estrelas.')
    })
    if (updatedBlock.type === 'timeline') {
      expect(updatedBlock.props.items[0].description).toBe('Um momento inesquecível sob as estrelas.')
    }
  })

  it('permite reordenar e remover marcos com os botões compactos', async () => {
    const block: Block = {
      id: 'timeline-1',
      type: 'timeline',
      version: 1,
      props: {
        items: [
          {
            id: 'item-1',
            date: 'Momento 1',
            title: 'Primeiro',
            description: 'Desc 1',
            image: '',
          },
          {
            id: 'item-2',
            date: 'Momento 2',
            title: 'Segundo',
            description: 'Desc 2',
            image: '',
          },
        ],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TimelineBlock, { block, mode: 'edit', onUpdate }))
    })

    const moveDownBtn = container.querySelector('button[aria-label="Mover para baixo"]') as HTMLButtonElement
    expect(moveDownBtn).not.toBeNull()

    await act(async () => {
      moveDownBtn.click()
    })

    if (updatedBlock.type === 'timeline') {
      expect(updatedBlock.props.items[0].title).toBe('Segundo')
      expect(updatedBlock.props.items[1].title).toBe('Primeiro')
    }

    const removeBtn = container.querySelector('button[aria-label="Remover marco"]') as HTMLButtonElement
    expect(removeBtn).not.toBeNull()

    await act(async () => {
      removeBtn.click()
    })

    if (updatedBlock.type === 'timeline') {
      expect(updatedBlock.props.items.length).toBe(1)
    }
  })

  it('permite adicionar novo momento na linha do tempo', async () => {
    const block: Block = {
      id: 'timeline-1',
      type: 'timeline',
      version: 1,
      props: {
        items: [],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(TimelineBlock, { block, mode: 'edit', onUpdate }))
    })

    const addBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Adicionar Primeiro Momento'),
    ) as HTMLButtonElement
    expect(addBtn).toBeDefined()

    await act(async () => {
      addBtn.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'timeline') {
      expect(updatedBlock.props.items.length).toBe(1)
    }
  })
})
