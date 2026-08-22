import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

  if (lines.length === 0) {
    return null
  }

  const isSynced = Boolean(syncedLyrics && syncedLyrics.trim())
  const targetIndex = activeIndex >= 0 ? activeIndex : 0

  const prevLine = targetIndex > 0 ? lines[targetIndex - 1] : null
  const currLine = lines[targetIndex] || null
  const nextLine = targetIndex < lines.length - 1 ? lines[targetIndex + 1] : null

  return (
    <div className="w-full flex flex-col items-center justify-center py-1.5 px-2 select-none">
      <div className="w-full max-w-sm space-y-1 text-center">
        {/* Linha Anterior (Contexto sutil) */}
        <div className="h-5 flex items-center justify-center overflow-hidden">
          {prevLine ? (
            <button
              type="button"
              onClick={() => isSynced && onSeek(prevLine.time)}
              className="text-[11px] sm:text-xs text-text-light/45 hover:text-text-light transition-colors truncate max-w-full cursor-pointer font-sans"
              title={prevLine.text}
            >
              {prevLine.text}
            </button>
          ) : (
            <span className="text-[11px] text-transparent select-none">&nbsp;</span>
          )}
        </div>

        {/* Linha Atual (Destaque Principal) */}
        <div className="min-h-[26px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {currLine ? (
              <motion.button
                key={`lyric-curr-${targetIndex}-${currLine.time}`}
                type="button"
                onClick={() => isSynced && onSeek(currLine.time)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="font-display text-xs sm:text-sm font-bold text-primary drop-shadow-xs truncate max-w-full cursor-pointer px-2 py-0.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
                title={currLine.text}
              >
                {currLine.text}
              </motion.button>
            ) : (
              <span className="text-xs text-text-light/40 italic">Tocando música...</span>
            )}
          </AnimatePresence>
        </div>

        {/* Linha Seguinte (Contexto sutil) */}
        <div className="h-5 flex items-center justify-center overflow-hidden">
          {nextLine ? (
            <button
              type="button"
              onClick={() => isSynced && onSeek(nextLine.time)}
              className="text-[11px] sm:text-xs text-text-light/45 hover:text-text-light transition-colors truncate max-w-full cursor-pointer font-sans"
              title={nextLine.text}
            >
              {nextLine.text}
            </button>
          ) : (
            <span className="text-[11px] text-transparent select-none">&nbsp;</span>
          )}
        </div>
      </div>
    </div>
  )
}
