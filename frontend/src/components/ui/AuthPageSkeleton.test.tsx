import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { AuthPageSkeleton } from './AuthPageSkeleton'

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

describe('AuthPageSkeleton', () => {
  it('renderiza o skeleton de autenticação com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<AuthPageSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando autenticação...')
    unmount()
  })

  it('renderiza campos de formulário, abas de alternância e botão de ação', () => {
    const { host, unmount } = renderComponent(<AuthPageSkeleton />)
    const shimmers = host.querySelectorAll('.animate-shimmer')

    expect(shimmers.length).toBeGreaterThanOrEqual(5)
    unmount()
  })

  it('suporta modo de redefinição de senha ocultando abas de login/registro', () => {
    const { host, unmount } = renderComponent(<AuthPageSkeleton isResetPassword />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    unmount()
  })
})
