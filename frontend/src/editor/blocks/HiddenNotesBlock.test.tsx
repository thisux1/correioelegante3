import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { HiddenNotesBlock } from './HiddenNotesBlock'
import type { Block, BlockComponentProps, HiddenNoteItem } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeBlock(notes: HiddenNoteItem[], title = 'Bilhetes escondidos'): Block {
  return {
    id: 'hn-1',
    type: 'hiddenNotes',
    version: 1,
    props: { title, notes },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

const DEFAULT_NOTES: HiddenNoteItem[] = [
  { id: 'n1', text: 'Você encontrou o primeiro.' },
  { id: 'n2', text: 'Esse eu escondi com carinho.' },
  { id: 'n3', text: 'Último: eu te amo.' },
]

describe('HiddenNotesBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('preview mostra lacres e revela bilhete ao clicar, atualizando o progresso', async () => {
    const block = makeBlock(DEFAULT_NOTES)

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(HiddenNotesBlock, { block, mode: 'preview' }))
    })

    // Nada revelado: nenhum texto de bilhete no DOM.
    for (const note of DEFAULT_NOTES) {
      expect(container.textContent).not.toContain(note.text)
    }
    expect(container.textContent).toContain('0 de 3 bilhetes encontrados')

    const firstSeal = container.querySelector(
      'button[aria-label="Bilhete escondido 1"]',
    ) as HTMLButtonElement
    expect(firstSeal).not.toBeNull()

    await act(async () => {
      firstSeal.click()
    })

    expect(container.textContent).toContain(DEFAULT_NOTES[0].text)
    expect(container.textContent).toContain('1 de 3 bilhetes encontrados')
    expect(
      container.querySelector('button[aria-label="Bilhete 1 (já aberto)"]'),
    ).not.toBeNull()

    // Bilhetes não precisam de ordem — o terceiro pode abrir antes do segundo.
    const thirdSeal = container.querySelector(
      'button[aria-label="Bilhete escondido 3"]',
    ) as HTMLButtonElement
    await act(async () => {
      thirdSeal.click()
    })

    expect(container.textContent).toContain(DEFAULT_NOTES[2].text)
    expect(container.textContent).toContain('2 de 3 bilhetes encontrados')
  })

  it('preview ignora bilhetes vazios e some quando não há nenhum', async () => {
    const withEmpty = makeBlock([
      { id: 'n1', text: '  ' },
      { id: 'n2', text: 'Só esse aparece.' },
    ])

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(HiddenNotesBlock, { block: withEmpty, mode: 'preview' }))
    })

    expect(container.querySelectorAll('button[aria-label^="Bilhete"]')).toHaveLength(1)

    const empty = makeBlock([])
    await act(async () => {
      root.render(React.createElement(HiddenNotesBlock, { block: empty, mode: 'preview' }))
    })
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('modo edição: título, texto, adicionar e remover disparam onUpdate', async () => {
    const block = makeBlock(DEFAULT_NOTES.slice(0, 2))
    let updatedBlock: Block = block
    let tick = 1
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      const next = updater(updatedBlock)
      // A store real bumpeia meta.updatedAt em cada mutação — sem isso o
      // memo do bloco ignora o re-render no teste.
      updatedBlock = { ...next, meta: { ...next.meta, updatedAt: next.meta.updatedAt + tick++ } }
    })

    const root = ReactDOM.createRoot(container)
    const renderBlock = async (next: Block) => {
      await act(async () => {
        root.render(React.createElement(HiddenNotesBlock, { block: next, mode: 'edit', onUpdate }))
      })
    }
    await renderBlock(block)

    // Em edição não há lacres — todos os textos editáveis.
    expect(container.querySelector('button[aria-label="Bilhete escondido 1"]')).toBeNull()
    expect(container.querySelectorAll('textarea')).toHaveLength(2)

    const titleInput = container.querySelector(
      'input[aria-label="Título dos bilhetes escondidos"]',
    ) as HTMLInputElement
    await act(async () => {
      setInputValue(titleInput, 'Segredos pra você achar')
    })
    if (updatedBlock.type === 'hiddenNotes') {
      expect(updatedBlock.props.title).toBe('Segredos pra você achar')
    }

    const firstTextarea = container.querySelector(
      'textarea[aria-label="Texto do bilhete 1"]',
    ) as HTMLTextAreaElement
    await act(async () => {
      setInputValue(firstTextarea, 'Bilhete reescrito.')
    })
    if (updatedBlock.type === 'hiddenNotes') {
      expect(updatedBlock.props.notes[0].text).toBe('Bilhete reescrito.')
    }

    const removeButton = container.querySelector(
      'button[aria-label="Remover bilhete 1"]',
    ) as HTMLButtonElement
    await act(async () => {
      removeButton.click()
    })
    if (updatedBlock.type === 'hiddenNotes') {
      expect(updatedBlock.props.notes.map((note) => note.id)).toEqual(['n2'])
    }

    await renderBlock(updatedBlock)
    const addButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Adicionar bilhete'),
    ) as HTMLButtonElement | undefined
    expect(addButton).not.toBeNull()
    await act(async () => {
      addButton?.click()
    })
    if (updatedBlock.type === 'hiddenNotes') {
      expect(updatedBlock.props.notes).toHaveLength(2)
      expect(updatedBlock.props.notes[1].text).toBe('')
    }
  })
})
