import { useRef, type RefObject } from 'react'
import { useScroll, useTransform, type MotionValue, type UseScrollOptions } from 'framer-motion'

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

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100])

  return { ref, y }
}
