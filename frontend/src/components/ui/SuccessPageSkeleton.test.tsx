import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { SuccessPageSkeleton } from './SuccessPageSkeleton'

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

describe('SuccessPageSkeleton', () => {
  it('renderiza o skeleton de sucesso com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<SuccessPageSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando confirmação...')
    unmount()
  })

  it('renderiza o ícone central, badge, comprovante de resumo e botões', () => {
    const { host, unmount } = renderComponent(<SuccessPageSkeleton />)
    const shimmers = host.querySelectorAll('.animate-shimmer')

    expect(shimmers.length).toBeGreaterThanOrEqual(6)
    unmount()
  })
})
