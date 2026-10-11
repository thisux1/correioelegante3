import { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { ReportPageModal } from './ReportPageModal'
import { pageService } from '@/services/pageService'

vi.mock('@/services/pageService', () => ({
  pageService: {
    reportPage: vi.fn(),
  },
}))

const mockedReport = vi.mocked(pageService.reportPage)

describe('ReportPageModal', () => {
  let container: HTMLDivElement
  const onClose = vi.fn()

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    mockedReport.mockReset()
    onClose.mockClear()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  async function render() {
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(<ReportPageModal isOpen onClose={onClose} pageId="page-1" />)
    })
  }

  it('exige motivo antes de enviar', async () => {
    await render()

    const form = container.querySelector('form')!
    await act(async () => {
      form.requestSubmit()
    })

    expect(mockedReport).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Escolha um motivo')
  })

  it('envia denúncia com motivo e mostra confirmação', async () => {
    await render()
    mockedReport.mockResolvedValue(undefined)

    const radio = container.querySelector<HTMLInputElement>('input[value="assedio"]')!
    await act(async () => {
      radio.click()
    })

    const form = container.querySelector('form')!
    await act(async () => {
      form.requestSubmit()
    })

    expect(mockedReport).toHaveBeenCalledWith('page-1', {
      reason: 'assedio',
      details: undefined,
    })
    expect(container.textContent).toContain('Denúncia registrada')
  })

  it('mostra erro quando a API falha', async () => {
    await render()
    mockedReport.mockRejectedValue(new Error('boom'))

    const radio = container.querySelector<HTMLInputElement>('input[value="spam"]')!
    await act(async () => {
      radio.click()
    })
    await act(async () => {
      container.querySelector('form')!.requestSubmit()
    })

    expect(container.textContent).toContain('Não foi possível enviar agora')
  })
})
