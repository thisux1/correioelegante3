import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { MemoryCardBlock } from './MemoryCardBlock'
import type { Block, BlockComponentProps, MemoryCardBlockProps } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeBlock(props: Partial<MemoryCardBlockProps>): Block {
  return {
    id: 'mc-1',
    type: 'memoryCard',
    version: 1,
    props: {
      title: '',
      date: '',
      place: '',
      imageSrc: '',
      caption: '',
      text: '',
      ...props,
    },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

describe('MemoryCardBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('preview renderiza selo de data+lugar, título, legenda e história', async () => {
    const block = makeBlock({
      title: 'Nosso primeiro piquenique',
      date: '14 de março de 2020',
      place: 'Parque da cidade',
      caption: 'o dia que tudo começou',
      text: 'A gente quase perdeu o ônibus, mas valeu cada segundo.',
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(MemoryCardBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('14 de março de 2020')
    expect(container.textContent).toContain('Parque da cidade')
    expect(container.textContent).toContain('Nosso primeiro piquenique')
    expect(container.textContent).toContain('o dia que tudo começou')
    expect(container.textContent).toContain('quase perdeu o ônibus')
    // Sem foto: placeholder ilustrado em vez de <img> quebrada.
    expect(container.querySelector('img')).toBeNull()
  })

  it('preview com foto renderiza a imagem', async () => {
    const block = makeBlock({
      imageSrc: 'https://example.com/foto.jpg',
      caption: 'nós dois',
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(MemoryCardBlock, { block, mode: 'preview' }))
    })

    const img = container.querySelector('img') as HTMLImageElement
    expect(img).not.toBeNull()
    expect(img.src).toBe('https://example.com/foto.jpg')
    expect(img.alt).toBe('nós dois')
  })

  it('preview totalmente vazio não renderiza nada', async () => {
    const block = makeBlock({})

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(MemoryCardBlock, { block, mode: 'preview' }))
    })

    expect(container.innerHTML).toBe('')
  })

  it('modo edição: campos disparam onUpdate com a prop certa', async () => {
    const block = makeBlock({ title: 'Memória' })
    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(MemoryCardBlock, { block, mode: 'edit', onUpdate }))
    })

    const cases: Array<[string, keyof MemoryCardBlockProps, string]> = [
      ['Título da memória', 'title', 'Primeiro beijo'],
      ['Data da memória', 'date', 'março de 2020'],
      ['Lugar da memória', 'place', 'a praça'],
      ['Legenda da memória', 'caption', 'no banco perto da fonte'],
    ]

    for (const [ariaLabel, prop, value] of cases) {
      const input = container.querySelector(
        `input[aria-label="${ariaLabel}"]`,
      ) as HTMLInputElement
      expect(input).not.toBeNull()
      await act(async () => {
        setInputValue(input, value)
      })
      if (updatedBlock.type === 'memoryCard') {
        expect(updatedBlock.props[prop]).toBe(value)
      }
    }

    const textarea = container.querySelector(
      'textarea[aria-label="História da memória"]',
    ) as HTMLTextAreaElement
    expect(textarea).not.toBeNull()
    await act(async () => {
      setInputValue(textarea, 'A história toda aqui.')
    })
    if (updatedBlock.type === 'memoryCard') {
      expect(updatedBlock.props.text).toBe('A história toda aqui.')
    }
  })
})
