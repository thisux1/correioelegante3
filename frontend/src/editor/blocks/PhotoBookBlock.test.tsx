import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { PhotoBookBlock } from './PhotoBookBlock'
import type { Block, BlockComponentProps, PhotoBookBlockProps, PhotoBookPage } from '@/editor/types'

vi.mock('@/services/assetService', () => ({
  assetService: {
    uploadFileFlow: vi.fn(),
    list: vi.fn(),
    reprocess: vi.fn(),
    getById: vi.fn(),
  },
}))

let reducedMotionMatches = false
const motionPreferenceListeners = new Set<() => void>()

function installMatchMediaMock() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return reducedMotionMatches
    },
    media: query,
    onchange: null,
    addListener: (callback: () => void) => motionPreferenceListeners.add(callback),
    removeListener: (callback: () => void) => motionPreferenceListeners.delete(callback),
    addEventListener: (_type: string, callback: () => void) =>
      motionPreferenceListeners.add(callback),
    removeEventListener: (_type: string, callback: () => void) =>
      motionPreferenceListeners.delete(callback),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function setReducedMotionPreference(value: boolean) {
  reducedMotionMatches = value
  motionPreferenceListeners.forEach((listener) => listener())
}

function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const isTextArea = input instanceof HTMLTextAreaElement
  const proto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  nativeSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

async function waitForCondition(assertion: () => void, timeoutMs = 3000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion()
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
  }
  assertion()
}

function makePage(id: string, caption?: string): PhotoBookPage {
  return { id, src: `https://example.com/${id}.jpg`, caption }
}

function makeBlock(pages: PhotoBookPage[], extra?: Partial<PhotoBookBlockProps>): Block {
  return {
    id: 'book-1',
    type: 'photoBook',
    version: 1,
    props: { pages, ...extra },
    meta: { createdAt: 0, updatedAt: 0 },
  }
}

function renderBlock(block: Block, mode: 'edit' | 'preview', onUpdate?: BlockComponentProps['onUpdate']) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = ReactDOM.createRoot(container)
  act(() => {
    root.render(React.createElement(PhotoBookBlock, { block, mode, onUpdate }))
  })
  return {
    container,
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

function queryButton(container: HTMLElement, ariaLabel: string) {
  return container.querySelector(`button[aria-label="${ariaLabel}"]`) as HTMLButtonElement | null
}

describe('PhotoBookBlock', () => {
  beforeEach(() => {
    installMatchMediaMock()
  })

  afterEach(() => {
    setReducedMotionPreference(false)
  })

  it('renderiza a capa com título e subtítulo no modo preview', () => {
    const block = makeBlock([makePage('p1'), makePage('p2')], {
      coverTitle: 'Nosso livro de memórias',
      coverSubtitle: 'Folheie com carinho',
    })

    const { container, unmount } = renderBlock(block, 'preview')

    expect(container.textContent).toContain('Nosso livro de memórias')
    expect(container.textContent).toContain('Folheie com carinho')
    expect(queryButton(container, 'Abrir livro de fotos')).not.toBeNull()
    expect(container.querySelector('input')).toBeNull()
    unmount()
  })

  it('exibe estado vazio elegante quando não há páginas', () => {
    const block = makeBlock([], { coverTitle: 'Nosso livro' })

    const { container, unmount } = renderBlock(block, 'preview')

    expect(container.textContent).toContain('Nosso livro')
    expect(container.textContent).toContain('ainda não tem fotos')
    expect(queryButton(container, 'Abrir livro de fotos')).toBeNull()
    unmount()
  })

  it('abre o livro, navega pelas páginas e respeita os limites', async () => {
    const block = makeBlock(
      [
        makePage('p1', 'Primeiro encontro'),
        makePage('p2', 'Viagem inesquecível'),
        makePage('p3', 'Casa nova'),
        makePage('p4', 'O pedido'),
      ],
      { coverTitle: 'Nosso livro', coverSubtitle: 'Folheie com carinho' },
    )

    const { container, unmount } = renderBlock(block, 'preview')

    const openButton = queryButton(container, 'Abrir livro de fotos') as HTMLButtonElement
    expect(openButton).not.toBeNull()

    await act(async () => {
      openButton.click()
    })

    await waitForCondition(() => {
      expect(container.textContent).toContain('Página 1 de 4')
    })
    expect(container.textContent).toContain('Primeiro encontro')

    const nextButton = queryButton(container, 'Próxima página') as HTMLButtonElement
    const prevButton = queryButton(container, 'Página anterior') as HTMLButtonElement
    expect(nextButton).not.toBeNull()
    expect(prevButton).not.toBeNull()
    expect(prevButton.disabled).toBe(true)

    // Avança: a folha animada aparece durante a virada
    await act(async () => {
      nextButton.click()
    })
    expect(container.textContent).toContain('Páginas 2 e 3 de 4')
    expect(container.querySelector('[data-photo-book-leaf]')).not.toBeNull()

    // Aguarda a folha assentar antes de virar novamente
    await waitForCondition(() => {
      expect(nextButton.disabled).toBe(false)
    })
    expect(container.querySelector('[data-photo-book-leaf]')).toBeNull()

    await act(async () => {
      nextButton.click()
    })
    expect(container.textContent).toContain('Página 4 de 4')

    await waitForCondition(() => {
      expect(container.querySelector('[data-photo-book-leaf]')).toBeNull()
    })
    expect(nextButton.disabled).toBe(true)

    // Volta até o início
    await act(async () => {
      prevButton.click()
    })
    expect(container.textContent).toContain('Páginas 2 e 3 de 4')

    await waitForCondition(() => {
      expect(prevButton.disabled).toBe(false)
    })

    await act(async () => {
      prevButton.click()
    })
    expect(container.textContent).toContain('Página 1 de 4')
    unmount()
  })

  it('navega com setas do teclado e fecha com Escape', async () => {
    const block = makeBlock([makePage('p1'), makePage('p2'), makePage('p3')], {
      coverTitle: 'Nosso livro',
    })

    const { container, unmount } = renderBlock(block, 'preview')

    const openButton = queryButton(container, 'Abrir livro de fotos') as HTMLButtonElement
    await act(async () => {
      openButton.click()
    })

    await waitForCondition(() => {
      expect(container.textContent).toContain('Página 1 de 3')
    })

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })
    expect(container.textContent).toContain('Páginas 2 e 3 de 3')

    // Aguarda a folha assentar antes da próxima virada
    await waitForCondition(() => {
      expect(container.querySelector('[data-photo-book-leaf]')).toBeNull()
    })

    // O listener de teclado é re-subscrito via useEffect quando `turn` zera —
    // um act() extra garante o flush do efeito antes de despachar a tecla.
    await act(async () => {})

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    expect(container.textContent).toContain('Página 1 de 3')

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    await waitForCondition(() => {
      expect(queryButton(container, 'Abrir livro de fotos')).not.toBeNull()
    })
    unmount()
  })

  it('respeita prefers-reduced-motion com troca instantânea de página', async () => {
    setReducedMotionPreference(true)

    const block = makeBlock([makePage('p1'), makePage('p2'), makePage('p3')], {
      coverTitle: 'Nosso livro',
    })

    const { container, unmount } = renderBlock(block, 'preview')

    const openButton = queryButton(container, 'Abrir livro de fotos') as HTMLButtonElement
    await act(async () => {
      openButton.click()
    })

    await waitForCondition(() => {
      expect(container.textContent).toContain('Página 1 de 3')
    })

    const nextButton = queryButton(container, 'Próxima página') as HTMLButtonElement
    await act(async () => {
      nextButton.click()
    })

    // Sem folha animada e botões nunca bloqueiam por animação
    expect(container.textContent).toContain('Páginas 2 e 3 de 3')
    expect(container.querySelector('[data-photo-book-leaf]')).toBeNull()
    expect(nextButton.disabled).toBe(true) // último spread de 3 páginas
    unmount()
  })

  it('permite editar título e subtítulo da capa no modo edição', () => {
    const block = makeBlock([makePage('p1')], {
      coverTitle: 'Título antigo',
      coverSubtitle: 'Sub antigo',
    })

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const { container, unmount } = renderBlock(block, 'edit', onUpdate)

    const titleInput = container.querySelector(
      'input[aria-label="Título da capa"]',
    ) as HTMLInputElement
    const subtitleInput = container.querySelector(
      'input[aria-label="Subtítulo da capa"]',
    ) as HTMLInputElement
    expect(titleInput).not.toBeNull()
    expect(subtitleInput).not.toBeNull()

    act(() => {
      setInputValue(titleInput, 'Nosso livro de memórias')
      setInputValue(subtitleInput, 'Folheie com carinho')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'photoBook') {
      expect(updatedBlock.props.coverTitle).toBe('Nosso livro de memórias')
      expect(updatedBlock.props.coverSubtitle).toBe('Folheie com carinho')
    }
    unmount()
  })

  it('permite adicionar e remover páginas chamando onUpdate', () => {
    const block = makeBlock([makePage('p1', 'Única foto')])

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const { container, unmount } = renderBlock(block, 'edit', onUpdate)

    const addButton = queryButton(container, 'Adicionar página') as HTMLButtonElement
    expect(addButton).not.toBeNull()

    act(() => {
      addButton.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'photoBook') {
      expect(updatedBlock.props.pages).toHaveLength(2)
      expect(updatedBlock.props.pages[1].id).toBeTruthy()
      expect(updatedBlock.props.pages[0].id).toBe('p1')
    }

    const removeButton = queryButton(container, 'Remover página 1') as HTMLButtonElement
    expect(removeButton).not.toBeNull()

    act(() => {
      removeButton.click()
    })

    if (updatedBlock.type === 'photoBook') {
      expect(updatedBlock.props.pages).toHaveLength(0)
    }
    unmount()
  })

  it('permite editar a legenda de uma página chamando onUpdate', () => {
    const block = makeBlock([makePage('p1', 'Legenda antiga'), makePage('p2')])

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const { container, unmount } = renderBlock(block, 'edit', onUpdate)

    const captionInput = container.querySelector(
      'input[aria-label="Legenda da página 1"]',
    ) as HTMLInputElement
    expect(captionInput).not.toBeNull()
    expect(captionInput.value).toBe('Legenda antiga')

    act(() => {
      setInputValue(captionInput, 'Nosso pôr do sol favorito')
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'photoBook') {
      expect(updatedBlock.props.pages[0].caption).toBe('Nosso pôr do sol favorito')
      expect(updatedBlock.props.pages[1].id).toBe('p2')
    }
    unmount()
  })

  it('permite reordenar páginas com os botões de mover', () => {
    const block = makeBlock([makePage('p1'), makePage('p2'), makePage('p3')])

    let updatedBlock: Block = block
    const onUpdate: NonNullable<BlockComponentProps['onUpdate']> = vi.fn((updater) => {
      updatedBlock = updater(updatedBlock)
    })

    const { container, unmount } = renderBlock(block, 'edit', onUpdate)

    const moveDownButton = queryButton(container, 'Mover página 1 para baixo') as HTMLButtonElement
    expect(moveDownButton).not.toBeNull()

    act(() => {
      moveDownButton.click()
    })

    expect(onUpdate).toHaveBeenCalled()
    if (updatedBlock.type === 'photoBook') {
      expect(updatedBlock.props.pages.map((page) => page.id)).toEqual(['p2', 'p1', 'p3'])
    }

    // O componente segue renderizando o bloco original (o pai re-renderizaria):
    // mover a página 3 para cima parte de ['p1','p2','p3'] -> ['p1','p3','p2'].
    const moveUpButton = queryButton(container, 'Mover página 3 para cima') as HTMLButtonElement
    expect(moveUpButton).not.toBeNull()

    act(() => {
      moveUpButton.click()
    })

    if (updatedBlock.type === 'photoBook') {
      expect(updatedBlock.props.pages.map((page) => page.id)).toEqual(['p1', 'p3', 'p2'])
    }
    unmount()
  })
})
