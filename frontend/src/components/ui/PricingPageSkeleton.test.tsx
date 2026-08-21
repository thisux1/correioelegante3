import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { PricingPageSkeleton } from './PricingPageSkeleton'

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

describe('PricingPageSkeleton', () => {
  it('renderiza o skeleton de planos com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<PricingPageSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando planos...')
    unmount()
  })

  it('renderiza 3 cards de planos por padrão', () => {
    const { host, unmount } = renderComponent(<PricingPageSkeleton />)
    const cards = host.querySelectorAll('.glass')

    expect(cards.length).toBe(3)
    unmount()
  })

  it('permite customizar a quantidade de cards', () => {
    const { host, unmount } = renderComponent(<PricingPageSkeleton cardsCount={2} />)
    const cards = host.querySelectorAll('.glass')

    expect(cards.length).toBe(2)
    unmount()
  })

  it('renderiza shimmers de títulos, preços, checklist e botões CTA', () => {
    const { host, unmount } = renderComponent(<PricingPageSkeleton />)
    const shimmerElements = host.querySelectorAll('.animate-shimmer')

    expect(shimmerElements.length).toBeGreaterThanOrEqual(10)
    unmount()
  })
})
