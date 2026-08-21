import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PageLoader } from './router'

function renderWithRouter(initialEntry: string) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)

  act(() => {
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <PageLoader />
      </MemoryRouter>
    )
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

describe('PageLoader (Intelligent Router Skeletons)', () => {
  it('renderiza EditorSkeleton na rota /editor', () => {
    const { host, unmount } = renderWithRouter('/editor')
    const el = host.querySelector('[aria-label="Carregando editor..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza CreatePageSkeleton na rota /create', () => {
    const { host, unmount } = renderWithRouter('/create')
    const el = host.querySelector('[aria-label="Carregando modelos..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza PricingPageSkeleton na rota /planos', () => {
    const { host, unmount } = renderWithRouter('/planos')
    const el = host.querySelector('[aria-label="Carregando planos..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza PaymentPageSkeleton na rota /payment', () => {
    const { host, unmount } = renderWithRouter('/payment/page/abc')
    const el = host.querySelector('[aria-label="Carregando pagamento..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza AuthPageSkeleton na rota /auth', () => {
    const { host, unmount } = renderWithRouter('/auth')
    const el = host.querySelector('[aria-label="Carregando autenticação..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza ProfileCardSkeleton na rota /profile', () => {
    const { host, unmount } = renderWithRouter('/profile')
    const el = host.querySelector('[aria-label="Carregando cartas do perfil..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza PageCardSkeleton na rota /card', () => {
    const { host, unmount } = renderWithRouter('/card/page/123')
    const el = host.querySelector('[aria-label="Carregando carta..."]')

    expect(el).not.toBeNull()
    unmount()
  })

  it('renderiza SuccessPageSkeleton na rota /planos/sucesso e /payment/:id/success', () => {
    const { host: host1, unmount: unmount1 } = renderWithRouter('/planos/sucesso')
    expect(host1.querySelector('[aria-label="Carregando confirmação..."]')).not.toBeNull()
    unmount1()

    const { host: host2, unmount: unmount2 } = renderWithRouter('/payment/msg123/success')
    expect(host2.querySelector('[aria-label="Carregando confirmação..."]')).not.toBeNull()
    unmount2()
  })

  it('renderiza LegalPageSkeleton por padrão em rotas institucionais e desconhecidas', () => {
    const { host, unmount } = renderWithRouter('/legal/terms')
    const el = host.querySelector('[aria-label="Carregando conteúdo institucional..."]')

    expect(el).not.toBeNull()
    unmount()
  })
})
