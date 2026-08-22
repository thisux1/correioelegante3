import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Music2 } from 'lucide-react'
import { parseLrc, type LrcLine } from '@/services/lyricsService'

interface SyncedLyricsViewProps {
  syncedLyrics?: string
  plainLyrics?: string
  currentTime: number
  isPlaying?: boolean
  onSeek: (time: number) => void
}

export function SyncedLyricsView({
  syncedLyrics,
  plainLyrics,
  currentTime,
  onSeek,
}: SyncedLyricsViewProps) {
  const lines: LrcLine[] = useMemo(() => {
    if (syncedLyrics && syncedLyrics.trim()) {
      return parseLrc(syncedLyrics)
    }
    if (plainLyrics && plainLyrics.trim()) {
      return plainLyrics
        .split(/\r?\n/)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text, idx) => ({ time: idx * 5, text }))
    }
    return []
  }, [syncedLyrics, plainLyrics])

  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLButtonElement>(null)

  // Find index of the active line based on currentTime
  const activeIndex = useMemo(() => {
    if (lines.length === 0) return -1
    let lastIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i]?.time ?? 0) <= currentTime + 0.3) {
        lastIndex = i
      } else {
        break
      }
    }
    return lastIndex
  }, [lines, currentTime])

  // Smoothly scroll active line to center of container
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex])

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-xs text-text-light">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2.5">
          <Music2 size={20} />
        </div>
        <p className="font-semibold text-text text-sm">Letra da música</p>
        <p className="text-xs text-text-light/70 mt-1 max-w-xs">
          Nenhuma letra cadastrada para esta faixa ainda. Você pode adicionar ou buscar no modo de edição.
        </p>
      </div>
    )
  }

  const isSynced = Boolean(syncedLyrics && syncedLyrics.trim())

  return (
    <div
      ref={containerRef}
      className="relative w-full max-h-[280px] sm:max-h-[360px] overflow-y-auto px-3 sm:px-4 py-4 scroll-smooth space-y-3.5 no-scrollbar select-none overscroll-contain"
    >
      {lines.map((line, idx) => {
        const isActive = idx === activeIndex
        const isPast = idx < activeIndex
        const isFuture = idx > activeIndex

        return (
          <motion.button
            key={`lyric-line-${idx}-${line.time}`}
            ref={isActive ? activeLineRef : null}
            type="button"
            onClick={() => {
              if (isSynced) {
                onSeek(line.time)
              }
            }}
            initial={false}
            animate={{
              scale: isActive ? 1.03 : 1,
              opacity: isActive ? 1 : isPast ? 0.45 : isFuture ? 0.4 : 0.5,
            }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`group w-full text-left transition-all rounded-xl p-2 flex items-start gap-2.5 ${
              isActive
                ? 'bg-primary/10 border border-primary/25 shadow-xs text-primary font-bold'
                : 'text-text font-medium hover:bg-surface-raised hover:text-text cursor-pointer'
            }`}
          >
            {/* Indicador de linha ativa (Micro Dot) */}
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                isActive ? 'bg-primary scale-125' : 'bg-transparent'
              }`}
            />

            <span
              className={`min-w-0 flex-1 font-display text-sm sm:text-base md:text-lg leading-relaxed ${
                isActive
                  ? 'text-primary font-bold drop-shadow-xs'
                  : 'text-text/80'
              }`}
            >
              {line.text}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
