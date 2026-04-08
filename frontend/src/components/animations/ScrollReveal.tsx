import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

// Shared spring config for smooth scroll animations without Lenis
const springConfig = { stiffness: 140, damping: 30, restDelta: 0.005 }

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
  /** Use mount animation instead of scroll-driven (for hero / top-of-page elements) */
  animateOnMount?: boolean
  /**
   * Manual scroll keyframes: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
   * Each value is 0–1 representing scroll progress through the element.
   * Default: [0.05, 0.20, 0.85, 1.0]
   *
   * Examples:
   *   [0.0, 0.10, 0.90, 1.0]  → reveals earlier, stays visible longer
   *   [0.0, 0.05, 0.95, 1.0]  → very fast reveal, almost always visible
   *   [0.10, 0.35, 0.75, 0.95] → slower reveal and exit
   */
  scrollRange?: [number, number, number, number]
}

const directionOffsets: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 60 },
  down: { x: 0, y: -60 },
  left: { x: 60, y: 0 },
  right: { x: -60, y: 0 },
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  animateOnMount = false,
  scrollRange,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const offset = directionOffsets[direction]

  // ── Scroll-driven animation ──
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end 0.1'],
  })

  // Smooth scroll progress (replaces Lenis smoothing)
  const smoothProgress = useSpring(scrollYProgress, springConfig)

  // Default keyframes with optional delay offset
  const defaultFadeIn = 0.05 + delay * 0.05
  const defaultRange: [number, number, number, number] = [
    defaultFadeIn,
    defaultFadeIn + 0.12,
    0.88,
    0.98,
  ]
  const [fi, fie, fo, foe] = scrollRange ?? defaultRange

  const opacity = useTransform(smoothProgress, [fi, fie, fo, foe], [0, 1, 1, 0])
  const x = useTransform(smoothProgress, [fi, fie, fo, foe], [offset.x, 0, 0, -offset.x])
  const y = useTransform(smoothProgress, [fi, fie, fo, foe], [offset.y, 0, 0, -offset.y])

  // ── Mount animation (for hero / top-of-page) ──
  if (animateOnMount) {
    return (
      <motion.div
        initial={{ opacity: 0, x: offset.x, y: offset.y }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration: 0.65,
          delay,
          ease: 'easeIn',
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x, y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
