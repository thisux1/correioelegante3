import { useRef, RefObject } from 'react'
import { useScroll, useTransform, MotionValue } from 'framer-motion'

interface ParallaxOptions {
  offset?: [string, string]
  speed?: number
}

interface ParallaxResult {
  ref: RefObject<HTMLDivElement | null>
  y: MotionValue<number>
}

export function useParallax({ offset, speed = 0.5 }: ParallaxOptions = {}): ParallaxResult {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (offset as any) || ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100])

  return { ref, y }
}
