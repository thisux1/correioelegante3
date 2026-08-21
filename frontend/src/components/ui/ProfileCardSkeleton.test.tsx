import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { ProfileCardSkeleton } from './ProfileCardSkeleton'

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

describe('ProfileCardSkeleton', () => {
  it('renderiza a quantidade padrão de 3 cards skeleton', () => {
    const { host, unmount } = renderComponent(<ProfileCardSkeleton />)
    const rootEl = host.querySelector('[role="status"]')
    const cards = host.querySelectorAll('.glass')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando cartas do perfil...')
    expect(cards.length).toBe(3)
    unmount()
  })

  it('renderiza contagem customizada de cards', () => {
    const { host, unmount } = renderComponent(<ProfileCardSkeleton count={5} />)
    const cards = host.querySelectorAll('.glass')

    expect(cards.length).toBe(5)
    unmount()
  })

  it('renderiza botões de ação e metadados nos cards', () => {
    const { host, unmount } = renderComponent(<ProfileCardSkeleton count={1} />)
    const shimmers = host.querySelectorAll('.animate-shimmer')

    // Deve ter título, badge, 2 metadados, 4 botões de ação = 8 shimmers por card
    expect(shimmers.length).toBeGreaterThanOrEqual(6)
    unmount()
  })
})
