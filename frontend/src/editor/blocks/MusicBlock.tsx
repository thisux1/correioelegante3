import { memo, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { LoaderCircle, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { assetService, type AssetSummary } from '@/services/assetService'

type UploadState = 'idle' | 'sending' | 'processing' | 'ready' | 'error'

function isValidAudioUrl(value: string): boolean {
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

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface MusicPlayerProps {
  src: string
  title: string
  artist: string
  waveform?: number[] | null
}

function MusicPlayer({ src, title, artist, waveform }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.volume = volume
  }, [volume])

  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-5 backdrop-blur-md md:p-6"
      style={{
        borderColor: 'var(--color-border)',
        background: 'linear-gradient(140deg, var(--color-surface) 0%, var(--color-surface-glass) 100%)',
        boxShadow: '0 24px 45px -34px rgba(0, 0, 0, 0.22)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: 'radial-gradient(circle at 18% 18%, var(--color-primary-light), transparent 55%), radial-gradient(circle at 82% 84%, var(--color-accent), transparent 48%)',
          opacity: 0.18,
        }}
      />
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setHasPlaybackError(false)
          setDuration(event.currentTarget.duration)
          setIsLoading(false)
        }}
        onWaiting={() => {
          setIsLoading(true)
        }}
        onCanPlay={() => {
          setIsLoading(false)
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime)
        }}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onError={() => {
          setHasPlaybackError(true)
          setIsPlaying(false)
          setIsLoading(false)
        }}
      />

      <div className="relative mb-5">
        <p className="truncate font-display text-2xl font-bold text-text">{title || 'Sua musica especial'}</p>
        <p className="truncate text-sm text-text-light">{artist || 'Trilha do seu momento'}</p>
      </div>

      {Array.isArray(waveform) && waveform.length > 0 ? (
        <div className="relative mb-4 flex h-12 items-end gap-1 rounded-xl border border-primary/15 bg-white/60 px-2 py-1">
          {waveform.slice(0, 64).map((point, index) => (
            <span
              key={`${index}-${point}`}
              className="w-1 rounded-full bg-primary/65"
              style={{ height: `${Math.max(8, Math.round(point * 100))}%` }}
            />
          ))}
        </div>
      ) : null}

      {hasPlaybackError ? (
        <p className="relative rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Nao foi possivel carregar este audio. Verifique a URL.
        </p>
      ) : (
        <>
          {isLoading ? (
            <p className="mb-3 rounded-xl border border-primary/20 bg-white/70 px-3 py-2 text-xs text-text-light">
              Carregando audio...
            </p>
          ) : null}
          <div className="relative mb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!audioRef.current) {
                  return
                }

                if (isPlaying) {
                  audioRef.current.pause()
                  setIsPlaying(false)
                  return
                }

                try {
                  await audioRef.current.play()
                  setHasPlaybackError(false)
                  setIsPlaying(true)
                } catch {
                  setHasPlaybackError(true)
                }
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:from-primary-dark hover:to-primary"
              aria-label={isPlaying ? 'Pausar musica' : 'Reproduzir musica'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
            </button>

            <div className="w-full">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => {
                  const nextTime = Number(event.target.value)
                  if (!audioRef.current || Number.isNaN(nextTime)) {
                    return
                  }

                  audioRef.current.currentTime = nextTime
                  setCurrentTime(nextTime)
                }}
                className="w-full accent-primary"
                disabled={isLoading || hasPlaybackError}
              />

              <div className="mt-1 flex justify-between text-[11px] text-text-light">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            {volume <= 0.01 ? <VolumeX size={15} className="text-text-light" /> : <Volume2 size={15} className="text-text-light" />}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => {
                const nextVolume = Number(event.target.value)
                if (Number.isNaN(nextVolume)) {
                  return
                }

                setVolume(nextVolume)
              }}
              className="w-40 max-w-full accent-primary"
              disabled={hasPlaybackError}
            />
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-text-light"
              style={{
                backgroundColor: 'var(--color-surface-glass)',
                borderColor: 'var(--color-border)',
              }}
            >
              {Math.round(volume * 100)}%
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function MusicBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isMusicBlock = block.type === 'music'
  const src = isMusicBlock ? block.props.src : ''
  const assetId = isMusicBlock ? block.props.assetId ?? '' : ''
  const title = isMusicBlock ? block.props.title ?? '' : ''
  const artist = isMusicBlock ? block.props.artist ?? '' : ''

  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null)
  const resolvedSource = selectedAsset?.publicUrl?.trim() || src.trim()
  const canPlay = useMemo(() => isValidAudioUrl(resolvedSource), [resolvedSource])
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [libraryCount, setLibraryCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isMusicBlock) {
      return
    }

    if (!assetId) {
      setSelectedAsset(null)
      return
    }

    let active = true
    assetService.getById(assetId)
      .then(({ data }) => {
        if (!active) {
          return
        }

        setSelectedAsset(data.asset)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setSelectedAsset(null)
      })

    return () => {
      active = false
    }
  }, [assetId, isMusicBlock])

  useEffect(() => {
    if (!selectedAsset || (selectedAsset.processingStatus !== 'pending' && selectedAsset.processingStatus !== 'processing')) {
      return
    }

    const timer = window.setInterval(() => {
      assetService.getById(selectedAsset.id)
        .then(({ data }) => {
          setSelectedAsset(data.asset)
        })
        .catch(() => undefined)
    }, 3000)

    return () => {
      window.clearInterval(timer)
    }
  }, [selectedAsset])

  const triggerFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!isMusicBlock) {
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadError(null)
    setUploadState('sending')

    try {
      const asset = await assetService.uploadFileFlow({ file, kind: 'audio' })
      setUploadState('processing')

      const { data } = await assetService.list('audio')
      setLibraryCount(data.assets.length)
      const refreshedAsset = data.assets.find((item) => item.id === asset.id) ?? asset
      setSelectedAsset(refreshedAsset)

      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'music') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            assetId: asset.id,
            src: asset.publicUrl ?? currentBlock.props.src,
          },
        }
      })

      setUploadState('ready')
    } catch (error) {
      setUploadState('error')
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Falha no upload do audio. Verifique a configuracao de midia no backend.',
      )
    } finally {
      event.target.value = ''
    }
  }

  if (!isMusicBlock) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,audio/x-wav"
            className="hidden"
            onChange={handleFileSelection}
          />
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={triggerFilePicker}
              className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Upload de audio
            </button>
            <span className="text-xs text-text-light">ou preencha URL manual abaixo</span>
          </div>
          <label className="mb-1 block text-xs font-medium text-text-light">URL do audio</label>
          <input
            type="url"
            value={src}
            onChange={(event) => {
              const nextSrc = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'music') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    assetId: undefined,
                    src: nextSrc,
                  },
                }
              })
            }}
            placeholder="https://..."
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
          {(uploadState !== 'idle' || uploadError || libraryCount !== null) ? (
            <div className="mt-2 rounded-lg border border-primary/20 bg-white/70 px-3 py-2 text-xs text-text-light">
              {uploadState === 'sending' ? 'Enviando audio...' : null}
              {uploadState === 'processing' ? 'Processando audio...' : null}
              {uploadState === 'ready' ? 'Audio pronto para uso.' : null}
              {uploadState === 'error' ? `Erro no upload: ${uploadError ?? 'tente novamente.'}` : null}
              {libraryCount !== null ? ` Biblioteca: ${libraryCount} asset(s).` : null}
            </div>
          ) : null}

          {selectedAsset ? (
            <div className="mt-2 rounded-lg border border-primary/20 bg-white/70 px-3 py-2 text-xs text-text-light">
              Asset {selectedAsset.id.slice(-6)} | status: {selectedAsset.processingStatus}
              {selectedAsset.errorMessage ? ` | erro: ${selectedAsset.errorMessage}` : ''}
              {selectedAsset.processingStatus === 'failed' ? (
                <button
                  type="button"
                  onClick={async () => {
                    await assetService.reprocess(selectedAsset.id)
                    setUploadState('processing')
                  }}
                  className="ml-2 rounded border border-amber-300 px-1.5 py-0.5 text-amber-700 hover:bg-amber-50"
                >
                  Reprocessar
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">Titulo (opcional)</label>
          <input
            type="text"
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'music') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    title: nextTitle,
                  },
                }
              })
            }}
            placeholder="Nome da faixa"
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">Artista (opcional)</label>
          <input
            type="text"
            value={artist}
            onChange={(event) => {
              const nextArtist = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'music') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    artist: nextArtist,
                  },
                }
              })
            }}
            placeholder="Quem canta"
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
        </div>
      </div>
    )
  }

  if (!canPlay) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-6 text-center text-sm text-text-light">
        URL de audio invalida ou vazia. Ajuste no modo de edicao.
      </div>
    )
  }

  if (selectedAsset && (selectedAsset.processingStatus === 'pending' || selectedAsset.processingStatus === 'processing')) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white/80 p-6 text-text-light">
        <LoaderCircle size={18} className="animate-spin" />
        <p className="text-sm">Audio em processamento...</p>
      </div>
    )
  }

  return (
    <MusicPlayer
      key={`${resolvedSource}-${assetId || 'manual'}-${selectedAsset?.updatedAt ?? ''}`}
      src={resolvedSource}
      title={title.trim()}
      artist={artist.trim()}
      waveform={selectedAsset?.waveform}
    />
  )
}

function areMusicBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MusicBlock = memo(MusicBlockComponent, areMusicBlockPropsEqual)
