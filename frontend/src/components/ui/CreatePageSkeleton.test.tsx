import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { CreatePageSkeleton } from './CreatePageSkeleton'

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

describe('CreatePageSkeleton', () => {
  it('renderiza o skeleton de templates com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<CreatePageSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando modelos...')
    unmount()
  })

  it('renderiza a quantidade padrão de 6 templates', () => {
    const { host, unmount } = renderComponent(<CreatePageSkeleton />)
    const cards = host.querySelectorAll('.glass')

    expect(cards.length).toBe(6)
    unmount()
  })

  it('permite customizar a quantidade de cards exibidos via count ou templatesCount', () => {
    const { host: host1, unmount: unmount1 } = renderComponent(<CreatePageSkeleton count={3} />)
    expect(host1.querySelectorAll('.glass').length).toBe(3)
    unmount1()

    const { host: host2, unmount: unmount2 } = renderComponent(<CreatePageSkeleton templatesCount={4} />)
    expect(host2.querySelectorAll('.glass').length).toBe(4)
    unmount2()
  })

  it('renderiza banner, badge, título, descrição e botão em cada card', () => {
    const { host, unmount } = renderComponent(<CreatePageSkeleton count={1} />)
    const card = host.querySelector('.glass')

    expect(card).not.toBeNull()
    const shimmers = card?.querySelectorAll('.animate-shimmer') ?? []
    expect(shimmers.length).toBeGreaterThanOrEqual(5)
    unmount()
  })

  it('aplica classes personalizadas via className', () => {
    const { host, unmount } = renderComponent(<CreatePageSkeleton className="custom-create-skeleton" />)
    const rootEl = host.querySelector('.custom-create-skeleton')

    expect(rootEl).not.toBeNull()
    unmount()
  })
})
