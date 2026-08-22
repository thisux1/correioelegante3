import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Music,
  Stamp,
  Clock,
  Sparkles,
  QrCode,
  Headphones,
  Heart,
  Star,
} from 'lucide-react'

export interface TickerProps {
  items?: readonly string[]
  className?: string
  speed?: number
  onItemClick?: (item: string) => void
}

export const DEFAULT_TICKER_ITEMS = [
  'Cartas com Trilha Sonora',
  'Lacre de Cera 3D',
  'Linha do Tempo de Momentos',
  'Raspadinha de Segredos',
  'Entrega Instantânea via QR Code e Link',
  'Áudio Hi-Fi e Letras Sincronizadas',
] as const

function getItemIcon(item: string) {
  const norm = item.toLowerCase()
  if (norm.includes('trilha') || norm.includes('música') || norm.includes('som')) {
    return <Music className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
  }
  if (norm.includes('lacre') || norm.includes('cera')) {
    return <Stamp className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
  }
  if (norm.includes('tempo') || norm.includes('linha') || norm.includes('momentos')) {
    return <Clock className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
  }
  if (norm.includes('raspadinha') || norm.includes('segredos')) {
    return <Sparkles className="w-3.5 h-3.5 text-pink-400" aria-hidden="true" />
  }
  if (norm.includes('qr code') || norm.includes('link') || norm.includes('entrega')) {
    return <QrCode className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
  }
  if (norm.includes('áudio') || norm.includes('hi-fi') || norm.includes('sincronizadas')) {
    return <Headphones className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
  }
  return <Heart className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
}

export function Ticker({
  items = DEFAULT_TICKER_ITEMS,
  className = '',
  speed = 0.65,
  onItemClick,
}: TickerProps) {
  const ribbonRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const segmentRef = useRef<HTMLDivElement>(null)

  const [isDraggingState, setIsDraggingState] = useState(false)

  // Physics and Animation refs (fully decoupled from React render cycle)
  const posRef = useRef<number>(0)
  const speedRef = useRef<number>(speed)
  const segmentWidthRef = useRef<number>(0)
  const isHoveredRef = useRef<boolean>(false)
  const isDraggingRef = useRef<boolean>(false)
  const hasDraggedRef = useRef<boolean>(false)
  const dragStartXRef = useRef<number>(0)
  const lastPointerXRef = useRef<number>(0)
  const dragVelocityRef = useRef<number>(0)
  const rafIdRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

  // Measure segment width
  const updateSegmentWidth = useCallback(() => {
    if (segmentRef.current) {
      const width = segmentRef.current.getBoundingClientRect().width
      if (width > 0) {
        segmentWidthRef.current = width
      }
    }
  }, [])

  useEffect(() => {
    updateSegmentWidth()

    if (!segmentRef.current || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => {
      updateSegmentWidth()
    })
    resizeObserver.observe(segmentRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [items, updateSegmentWidth])

  // Pure 60fps/120fps hardware-accelerated RAF animation loop
  useEffect(() => {
    const isReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReducedMotion) {
      if (trackRef.current) {
        trackRef.current.style.transform = 'translate3d(0, 0, 0)'
      }
      return
    }

    lastFrameTimeRef.current = performance.now()

    const loop = (time: number) => {
      const dt = Math.min(Math.max(time - lastFrameTimeRef.current, 1), 40)
      lastFrameTimeRef.current = time
      const timeScale = dt / 16.667

      if (isDraggingRef.current) {
        // Dragging is actively handled via pointermove
      } else {
        // Inertia decay after drag release
        if (Math.abs(dragVelocityRef.current) > 0.05) {
          posRef.current += dragVelocityRef.current * timeScale
          dragVelocityRef.current *= Math.pow(0.9, timeScale)
        } else {
          dragVelocityRef.current = 0
        }

        const baseSpeed = speed
        const targetSpeed = isHoveredRef.current ? 0.12 : baseSpeed

        speedRef.current += (targetSpeed - speedRef.current) * (0.1 * timeScale)
        posRef.current -= speedRef.current * timeScale
      }

      // Seamless modular wrap-around
      const segWidth = segmentWidthRef.current
      if (segWidth > 0) {
        while (posRef.current <= -segWidth) {
          posRef.current += segWidth
        }
        while (posRef.current > 0) {
          posRef.current -= segWidth
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current.toFixed(2)}px, 0, 0)`
      }

      rafIdRef.current = requestAnimationFrame(loop)
    }

    rafIdRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [speed])

  // Mouse Drag handlers (restricted strictly to mouse to never block mobile touch scroll)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return

    isDraggingRef.current = true
    hasDraggedRef.current = false
    dragStartXRef.current = e.clientX
    lastPointerXRef.current = e.clientX
    dragVelocityRef.current = 0
    setIsDraggingState(true)

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    const deltaX = e.clientX - lastPointerXRef.current
    if (Math.abs(e.clientX - dragStartXRef.current) > 5) {
      hasDraggedRef.current = true
    }

    posRef.current += deltaX
    dragVelocityRef.current = deltaX
    lastPointerXRef.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDraggingState(false)

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // Ignore
    }
  }

  const handleItemClick = (e: React.MouseEvent, item: string) => {
    if (hasDraggedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    onItemClick?.(item)
  }

  // 4 identical segments to guarantee gapless ribbon on ultra-wide screens
  const segments = [0, 1, 2, 3]

  return (
    <div
      ref={ribbonRef}
      className={`relative z-20 w-full overflow-hidden bg-[#171615] text-[#f7f3eb] py-3 md:py-4 border-y border-white/10 select-none ${
        isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`.trim()}
      role="region"
      aria-label="Destaques e recursos do Correio Elegante"
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        isHoveredRef.current = true
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false
      }}
    >
      <div
        ref={trackRef}
        className="flex items-center w-max will-change-transform select-none"
      >
        {segments.map((segIdx) => (
          <div
            key={segIdx}
            ref={segIdx === 0 ? segmentRef : undefined}
            className="inline-flex items-center gap-4 md:gap-6 pr-4 md:pr-6 shrink-0 whitespace-nowrap"
            aria-hidden={segIdx > 0}
          >
            {items.map((item, itemIdx) => {
              const icon = getItemIcon(item)
              return (
                <React.Fragment key={`${item}-${segIdx}-${itemIdx}`}>
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-white/[0.06] border border-white/10 hover:border-[#db3b36]/80 hover:bg-[#db3b36]/15 text-[#f7f3eb] hover:text-white transition-all duration-200 shadow-xs hover:shadow-[0_0_16px_rgba(219,59,54,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#db3b36]"
                    onClick={(e) => handleItemClick(e, item)}
                    aria-label={item}
                    tabIndex={segIdx === 0 ? 0 : -1}
                  >
                    <span className="inline-flex items-center justify-center transition-transform group-hover:scale-110">
                      {icon}
                    </span>
                    <span className="font-mono text-xs md:text-sm font-medium tracking-wide uppercase">
                      {item}
                    </span>
                  </button>
                  <span
                    className="inline-flex items-center justify-center text-[#db3b36] transition-transform hover:scale-125"
                    aria-hidden="true"
                  >
                    <Star className="w-3 h-3 fill-[#db3b36] opacity-75" />
                  </span>
                </React.Fragment>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
