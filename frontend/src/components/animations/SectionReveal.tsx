import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

// Shared spring config for smooth scroll animations without Lenis
const springConfig = { stiffness: 140, damping: 30, restDelta: 0.005 }

interface SectionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /**
   * Manual scroll keyframes: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
   * Default: [0.05, 0.20, 0.85, 1.0]
   */
  scrollRange?: [number, number, number, number]
}

export function SectionReveal({ children, className = '', delay = 0, scrollRange }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end 0.1'],
  })

  // Smooth scroll progress (replaces Lenis smoothing)
  const smoothProgress = useSpring(scrollYProgress, springConfig)

  const defaultFadeIn = 0.05 + delay * 0.05
  const defaultRange: [number, number, number, number] = [
    defaultFadeIn,
    defaultFadeIn + 0.12,
    0.88,
    0.98,
  ]
  const [fi, fie, fo, foe] = scrollRange ?? defaultRange

  const opacity = useTransform(smoothProgress, [fi, fie, fo, foe], [0, 1, 1, 0])
  const y = useTransform(smoothProgress, [fi, fie, fo, foe], [50, 0, 0, -50])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
