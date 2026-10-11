import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { HintsBlock } from './HintsBlock'
import type { Block, BlockComponentProps, HintItem } from '@/editor/types'

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function makeHintsBlock(hints: HintItem[], title = 'Dicas sobre quem escreveu'): Block {
  return {
    id: 'hints-1',
    type: 'hints',
    version: 1,
    props: { title, hints },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

const DEFAULT_HINTS: HintItem[] = [
  { id: 'h1', text: 'A gente se conhece faz mais tempo do que você imagina.' },
  { id: 'h2', text: 'Eu sempre reparo em você quando você entra no lugar.' },
  { id: 'h3', text: 'Você já me fez rir num dia em que eu estava péssimo.' },
]

function revealButton(container: HTMLElement, index: number) {
  return container.querySelector(
    `button[aria-label="Revelar dica ${index}"]`,
  ) as HTMLButtonElement | null
}

describe('HintsBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('preview inicia lacrado e revela uma dica por vez, em ordem, atualizando o contador', async () => {
    const block = makeHintsBlock(DEFAULT_HINTS)

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(HintsBlock, { block, mode: 'preview' }))
    })

    // Tudo começa selado: nenhum texto de dica aparece e não há formulários.
    for (const hint of DEFAULT_HINTS) {
      expect(container.textContent).not.toContain(hint.text)
    }
    expect(container.textContent).toContain('0 de 3 dicas reveladas')
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('textarea')).toBeNull()

    // Apenas a próxima dica é clicável — a dica 2 ainda está atrás do cadeado.
    expect(revealButton(container, 1)).not.toBeNull()
    expect(revealButton(container, 2)).toBeNull()
    expect(container.textContent).toContain('Revele a dica anterior')

    // Revela a primeira: texto aparece, contador e aria-live acompanham.
    await act(async () => {
      revealButton(container, 1)?.click()
    })
    expect(container.textContent).toContain(DEFAULT_HINTS[0].text)
    expect(container.textContent).not.toContain(DEFAULT_HINTS[1].text)
    expect(container.textContent).not.toContain(DEFAULT_HINTS[2].text)
    expect(container.textContent).toContain('1 de 3 dicas reveladas')
    expect(container.querySelector('div[aria-live="polite"]')?.textContent).toContain(
      'Dica 1 revelada',
    )

    // A próxima dica lacrada destrava e só ela pode ser aberta.
    expect(revealButton(container, 2)).not.toBeNull()
    expect(revealButton(container, 3)).toBeNull()

    await act(async () => {
      revealButton(container, 2)?.click()
    })
    expect(container.textContent).toContain(DEFAULT_HINTS[1].text)
    expect(container.textContent).not.toContain(DEFAULT_HINTS[2].text)
    expect(container.textContent).toContain('2 de 3 dicas reveladas')
    expect(container.querySelector('div[aria-live="polite"]')?.textContent).toContain(
      'Dica 2 revelada',
    )

    await act(async () => {
      revealButton(container, 3)?.click()
    })
    expect(container.textContent).toContain(DEFAULT_HINTS[2].text)
    expect(container.textContent).toContain('3 de 3 dicas reveladas')
    expect(container.textContent).toContain('Todas as pistas foram reveladas.')
    expect(container.querySelector('div[aria-live="polite"]')?.textContent).toContain(
      'Dica 3 revelada',
    )
  })

  it('não permite revelar além do fim da lista', async () => {
    const block = makeHintsBlock(DEFAULT_HINTS.slice(0, 2))

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(HintsBlock, { block, mode: 'preview' }))
    })

    await act(async () => {
      revealButton(container, 1)?.click()
    })
    await act(async () => {
      revealButton(container, 2)?.click()
    })

    // Nunca existiu uma terceira dica para revelar.
    expect(revealButton(container, 3)).toBeNull()
    expect(container.textContent).toContain('2 de 2 dicas reveladas')
    expect(container.textContent).toContain('Todas as pistas foram reveladas.')

    // Clicar de novo em um selo que já saiu de cena não avança o contador.
    const staleSeal = revealButton(container, 2)
    if (staleSeal) {
      await act(async () => {
        staleSeal.click()
      })
    }
    expect(container.textContent).toContain('2 de 2 dicas reveladas')
    expect(container.querySelector('div[aria-live="polite"]')?.textContent).toContain(
      'Dica 2 revelada',
    )
  })

  it('modo edição: editar texto, adicionar, remover e reordenar disparam onUpdate', async () => {
    const block = makeHintsBlock(DEFAULT_HINTS)
    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const root = ReactDOM.createRoot(container)
    const renderBlock = async (next: Block) => {
      await act(async () => {
        root.render(React.createElement(HintsBlock, { block: next, mode: 'edit', onUpdate }))
      })
    }
    await renderBlock(block)

    // Em edição tudo aparece aberto — nada de selos.
    expect(revealButton(container, 1)).toBeNull()
    expect(container.querySelectorAll('textarea')).toHaveLength(3)

    // 1) Edição do título inline.
    const titleInput = container.querySelector(
      'input[aria-label="Título das dicas"]',
    ) as HTMLInputElement
    expect(titleInput).not.toBeNull()
    await act(async () => {
      setInputValue(titleInput, 'Pistas sobre mim')
    })
    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'hints') {
      expect(updatedBlock.props.title).toBe('Pistas sobre mim')
    }

    // 2) Edição do texto de uma dica.
    const firstTextarea = container.querySelector(
      'textarea[aria-label="Texto da dica 1"]',
    ) as HTMLTextAreaElement
    expect(firstTextarea).not.toBeNull()
    await act(async () => {
      setInputValue(firstTextarea, 'Te vi pela primeira vez na biblioteca.')
    })
    if (updatedBlock.type === 'hints') {
      expect(updatedBlock.props.hints[0].text).toBe('Te vi pela primeira vez na biblioteca.')
    }

    // 3) Reordenação: mover a dica 2 para cima troca a ordem.
    await renderBlock(updatedBlock)
    const moveUpButton = container.querySelector(
      'button[aria-label="Mover dica 2 para cima"]',
    ) as HTMLButtonElement
    expect(moveUpButton).not.toBeNull()
    await act(async () => {
      moveUpButton.click()
    })
    if (updatedBlock.type === 'hints') {
      expect(updatedBlock.props.hints.map((hint) => hint.id)).toEqual(['h2', 'h1', 'h3'])
    }

    // O DOM reflete a nova ordem após re-render.
    await renderBlock(updatedBlock)
    expect(
      (container.querySelector('textarea[aria-label="Texto da dica 1"]') as HTMLTextAreaElement)
        .value,
    ).toBe(DEFAULT_HINTS[1].text)

    // Botões de mover respeitam os limites da lista.
    expect(
      (container.querySelector('button[aria-label="Mover dica 1 para cima"]') as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(
      (container.querySelector('button[aria-label="Mover dica 3 para baixo"]') as HTMLButtonElement)
        .disabled,
    ).toBe(true)

    // 4) Remoção da primeira dica.
    const removeButton = container.querySelector(
      'button[aria-label="Remover dica 1"]',
    ) as HTMLButtonElement
    expect(removeButton).not.toBeNull()
    await act(async () => {
      removeButton.click()
    })
    if (updatedBlock.type === 'hints') {
      expect(updatedBlock.props.hints.map((hint) => hint.id)).toEqual(['h1', 'h3'])
      expect(updatedBlock.props.hints).toHaveLength(2)
    }

    // 5) Adição de uma nova dica em branco no fim da lista.
    await renderBlock(updatedBlock)
    const addButton = container.querySelector(
      'button[aria-label="Adicionar dica"]',
    ) as HTMLButtonElement
    expect(addButton).not.toBeNull()
    expect(addButton.disabled).toBe(false)
    await act(async () => {
      addButton.click()
    })
    if (updatedBlock.type === 'hints') {
      expect(updatedBlock.props.hints).toHaveLength(3)
      expect(updatedBlock.props.hints[2].id).not.toBe('')
      expect(updatedBlock.props.hints[2].text).toBe('')
    }
  })

  it('modo edição: botão de adicionar desabilita ao atingir o limite de 12 dicas', async () => {
    const block = makeHintsBlock(
      Array.from({ length: 12 }, (_, i) => ({ id: `h${i + 1}`, text: `Pista ${i + 1}` })),
    )
    const onUpdate = vi.fn()

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(HintsBlock, { block, mode: 'edit', onUpdate }))
    })

    const addButton = container.querySelector(
      'button[aria-label="Adicionar dica"]',
    ) as HTMLButtonElement
    expect(addButton).not.toBeNull()
    expect(addButton.disabled).toBe(true)
    expect(container.textContent).toContain('Limite de 12 dicas atingido.')

    await act(async () => {
      addButton.click()
    })
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('preview com lista vazia exibe estado amigável sem quebrar', async () => {
    const block = makeHintsBlock([])

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(HintsBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Nenhuma dica por aqui ainda.')
    expect(revealButton(container, 1)).toBeNull()
  })

  it('respeita prefers-reduced-motion e revela sem quebrar', async () => {
    const prevPrefers = prefersReducedMotion.current
    const prevListener = hasReducedMotionListener.current
    prefersReducedMotion.current = true
    hasReducedMotionListener.current = true

    try {
      const block = makeHintsBlock(DEFAULT_HINTS.slice(0, 2))

      const root = ReactDOM.createRoot(container)
      await act(async () => {
        root.render(React.createElement(HintsBlock, { block, mode: 'preview' }))
      })

      expect(revealButton(container, 1)).not.toBeNull()
      await act(async () => {
        revealButton(container, 1)?.click()
      })

      // A dica aparece de imediato, sem depender do flip animado.
      expect(container.textContent).toContain(DEFAULT_HINTS[0].text)
      expect(container.textContent).toContain('1 de 2 dicas reveladas')
    } finally {
      prefersReducedMotion.current = prevPrefers
      hasReducedMotionListener.current = prevListener
    }
  })
})
