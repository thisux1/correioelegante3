import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

// Shared spring config for smooth scroll animations without Lenis
const springConfig = { stiffness: 140, damping: 30, restDelta: 0.005 }

interface TextSplitProps {
  text: string
  className?: string
  charClassName?: string
  delay?: number
  /** Use mount animation instead of scroll-driven (for hero / top-of-page elements) */
  animateOnMount?: boolean
}

export function TextSplit({ text, className = '', charClassName = '', delay = 0, animateOnMount = false }: TextSplitProps) {
  const ref = useRef<HTMLDivElement>(null)
  const words = text.split(' ')
  const totalChars = text.replace(/ /g, '').length

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end 0.1'],
  })

  // Smooth scroll progress (replaces Lenis smoothing)
  const smoothProgress = useSpring(scrollYProgress, springConfig)

  // ── Mount animation mode ──
  if (animateOnMount) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        className={`flex flex-wrap ${className}`}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-flex">
            {word.split('').map((char, charIndex) => {
              const globalIndex = words.slice(0, wordIndex).join('').length + charIndex
              return (
                <motion.span
                  key={charIndex}
                  variants={{
                    hidden: { y: 34, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                        transition: {
                          duration: 0.54,
                          delay: delay + globalIndex * 0.026,
                          ease: [0.22, 1, 0.36, 1],
                        },
                    },
                  }}
                  className={`inline-block ${charClassName}`}
                >
                  {char}
                </motion.span>
              )
            })}
          </span>
        ))}
      </motion.div>
    )
  }

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex">
          {word.split('').map((char, charIndex) => {
            const globalIndex = words.slice(0, wordIndex).join('').length + charIndex
            const charStart = 0.05 + delay * 0.03 + (globalIndex / totalChars) * 0.15
            const charEnd = charStart + 0.085
            const charFadeOut = 0.88 + ((totalChars - globalIndex) / totalChars) * 0.08
            const charGone = Math.min(charFadeOut + 0.08, 1)

            return (
              <TextSplitChar
                key={charIndex}
                char={char}
                smoothProgress={smoothProgress}
                fadeIn={charStart}
                fadeInEnd={charEnd}
                fadeOut={charFadeOut}
                fadeOutEnd={charGone}
                charClassName={charClassName}
              />
            )
          })}
        </span>
      ))}
    </div>
  )
}

function TextSplitChar({
  char,
  smoothProgress,
  fadeIn,
  fadeInEnd,
  fadeOut,
  fadeOutEnd,
  charClassName,
}: {
  char: string
  smoothProgress: MotionValue<number>
  fadeIn: number
  fadeInEnd: number
  fadeOut: number
  fadeOutEnd: number
  charClassName: string
}) {
  const opacity = useTransform(
    smoothProgress,
    [fadeIn, fadeInEnd, fadeOut, fadeOutEnd],
    [0, 1, 1, 0]
  )
  const y = useTransform(
    smoothProgress,
    [fadeIn, fadeInEnd, fadeOut, fadeOutEnd],
    [50, 0, 0, -50]
  )

  return (
    <motion.span
      style={{ opacity, y }}
      className={`inline-block ${charClassName}`}
    >
      {char}
    </motion.span>
  )
}
