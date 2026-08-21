import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { PageCardSkeleton } from './PageCardSkeleton'

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

describe('PageCardSkeleton', () => {
  it('renderiza o skeleton de carta com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<PageCardSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando carta...')
    unmount()
  })

  it('aplica largura máxima 3xl por padrão e aceita outras larguras', () => {
    const { host, unmount } = renderComponent(<PageCardSkeleton maxWidth="lg" />)
    const cardContainer = host.querySelector('.max-w-lg')

    expect(cardContainer).not.toBeNull()
    unmount()
  })

  it('renderiza múltiplos elementos de skeleton para lacre, texto e cabeçalho', () => {
    const { host, unmount } = renderComponent(<PageCardSkeleton showMediaPlaceholder />)
    const shimmerElements = host.querySelectorAll('.animate-shimmer')

    // Deve conter múltiplos shimmers (lacre, cabeçalhos, linhas de texto, assinatura, etc.)
    expect(shimmerElements.length).toBeGreaterThanOrEqual(6)
    unmount()
  })
})
