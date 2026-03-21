import { memo, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { LoaderCircle, Music2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { assetService, type AssetSummary } from '@/services/assetService'
import { MediaField } from '@/editor/components/MediaField'

type UploadState = 'idle' | 'sending' | 'processing' | 'ready' | 'error'
const EMPTY_TRACKS: Array<{
  assetId?: string
  src: string
  title?: string
  artist?: string
  coverSrc?: string
  coverAssetId?: string
}> = []

function isValidUrl(value: string): boolean {
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

function PlaybackIndicator({ isPlaying, pulseTick }: { isPlaying: boolean; pulseTick: number }) {
  const barHeights = [0, 1, 2, 3].map((index) => {
    const mainWave = (Math.sin((pulseTick * (0.74 + index * 0.09)) + index * 1.41) + 1) / 2
    const fastWave = (Math.sin((pulseTick * (1.62 + index * 0.17)) + index * 2.73) + 1) / 2
    const driftWave = (Math.sin((pulseTick * 0.31) + index * 0.93) + 1) / 2
    const rawNoise = Math.sin((pulseTick * 13.37) + index * 47.19) * 43758.5453
    const noise = rawNoise - Math.floor(rawNoise)
    const burst = noise > 0.82 ? (noise - 0.82) * 2.8 : 0
    return Math.max(0.16, Math.min(0.98, 0.08 + mainWave * 0.36 + fastWave * 0.23 + driftWave * 0.2 + noise * 0.18 + burst))
  })

  return (
    <div className="inline-flex h-full items-end gap-1" aria-live="polite" aria-label={isPlaying ? 'Audio em reproducao' : 'Audio pausado'}>
      {barHeights.map((height, index) => (
        <span
          key={`playback-indicator-${index}`}
          className="w-2.5 rounded-t-full transition-[height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            height: `${Math.round((isPlaying ? height : 0.05) * 100)}%`,
            opacity: isPlaying ? 0.92 : 0,
            transform: isPlaying ? 'translateY(0%)' : 'translateY(14%)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 100%)',
            boxShadow: '0 0 20px -12px rgba(255,255,255,0.9)',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function MusicBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isMusicBlock = block.type === 'music'
  const src = isMusicBlock ? block.props.src : ''
  const assetId = isMusicBlock ? block.props.assetId ?? '' : ''
  const coverSrc = isMusicBlock ? block.props.coverSrc ?? '' : ''
  const coverAssetId = isMusicBlock ? block.props.coverAssetId : undefined
  const tracks = isMusicBlock ? block.props.tracks ?? EMPTY_TRACKS : EMPTY_TRACKS
  const title = isMusicBlock ? block.props.title ?? '' : ''
  const artist = isMusicBlock ? block.props.artist ?? '' : ''

  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [libraryCount, setLibraryCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferedTime, setBufferedTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)
  const [playbackPulse, setPlaybackPulse] = useState(0)
  const [trackIndex, setTrackIndex] = useState(0)

  const resolvedSource = selectedAsset?.publicUrl?.trim() || src.trim()
  const canPlay = useMemo(() => isValidUrl(resolvedSource), [resolvedSource])

  const playlist = useMemo(() => {
    const normalizedTracks = Array.isArray(tracks)
      ? tracks.filter((track) => isValidUrl(track.src)).map((track) => ({ ...track, src: track.src.trim() }))
      : []
    const primary = isValidUrl(resolvedSource)
      ? [{ src: resolvedSource, title, artist, coverSrc }]
      : []
    const merged = [...primary, ...normalizedTracks]
    const seen = new Set<string>()
    return merged.filter((track) => {
      if (seen.has(track.src)) {
        return false
      }
      seen.add(track.src)
      return true
    })
  }, [artist, coverSrc, resolvedSource, title, tracks])

  const safeTrackIndex = playlist.length > 0 ? Math.min(trackIndex, playlist.length - 1) : 0
  const activeTrack = playlist[safeTrackIndex] ?? playlist[0] ?? { src: resolvedSource, title, artist, coverSrc }
  const canGoPrev = playlist.length > 1 && safeTrackIndex > 0
  const canGoNext = playlist.length > 1 && safeTrackIndex < playlist.length - 1
  const effectiveDuration = duration > 0 ? duration : (selectedAsset?.durationMs ? selectedAsset.durationMs / 1000 : 0)
  const progressRatio = effectiveDuration > 0 ? Math.min(currentTime / effectiveDuration, 1) : 0
  const bufferedRatio = effectiveDuration > 0 ? Math.min(bufferedTime / effectiveDuration, 1) : 0

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
        if (active) {
          setSelectedAsset(data.asset)
        }
      })
      .catch(() => {
        if (active) {
          setSelectedAsset(null)
        }
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
        .then(({ data }) => setSelectedAsset(data.asset))
        .catch(() => undefined)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [selectedAsset])

  useEffect(() => {
    if (!audioRef.current) {
      return
    }
    audioRef.current.volume = isMuted ? 0 : volume
  }, [isMuted, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    const wasPlaying = !audio.paused
    audio.src = activeTrack.src
    audio.load()

    if (!wasPlaying) {
      return
    }

    audio.play()
      .then(() => {
        setIsPlaying(true)
        setHasPlaybackError(false)
      })
      .catch(() => {
        setIsPlaying(false)
        setHasPlaybackError(true)
      })
  }, [activeTrack.src])

  useEffect(() => {
    if (!isPlaying || !audioRef.current) {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const sync = () => {
      if (!audioRef.current) {
        return
      }
      setCurrentTime(audioRef.current.currentTime)
      rafRef.current = window.requestAnimationFrame(sync)
    }

    rafRef.current = window.requestAnimationFrame(sync)
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = window.setInterval(() => {
      setPlaybackPulse((value) => value + 0.42)
    }, 90)

    return () => {
      window.clearInterval(timer)
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  if (!isMusicBlock) {
    return null
  }

  const safeTitle = activeTrack.title || title || 'Sua musica especial'
  const safeArtist = activeTrack.artist || artist || 'Trilha do seu momento'
  const resolvedCover = (activeTrack.coverSrc || coverSrc).trim()
  const hasCover = isValidUrl(resolvedCover)
  const monogram = safeTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('') || 'M'

  const togglePlay = async () => {
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
      setIsPlaying(false)
    }
  }

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
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

        const trackTitle = file.name.replace(/\.[^/.]+$/, '')
        const nextTrack = {
          src: asset.publicUrl ?? currentBlock.props.src,
          assetId: asset.id,
          title: currentBlock.props.title || trackTitle,
          artist: currentBlock.props.artist || '',
          coverSrc: currentBlock.props.coverSrc ?? '',
          coverAssetId: currentBlock.props.coverAssetId,
        }

        const existingTracks = Array.isArray(currentBlock.props.tracks) ? currentBlock.props.tracks : []
        const dedupedTracks = [
          ...existingTracks.filter((track) => track.src.trim() !== nextTrack.src.trim()),
          nextTrack,
        ]

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            assetId: asset.id,
            src: asset.publicUrl ?? currentBlock.props.src,
            tracks: dedupedTracks,
          },
        }
      })

      setUploadState('ready')
    } catch (error) {
      setUploadState('error')
      setUploadError(error instanceof Error ? error.message : 'Falha no upload do audio.')
    } finally {
      event.target.value = ''
    }
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <div>
          <input ref={fileInputRef} type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,audio/x-wav" className="hidden" onChange={handleFileSelection} />
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">Upload de audio</button>
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
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30"
          />

          <MediaField
            kind="image"
            label="URL da capa (opcional)"
            value={{ src: coverSrc, assetId: coverAssetId }}
            onChange={(nextValue) => {
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'music') {
                  return currentBlock
                }
                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    coverSrc: nextValue.src,
                    coverAssetId: nextValue.assetId,
                  },
                }
              })
            }}
            onRemove={() => {
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'music') {
                  return currentBlock
                }
                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    coverSrc: '',
                    coverAssetId: undefined,
                  },
                }
              })
            }}
            helperText="Capa opcional com upload direto ou URL manual."
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
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30"
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
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </div>
    )
  }

  if (!canPlay) {
    return <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-6 text-center text-sm text-text-light">URL de audio invalida ou vazia. Ajuste no modo de edicao.</div>
  }

  if (selectedAsset && (selectedAsset.processingStatus === 'pending' || selectedAsset.processingStatus === 'processing')) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-white/80 p-6 text-text-light">
        <div className="mb-4 flex items-center gap-2">
          <LoaderCircle size={18} className="animate-spin" />
          <p className="text-sm">Audio em processamento...</p>
        </div>
        <div className="space-y-2" aria-hidden="true">
          <div className="h-4 w-1/3 animate-pulse rounded bg-primary/15" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-primary/10" />
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-primary/10" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl md:p-6" style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(132deg, color-mix(in srgb, var(--color-surface) 76%, white 24%) 0%, color-mix(in srgb, var(--color-surface-glass) 82%, var(--color-primary-light) 18%) 100%)', boxShadow: '0 28px 55px -38px rgba(0, 0, 0, 0.32)' }}>
      <audio
        ref={audioRef}
        src={activeTrack.src}
        crossOrigin="anonymous"
        preload="auto"
        onLoadedMetadata={(event) => {
          setHasPlaybackError(false)
          if (Number.isFinite(event.currentTarget.duration) && event.currentTarget.duration > 0) {
            setDuration(event.currentTarget.duration)
          }
        }}
        onDurationChange={(event) => {
          if (Number.isFinite(event.currentTarget.duration) && event.currentTarget.duration > 0) {
            setDuration(event.currentTarget.duration)
          }
        }}
        onProgress={(event) => {
          const media = event.currentTarget
          if (!media.buffered || media.buffered.length === 0) {
            return
          }
          setBufferedTime(media.buffered.end(media.buffered.length - 1))
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          if (canGoNext) {
            setTrackIndex((current) => current + 1)
            setCurrentTime(0)
            return
          }
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onError={() => {
          setHasPlaybackError(true)
          setIsPlaying(false)
        }}
      />

      {hasPlaybackError ? <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">Nao foi possivel carregar este audio. Verifique a URL.</p> : null}

      <div className="relative mb-5 flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border" style={{ borderColor: 'color-mix(in srgb, var(--color-border) 72%, white 28%)', background: 'linear-gradient(155deg, color-mix(in srgb, var(--color-primary-light) 44%, white 56%) 0%, color-mix(in srgb, var(--color-accent) 26%, var(--color-surface) 74%) 100%)' }}>
          {hasCover ? <img src={resolvedCover} alt={`Capa da musica ${safeTitle}`} className="h-full w-full object-cover" loading="lazy" /> : <><span className="font-display text-xl font-semibold text-text/75">{monogram}</span><Music2 size={14} className="absolute bottom-2 right-2 text-text/55" /></>}
          <div
            className="pointer-events-none absolute inset-0 bg-black/24 transition-opacity duration-300"
            style={{ opacity: isPlaying ? 1 : 0 }}
            aria-hidden={!isPlaying}
          >
            <div className="absolute inset-x-0 bottom-0 flex h-[70%] items-end justify-center pb-1.5">
              <PlaybackIndicator isPlaying={isPlaying} pulseTick={playbackPulse} />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl font-bold text-text">{safeTitle}</p>
          <p className="truncate text-sm text-text-light">{safeArtist}</p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={() => { if (isMuted || volume <= 0.01) { setIsMuted(false); setVolume(0.8); return } setIsMuted(true) }} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label={isMuted || volume <= 0.01 ? 'Ativar som' : 'Silenciar audio'}>{isMuted || volume <= 0.01 ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
          <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(event) => {
            const nextVolume = Number(event.target.value)
            if (Number.isNaN(nextVolume)) {
              return
            }
            setIsMuted(nextVolume <= 0.01)
            setVolume(nextVolume)
          }} className="w-24 max-w-full accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Controle de volume" />
        </div>
      </div>

      <div className="mb-2 flex items-center justify-center gap-3">
        <button type="button" onClick={() => { if (canGoPrev) setTrackIndex((current) => Math.max(0, current - 1)) }} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,opacity,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label="Faixa anterior" disabled={!canGoPrev}><SkipBack size={16} /></button>
        <button type="button" onClick={() => { void togglePlay() }} className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-primary to-secondary text-white shadow-[0_16px_24px_-18px_color-mix(in_srgb,var(--color-primary)_86%,black_14%)] transition-[transform,opacity,filter] duration-200 hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70" aria-label={isPlaying ? 'Pausar musica' : 'Reproduzir musica'}>{isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}</button>
        <button type="button" onClick={() => { if (canGoNext) setTrackIndex((current) => Math.min(playlist.length - 1, current + 1)) }} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,opacity,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label="Proxima faixa" disabled={!canGoNext}><SkipForward size={16} /></button>
      </div>

      <div className="mb-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-black/10" />
          <div className="pointer-events-none absolute inset-y-0 left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-black/20" style={{ width: `${bufferedRatio * 100}%` }} />
          <div className="pointer-events-none absolute inset-y-0 left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" style={{ width: `${progressRatio * 100}%` }} />
          <input type="range" min={0} max={effectiveDuration || 0} step={0.1} value={Math.min(currentTime, effectiveDuration || 0)} onChange={(event) => {
            const nextTime = Number(event.target.value)
            if (!audioRef.current || Number.isNaN(nextTime)) {
              return
            }
            audioRef.current.currentTime = nextTime
            setCurrentTime(nextTime)
          }} className="relative w-full appearance-none bg-transparent accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Barra de progresso da musica" />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-text-light"><span>{formatTime(currentTime)}</span><span>{formatTime(effectiveDuration)}</span></div>
      </div>

      {playlist.length > 1 ? <p className="mb-2 text-[11px] text-text-light">Faixa {safeTrackIndex + 1} de {playlist.length}</p> : null}

      <div className="relative flex items-center justify-end gap-2 md:hidden">
        <button type="button" onClick={() => { if (isMuted || volume <= 0.01) { setIsMuted(false); setVolume(0.8); return } setIsMuted(true) }} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label={isMuted || volume <= 0.01 ? 'Ativar som' : 'Silenciar audio'}>{isMuted || volume <= 0.01 ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
        <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(event) => {
          const nextVolume = Number(event.target.value)
          if (Number.isNaN(nextVolume)) {
            return
          }
          setIsMuted(nextVolume <= 0.01)
          setVolume(nextVolume)
        }} className="w-28 max-w-full accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Controle de volume" />
        <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-text-light" style={{ backgroundColor: 'var(--color-surface-glass)', borderColor: 'var(--color-border)' }}>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
      </div>
    </div>
  )
}

function areMusicBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MusicBlock = memo(MusicBlockComponent, areMusicBlockPropsEqual)
