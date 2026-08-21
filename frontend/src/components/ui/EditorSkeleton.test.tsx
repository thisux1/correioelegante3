import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { EditorSkeleton } from './EditorSkeleton'

function renderComponent(ui: React.ReactElement) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)

  act(() => {
    root.render(ui)
  })

  return {
    host,
    unmount: () => {
      act(() => {
        root.unmount()
      })
      host.remove()
    },
  }
}

describe('EditorSkeleton', () => {
  it('renderiza o skeleton do editor com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<EditorSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando editor...')
    unmount()
  })

  it('renderiza a barra de ferramentas e blocos de canvas', () => {
    const { host, unmount } = renderComponent(<EditorSkeleton />)
    const blockSkeletons = host.querySelectorAll('[data-block-skeleton]')

    expect(blockSkeletons.length).toBeGreaterThanOrEqual(3)
    unmount()
  })

  it('renderiza os 3 blocos específicos: envelope, text e polaroid', () => {
    const { host, unmount } = renderComponent(<EditorSkeleton />)

    const envelopeBlock = host.querySelector('[data-block-skeleton="envelope"]')
    const textBlock = host.querySelector('[data-block-skeleton="text"]')
    const polaroidBlock = host.querySelector('[data-block-skeleton="polaroid"]')

    expect(envelopeBlock).not.toBeNull()
    expect(textBlock).not.toBeNull()
    expect(polaroidBlock).not.toBeNull()
    unmount()
  })

  it('permite ocultar o cabeçalho mantendo os 3 blocos do canvas', () => {
    const { host, unmount } = renderComponent(<EditorSkeleton showHeader={false} />)

    const envelopeBlock = host.querySelector('[data-block-skeleton="envelope"]')
    const textBlock = host.querySelector('[data-block-skeleton="text"]')
    const polaroidBlock = host.querySelector('[data-block-skeleton="polaroid"]')

    expect(envelopeBlock).not.toBeNull()
    expect(textBlock).not.toBeNull()
    expect(polaroidBlock).not.toBeNull()
    unmount()
  })
})
