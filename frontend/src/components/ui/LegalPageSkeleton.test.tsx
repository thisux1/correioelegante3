import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { LegalPageSkeleton } from './LegalPageSkeleton'

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

describe('LegalPageSkeleton', () => {
  it('renderiza o skeleton institucional com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<LegalPageSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando conteúdo institucional...')
    unmount()
  })

  it('renderiza cabeçalho institucional e seções de texto em shimmer', () => {
    const { host, unmount } = renderComponent(<LegalPageSkeleton sectionsCount={3} />)
    const shimmers = host.querySelectorAll('.animate-shimmer')

    expect(shimmers.length).toBeGreaterThanOrEqual(8)
    unmount()
  })
})
