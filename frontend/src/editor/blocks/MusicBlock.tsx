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

function AudioVisualizer({ bars, isPlaying, waveform }: { bars: number[]; isPlaying: boolean; waveform?: number[] | null }) {
  return (
    <div className="relative mb-4 flex h-14 items-end gap-1 overflow-hidden rounded-xl border border-white/35 bg-white/45 px-2 py-1.5">
      {bars.map((bar, index) => {
        const waveformPoint = Array.isArray(waveform) && waveform.length > 0
          ? waveform[Math.floor((index / Math.max(bars.length - 1, 1)) * (waveform.length - 1))] ?? 0.22
          : 0.2
        const renderedBar = isPlaying ? bar : Math.max(0.14, Math.min(0.5, waveformPoint * 0.85 + bar * 0.3))
        return (
          <div
            key={`visual-${index}`}
            className="w-[3.5%] rounded-full transition-[height,opacity] duration-300"
            style={{
              height: `${Math.round(renderedBar * 100)}%`,
              opacity: isPlaying ? 0.95 : 0.65,
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 82%, white 18%) 0%, color-mix(in srgb, var(--color-accent) 76%, var(--color-primary) 24%) 100%)',
            }}
            aria-hidden="true"
          />
        )
      })}
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
  const visualizerRafRef = useRef<number | null>(null)
  const idleVisualizerTimerRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null>(null)
  const analyserSinkRef = useRef<GainNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferedTime, setBufferedTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [visualizerBars, setVisualizerBars] = useState<number[]>(() => Array.from({ length: 24 }, (_, index) => 0.18 + ((index % 7) * 0.04)))
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
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

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

  const ensureAnalyser = async () => {
    if (!audioRef.current) {
      return
    }

    const AudioContextCtor = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor()
    }

    if (!analyserRef.current) {
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.78

      let sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null
      try {
        const parsed = new URL(activeTrack.src)
        if (parsed.origin === window.location.origin) {
          sourceNode = audioContextRef.current.createMediaElementSource(audioRef.current)
        }
      } catch {
        sourceNode = null
      }

      if (!sourceNode) {
        try {
          const audioWithCapture = audioRef.current as HTMLAudioElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream }
          const stream = audioWithCapture.captureStream?.() ?? audioWithCapture.mozCaptureStream?.()
          if (stream && stream.getAudioTracks().length > 0) {
            sourceNode = audioContextRef.current.createMediaStreamSource(stream)
          }
        } catch {
          sourceNode = null
        }
      }

      if (sourceNode) {
        const sink = audioContextRef.current.createGain()
        sink.gain.value = 0
        sourceNode.connect(analyser)
        analyser.connect(sink)
        sink.connect(audioContextRef.current.destination)
        sourceNodeRef.current = sourceNode
        analyserRef.current = analyser
        analyserSinkRef.current = sink
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
      }
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
  }

  useEffect(() => {
    if (visualizerRafRef.current) {
      window.cancelAnimationFrame(visualizerRafRef.current)
      visualizerRafRef.current = null
    }

    if (!isPlaying || prefersReducedMotion) {
      return
    }

    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current

    const draw = () => {
      const barCount = 24
      let nextBars: number[]

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray)
        const step = Math.max(1, Math.floor(dataArray.length / barCount))
        nextBars = Array.from({ length: barCount }, (_, index) => {
          let total = 0
          for (let i = 0; i < step; i += 1) {
            total += dataArray[index * step + i] ?? 0
          }
          return Math.max(0.08, Math.min(1, total / step / 255))
        })
      } else {
        const now = performance.now()
        const mediaCurrentTime = audioRef.current?.currentTime ?? 0
        const mediaDuration = audioRef.current?.duration
        const resolvedDuration = Number.isFinite(mediaDuration) && mediaDuration && mediaDuration > 0
          ? mediaDuration
          : effectiveDuration
        const progress = resolvedDuration > 0 ? Math.min(mediaCurrentTime / resolvedDuration, 1) : 0
        nextBars = Array.from({ length: barCount }, (_, index) => {
          if (Array.isArray(selectedAsset?.waveform) && selectedAsset.waveform.length > 0) {
            const sampleIndex = Math.floor(progress * (selectedAsset.waveform.length - 1))
            const amplitude = selectedAsset.waveform[Math.min(selectedAsset.waveform.length - 1, Math.max(0, sampleIndex + index - 12))] ?? 0.2
            const pulse = (Math.sin((now / 240) + index * 0.55 + progress * 8) + 1) * 0.07
            return Math.max(0.08, Math.min(1, amplitude * 0.9 + pulse))
          }
          return Math.max(0.08, Math.min(0.62, 0.14 + Math.abs(Math.sin((now / 230) + index * 0.58 + progress * 10)) * 0.42))
        })
      }

      setVisualizerBars(nextBars)
      visualizerRafRef.current = window.requestAnimationFrame(draw)
    }

    visualizerRafRef.current = window.requestAnimationFrame(draw)
    return () => {
      if (visualizerRafRef.current) {
        window.cancelAnimationFrame(visualizerRafRef.current)
        visualizerRafRef.current = null
      }
    }
  }, [effectiveDuration, isPlaying, prefersReducedMotion, selectedAsset?.waveform])

  useEffect(() => {
    if (idleVisualizerTimerRef.current) {
      window.clearInterval(idleVisualizerTimerRef.current)
      idleVisualizerTimerRef.current = null
    }

    if (isPlaying || prefersReducedMotion) {
      return
    }

    idleVisualizerTimerRef.current = window.setInterval(() => {
      setVisualizerBars((currentBars) => currentBars.map((bar, index) => {
        const wobble = Math.sin((Date.now() / 1200) + index * 0.45) * 0.03
        return Math.max(0.08, Math.min(0.32, bar * 0.82 + 0.1 + wobble))
      }))
    }, 1200)

    return () => {
      if (idleVisualizerTimerRef.current) {
        window.clearInterval(idleVisualizerTimerRef.current)
      }
    }
  }, [isPlaying, prefersReducedMotion])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
      if (visualizerRafRef.current) {
        window.cancelAnimationFrame(visualizerRafRef.current)
      }
      if (idleVisualizerTimerRef.current) {
        window.clearInterval(idleVisualizerTimerRef.current)
      }
      sourceNodeRef.current?.disconnect()
      analyserRef.current?.disconnect()
      analyserSinkRef.current?.disconnect()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close()
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
      await ensureAnalyser()
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
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl font-bold text-text">{safeTitle}</p>
          <p className="truncate text-sm text-text-light">{safeArtist}</p>
        </div>
      </div>

      <AudioVisualizer bars={visualizerBars} isPlaying={isPlaying} waveform={selectedAsset?.waveform} />

      <div className="relative mb-3 flex items-center gap-3">
        <button type="button" onClick={() => { void togglePlay() }} className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:from-primary-dark hover:to-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={isPlaying ? 'Pausar musica' : 'Reproduzir musica'}>{isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}</button>
        <button type="button" onClick={() => { if (canGoPrev) setTrackIndex((current) => Math.max(0, current - 1)) }} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/50 text-text-light transition-colors hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Faixa anterior" disabled={!canGoPrev}><SkipBack size={16} /></button>
        <button type="button" onClick={() => { if (canGoNext) setTrackIndex((current) => Math.min(playlist.length - 1, current + 1)) }} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/50 text-text-light transition-colors hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Proxima faixa" disabled={!canGoNext}><SkipForward size={16} /></button>

        <div className="w-full">
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
      </div>

      {playlist.length > 1 ? <p className="mb-2 text-[11px] text-text-light">Faixa {safeTrackIndex + 1} de {playlist.length}</p> : null}

      <div className="relative flex items-center gap-2">
        <button type="button" onClick={() => { if (isMuted || volume <= 0.01) { setIsMuted(false); setVolume(0.8); return } setIsMuted(true) }} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/45 text-text-light transition-colors hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={isMuted || volume <= 0.01 ? 'Ativar som' : 'Silenciar audio'}>{isMuted || volume <= 0.01 ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
        <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(event) => {
          const nextVolume = Number(event.target.value)
          if (Number.isNaN(nextVolume)) {
            return
          }
          setIsMuted(nextVolume <= 0.01)
          setVolume(nextVolume)
        }} className="w-40 max-w-full accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Controle de volume" />
        <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-text-light" style={{ backgroundColor: 'var(--color-surface-glass)', borderColor: 'var(--color-border)' }}>{Math.round((isMuted ? 0 : volume) * 100)}%</span>
      </div>
    </div>
  )
}

function areMusicBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MusicBlock = memo(MusicBlockComponent, areMusicBlockPropsEqual)
