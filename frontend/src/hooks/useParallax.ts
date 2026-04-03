import { useRef, type RefObject } from 'react'
import { useScroll, useSpring, useTransform, type MotionValue, type UseScrollOptions } from 'framer-motion'

// Shared spring config for smooth scroll animations without Lenis
const springConfig = { stiffness: 100, damping: 28, restDelta: 0.01 }

interface ParallaxOptions {
  offset?: UseScrollOptions['offset']
  speed?: number
}

interface ParallaxResult {
  ref: RefObject<HTMLDivElement | null>
  y: MotionValue<number>
}

export function useParallax({ offset, speed = 0.5 }: ParallaxOptions = {}): ParallaxResult {
  const ref = useRef<HTMLDivElement>(null)
  const resolvedOffset: NonNullable<UseScrollOptions['offset']> = offset ?? ['start end', 'end start']

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: resolvedOffset,
  })

  // Smooth scroll progress (replaces Lenis smoothing)
  const smoothProgress = useSpring(scrollYProgress, springConfig)

  const y = useTransform(smoothProgress, [0, 1], [speed * 100, speed * -100])

  return { ref, y }
}
