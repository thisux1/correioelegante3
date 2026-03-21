import { memo, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Film, LoaderCircle, TriangleAlert } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { assetService, type AssetSummary } from '@/services/assetService'

type UploadState = 'idle' | 'sending' | 'processing' | 'ready' | 'error'

function isValidVideoUrl(value: string): boolean {
  const normalized = value.trim()
  if (!normalized) {
    return false
  }

  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

interface AssetSelectProps {
  assets: AssetSummary[]
  selectedAssetId: string
  onSelect: (assetId: string) => void
}

function AssetSelect({ assets, selectedAssetId, onSelect }: AssetSelectProps) {
  return (
    <select
      value={selectedAssetId}
      onChange={(event) => onSelect(event.target.value)}
      className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
    >
      <option value="">Sem asset selecionado</option>
      {assets.map((asset) => (
        <option key={asset.id} value={asset.id}>
          {asset.id.slice(-6)} - {asset.processingStatus}
        </option>
      ))}
    </select>
  )
}

function VideoBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isVideoBlock = block.type === 'video'
  const src = isVideoBlock ? block.props.src : ''
  const assetId = isVideoBlock ? block.props.assetId ?? '' : ''

  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [assets, setAssets] = useState<AssetSummary[]>([])
  const [assetLoading, setAssetLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null)
  const [draftSrc, setDraftSrc] = useState(src)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const updateVideoProps = useCallback((next: { assetId?: string; src?: string }) => {
    onUpdate?.((current) => {
      if (current.type !== 'video') {
        return current
      }

      return {
        ...current,
        props: {
          ...current.props,
          ...(typeof next.assetId !== 'undefined' ? { assetId: next.assetId } : {}),
          ...(typeof next.src !== 'undefined' ? { src: next.src } : {}),
        },
      }
    })
  }, [onUpdate])

  useEffect(() => {
    setDraftSrc(src)
  }, [src])

  useEffect(() => {
    if (mode !== 'edit') {
      return
    }

    let alive = true
    setAssetLoading(true)
    assetService.list('video')
      .then(({ data }) => {
        if (!alive) {
          return
        }

        setAssets(data.assets)
      })
      .catch(() => {
        if (!alive) {
          return
        }

        setAssets([])
      })
      .finally(() => {
        if (!alive) {
          return
        }

        setAssetLoading(false)
      })

    return () => {
      alive = false
    }
  }, [mode, uploadState])

  useEffect(() => {
    if (!assetId) {
      setSelectedAsset(null)
      return
    }

    const fromList = assets.find((item) => item.id === assetId)
    if (fromList) {
      setSelectedAsset(fromList)
      return
    }

    let alive = true
    assetService.getById(assetId)
      .then(({ data }) => {
        if (!alive) {
          return
        }

        setSelectedAsset(data.asset)
      })
      .catch(() => {
        if (!alive) {
          return
        }

        setSelectedAsset(null)
      })

    return () => {
      alive = false
    }
  }, [assetId, assets])

  useEffect(() => {
    if (!selectedAsset || (selectedAsset.processingStatus !== 'pending' && selectedAsset.processingStatus !== 'processing')) {
      return
    }

    const timer = window.setInterval(() => {
      assetService.getById(selectedAsset.id)
        .then(({ data }) => {
          setSelectedAsset(data.asset)
          if (data.asset.publicUrl) {
            updateVideoProps({ src: data.asset.publicUrl })
          }
        })
        .catch(() => undefined)
    }, 3000)

    return () => {
      window.clearInterval(timer)
    }
  }, [selectedAsset, updateVideoProps])

  const resolvedSource = useMemo(() => {
    if (selectedAsset?.publicUrl) {
      return selectedAsset.publicUrl
    }

    return src.trim()
  }, [selectedAsset, src])

  const posterUrl = selectedAsset?.posterUrl ?? null
  const canPlay = isValidVideoUrl(resolvedSource)

  const triggerPicker = () => {
    fileInputRef.current?.click()
  }

  const onFilePicked = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!isVideoBlock) {
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadState('sending')
    setUploadError(null)

    try {
      const uploaded = await assetService.uploadFileFlow({ file, kind: 'video' })
      setUploadState('processing')

      updateVideoProps({
        assetId: uploaded.id,
        src: uploaded.publicUrl ?? src,
      })

      setSelectedAsset(uploaded)
      setUploadState(uploaded.processingStatus === 'ready' ? 'ready' : 'processing')
    } catch (error) {
      setUploadState('error')
      setUploadError(error instanceof Error ? error.message : 'Falha ao enviar video.')
    } finally {
      event.target.value = ''
    }
  }

  if (!isVideoBlock) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={onFilePicked}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerPicker}
            className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Upload de video
          </button>
          <button
            type="button"
            onClick={() => {
              updateVideoProps({ assetId: '', src: '' })
              setSelectedAsset(null)
              setDraftSrc('')
            }}
            className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Remover video
          </button>
          {selectedAsset?.processingStatus === 'failed' ? (
            <button
              type="button"
              onClick={async () => {
                if (!selectedAsset) {
                  return
                }

                await assetService.reprocess(selectedAsset.id)
                setUploadState('processing')
              }}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
            >
              Reprocessar
            </button>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">Biblioteca de videos</label>
          <AssetSelect
            assets={assets}
            selectedAssetId={assetId}
            onSelect={(nextAssetId) => {
              const chosen = assets.find((item) => item.id === nextAssetId) ?? null
              setSelectedAsset(chosen)
              updateVideoProps({
                assetId: nextAssetId || '',
                src: chosen?.publicUrl ?? src,
              })
            }}
          />
          {assetLoading ? (
            <p className="mt-1 text-xs text-text-light">Carregando biblioteca...</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">URL fallback do video</label>
          <input
            type="url"
            value={draftSrc}
            onChange={(event) => setDraftSrc(event.target.value)}
            onBlur={() => updateVideoProps({ src: draftSrc.trim() })}
            placeholder="https://..."
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
        </div>

        <div className="rounded-lg border border-primary/20 bg-white/70 px-3 py-2 text-xs text-text-light">
          {uploadState === 'sending' ? 'Enviando video...' : null}
          {uploadState === 'processing' ? 'Processando video...' : null}
          {uploadState === 'ready' ? 'Video pronto para uso.' : null}
          {uploadState === 'error' ? `Erro no upload: ${uploadError ?? 'tente novamente.'}` : null}
          {selectedAsset
            ? ` Status do asset: ${selectedAsset.processingStatus}${selectedAsset.errorMessage ? ` (${selectedAsset.errorMessage})` : ''}`
            : ' Sem asset selecionado.'}
        </div>
      </div>
    )
  }

  if (!selectedAsset && !canPlay) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-6 text-center text-sm text-text-light">
        Video indisponivel. Ajuste o asset ou URL no modo de edicao.
      </div>
    )
  }

  if (selectedAsset?.processingStatus === 'processing' || selectedAsset?.processingStatus === 'pending') {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white/80 p-6 text-text-light">
        <LoaderCircle size={20} className="animate-spin" />
        <p className="text-sm">Video em processamento...</p>
      </div>
    )
  }

  if (selectedAsset?.processingStatus === 'failed') {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-700">
        <TriangleAlert size={20} />
        <p className="text-sm font-medium">Falha no processamento do video</p>
        <p className="text-xs">{selectedAsset.errorMessage ?? 'Tente substituir por outro arquivo.'}</p>
      </div>
    )
  }

  if (!canPlay) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-6 text-center text-sm text-text-light">
        URL de video invalida. Ajuste no modo de edicao.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-black/90">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs text-white/80">
        <Film size={14} />
        <span>Video</span>
      </div>
      <video
        src={resolvedSource}
        poster={posterUrl ?? undefined}
        controls
        autoPlay={false}
        preload="metadata"
        className="h-auto max-h-[540px] w-full bg-black"
      />
    </div>
  )
}

function areVideoBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const VideoBlock = memo(VideoBlockComponent, areVideoBlockPropsEqual)
