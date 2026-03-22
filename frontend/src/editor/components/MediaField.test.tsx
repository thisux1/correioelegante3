import { describe, expect, it, vi, beforeEach } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { MediaField } from '@/editor/components/MediaField'
import { assetService } from '@/services/assetService'
import type { AssetSummary } from '@/services/assetService'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

vi.mock('@/services/assetService', () => ({
  assetService: {
    uploadFileFlow: vi.fn(),
    list: vi.fn(),
    reprocess: vi.fn(),
  },
}))

const mockedAssetService = vi.mocked(assetService)

function createAssetListResponse(assets: AssetSummary[]): AxiosResponse<{ assets: AssetSummary[] }> {
  return {
    data: { assets },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {},
    } as InternalAxiosRequestConfig,
  }
}

async function waitForCondition(assertion: () => void, timeoutMs = 1500) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion()
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
  }

  assertion()
}

function renderMediaField(props: Parameters<typeof MediaField>[0]) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)

  act(() => {
    root.render(<MediaField {...props} />)
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

describe('MediaField', () => {
  beforeEach(() => {
    mockedAssetService.uploadFileFlow.mockReset()
    mockedAssetService.list.mockReset()
    mockedAssetService.reprocess.mockReset()
  })

  it('renderiza upload primeiro e URL manual depois', () => {
    const { host, unmount } = renderMediaField({
      kind: 'image',
      label: 'Imagem principal',
      value: { src: '' },
      onChange: () => undefined,
    })

    const uploadButton = host.querySelector('button[aria-label="Upload de arquivo para Imagem principal"]')
    const urlInput = host.querySelector('input[aria-label="Colar URL para Imagem principal"]')

    expect(uploadButton).not.toBeNull()
    expect(urlInput).not.toBeNull()
    expect(uploadButton?.compareDocumentPosition(urlInput as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    unmount()
  })

  it('aceita drag-and-drop e atualiza com asset enviado', async () => {
    mockedAssetService.uploadFileFlow.mockResolvedValue({
      id: '507f1f77bcf86cd799439111',
      kind: 'image',
      source: 'upload',
      storageKey: 'image/user/asset',
      publicUrl: 'https://cdn.example.com/photo.jpg',
      posterUrl: null,
      waveform: null,
      mimeType: 'image/jpeg',
      sizeBytes: 1234,
      width: 400,
      height: 300,
      durationMs: null,
      processingStatus: 'ready',
      errorCode: null,
      errorMessage: null,
      moderationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    mockedAssetService.list.mockResolvedValue(createAssetListResponse([]))

    const onChange = vi.fn()

    const { host, unmount } = renderMediaField({
      kind: 'image',
      label: 'Imagem principal',
      value: { src: '' },
      onChange,
    })

    const dropZone = host.querySelector('div[aria-label="Area de upload para Imagem principal"]') as HTMLDivElement | null
    expect(dropZone).not.toBeNull()
    const file = new File(['abc'], 'foto.jpg', { type: 'image/jpeg' })

    await act(async () => {
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: { files: File[] } }
      dropEvent.dataTransfer = { files: [file] }
      dropZone?.dispatchEvent(dropEvent)
    })

    await waitForCondition(() => {
      expect(onChange).toHaveBeenCalled()
    })

    expect(onChange).toHaveBeenCalledWith({
      src: 'https://cdn.example.com/photo.jpg',
      assetId: '507f1f77bcf86cd799439111',
    })

    const statusText = host.textContent ?? ''
    expect(statusText.includes('Arquivo pronto para uso.')).toBe(true)
    unmount()
  })

  it('mostra erro amigavel quando drop tem arquivo invalido', async () => {
    mockedAssetService.uploadFileFlow.mockRejectedValue(new Error('MEDIA_UNSUPPORTED_TYPE'))

    const { host, unmount } = renderMediaField({
      kind: 'image',
      label: 'Imagem principal',
      value: { src: '' },
      onChange: () => undefined,
    })

    const dropZone = host.querySelector('div[aria-label="Area de upload para Imagem principal"]') as HTMLDivElement | null
    expect(dropZone).not.toBeNull()
    const file = new File(['abc'], 'foto.gif', { type: 'image/gif' })

    await act(async () => {
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer: { files: File[] } }
      dropEvent.dataTransfer = { files: [file] }
      dropZone?.dispatchEvent(dropEvent)
    })

    await waitForCondition(() => {
      expect((host.textContent ?? '').includes('Formato nao suportado. Escolha outro arquivo.')).toBe(true)
    })
    unmount()
  })
})
