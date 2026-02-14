import { motion } from 'framer-motion'

interface TextSplitProps {
  text: string
  className?: string
  charClassName?: string
  delay?: number
}

export function TextSplit({ text, className = '', charClassName = '', delay = 0 }: TextSplitProps) {
  const words = text.split(' ')

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`flex flex-wrap ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split('').map((char, charIndex) => {
            const globalIndex = words.slice(0, wordIndex).join(' ').length + charIndex
            return (
              <motion.span
                key={charIndex}
                variants={{
                  hidden: { y: 50, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: delay + globalIndex * 0.03,
                      ease: [0.19, 1, 0.22, 1],
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
