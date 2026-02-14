import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionRevealProps {
  children: ReactNode
  className?: string
}

export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  return (
    <motion.div
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
