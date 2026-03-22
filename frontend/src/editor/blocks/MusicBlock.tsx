import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, LoaderCircle, Music2, Pause, Play, Plus, Settings2, Shuffle, SkipBack, SkipForward, Trash2, Volume2, VolumeX } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { assetService, type AssetSummary } from '@/services/assetService'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'
import { getMusicPlayerUIMode } from '@/editor/blocks/music/getMusicPlayerUIMode'
import { normalizeMusicTracks } from '@/editor/blocks/music/normalizeMusicTracks'
import { resolveIsActuallyPlaying, useMusicPlayback } from '@/editor/blocks/music/useMusicPlayback'
import { useMusicVisualizer } from '@/editor/blocks/music/useMusicVisualizer'
import {
  buildWaveformBarsModel,
  resolveBarIndexFromClientX,
  resolveProgressBarIndex,
  resolveSeekTimeFromBarIndex,
  resolveWaveformBarsCount,
} from '@/editor/blocks/music/playerWaveform'
import {
  addTrack,
  clampEditorTrackIndex,
  moveTrack,
  removeTrack,
  syncLegacyMirror,
  updateTrackAtIndex,
} from '@/editor/blocks/music/trackEditorState'

const EMPTY_TRACKS: Array<{ src: string }> = []

function resolveWaveformHeights(inputBars: number[], barsCount: number): number[] {
  if (barsCount <= 0) {
    return []
  }

  if (inputBars.length === barsCount) {
    return inputBars
  }

  if (inputBars.length === 0) {
    return new Array(barsCount).fill(0.15)
  }

  return new Array(barsCount).fill(0).map((_, index) => {
    const sourceIndex = Math.floor((index / barsCount) * inputBars.length)
    return inputBars[Math.max(0, Math.min(inputBars.length - 1, sourceIndex))] ?? 0.15
  })
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const [editActiveTrackIndex, setEditActiveTrackIndex] = useState(0)
  const editableTracks = tracks as Array<{
    src: string
    assetId?: string
    title?: string
    artist?: string
    coverSrc?: string
    coverAssetId?: string
  }>
  const safeEditTrackIndex = clampEditorTrackIndex(editActiveTrackIndex, editableTracks.length)
  const activeEditableTrack = editableTracks[safeEditTrackIndex]
  const normalizedPlaylist = useMemo(() => normalizeMusicTracks({
    tracks,
    src,
    title,
    artist,
    coverSrc,
    assetId,
    coverAssetId,
  }), [artist, assetId, coverAssetId, coverSrc, src, title, tracks])
  const playback = useMusicPlayback(normalizedPlaylist)

  const activeTrack = playback.activeTrack
  const selectedAssetId = activeTrack?.assetId ?? assetId
  const activeSelectedAsset = selectedAsset && selectedAsset.id === selectedAssetId
    ? selectedAsset
    : null
  const safeTrackIndex = playback.state.activeTrackIndex
  const [waveformBarsCount, setWaveformBarsCount] = useState<number>(() => {
    if (typeof window === 'undefined') {
      return 44
    }
    return resolveWaveformBarsCount(window.innerWidth)
  })
  const effectiveDuration = playback.state.duration > 0
    ? playback.state.duration
    : (activeSelectedAsset?.durationMs ? activeSelectedAsset.durationMs / 1000 : 0)
  const activeProgressBarIndex = resolveProgressBarIndex(playback.state.currentTime, effectiveDuration, waveformBarsCount)

  const { bars: visualizerBars } = useMusicVisualizer({
    audioElement,
    isPlaying: playback.state.isPlaying,
    barsCount: waveformBarsCount,
    volume: playback.state.volume,
    isMuted: playback.state.isMuted,
  })
  const waveformHeights = useMemo(
    () => resolveWaveformHeights(visualizerBars, waveformBarsCount),
    [visualizerBars, waveformBarsCount],
  )
  const waveformBarsModel = useMemo(
    () => buildWaveformBarsModel(waveformHeights, activeProgressBarIndex, waveformBarsCount),
    [activeProgressBarIndex, waveformBarsCount, waveformHeights],
  )

  const handleAudioRef = useCallback((node: HTMLAudioElement | null) => {
    const audioRef = playback.audioRef
    audioRef.current = node
    setAudioElement((current) => (current === node ? current : node))
  }, [playback.audioRef])

  useEffect(() => {
    if (!isMusicBlock) {
      return
    }

    if (!selectedAssetId) {
      return
    }

    let active = true
    assetService.getById(selectedAssetId)
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
  }, [isMusicBlock, selectedAssetId])

  useEffect(() => {
    if (!activeSelectedAsset || (activeSelectedAsset.processingStatus !== 'pending' && activeSelectedAsset.processingStatus !== 'processing')) {
      return
    }

    const timer = window.setInterval(() => {
      assetService.getById(activeSelectedAsset.id)
        .then(({ data }) => setSelectedAsset(data.asset))
        .catch(() => undefined)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [activeSelectedAsset])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateBarsCount = () => {
      setWaveformBarsCount(resolveWaveformBarsCount(window.innerWidth))
    }

    updateBarsCount()
    window.addEventListener('resize', updateBarsCount)
    return () => window.removeEventListener('resize', updateBarsCount)
  }, [])

  const playlistLength = normalizedPlaylist.length
  const playerUIMode = getMusicPlayerUIMode(playlistLength)
  const isPlaylistMode = playerUIMode === 'playlist'

  useEffect(() => {
    if (!isMusicBlock || !onUpdate) {
      return
    }

    const mirror = syncLegacyMirror(block.props, safeEditTrackIndex)
    const isAligned =
      (block.props.src ?? '') === mirror.src
      && (block.props.assetId ?? '') === (mirror.assetId ?? '')
      && (block.props.title ?? '') === mirror.title
      && (block.props.artist ?? '') === mirror.artist
      && (block.props.coverSrc ?? '') === mirror.coverSrc
      && (block.props.coverAssetId ?? '') === (mirror.coverAssetId ?? '')

    if (isAligned) {
      return
    }

    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') {
        return currentBlock
      }

      const nextMirror = syncLegacyMirror(currentBlock.props, safeEditTrackIndex)
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          ...nextMirror,
        },
      }
    })
  }, [block.props, isMusicBlock, onUpdate, safeEditTrackIndex])

  const applyTrackMutation = useCallback((nextTracks: typeof editableTracks, nextActiveIndex: number) => {
    const safeNextActiveIndex = clampEditorTrackIndex(nextActiveIndex, nextTracks.length)
    setEditActiveTrackIndex(safeNextActiveIndex)

    onUpdate?.((currentBlock) => {
      if (currentBlock.type !== 'music') {
        return currentBlock
      }

      const nextProps = {
        ...currentBlock.props,
        tracks: nextTracks,
      }
      const mirror = syncLegacyMirror(nextProps, safeNextActiveIndex)

      return {
        ...currentBlock,
        props: {
          ...nextProps,
          ...mirror,
        },
      }
    })
  }, [onUpdate])

  const handleSelectTrack = useCallback((index: number) => {
    const nextIndex = clampEditorTrackIndex(index, editableTracks.length)
    setEditActiveTrackIndex(nextIndex)

    onUpdate?.((currentBlock) => {
      if (currentBlock.type !== 'music') {
        return currentBlock
      }

      const mirror = syncLegacyMirror(currentBlock.props, nextIndex)
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          ...mirror,
        },
      }
    })
  }, [editableTracks.length, onUpdate])

  const handleAddTrack = useCallback(() => {
    const result = addTrack(editableTracks)
    applyTrackMutation(result.tracks, result.activeIndex)
  }, [applyTrackMutation, editableTracks])

  const handleRemoveTrack = useCallback((index: number) => {
    const result = removeTrack(editableTracks, index, safeEditTrackIndex)
    applyTrackMutation(result.tracks, result.activeIndex)
  }, [applyTrackMutation, editableTracks, safeEditTrackIndex])

  const handleMoveTrack = useCallback((index: number, direction: 'up' | 'down') => {
    const result = moveTrack(editableTracks, index, direction, safeEditTrackIndex)
    applyTrackMutation(result.tracks, result.activeIndex)
  }, [applyTrackMutation, editableTracks, safeEditTrackIndex])

  const handlePatchTrack = useCallback((index: number, patch: Partial<typeof editableTracks[number]>) => {
    const result = updateTrackAtIndex(editableTracks, index, patch, safeEditTrackIndex)
    applyTrackMutation(result.tracks, result.activeIndex)
  }, [applyTrackMutation, editableTracks, safeEditTrackIndex])

  const handleWaveformSeek = useCallback((clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect()
    const barIndex = resolveBarIndexFromClientX(clientX, rect.left, rect.width, waveformBarsCount)
    const nextTime = resolveSeekTimeFromBarIndex(barIndex, waveformBarsCount, effectiveDuration)
    playback.seek(nextTime)
  }, [effectiveDuration, playback, waveformBarsCount])

  if (!isMusicBlock) {
    return null
  }

  const isPlaylistPanelOpen = isPlaylistMode && isPlaylistOpen
  const isActuallyPlaying = resolveIsActuallyPlaying(playback.state.isPlaying, playback.state.shouldContinuePlaying, playback.audioRef.current?.paused)

  const safeTitle = activeTrack?.title || title || 'Sua musica especial'
  const safeArtist = activeTrack?.artist || artist || 'Trilha do seu momento'
  const resolvedCover = (activeTrack?.coverSrc || coverSrc).trim()
  const hasCover = resolvedCover.startsWith('http://') || resolvedCover.startsWith('https://')
  const monogram = safeTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('') || 'M'

  if (mode === 'edit') {
    return (
      <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-lg font-bold text-text">Playlist</p>
            <p className="text-xs text-text-light">Gerencie audio, metadados e capa por faixa.</p>
          </div>
          <button
            type="button"
            onClick={handleAddTrack}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/35 bg-white px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Plus size={16} />
            Adicionar faixa
          </button>
        </div>

        {editableTracks.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-primary/15 bg-white/70 p-2">
              <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                {editableTracks.map((track, index) => {
                  const isActiveEditorTrack = index === safeEditTrackIndex
                  const trackTitle = track.title?.trim() || `Faixa ${String(index + 1).padStart(2, '0')}`
                  const trackArtist = track.artist?.trim() || 'Sem artista'

                  return (
                    <div key={`music-edit-track-${index}`} className={`rounded-xl border px-2 py-2 transition-colors ${isActiveEditorTrack ? 'border-primary/30 bg-primary/10' : 'border-primary/10 bg-white/70'}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectTrack(index)}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${isActiveEditorTrack ? 'border-primary/45 bg-primary/20 text-primary-dark' : 'border-primary/20 bg-white text-text-light'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-text">{trackTitle}</span>
                          <span className="block truncate text-xs text-text-light">{trackArtist}</span>
                        </span>
                      </button>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button type="button" onClick={() => handleMoveTrack(index, 'up')} disabled={index === 0} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-primary/20 px-2 py-1 text-[11px] font-medium text-text-light transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45">↑</button>
                        <button type="button" onClick={() => handleMoveTrack(index, 'down')} disabled={index === editableTracks.length - 1} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-primary/20 px-2 py-1 text-[11px] font-medium text-text-light transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45">↓</button>
                        <button type="button" onClick={() => handleRemoveTrack(index)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50">
                          <Trash2 size={11} />
                          Remover
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-primary/15 bg-white/70 p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-light">Faixa ativa {String(safeEditTrackIndex + 1).padStart(2, '0')}</p>
              <MediaField
                kind="audio"
                label="Audio da faixa"
                value={{ src: activeEditableTrack?.src ?? '', assetId: activeEditableTrack?.assetId }}
                onChange={(nextValue) => {
                  handlePatchTrack(safeEditTrackIndex, {
                    src: nextValue.src,
                    assetId: nextValue.assetId,
                  })
                }}
                onRemove={() => {
                  handlePatchTrack(safeEditTrackIndex, {
                    src: '',
                    assetId: undefined,
                  })
                }}
                helperText="Adicione o audio desta faixa por arquivo ou URL."
              />

                <EditorInputSection title="Titulo da faixa" helperText="Opcional. Ajuda o usuario a reconhecer a musica.">
                  <input
                  type="text"
                  value={activeEditableTrack?.title ?? ''}
                  onChange={(event) => {
                    handlePatchTrack(safeEditTrackIndex, {
                      title: event.target.value,
                    })
                    }}
                    placeholder="Nome da faixa"
                    className={EDITOR_FIELD_BASE_CLASS}
                  />
                </EditorInputSection>

                <EditorInputSection title="Artista" helperText="Opcional. Mostrado no player e na playlist.">
                  <input
                  type="text"
                  value={activeEditableTrack?.artist ?? ''}
                  onChange={(event) => {
                    handlePatchTrack(safeEditTrackIndex, {
                      artist: event.target.value,
                    })
                    }}
                    placeholder="Quem canta"
                    className={EDITOR_FIELD_BASE_CLASS}
                  />
                </EditorInputSection>

              <MediaField
                kind="image"
                label="Capa da faixa (opcional)"
                value={{ src: activeEditableTrack?.coverSrc ?? '', assetId: activeEditableTrack?.coverAssetId }}
                onChange={(nextValue) => {
                  handlePatchTrack(safeEditTrackIndex, {
                    coverSrc: nextValue.src,
                    coverAssetId: nextValue.assetId,
                  })
                }}
                onRemove={() => {
                  handlePatchTrack(safeEditTrackIndex, {
                    coverSrc: '',
                    coverAssetId: undefined,
                  })
                }}
                helperText="Imagem de capa opcional para esta faixa."
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-4 text-sm text-text-light">
            Nenhuma faixa ainda. Toque em "Adicionar faixa" para comecar sua playlist.
          </div>
        )}

      </div>
    )
  }

  if (playlistLength === 0) {
    return <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-6 text-center text-sm text-text-light">URL de audio invalida ou vazia. Ajuste no modo de edicao.</div>
  }

  if (activeSelectedAsset && (activeSelectedAsset.processingStatus === 'pending' || activeSelectedAsset.processingStatus === 'processing')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-white/80 p-6 text-text-light"
      >
        <div className="mb-4 flex items-center gap-2">
          <LoaderCircle size={18} className="animate-spin" />
          <p className="text-sm">Estamos preparando o audio para tocar com qualidade.</p>
        </div>
        <div className="space-y-2" aria-hidden="true">
          <div className="h-4 w-1/3 animate-pulse rounded bg-primary/15" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-primary/10" />
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-primary/10" />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-4 font-sans sm:p-5 md:p-6" style={{ background: 'linear-gradient(132deg, color-mix(in srgb, var(--color-surface) 76%, white 24%) 0%, color-mix(in srgb, var(--color-surface-glass) 82%, var(--color-primary-light) 18%) 100%)' }}>
      <audio
        ref={handleAudioRef}
        src={activeTrack?.src ?? ''}
        crossOrigin="anonymous"
        preload="auto"
        onPlay={() => playback.onPlayStateChange(true)}
        onPause={() => playback.onPlayStateChange(false)}
        onLoadedMetadata={(event) => playback.onLoadedMetadata(event.currentTarget.duration)}
        onDurationChange={(event) => playback.onDurationChange(event.currentTarget.duration)}
        onProgress={(event) => {
          const media = event.currentTarget
          if (!media.buffered || media.buffered.length === 0) {
            return
          }
          playback.onProgress(media.buffered.end(media.buffered.length - 1))
        }}
        onTimeUpdate={(event) => playback.onTimeUpdate(event.currentTarget.currentTime)}
        onEnded={playback.onEnded}
        onError={playback.onError}
      />

      {playback.state.hasPlaybackError ? (
        <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Nao foi possivel carregar este audio. Volte ao modo de edicao e troque o arquivo ou URL.
        </p>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
        <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/45 bg-white/70 px-3 py-1.5 text-xs text-text-light">
          <Settings2 size={14} aria-hidden="true" />
          <span className="font-medium">Player</span>
        </div>
        {isPlaylistMode ? (
          <button
            type="button"
            onClick={() => setIsPlaylistOpen((current) => !current)}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/45 bg-white/70 px-3 text-xs font-medium text-text shadow-[0_12px_18px_-14px_rgba(0,0,0,0.45)] transition-[transform,background-color,border-color] duration-200 hover:border-white/65 hover:bg-white/85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65"
            aria-label={isPlaylistPanelOpen ? 'Fechar lista de faixas' : 'Abrir lista de faixas'}
            aria-expanded={isPlaylistPanelOpen}
            aria-controls={`playlist-panel-${block.id}`}
          >
            <span>Faixas</span>
            {isPlaylistPanelOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>
        ) : null}
      </div>

      <div className="relative mb-4 flex min-w-0 items-center gap-3 sm:mb-5 sm:gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border" style={{ borderColor: 'color-mix(in srgb, var(--color-border) 72%, white 28%)', background: 'linear-gradient(155deg, color-mix(in srgb, var(--color-primary-light) 44%, white 56%) 0%, color-mix(in srgb, var(--color-accent) 26%, var(--color-surface) 74%) 100%)' }}>
          {hasCover ? <img src={resolvedCover} alt={`Capa da musica ${safeTitle}`} className="h-full w-full object-cover" loading="lazy" /> : <><span className="font-display text-xl font-semibold text-text/75">{monogram}</span><Music2 size={14} className="absolute bottom-2 right-2 text-text/55" /></>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold text-text sm:text-2xl">{safeTitle}</p>
          <p className="truncate text-sm text-text-light">{safeArtist}</p>
          <p className="text-[11px] text-text-light">{formatTime(playback.state.currentTime)} / {formatTime(effectiveDuration)}</p>
        </div>
      </div>

      <div
        className="mb-4"
        role="group"
        aria-label="Waveform de progresso"
        onClick={(event) => {
          handleWaveformSeek(event.clientX, event.currentTarget)
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0]
          if (!touch) {
            return
          }
          handleWaveformSeek(touch.clientX, event.currentTarget)
        }}
      >
        <div className="flex h-24 items-end gap-1 rounded-xl border border-white/35 bg-gradient-to-b from-white/45 to-white/15 px-2 py-2 sm:h-28">
          {waveformBarsModel.map((bar, index) => {
            return (
              <button
                key={`waveform-bar-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  const nextTime = resolveSeekTimeFromBarIndex(index, waveformBarsCount, effectiveDuration)
                  playback.seek(nextTime)
                }}
                className="min-h-[2px] flex-1 rounded-[999px] transition-[height,background-color,opacity] duration-200 ease-[var(--ease-out-expo)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                style={{
                  height: `${Math.round((isActuallyPlaying ? bar.heightRatio : Math.max(bar.heightRatio * 0.72, 0.12)) * 100)}%`,
                  opacity: 0.95,
                  minWidth: '4px',
                  background: bar.isPlayed
                    ? 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary-light) 68%, white 32%) 0%, color-mix(in srgb, var(--color-primary) 88%, black 12%) 100%)'
                    : 'linear-gradient(180deg, rgba(107,114,128,0.58) 0%, rgba(107,114,128,0.32) 100%)',
                }}
                aria-label={`Ir para ponto ${index + 1} da faixa`}
              />
            )
          })}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-[11px] text-text-light">
        <span>{isPlaylistMode ? `Faixa ${safeTrackIndex + 1} de ${playlistLength}` : 'Faixa unica'}</span>
        <span>{playback.state.isShuffleEnabled ? 'Aleatorio ativo' : 'Aleatorio inativo'}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={playback.toggleMute} className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label={playback.state.isMuted || playback.state.volume <= 0.01 ? 'Ativar som' : 'Silenciar audio'}>{playback.state.isMuted || playback.state.volume <= 0.01 ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
          <input type="range" min={0} max={1} step={0.01} value={playback.state.isMuted ? 0 : playback.state.volume} onChange={(event) => playback.setVolume(Number(event.target.value))} className="w-20 max-w-[26vw] accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Controle de volume" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isPlaylistMode ? (
            <button type="button" onClick={playback.prevTrack} className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,opacity,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label="Faixa anterior" disabled={!playback.canGoPrev}><SkipBack size={16} /></button>
          ) : null}
          <button type="button" onClick={() => { void playback.togglePlay() }} className="relative inline-flex h-12 w-12 min-h-12 min-w-12 items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-primary to-secondary text-white shadow-[0_16px_24px_-18px_color-mix(in_srgb,var(--color-primary)_86%,black_14%)] transition-[transform,opacity,filter] duration-200 hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70" aria-label={isActuallyPlaying ? 'Pausar musica' : 'Reproduzir musica'}>{isActuallyPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}</button>
          {isPlaylistMode ? (
            <button type="button" onClick={playback.nextTrack} className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 text-text-light shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,opacity,border-color] duration-200 hover:border-white/60 hover:bg-white/78 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65" aria-label="Proxima faixa" disabled={!playback.canGoNext}><SkipForward size={16} /></button>
          ) : null}
        </div>

        {isPlaylistMode ? (
          <button
            type="button"
            onClick={playback.toggleShuffle}
            className={`inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border shadow-[0_10px_18px_-16px_rgba(0,0,0,0.45)] transition-[transform,background-color,border-color] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65 ${playback.state.isShuffleEnabled ? 'border-primary/45 bg-primary/15 text-primary-dark' : 'border-white/40 bg-white/55 text-text-light hover:border-white/60 hover:bg-white/78'}`}
            aria-label={playback.state.isShuffleEnabled ? 'Desativar modo aleatorio' : 'Ativar modo aleatorio'}
            aria-pressed={playback.state.isShuffleEnabled}
          >
            <Shuffle size={15} />
          </button>
        ) : null}
      </div>

      {isPlaylistMode ? (
        <div
          id={`playlist-panel-${block.id}`}
           className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${isPlaylistPanelOpen ? 'mt-3 max-h-72 opacity-100 sm:max-h-80' : 'max-h-0 opacity-0'}`}
           aria-hidden={!isPlaylistPanelOpen}
        >
          <div className="rounded-2xl border border-white/45 bg-white/60 p-2 sm:p-3">
            <div
              className="max-h-56 overflow-y-auto pr-1 sm:max-h-64"
              role="listbox"
              aria-label="Lista de faixas"
              aria-activedescendant={`playlist-option-${block.id}-${safeTrackIndex}`}
            >
              {normalizedPlaylist.map((track, index) => {
                const optionId = `playlist-option-${block.id}-${index}`
                const isActive = index === safeTrackIndex
                const trackTitle = track.title?.trim() || `Faixa ${index + 1}`
                const trackArtist = track.artist?.trim() || 'Artista desconhecido'

                return (
                  <button
                    key={`${track.src}-${index}`}
                    id={optionId}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => playback.setActiveTrackIndex(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        playback.setActiveTrackIndex(index)
                      }
                    }}
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/65 ${isActive ? 'bg-primary/15 text-text' : 'text-text-light hover:bg-white/70'}`}
                    aria-label={`Reproduzir faixa ${index + 1}: ${trackTitle}`}
                  >
                    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${isActive ? 'border-primary/40 bg-primary/20 text-primary-dark' : 'border-white/55 bg-white/70 text-text-light'}`}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${isActive ? 'font-semibold text-text' : 'font-medium text-text'}`}>{trackTitle}</span>
                      <span className="block truncate text-xs text-text-light">{trackArtist}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function areMusicBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MusicBlock = memo(MusicBlockComponent, areMusicBlockPropsEqual)
