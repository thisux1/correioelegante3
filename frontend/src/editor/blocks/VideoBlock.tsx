import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { LoaderCircle, Pause, Play, TriangleAlert, Volume2, VolumeX } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { assetService, type AssetSummary } from '@/services/assetService'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

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

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function AssetSelect({ assets, selectedAssetId, onSelect }: AssetSelectProps) {
  return (
    <select
      value={selectedAssetId}
      onChange={(event) => onSelect(event.target.value)}
      className={EDITOR_FIELD_BASE_CLASS}
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
  const shouldReduceMotion = useReducedMotion()
  const isVideoBlock = block.type === 'video'
  const src = isVideoBlock ? block.props.src : ''
  const assetId = isVideoBlock ? block.props.assetId ?? '' : ''

  const [assets, setAssets] = useState<AssetSummary[]>([])
  const [assetLoading, setAssetLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const pollTimeoutRef = useRef<number | null>(null)
  const pollingInFlightRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

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
    let alive = true
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
  }, [])

  useEffect(() => {
    if (!assetId) {
      return
    }

    if (selectedAsset?.id === assetId) {
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
  }, [assetId, selectedAsset?.id])

  const effectiveSelectedAsset = assetId && selectedAsset?.id === assetId
    ? selectedAsset
    : null

  useEffect(() => {
    if (!selectedAsset || (selectedAsset.processingStatus !== 'pending' && selectedAsset.processingStatus !== 'processing')) {
      return
    }

    let cancelled = false

    const clearPollingTimeout = () => {
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
    }

    const poll = () => {
      if (cancelled) {
        return
      }

      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        pollTimeoutRef.current = window.setTimeout(poll, 5000)
        return
      }

      if (pollingInFlightRef.current) {
        pollTimeoutRef.current = window.setTimeout(poll, 3000)
        return
      }

      pollingInFlightRef.current = true
      let shouldScheduleNextPoll = true

      assetService.getById(selectedAsset.id)
        .then(({ data }) => {
          if (cancelled) {
            return
          }

          setSelectedAsset(data.asset)
          if (data.asset.publicUrl) {
            updateVideoProps({ src: data.asset.publicUrl })
          }

          if (data.asset.processingStatus === 'ready' || data.asset.processingStatus === 'failed') {
            shouldScheduleNextPoll = false
          }
        })
        .catch(() => undefined)
        .finally(() => {
          pollingInFlightRef.current = false
          if (!cancelled && shouldScheduleNextPoll) {
            pollTimeoutRef.current = window.setTimeout(poll, 3000)
          }
        })
    }

    poll()

    return () => {
      cancelled = true
      clearPollingTimeout()
      pollingInFlightRef.current = false
    }
  }, [selectedAsset, updateVideoProps])

  const resolvedSource = useMemo(() => {
    if (effectiveSelectedAsset?.publicUrl) {
      return effectiveSelectedAsset.publicUrl
    }

    return src.trim()
  }, [effectiveSelectedAsset, src])

  const posterUrl = effectiveSelectedAsset?.posterUrl ?? null
  const canPlay = isValidVideoUrl(resolvedSource)
  const progressRatio = duration > 0 ? Math.min(currentTime / duration, 1) : 0

  if (!isVideoBlock) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <MediaField
          kind="video"
          label="Video principal"
          value={{ src, assetId: assetId || undefined }}
          onChange={(nextValue) => {
            updateVideoProps({
              src: nextValue.src,
              assetId: nextValue.assetId,
            })
          }}
          onRemove={() => {
            updateVideoProps({
              src: '',
              assetId: '',
            })
            setSelectedAsset(null)
          }}
          helperText="Adicione o video por arquivo ou URL."
        />

        <EditorInputSection title="Biblioteca de videos" helperText="Opcional: escolha um video ja enviado.">
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
        </EditorInputSection>

        <div className="rounded-lg border border-primary/20 bg-white/70 px-3 py-2 text-xs text-text-light">
          {effectiveSelectedAsset
            ? ` Status do asset: ${effectiveSelectedAsset.processingStatus}${effectiveSelectedAsset.errorMessage ? ` (${effectiveSelectedAsset.errorMessage})` : ''}`
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

  if (effectiveSelectedAsset?.processingStatus === 'processing' || effectiveSelectedAsset?.processingStatus === 'pending') {
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
        className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white/80 p-6 text-text-light"
      >
        <LoaderCircle size={20} className="animate-spin" />
        <p className="text-sm">Estamos finalizando o video. Aguarde um instante.</p>
      </motion.div>
    )
  }

  if (effectiveSelectedAsset?.processingStatus === 'failed') {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-700">
        <TriangleAlert size={20} />
        <p className="text-sm font-medium">Falha no processamento do video</p>
        <p className="text-xs">{effectiveSelectedAsset.errorMessage ?? 'Tente substituir por outro arquivo.'}</p>
        <p className="text-xs">Volte ao modo de edicao e escolha outro arquivo ou URL valida.</p>
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
    <div className="overflow-hidden rounded-3xl border-2 border-primary/80 bg-black/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="relative">
        <video
          ref={videoRef}
          src={resolvedSource}
          poster={posterUrl ?? undefined}
          autoPlay={false}
          preload="auto"
          onLoadedMetadata={(event) => {
            if (Number.isFinite(event.currentTarget.duration) && event.currentTarget.duration > 0) {
              setDuration(event.currentTarget.duration)
            }
            setIsVideoLoading(false)
          }}
          onDurationChange={(event) => {
            if (Number.isFinite(event.currentTarget.duration) && event.currentTarget.duration > 0) {
              setDuration(event.currentTarget.duration)
            }
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(event.currentTarget.currentTime)
          }}
          onWaiting={() => {
            setIsVideoLoading(true)
          }}
          onCanPlay={() => {
            setIsVideoLoading(false)
          }}
          onPlay={() => {
            setIsPlaying(true)
          }}
          onPause={() => {
            setIsPlaying(false)
          }}
          onEnded={() => {
            setIsPlaying(false)
          }}
          onVolumeChange={(event) => {
            setIsMuted(event.currentTarget.muted)
            setVolume(event.currentTarget.volume)
          }}
          className="h-auto max-h-[540px] w-full bg-black"
        />

        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-black/60 p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
          {/* Barra de Progresso / Seek */}
          <div className="group relative mb-2 flex h-5 w-full cursor-pointer items-center">
            <div className="absolute left-0 right-0 h-1.5 overflow-hidden rounded-full bg-white/20 shadow-inner">
              <div
                className="h-full bg-primary"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => {
                if (!videoRef.current) return
                const next = Number(event.target.value)
                if (Number.isNaN(next)) return
                videoRef.current.currentTime = next
                setCurrentTime(next)
              }}
              className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0"
              aria-label="Progresso do video"
            />
            <div
              className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] group-hover:scale-110 group-hover:shadow-[0_2px_5px_rgba(0,0,0,0.4)] group-active:scale-95 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/65"
              style={{ left: `${progressRatio * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white shadow-sm transition-[transform,background-color] duration-200 hover:bg-white/30 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                onClick={async () => {
                  if (!videoRef.current) return
                  if (videoRef.current.paused) {
                    await videoRef.current.play()
                    return
                  }
                  videoRef.current.pause()
                }}
                aria-label={isPlaying ? 'Pausar video' : 'Reproduzir video'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
              </button>
              
              <span className="text-xs font-medium tracking-wide text-white/90">
                {formatTime(currentTime)} <span className="mx-0.5 text-white/40">/</span> {formatTime(duration || (effectiveSelectedAsset?.durationMs ? effectiveSelectedAsset.durationMs / 1000 : 0))}
              </span>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-[color,transform] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65"
                onClick={() => {
                  if (!videoRef.current) return
                  const next = !isMuted
                  videoRef.current.muted = next
                }}
                aria-label={isMuted || volume <= 0.01 ? 'Ativar audio' : 'Silenciar audio'}
              >
                {isMuted || volume <= 0.01 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <div className="group relative hidden h-5 w-16 cursor-pointer items-center sm:flex">
                <div className="absolute left-0 right-0 h-1 overflow-hidden rounded-full bg-white/20 shadow-inner">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-out"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    if (!videoRef.current) return
                    const next = Number(e.target.value)
                    videoRef.current.volume = next
                    if (next > 0 && isMuted) {
                      videoRef.current.muted = false
                    } else if (next === 0 && !isMuted) {
                      videoRef.current.muted = true
                    }
                  }}
                  className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                  aria-label="Controle de volume"
                />
                <div
                  className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] group-hover:scale-125 group-active:scale-95 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/65"
                  style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {isVideoLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <LoaderCircle size={20} className="animate-spin text-white" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function areVideoBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const VideoBlock = memo(VideoBlockComponent, areVideoBlockPropsEqual)
