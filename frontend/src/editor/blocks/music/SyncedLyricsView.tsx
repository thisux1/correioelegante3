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
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-xs text-text-light/60">
        <Music2 size={24} className="mb-2 opacity-40" />
        <p>Letra da música não disponível para esta faixa.</p>
      </div>
    )
  }

  const isSynced = Boolean(syncedLyrics && syncedLyrics.trim())

  return (
    <div
      ref={containerRef}
      className="relative max-h-64 sm:max-h-80 overflow-y-auto px-4 py-6 scroll-smooth space-y-4 no-scrollbar select-none"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
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
              scale: isActive ? 1.04 : 1,
              opacity: isActive ? 1 : isPast ? 0.45 : isFuture ? 0.35 : 0.5,
              filter: isActive ? 'blur(0px)' : isFuture ? 'blur(0.5px)' : 'blur(0px)',
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`w-full text-left transition-colors font-display text-base sm:text-lg leading-relaxed ${
              isActive
                ? 'text-primary font-extrabold drop-shadow-sm cursor-pointer'
                : 'text-text font-medium hover:text-text hover:opacity-75 cursor-pointer'
            }`}
          >
            {line.text}
          </motion.button>
        )
      })}
    </div>
  )
}
