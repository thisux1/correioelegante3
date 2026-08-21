import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { PolaroidBlock } from './PolaroidBlock'
import type { Block, BlockComponentProps } from '@/editor/types'

describe('PolaroidBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renderiza o estado vazio corretamente no modo edição', async () => {
    const block: Block = {
      id: 'polaroid-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(PolaroidBlock, { block, mode: 'edit' }))
    })

    expect(container.textContent).toContain('Nenhuma foto Polaroid adicionada')
    expect(container.textContent).toContain('Nova Polaroid')
  })

  it('renderiza fotos em preview sem ferramentas de edição ou sliders distantes', async () => {
    const block: Block = {
      id: 'polaroid-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [
          {
            id: 'p-1',
            src: 'https://example.com/photo1.jpg',
            caption: 'Nossa primeira viagem juntos ❤️',
            rotation: -3,
            width: 260,
          },
        ],
      },
      meta: { createdAt: Date.now(), updatedAt: Date.now() },
    }

    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(PolaroidBlock, { block, mode: 'preview' }))
    })

    expect(container.textContent).toContain('Nossa primeira viagem juntos ❤️')
    expect(container.querySelector('img')).not.toBeNull()
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('button[title="Trocar Foto da Polaroid"]')).toBeNull()
    expect(container.querySelector('input[type="range"]')).toBeNull()
  })

  it('ao clicar na foto em modo edição, exibe bounding box, alça de rotação e barra flutuante', async () => {
    const block: Block = {
      id: 'polaroid-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [
          {
            id: 'p-1',
            src: 'https://example.com/photo1.jpg',
            caption: 'Momento Mágico ✨',
            rotation: 2.5,
            width: 260,
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
      root.render(React.createElement(PolaroidBlock, { block, mode: 'edit', onUpdate }))
    })

    const card = container.querySelector('[role="button"]') as HTMLDivElement
    expect(card).not.toBeNull()

    // Clica na polaroid para focar/selecionar
    await act(async () => {
      card.click()
    })

    // Alça de rotação e barra flutuante devem surgir
    const rotateHandle = container.querySelector('button[title="Arrastar para girar a foto"]')
    expect(rotateHandle).not.toBeNull()

    const toolbarButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Trocar Foto'),
    )
    expect(toolbarButton).toBeDefined()
  })

  it('permite digitação direta (click-to-type) na legenda da foto sobre a moldura', async () => {
    const block: Block = {
      id: 'polaroid-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [
          {
            id: 'p-1',
            src: '',
            caption: 'Legenda antiga',
            rotation: 0,
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
      root.render(React.createElement(PolaroidBlock, { block, mode: 'edit', onUpdate }))
    })

    const captionInput = container.querySelector('input[aria-label="Legenda da foto polaroid"]') as HTMLInputElement
    expect(captionInput).not.toBeNull()
    expect(captionInput.value).toBe('Legenda antiga')

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(captionInput, 'Amor da minha vida inteira 🥰')
      captionInput.dispatchEvent(new Event('input', { bubbles: true }))
      captionInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'polaroid') {
      expect(updatedBlock.props.photos[0].caption).toBe('Amor da minha vida inteira 🥰')
    }
  })

  it('permite adicionar e duplicar polaroids', async () => {
    const block: Block = {
      id: 'polaroid-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [
          {
            id: 'p-1',
            src: '',
            caption: 'Foto 1',
            rotation: -2,
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
      root.render(React.createElement(PolaroidBlock, { block, mode: 'edit', onUpdate }))
    })

    const newButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Nova Polaroid'),
    ) as HTMLButtonElement

    expect(newButton).toBeDefined()

    await act(async () => {
      newButton.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'polaroid') {
      expect(updatedBlock.props.photos.length).toBe(2)
    }
  })

  it('exibe ponto de ancoragem central e haste radial ao selecionar foto, e reseta para 0° com duplo clique', async () => {
    const block: Block = {
      id: 'polaroid-1',
      type: 'polaroid',
      version: 1,
      props: {
        photos: [
          {
            id: 'p-1',
            src: 'https://example.com/photo1.jpg',
            caption: 'Viagem incrível',
            rotation: 18.5,
            width: 260,
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
      root.render(React.createElement(PolaroidBlock, { block, mode: 'edit', onUpdate }))
    })

    const card = container.querySelector('[role="button"]') as HTMLDivElement
    expect(card).not.toBeNull()

    await act(async () => {
      card.click()
    })

    // Verifica presença do ponto de ancoragem central e da haste radial (estilo Lightroom / Camera Raw)
    const centralAnchor = container.querySelector('[data-testid="central-anchor-point"]')
    expect(centralAnchor).not.toBeNull()

    const radialStem = container.querySelector('[data-testid="radial-stem"]')
    expect(radialStem).not.toBeNull()

    // Verifica que duplo-clique no puxador de rotação reseta o ângulo para 0°
    const rotateHandle = container.querySelector('button[title="Arrastar para girar a foto"]') as HTMLButtonElement
    expect(rotateHandle).not.toBeNull()

    await act(async () => {
      rotateHandle.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'polaroid') {
      expect(updatedBlock.props.photos[0].rotation).toBe(0)
    }
  })
})
