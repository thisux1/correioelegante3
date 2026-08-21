import { describe, expect, it } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import { PaymentPageSkeleton } from './PaymentPageSkeleton'

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

describe('PaymentPageSkeleton', () => {
  it('renderiza o skeleton de pagamento com atributos de acessibilidade', () => {
    const { host, unmount } = renderComponent(<PaymentPageSkeleton />)
    const rootEl = host.querySelector('[role="status"]')

    expect(rootEl).not.toBeNull()
    expect(rootEl?.getAttribute('aria-label')).toBe('Carregando pagamento...')
    unmount()
  })

  it('renderiza a estrutura de checkout em 2 colunas', () => {
    const { host, unmount } = renderComponent(<PaymentPageSkeleton />)

    const summaryCol = host.querySelector('[data-testid="payment-skeleton-summary-column"]')
    const methodsCol = host.querySelector('[data-testid="payment-skeleton-methods-column"]')

    expect(summaryCol).not.toBeNull()
    expect(methodsCol).not.toBeNull()
    unmount()
  })

  it('renderiza resumo da carta com valor e selos de segurança na coluna esquerda', () => {
    const { host, unmount } = renderComponent(<PaymentPageSkeleton />)

    const securitySeals = host.querySelector('[data-testid="payment-skeleton-security-seals"]')
    expect(securitySeals).not.toBeNull()

    const summaryCol = host.querySelector('[data-testid="payment-skeleton-summary-column"]')
    const shimmers = summaryCol?.querySelectorAll('.animate-shimmer') ?? []
    expect(shimmers.length).toBeGreaterThanOrEqual(6)
    unmount()
  })

  it('renderiza abas de métodos (PIX, Cartão) e caixa de QR Code em shimmer na coluna direita', () => {
    const { host, unmount } = renderComponent(<PaymentPageSkeleton />)

    const methodTabs = host.querySelector('[data-testid="payment-skeleton-method-tabs"]')
    const qrCodeBox = host.querySelector('[data-testid="payment-skeleton-qrcode-box"]')

    expect(methodTabs).not.toBeNull()
    expect(qrCodeBox).not.toBeNull()

    const qrShimmers = qrCodeBox?.querySelectorAll('.animate-shimmer') ?? []
    expect(qrShimmers.length).toBeGreaterThanOrEqual(4)
    unmount()
  })

  it('aplica classes personalizadas via className', () => {
    const { host, unmount } = renderComponent(<PaymentPageSkeleton className="custom-payment-skeleton" />)
    const rootEl = host.querySelector('.custom-payment-skeleton')

    expect(rootEl).not.toBeNull()
    unmount()
  })
})
