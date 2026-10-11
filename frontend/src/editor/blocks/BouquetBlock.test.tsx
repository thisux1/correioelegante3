import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { BouquetBlock } from './BouquetBlock'
import type { Block, BlockComponentProps, BouquetBlockProps } from '@/editor/types'

function makeBlock(props: Partial<BouquetBlockProps> = {}): Block {
  return {
    id: 'bouquet-1',
    type: 'bouquet',
    version: 1,
    props: {
      seed: 42,
      flowers: [
        { species: 'rosa' },
        { species: 'girassol' },
        { species: 'margarida' },
      ],
      wrap: 'papel',
      ribbonColor: '#e11d48',
      message: 'Flores que não murcham nunca.',
      ...props,
    },
    meta: { createdAt: Date.now(), updatedAt: Date.now() },
  }
}

async function renderBlock(
  container: HTMLDivElement,
  block: Block,
  mode: 'edit' | 'preview',
  onUpdate?: BlockComponentProps['onUpdate'],
) {
  const root = ReactDOM.createRoot(container)
  await act(async () => {
    root.render(React.createElement(BouquetBlock, { block, mode, onUpdate }))
  })
  return root
}

/**
 * Signature of the generated art: every pixel rect (x, y, width, fill) plus
 * each flower head's placement transform, in document order. This is the
 * determinism contract — identical props must yield identical pixels and
 * identical arrangement. Animation wrapper styles are intentionally ignored.
 */
function artSignature(container: HTMLDivElement): string {
  const svg = container.querySelector('svg[data-testid="bouquet-art"]')
  expect(svg).not.toBeNull()
  if (!svg) return ''
  return [...svg.querySelectorAll('[data-flower-head], rect')]
    .map((el) =>
      el.tagName === 'g'
        ? `HEAD:${el.getAttribute('transform')}`
        : `RECT:${el.getAttribute('x')},${el.getAttribute('y')},${el.getAttribute('width')},${el.getAttribute('fill')}`,
    )
    .join('\n')
}

describe('BouquetBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza as flores no modo preview, com arte em pixel e dedicatória', async () => {
    await renderBlock(container, makeBlock(), 'preview')

    const heads = container.querySelectorAll('[data-flower-head]')
    expect(heads.length).toBe(3)

    const svg = container.querySelector('svg[data-testid="bouquet-art"]')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('shape-rendering')).toBe('crispEdges')
    expect(svg?.querySelectorAll('rect').length).toBeGreaterThan(100)

    expect(container.textContent).toContain('Flores que não murcham nunca.')
    // Preview não exibe controles de edição.
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('select')).toBeNull()
    expect(container.textContent).not.toContain('Gerar outro')
  })

  it('o mesmo seed produz arte idêntica em renderizações separadas', async () => {
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    try {
      await renderBlock(container, makeBlock(), 'preview')
      await renderBlock(container2, makeBlock(), 'preview')
      expect(artSignature(container)).toBe(artSignature(container2))
    } finally {
      document.body.removeChild(container2)
    }
  })

  it('seeds diferentes produzem arte diferente', async () => {
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    try {
      await renderBlock(container, makeBlock({ seed: 42 }), 'preview')
      await renderBlock(container2, makeBlock({ seed: 43 }), 'preview')
      expect(artSignature(container)).not.toBe(artSignature(container2))
    } finally {
      document.body.removeChild(container2)
    }
  })

  it('"Gerar outro" troca o seed via onUpdate', async () => {
    let updatedBlock = makeBlock()
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn(
      (updater) => {
        updatedBlock = updater(updatedBlock)
      },
    )

    await renderBlock(container, makeBlock(), 'edit', onUpdate)

    const reseedBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Gerar outro'),
    ) as HTMLButtonElement
    expect(reseedBtn).toBeDefined()

    await act(async () => {
      reseedBtn.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.seed).not.toBe(42)
      expect(Number.isInteger(updatedBlock.props.seed)).toBe(true)
    }
  })

  it('adicionar flor chama onUpdate com uma flor a mais', async () => {
    let updatedBlock = makeBlock()
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn(
      (updater) => {
        updatedBlock = updater(updatedBlock)
      },
    )

    await renderBlock(container, makeBlock(), 'edit', onUpdate)

    const addBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Adicionar flor'),
    ) as HTMLButtonElement
    expect(addBtn).toBeDefined()

    await act(async () => {
      addBtn.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.flowers.length).toBe(4)
      expect(updatedBlock.props.flowers[3].species).toBeDefined()
    }
  })

  it('remover flor chama onUpdate com uma flor a menos', async () => {
    let updatedBlock = makeBlock()
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn(
      (updater) => {
        updatedBlock = updater(updatedBlock)
      },
    )

    await renderBlock(container, makeBlock(), 'edit', onUpdate)

    const removeBtn = container.querySelector(
      'button[aria-label="Remover flor 1"]',
    ) as HTMLButtonElement
    expect(removeBtn).not.toBeNull()

    await act(async () => {
      removeBtn.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.flowers.length).toBe(2)
    }
  })

  it('edições de embrulho, laço e mensagem chamam onUpdate', async () => {
    let updatedBlock = makeBlock()
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn(
      (updater) => {
        updatedBlock = updater(updatedBlock)
      },
    )

    await renderBlock(container, makeBlock(), 'edit', onUpdate)

    // Embrulho
    const wrapSelect = container.querySelector(
      'select[aria-label="Estilo do embrulho"]',
    ) as HTMLSelectElement
    expect(wrapSelect).not.toBeNull()
    await act(async () => {
      wrapSelect.value = 'juta'
      wrapSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.wrap).toBe('juta')
    }

    // Cor do laço
    const ribbonInput = container.querySelector(
      'input[aria-label="Cor do laço"]',
    ) as HTMLInputElement
    expect(ribbonInput).not.toBeNull()
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      setter?.call(ribbonInput, '#881337')
      ribbonInput.dispatchEvent(new Event('input', { bubbles: true }))
      ribbonInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.ribbonColor).toBe('#881337')
    }

    // Mensagem
    const messageInput = container.querySelector(
      'input[aria-label="Mensagem do buquê"]',
    ) as HTMLInputElement
    expect(messageInput).not.toBeNull()
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      setter?.call(messageInput, 'Para o amor da minha vida')
      messageInput.dispatchEvent(new Event('input', { bubbles: true }))
      messageInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.message).toBe('Para o amor da minha vida')
    }
  })

  it('trocar espécie e cor de uma flor chama onUpdate', async () => {
    let updatedBlock = makeBlock()
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn(
      (updater) => {
        updatedBlock = updater(updatedBlock)
      },
    )

    await renderBlock(container, makeBlock(), 'edit', onUpdate)

    const speciesSelect = container.querySelector(
      'select[aria-label="Espécie da flor 2"]',
    ) as HTMLSelectElement
    expect(speciesSelect).not.toBeNull()
    await act(async () => {
      speciesSelect.value = 'tulipa'
      speciesSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.flowers[1].species).toBe('tulipa')
    }

    const colorInput = container.querySelector(
      'input[aria-label="Cor da flor 1"]',
    ) as HTMLInputElement
    expect(colorInput).not.toBeNull()
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      setter?.call(colorInput, '#f6a90c')
      colorInput.dispatchEvent(new Event('input', { bubbles: true }))
      colorInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    if (updatedBlock.type === 'bouquet') {
      expect(updatedBlock.props.flowers[0].color).toBe('#f6a90c')
    }
  })

  it('lida com buquê vazio e com o máximo de 24 flores', async () => {
    await renderBlock(
      container,
      makeBlock({ flowers: [], message: undefined }),
      'preview',
    )
    expect(container.querySelectorAll('[data-flower-head]').length).toBe(0)
    // O embrulho ainda é desenhado.
    expect(container.querySelector('svg')?.querySelectorAll('rect').length).toBeGreaterThan(50)

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    try {
      const full = makeBlock({
        flowers: Array.from({ length: 24 }, (_, i) => ({
          species: (['rosa', 'girassol', 'tulipa', 'margarida', 'cravo', 'lavanda'] as const)[i % 6],
        })),
      })
      await renderBlock(container2, full, 'preview')
      expect(container2.querySelectorAll('[data-flower-head]').length).toBe(24)
    } finally {
      document.body.removeChild(container2)
    }
  })
})
