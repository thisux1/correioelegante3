import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'

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
}

function MusicPlayer({ src, title, artist }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [hasPlaybackError, setHasPlaybackError] = useState(false)

  useEffect(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.volume = volume
  }, [volume])

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-white to-primary/5 p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setHasPlaybackError(false)
          setDuration(event.currentTarget.duration)
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
        }}
      />

      <div className="mb-4">
        <p className="truncate text-base font-semibold text-text">{title || 'Sua musica especial'}</p>
        <p className="truncate text-sm text-text-light">{artist || 'Artista'}</p>
      </div>

      {hasPlaybackError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Nao foi possivel carregar este audio. Verifique a URL.
        </p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-3">
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark"
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
              />

              <div className="mt-1 flex justify-between text-[11px] text-text-light">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              className="w-36 max-w-full accent-primary"
            />
          </div>
        </>
      )}
    </div>
  )
}

function MusicBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isMusicBlock = block.type === 'music'
  const src = isMusicBlock ? block.props.src.trim() : ''
  const title = isMusicBlock ? block.props.title?.trim() || '' : ''
  const artist = isMusicBlock ? block.props.artist?.trim() || '' : ''

  const canPlay = useMemo(() => isValidAudioUrl(src), [src])

  if (!isMusicBlock) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <div>
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
                    src: nextSrc,
                  },
                }
              })
            }}
            placeholder="https://..."
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
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

  return <MusicPlayer key={src} src={src} title={title} artist={artist} />
}

function areMusicBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MusicBlock = memo(MusicBlockComponent, areMusicBlockPropsEqual)
