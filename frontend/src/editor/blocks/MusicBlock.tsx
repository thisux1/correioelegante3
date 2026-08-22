import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Disc,
  FileText,
  LoaderCircle,
  Music2,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import type { BlockComponentProps, MusicPlayerStyle, MusicTrack } from '@/editor/types'
import { assetService, type AssetSummary } from '@/services/assetService'
import { MediaField } from '@/editor/components/MediaField'
import { getMusicPlayerUIMode } from '@/editor/blocks/music/getMusicPlayerUIMode'
import { normalizeMusicTracks } from '@/editor/blocks/music/normalizeMusicTracks'
import { resolveIsActuallyPlaying, useMusicPlayback } from '@/editor/blocks/music/useMusicPlayback'
import {
  addTrack,
  clampEditorTrackIndex,
  moveTrack,
  removeTrack,
  syncLegacyMirror,
  updateTrackAtIndex,
} from '@/editor/blocks/music/trackEditorState'
import { VintagePlayerDeck } from '@/editor/blocks/music/VintagePlayerDeck'
import { SyncedLyricsView } from '@/editor/blocks/music/SyncedLyricsView'
import { getLyrics, guessMetadataFromFileName, searchLyrics, type LyricsSearchResult } from '@/services/lyricsService'

const EMPTY_TRACKS: MusicTrack[] = []

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function MusicBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const shouldReduceMotion = useReducedMotion()
  const isMusicBlock = block.type === 'music'
  const src = isMusicBlock ? block.props.src : ''
  const assetId = isMusicBlock ? block.props.assetId ?? '' : ''
  const coverSrc = isMusicBlock ? block.props.coverSrc ?? '' : ''
  const coverAssetId = isMusicBlock ? block.props.coverAssetId : undefined
  const tracks = isMusicBlock ? block.props.tracks ?? EMPTY_TRACKS : EMPTY_TRACKS
  const title = isMusicBlock ? block.props.title ?? '' : ''
  const artist = isMusicBlock ? block.props.artist ?? '' : ''
  const playerStyle: MusicPlayerStyle = isMusicBlock ? block.props.playerStyle ?? 'minimal' : 'minimal'
  const syncedLyrics = isMusicBlock ? block.props.syncedLyrics : undefined
  const plainLyrics = isMusicBlock ? block.props.plainLyrics : undefined
  const showLyrics = isMusicBlock ? block.props.showLyrics ?? true : true

  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null)
  const pollTimeoutRef = useRef<number | null>(null)
  const pollingInFlightRef = useRef(false)
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)
  const [editActiveTrackIndex, setEditActiveTrackIndex] = useState(0)

  // Estados de busca automática de letra
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchingLyrics, setIsSearchingLyrics] = useState(false)
  const [lyricsResults, setLyricsResults] = useState<LyricsSearchResult[]>([])
  const [lyricsSearchOpen, setLyricsSearchOpen] = useState(false)

  const editableTracks: MusicTrack[] = useMemo(() => {
    return Array.isArray(tracks) ? (tracks as MusicTrack[]) : EMPTY_TRACKS
  }, [tracks])

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
    syncedLyrics,
    plainLyrics,
  }), [artist, assetId, coverAssetId, coverSrc, plainLyrics, src, syncedLyrics, title, tracks])
  const playback = useMusicPlayback(normalizedPlaylist)

  const activeTrack = playback.activeTrack
  const selectedAssetId = activeTrack?.assetId ?? assetId
  const activeSelectedAsset = selectedAsset && selectedAsset.id === selectedAssetId
    ? selectedAsset
    : null
  const safeTrackIndex = playback.state.activeTrackIndex
  const playlistLength = normalizedPlaylist.length
  const isPlaylistMode = getMusicPlayerUIMode(playlistLength) === 'playlist'

  const effectiveDuration = playback.state.duration > 0
    ? playback.state.duration
    : (activeSelectedAsset?.durationMs ? activeSelectedAsset.durationMs / 1000 : 0)

  const progressPercent = effectiveDuration > 0
    ? Math.min(100, Math.max(0, (playback.state.currentTime / effectiveDuration) * 100))
    : 0

  const handleAudioRef = useCallback((node: HTMLAudioElement | null) => {
    playback.audioRef.current = node
  }, [playback.audioRef])

  useEffect(() => {
    if (!isMusicBlock) {
      return
    }

    let isMounted = true

    if (!selectedAssetId) {
      setSelectedAsset(null)
      return () => {
        isMounted = false
      }
    }

    const cancelPolling = () => {
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
      pollingInFlightRef.current = false
    }

    const executePoll = async () => {
      if (!isMounted || pollingInFlightRef.current) {
        return
      }

      pollingInFlightRef.current = true
      try {
        const res = await assetService.getById(selectedAssetId)
        if (!isMounted) {
          return
        }

        setSelectedAsset(res.data.asset)
        const isDone = res.data.asset.processingStatus === 'ready' || res.data.asset.processingStatus === 'failed'

        if (!isDone) {
          pollTimeoutRef.current = window.setTimeout(executePoll, 1500)
        }
      } catch {
        if (isMounted) {
          pollTimeoutRef.current = window.setTimeout(executePoll, 3000)
        }
      } finally {
        pollingInFlightRef.current = false
      }
    }

    void executePoll()

    return () => {
      isMounted = false
      cancelPolling()
    }
  }, [isMusicBlock, selectedAssetId])

  const handleSelectTrack = useCallback((index: number) => {
    setEditActiveTrackIndex(index)
  }, [])

  const handleAddTrack = useCallback(() => {
    if (!isMusicBlock || !onUpdate) {
      return
    }

    const mutation = addTrack(editableTracks)
    const nextMirror = syncLegacyMirror({ ...block.props, tracks: mutation.tracks }, mutation.activeIndex)
    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') return currentBlock
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          tracks: mutation.tracks,
          ...nextMirror,
        },
      }
    })
    setEditActiveTrackIndex(mutation.activeIndex)
  }, [block.props, editableTracks, isMusicBlock, onUpdate])

  const handleRemoveTrack = useCallback((index: number) => {
    if (!isMusicBlock || !onUpdate) {
      return
    }

    const mutation = removeTrack(editableTracks, index, safeEditTrackIndex)
    const nextMirror = syncLegacyMirror({ ...block.props, tracks: mutation.tracks }, mutation.activeIndex)
    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') return currentBlock
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          tracks: mutation.tracks,
          ...nextMirror,
        },
      }
    })
    setEditActiveTrackIndex(mutation.activeIndex)
  }, [block.props, editableTracks, isMusicBlock, onUpdate, safeEditTrackIndex])

  const handleMoveTrack = useCallback((index: number, direction: 'up' | 'down') => {
    if (!isMusicBlock || !onUpdate) {
      return
    }

    const mutation = moveTrack(editableTracks, index, direction, safeEditTrackIndex)
    const nextMirror = syncLegacyMirror({ ...block.props, tracks: mutation.tracks }, mutation.activeIndex)
    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') return currentBlock
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          tracks: mutation.tracks,
          ...nextMirror,
        },
      }
    })
    setEditActiveTrackIndex(mutation.activeIndex)
  }, [block.props, editableTracks, isMusicBlock, onUpdate, safeEditTrackIndex])

  const handlePatchTrack = useCallback((index: number, patch: Partial<MusicTrack>) => {
    if (!isMusicBlock || !onUpdate) {
      return
    }

    const mutation = updateTrackAtIndex(editableTracks, index, patch, safeEditTrackIndex)
    const nextMirror = syncLegacyMirror({ ...block.props, tracks: mutation.tracks }, safeEditTrackIndex)
    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') return currentBlock
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          tracks: mutation.tracks,
          ...nextMirror,
        },
      }
    })
  }, [block.props, editableTracks, isMusicBlock, onUpdate, safeEditTrackIndex])

  const handleSetPlayerStyle = useCallback((style: MusicPlayerStyle) => {
    if (!isMusicBlock || !onUpdate) return
    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') return currentBlock
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          playerStyle: style,
        },
      }
    })
  }, [isMusicBlock, onUpdate])

  // Busca de Letras no LRCLIB
  const handlePerformLyricsSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setIsSearchingLyrics(true)
    setLyricsSearchOpen(true)
    try {
      const results = await searchLyrics(q)
      setLyricsResults(results)
    } finally {
      setIsSearchingLyrics(false)
    }
  }, [])

  const handleApplyLyrics = useCallback((result: LyricsSearchResult) => {
    if (!isMusicBlock || !onUpdate) return

    handlePatchTrack(safeEditTrackIndex, {
      title: result.trackName,
      artist: result.artistName,
      syncedLyrics: result.syncedLyrics,
      plainLyrics: result.plainLyrics,
    })

    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'music') return currentBlock
      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          title: result.trackName,
          artist: result.artistName,
          syncedLyrics: result.syncedLyrics,
          plainLyrics: result.plainLyrics,
        },
      }
    })

    setLyricsSearchOpen(false)
  }, [handlePatchTrack, isMusicBlock, onUpdate, safeEditTrackIndex])

  const handleSeekFromProgressBar = useCallback((clientX: number, target: HTMLDivElement) => {
    if (effectiveDuration <= 0) return
    const rect = target.getBoundingClientRect()
    if (rect.width <= 0) return
    const clickRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    playback.seek(clickRatio * effectiveDuration)
  }, [effectiveDuration, playback])

  if (!isMusicBlock) {
    return null
  }

  const isActuallyPlaying = resolveIsActuallyPlaying(playback.state.isPlaying, playback.state.shouldContinuePlaying, playback.audioRef.current?.paused)
  const safeTitle = activeTrack?.title || title || 'Música Especial'
  const safeArtist = activeTrack?.artist || artist || 'Trilha Sonora'
  const resolvedCover = (activeTrack?.coverSrc || coverSrc).trim()
  const currentSyncedLyrics = activeTrack?.syncedLyrics || syncedLyrics
  const currentPlainLyrics = activeTrack?.plainLyrics || plainLyrics
  const hasLyrics = Boolean((currentSyncedLyrics && currentSyncedLyrics.trim()) || (currentPlainLyrics && currentPlainLyrics.trim()))

  // --- MODO EDIÇÃO COMPACTO E INTUITIVO ---
  if (mode === 'edit') {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4">
        {/* Topo: Título + Seletor de Estilo do Widget */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Music2 size={18} />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-text">Widget de Música</p>
              <p className="text-[11px] text-text-light">Escolha o visual e configure a trilha sonora.</p>
            </div>
          </div>

          {/* Segmented Switcher: Minimalista vs Vinil Imersivo */}
          <div className="flex items-center p-1 rounded-xl bg-surface-raised border border-border gap-1 w-fit">
            <button
              type="button"
              onClick={() => handleSetPlayerStyle('minimal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                playerStyle === 'minimal'
                  ? 'bg-surface text-primary shadow-xs border border-border/80'
                  : 'text-text-light hover:text-text'
              }`}
            >
              <Radio size={14} />
              <span>Barra Compacta</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetPlayerStyle('vinyl')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                playerStyle === 'vinyl'
                  ? 'bg-surface text-primary shadow-xs border border-border/80'
                  : 'text-text-light hover:text-text'
              }`}
            >
              <Disc size={14} />
              <span>Vinil e Toca-Fitas</span>
              <Sparkles size={11} className="text-amber-500" />
            </button>
          </div>
        </div>

        {/* Lista de abas de faixas (se playlist) */}
        <div className="flex items-center justify-between gap-2">
          {editableTracks.length > 1 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {editableTracks.map((track, index) => {
                const isActive = index === safeEditTrackIndex
                const trackTitle = track.title?.trim() || `Faixa ${index + 1}`
                return (
                  <div
                    key={`edit-tab-${index}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface border-border text-text-light hover:text-text'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectTrack(index)}
                      className="cursor-pointer truncate max-w-[110px]"
                    >
                      {trackTitle}
                    </button>
                    <div className="flex items-center gap-0.5 ml-1 border-l border-white/20 pl-1">
                      <button
                        type="button"
                        onClick={() => handleMoveTrack(index, 'up')}
                        disabled={index === 0}
                        className="text-[10px] opacity-75 hover:opacity-100 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTrack(index, 'down')}
                        disabled={index === editableTracks.length - 1}
                        className="text-[10px] opacity-75 hover:opacity-100 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrack(index)}
                        className="text-[10px] text-red-300 hover:text-red-100 ml-0.5"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <span className="text-xs font-semibold text-text">Áudio da Carta</span>
          )}

          <button
            type="button"
            onClick={handleAddTrack}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors cursor-pointer shrink-0 ml-auto"
          >
            <Plus size={12} />
            <span>Adicionar faixa</span>
          </button>
        </div>

        {/* Campos de edição da faixa ativa */}
        {editableTracks.length > 0 ? (
          <div className="space-y-3.5">
            {/* Uploader de Áudio com Reconhecimento Automático de Nome */}
            <MediaField
              kind="audio"
              label="Arquivo de Áudio ou Link"
              value={{ src: activeEditableTrack?.src ?? '', assetId: activeEditableTrack?.assetId }}
              onChange={(nextValue) => {
                const guessed = guessMetadataFromFileName(nextValue.src)
                const currentT = activeEditableTrack?.title?.trim()
                const currentA = activeEditableTrack?.artist?.trim()

                const newTitle = (!currentT && guessed.title) ? guessed.title : currentT
                const newArtist = (!currentA && guessed.artist) ? guessed.artist : currentA

                handlePatchTrack(safeEditTrackIndex, {
                  src: nextValue.src,
                  assetId: nextValue.assetId,
                  title: newTitle,
                  artist: newArtist,
                })

                // Auto busca de letras se tiver título e artista
                if (newTitle && newArtist) {
                  void getLyrics(newTitle, newArtist).then((lyricsRes) => {
                    if (lyricsRes?.syncedLyrics || lyricsRes?.plainLyrics) {
                      handlePatchTrack(safeEditTrackIndex, {
                        syncedLyrics: lyricsRes.syncedLyrics,
                        plainLyrics: lyricsRes.plainLyrics,
                      })
                    }
                  })
                }
              }}
              onRemove={() => {
                handlePatchTrack(safeEditTrackIndex, {
                  src: '',
                  assetId: undefined,
                })
              }}
              helperText="Envie um MP3/M4A ou cole a URL direta do áudio."
            />

            {/* Smart Lyrics & Track Recognition Search Bar */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Search size={13} />
                  <span>Buscar Letra e Metadados</span>
                </div>
                {hasLyrics && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <Check size={13} />
                    <span>Letra Sincronizada</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void handlePerformLyricsSearch(searchQuery)
                    }
                  }}
                  placeholder="Nome da música e artista..."
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-light/50 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handlePerformLyricsSearch(searchQuery || `${activeEditableTrack?.artist ?? ''} ${activeEditableTrack?.title ?? ''}`)}
                  disabled={isSearchingLyrics}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isSearchingLyrics ? <LoaderCircle size={13} className="animate-spin" /> : <Search size={13} />}
                  <span>Buscar</span>
                </button>
              </div>

              {/* Lista de Resultados da Busca */}
              {lyricsSearchOpen && lyricsResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 space-y-1 shadow-md">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] text-text-light border-b border-border/40">
                    <span>Músicas encontradas ({lyricsResults.length})</span>
                    <button
                      type="button"
                      onClick={() => setLyricsSearchOpen(false)}
                      className="hover:text-text cursor-pointer flex items-center gap-1"
                    >
                      <X size={12} />
                      <span>Fechar</span>
                    </button>
                  </div>
                  {lyricsResults.map((item) => (
                    <button
                      key={`lrclib-res-${item.id}`}
                      type="button"
                      onClick={() => handleApplyLyrics(item)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-text truncate">{item.trackName}</p>
                        <p className="text-[11px] text-text-light truncate">{item.artistName}</p>
                      </div>
                      <span className="text-[10px] text-primary font-bold shrink-0 bg-primary/10 px-2 py-0.5 rounded-md">
                        {item.syncedLyrics ? 'Letra Sincronizada' : 'Texto'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Título e Artista em Grid Compacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Título da Música
                </label>
                <input
                  type="text"
                  value={activeEditableTrack?.title ?? ''}
                  onChange={(e) => handlePatchTrack(safeEditTrackIndex, { title: e.target.value })}
                  placeholder="Nome da faixa"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-light/50 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Artista / Banda
                </label>
                <input
                  type="text"
                  value={activeEditableTrack?.artist ?? ''}
                  onChange={(e) => handlePatchTrack(safeEditTrackIndex, { artist: e.target.value })}
                  placeholder="Nome do artista"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-light/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Capa Opcional Compacta */}
            <div>
              <MediaField
                kind="image"
                label="Capa do Álbum / Vinil (Opcional)"
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
                helperText="Imagem quadrada para a capa do vinil ou player."
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-text-light">
            Nenhuma música cadastrada. Clique em "+ Adicionar faixa" para incluir uma trilha sonora.
          </div>
        )}
      </div>
    )
  }

  // Se vazio no preview
  if (playlistLength === 0 || !activeTrack?.src) {
    return null
  }

  if (activeSelectedAsset && (activeSelectedAsset.processingStatus === 'pending' || activeSelectedAsset.processingStatus === 'processing')) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-3.5 flex items-center gap-2.5 text-xs text-text-light shadow-xs">
        <LoaderCircle size={15} className="animate-spin text-primary" />
        <span>Processando áudio para reprodução com qualidade...</span>
      </div>
    )
  }

  // =========================================================================
  // --- MODO PREVIEW 1: DISCO DE VINIL + TOCA-FITAS + LETRAS SIMULTÂNEAS ---
  // =========================================================================
  if (playerStyle === 'vinyl') {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-surface via-surface/95 to-surface-raised p-5 sm:p-7 shadow-xl">
        <audio
          ref={handleAudioRef}
          src={activeTrack?.src ?? ''}
          crossOrigin="anonymous"
          preload="auto"
          onPlay={() => playback.onPlayStateChange(true)}
          onPause={() => playback.onPlayStateChange(false)}
          onLoadedMetadata={(e) => playback.onLoadedMetadata(e.currentTarget.duration)}
          onDurationChange={(e) => playback.onDurationChange(e.currentTarget.duration)}
          onProgress={(e) => {
            const media = e.currentTarget
            if (!media.buffered || media.buffered.length === 0) return
            playback.onProgress(media.buffered.end(media.buffered.length - 1))
          }}
          onTimeUpdate={(e) => playback.onTimeUpdate(e.currentTarget.currentTime)}
          onEnded={playback.onEnded}
          onError={playback.onError}
        />

        {playback.state.hasPlaybackError ? (
          <p className="mb-3 text-center text-xs text-amber-600 font-medium">
            Não foi possível reproduzir este áudio.
          </p>
        ) : null}

        {/* Aura / Brilho Ambiental no Fundo */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'var(--color-primary, #e11d48)' }}
        />

        {/* LAYOUT INTEGRADO: TOCA-DISCOS & VINIL COM LETRAS DIRETAMENTE INTEGRADAS */}
        <div className="relative z-10 max-w-sm sm:max-w-md mx-auto flex flex-col items-center space-y-3">
          {/* Toca-Discos Vintage */}
          <VintagePlayerDeck
            coverSrc={resolvedCover}
            title={safeTitle}
            artist={safeArtist}
            isPlaying={isActuallyPlaying}
            progressPercent={progressPercent}
            currentTime={playback.state.currentTime}
            duration={effectiveDuration}
            onClick={() => { void playback.togglePlay() }}
          />

          {/* Informações da Faixa */}
          <div className="w-full text-center px-1">
            <h3 className="font-display font-bold text-base sm:text-lg text-text truncate">
              {safeTitle}
            </h3>
            <p className="text-xs text-text-light truncate mt-0.5">
              {safeArtist}
            </p>
          </div>

          {/* Letras Integradas em 3 Linhas (Diretamente no componente) */}
          {showLyrics && hasLyrics && (
            <div className="w-full py-0.5">
              <SyncedLyricsView
                syncedLyrics={currentSyncedLyrics}
                plainLyrics={currentPlainLyrics}
                currentTime={playback.state.currentTime}
                isPlaying={isActuallyPlaying}
                onSeek={(time) => playback.seek(time)}
              />
            </div>
          )}

          {/* Barra de Progresso com Tempo */}
          <div className="w-full space-y-1 px-1">
            <div
              className="group/track relative h-3 flex items-center cursor-pointer"
              onClick={(e) => handleSeekFromProgressBar(e.clientX, e.currentTarget as HTMLDivElement)}
              role="slider"
              aria-label="Progresso da música"
              aria-valuemin={0}
              aria-valuemax={effectiveDuration}
              aria-valuenow={playback.state.currentTime}
            >
              <div className="w-full h-1.5 group-hover/track:h-2 rounded-full bg-border/80 overflow-hidden transition-all">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div
                className="absolute h-3.5 w-3.5 rounded-full bg-primary border-2 border-white shadow-md opacity-0 group-hover/track:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-light font-mono tabular-nums">
              <span>{formatTime(playback.state.currentTime)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Controles de Reprodução */}
          <div className="w-full flex items-center justify-between gap-3 pt-0.5 px-1">
            {/* Aleatório / Volume */}
            <div className="flex items-center gap-2">
              {isPlaylistMode && (
                <button
                  type="button"
                  onClick={playback.toggleShuffle}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    playback.state.isShuffleEnabled ? 'text-primary' : 'text-text-light hover:text-text'
                  }`}
                  aria-label="Modo aleatório"
                >
                  <Shuffle size={16} />
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsVolumeOpen((prev) => !prev)}
                  className="p-2 text-text-light hover:text-text transition-colors cursor-pointer"
                  aria-label="Volume"
                >
                  {playback.state.isMuted || playback.state.volume <= 0.01 ? (
                    <VolumeX size={17} />
                  ) : (
                    <Volume2 size={17} />
                  )}
                </button>

                {isVolumeOpen && (
                  <div className="absolute bottom-full left-0 mb-2 p-2.5 bg-surface rounded-xl border border-border shadow-xl z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={playback.toggleMute}
                      className="text-text-light hover:text-text"
                    >
                      {playback.state.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={playback.state.isMuted ? 0 : playback.state.volume}
                      onChange={(e) => playback.setVolume(Number(e.target.value))}
                      className="w-20 h-1.5 accent-primary cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Botões Centrais de Faixa & Play/Pause */}
            <div className="flex items-center gap-3 sm:gap-4">
              {isPlaylistMode && (
                <button
                  type="button"
                  onClick={playback.prevTrack}
                  disabled={!playback.canGoPrev}
                  className="p-2 text-text-light hover:text-text disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Faixa anterior"
                >
                  <SkipBack size={20} />
                </button>
              )}

              <button
                type="button"
                onClick={() => { void playback.togglePlay() }}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-primary via-primary to-primary-dark text-white shadow-[0_10px_25px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                aria-label={isActuallyPlaying ? 'Pausar música' : 'Tocar música'}
              >
                {isActuallyPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
              </button>

              {isPlaylistMode && (
                <button
                  type="button"
                  onClick={playback.nextTrack}
                  disabled={!playback.canGoNext}
                  className="p-2 text-text-light hover:text-text disabled:opacity-30 transition-colors cursor-pointer"
                  aria-label="Próxima faixa"
                >
                  <SkipForward size={20} />
                </button>
              )}
            </div>

            {/* Botão de Playlist Dropdown */}
            <div>
              {isPlaylistMode ? (
                <button
                  type="button"
                  onClick={() => setIsPlaylistOpen((prev) => !prev)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                    isPlaylistOpen ? 'bg-primary/15 text-primary' : 'text-text-light hover:text-text'
                  }`}
                  aria-label="Ver todas as faixas"
                >
                  <span>{playlistLength} faixas</span>
                  {isPlaylistOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              ) : (
                <div className="w-8" />
              )}
            </div>
          </div>

          {/* Gaveta de Playlist Expandida */}
          {isPlaylistMode && isPlaylistOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full mt-2 pt-2.5 border-t border-border/60 space-y-1"
            >
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {normalizedPlaylist.map((track, idx) => {
                  const isCurrent = idx === safeTrackIndex
                  return (
                    <button
                      key={`vinyl-pl-${track.src}-${idx}`}
                      type="button"
                      onClick={() => playback.setActiveTrackIndex(idx)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-primary/15 text-primary font-bold'
                          : 'text-text-light hover:bg-surface-raised hover:text-text'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-[11px] w-4 text-center font-mono opacity-60">
                          {idx + 1}
                        </span>
                        <span className="truncate">{track.title || `Faixa ${idx + 1}`}</span>
                      </div>
                      {track.artist && (
                        <span className="text-[11px] text-text-light/70 truncate max-w-[110px] ml-2">
                          {track.artist}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // --- MODO PREVIEW 2: BARRA COMPACTA & MINIMALISTA ---
  // =========================================================================
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-md p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-shadow">
      <audio
        ref={handleAudioRef}
        src={activeTrack?.src ?? ''}
        crossOrigin="anonymous"
        preload="auto"
        onPlay={() => playback.onPlayStateChange(true)}
        onPause={() => playback.onPlayStateChange(false)}
        onLoadedMetadata={(e) => playback.onLoadedMetadata(e.currentTarget.duration)}
        onDurationChange={(e) => playback.onDurationChange(e.currentTarget.duration)}
        onProgress={(e) => {
          const media = e.currentTarget
          if (!media.buffered || media.buffered.length === 0) return
          playback.onProgress(media.buffered.end(media.buffered.length - 1))
        }}
        onTimeUpdate={(e) => playback.onTimeUpdate(e.currentTarget.currentTime)}
        onEnded={playback.onEnded}
        onError={playback.onError}
      />

      {playback.state.hasPlaybackError ? (
        <p className="mb-2 text-center text-xs text-amber-600 font-medium">
          Não foi possível reproduzir este áudio.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        {/* Capa Compacta com Lombada Esquerda / Ícone Vinil */}
        <div
          onClick={() => { void playback.togglePlay() }}
          className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/60 border-l-[3px] border-l-primary bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center cursor-pointer shadow-xs group"
        >
          {resolvedCover ? (
            <img
              src={resolvedCover}
              alt={safeTitle}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isActuallyPlaying && !shouldReduceMotion ? 'scale-105' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <Music2 size={20} className="text-primary/70" />
          )}

          {/* Overlay com micro play/pause ao passar o mouse */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            {isActuallyPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
          </div>
        </div>

        {/* Informações da Música & Barra de Progresso Integrada */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              <p className="truncate text-xs sm:text-sm font-bold text-text">
                {safeTitle}
              </p>
              {safeArtist && (
                <span className="hidden sm:inline text-xs text-text-light truncate">
                  • {safeArtist}
                </span>
              )}
              {/* Equalizador animado minimalista de 3 barras quando tocando */}
              {isActuallyPlaying && !shouldReduceMotion && (
                <div className="flex items-end gap-0.5 h-3 shrink-0" aria-hidden="true">
                  <span className="w-0.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2.5" />
                  <span className="w-0.5 bg-primary rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-3" />
                  <span className="w-0.5 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.4s] h-2" />
                </div>
              )}
            </div>

            {/* Tempo */}
            <span className="text-[10px] text-text-light font-mono tabular-nums shrink-0">
              {formatTime(playback.state.currentTime)} / {formatTime(effectiveDuration)}
            </span>
          </div>

          {/* Barra de Progresso Interativa Fina */}
          <div
            className="group/track relative h-2.5 flex items-center cursor-pointer"
            onClick={(e) => handleSeekFromProgressBar(e.clientX, e.currentTarget as HTMLDivElement)}
            role="slider"
            aria-label="Progresso da música"
            aria-valuemin={0}
            aria-valuemax={effectiveDuration}
            aria-valuenow={playback.state.currentTime}
          >
            <div className="w-full h-1 group-hover/track:h-1.5 rounded-full bg-border/60 overflow-hidden transition-all">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Knob ao passar o mouse */}
            <div
              className="absolute h-2.5 w-2.5 rounded-full bg-primary border-2 border-white shadow-xs opacity-0 group-hover/track:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controles de Reprodução Compactos */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          {/* Botão para Abrir Letra no Modo Compacto */}
          {hasLyrics && (
            <button
              type="button"
              onClick={() => setIsLyricsOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                isLyricsOpen ? 'bg-primary/15 text-primary' : 'text-text-light hover:text-text'
              }`}
              aria-label="Ver letra da música"
              title="Ver letra"
            >
              <FileText size={15} />
              <span className="hidden sm:inline text-[11px]">Letra</span>
            </button>
          )}

          {isPlaylistMode && (
            <button
              type="button"
              onClick={playback.prevTrack}
              disabled={!playback.canGoPrev}
              className="p-1.5 text-text-light hover:text-text disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Faixa anterior"
            >
              <SkipBack size={15} />
            </button>
          )}

          {/* Botão Play / Pause Principal */}
          <button
            type="button"
            onClick={() => { void playback.togglePlay() }}
            className="w-9 h-9 rounded-full bg-primary text-white shadow-xs hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
            aria-label={isActuallyPlaying ? 'Pausar' : 'Tocar'}
          >
            {isActuallyPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
          </button>

          {isPlaylistMode && (
            <button
              type="button"
              onClick={playback.nextTrack}
              disabled={!playback.canGoNext}
              className="p-1.5 text-text-light hover:text-text disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Próxima faixa"
            >
              <SkipForward size={15} />
            </button>
          )}

          {/* Botão Mudo / Volume Flutuante */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsVolumeOpen((prev) => !prev)}
              className="p-1.5 text-text-light hover:text-text transition-colors cursor-pointer"
              aria-label="Volume"
            >
              {playback.state.isMuted || playback.state.volume <= 0.01 ? (
                <VolumeX size={15} />
              ) : (
                <Volume2 size={15} />
              )}
            </button>

            {isVolumeOpen && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-surface rounded-xl border border-border shadow-xl z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={playback.toggleMute}
                  className="text-text-light hover:text-text"
                >
                  {playback.state.isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={playback.state.isMuted ? 0 : playback.state.volume}
                  onChange={(e) => playback.setVolume(Number(e.target.value))}
                  className="w-16 h-1 accent-primary cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Botão de Abrir Lista de Faixas (Se for Playlist) */}
          {isPlaylistMode && (
            <button
              type="button"
              onClick={() => setIsPlaylistOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPlaylistOpen ? 'bg-primary/15 text-primary' : 'text-text-light hover:text-text'
              }`}
              aria-label="Ver todas as faixas"
            >
              {isPlaylistOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Gaveta de Letra da Música no Modo Compacto */}
      {hasLyrics && isLyricsOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-2.5 pt-2 border-t border-border/60"
        >
          <SyncedLyricsView
            syncedLyrics={currentSyncedLyrics}
            plainLyrics={currentPlainLyrics}
            currentTime={playback.state.currentTime}
            isPlaying={isActuallyPlaying}
            onSeek={(time) => playback.seek(time)}
          />
        </motion.div>
      )}

      {/* Gaveta Recolhível de Playlist */}
      {isPlaylistMode && isPlaylistOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-2.5 pt-2.5 border-t border-border/60 space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] text-text-light mb-1 px-1">
            <span>{playlistLength} faixas na playlist</span>
            <button
              type="button"
              onClick={playback.toggleShuffle}
              className={`flex items-center gap-1 hover:text-primary transition-colors cursor-pointer ${
                playback.state.isShuffleEnabled ? 'text-primary font-bold' : ''
              }`}
            >
              <Shuffle size={11} />
              <span>Aleatório</span>
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
            {normalizedPlaylist.map((track, idx) => {
              const isCurrent = idx === safeTrackIndex
              return (
                <button
                  key={`${track.src}-${idx}`}
                  type="button"
                  onClick={() => playback.setActiveTrackIndex(idx)}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-light hover:bg-surface-raised hover:text-text'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] w-3.5 text-center font-mono opacity-60">
                      {idx + 1}
                    </span>
                    <span className="truncate">{track.title || `Faixa ${idx + 1}`}</span>
                  </div>
                  {track.artist && (
                    <span className="text-[10px] text-text-light/70 truncate max-w-[90px] ml-2">
                      {track.artist}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function areMusicBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MusicBlock = memo(MusicBlockComponent, areMusicBlockPropsEqual)
