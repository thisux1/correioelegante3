import { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ShareLetterModal } from './ShareLetterModal'
import { formatLetterUrl } from './shareLetterUtils'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ShareLetterModal', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    mockNavigate.mockClear()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('calcula formatLetterUrl corretamente para diferentes domínios e customUrl', () => {
    expect(formatLetterUrl('carta-456')).toContain('carta-456')
    expect(formatLetterUrl('carta-456', 'https://meulink.com/carta')).toBe('https://meulink.com/carta')
    expect(formatLetterUrl('')).toBe('')
  })

  it('não renderiza nada quando isOpen é false', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={false}
            onClose={vi.fn()}
            pageId="page-123"
          />
        </BrowserRouter>
      )
    })

    expect(container.textContent).toBe('')
  })

  it('renderiza selo de cera 3D e mensagem celebratória quando aberto', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={vi.fn()}
            pageId="page-123"
            pageTitle="Declaração para Ana"
            recipientName="Ana"
          />
        </BrowserRouter>
      )
    })

    expect(container.textContent).toContain('Carta Selada & Pronta para Envio!')
    expect(container.textContent).toContain('Declaração para Ana')
  })

  it('exibe a URL da carta e permite copiar com feedback imediato', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={vi.fn()}
            pageId="page-abc-123"
            customUrl="https://correioelegante.studio/p/page-abc-123"
          />
        </BrowserRouter>
      )
    })

    const input = container.querySelector('input#share-letter-url') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('https://correioelegante.studio/p/page-abc-123')

    const copyBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Copiar Link')
    ) as HTMLButtonElement

    expect(copyBtn).toBeDefined()

    await act(async () => {
      copyBtn.click()
    })

    expect(writeTextMock).toHaveBeenCalledWith('https://correioelegante.studio/p/page-abc-123')
    expect(container.textContent).toContain('Copiado!')
    expect(container.textContent).toContain('Link copiado com sucesso!')
  })

  it('renderiza o botão do WhatsApp com link direto e mensagem romântica formatada', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={vi.fn()}
            pageId="page-xyz"
            recipientName="Juliana"
            customUrl="https://correioelegante.studio/p/page-xyz"
          />
        </BrowserRouter>
      )
    })

    const whatsappLink = Array.from(container.querySelectorAll('a')).find(
      (a) => a.textContent?.includes('Enviar no WhatsApp')
    ) as HTMLAnchorElement

    expect(whatsappLink).toBeDefined()
    expect(whatsappLink.href).toContain('api.whatsapp.com/send?text=')
    expect(whatsappLink.href).toContain(encodeURIComponent('Juliana'))
    expect(whatsappLink.href).toContain(encodeURIComponent('https://correioelegante.studio/p/page-xyz'))
    expect(whatsappLink.target).toBe('_blank')
  })

  it('renderiza gerador de QR Code com moldura e botão para baixar imagem PNG', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={vi.fn()}
            pageId="page-qr-99"
          />
        </BrowserRouter>
      )
    })

    expect(container.textContent).toContain('QR Code para Presentes & Cartões Físicos')
    const downloadQrBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Baixar QR Code (PNG)')
    ) as HTMLButtonElement

    expect(downloadQrBtn).toBeDefined()

    // Test download click
    const fakeCanvas = document.createElement('canvas')
    fakeCanvas.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,fake')
    container.querySelector('div.inline-block')?.appendChild(fakeCanvas)

    await act(async () => {
      downloadQrBtn.click()
    })

    expect(container.textContent).toContain('QR Code Baixado!')
  })

  it('renderiza o botão Ver como Destinatário abrindo em nova aba', async () => {
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={vi.fn()}
            pageId="carta-1234"
          />
        </BrowserRouter>
      )
    })

    const recipientLink = Array.from(container.querySelectorAll('a')).find(
      (a) => a.textContent?.includes('Ver como Destinatário')
    ) as HTMLAnchorElement

    expect(recipientLink).toBeDefined()
    expect(recipientLink.href).toContain('/card/page/carta-1234')
    expect(recipientLink.target).toBe('_blank')
  })

  it('permite navegar diretamente para Minhas Cartas (/profile)', async () => {
    const onClose = vi.fn()
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={onClose}
            pageId="carta-1234"
          />
        </BrowserRouter>
      )
    })

    const profileBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Minhas Cartas')
    ) as HTMLButtonElement

    expect(profileBtn).toBeDefined()

    await act(async () => {
      profileBtn.click()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/profile?tab=messages')
  })

  it('fecha o modal ao clicar no botão de fechar', async () => {
    const onClose = vi.fn()
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BrowserRouter>
          <ShareLetterModal
            isOpen={true}
            onClose={onClose}
            pageId="carta-1234"
          />
        </BrowserRouter>
      )
    })

    const closeBtn = container.querySelector('button[aria-label="Fechar modal de compartilhamento"]') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()

    await act(async () => {
      closeBtn.click()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
