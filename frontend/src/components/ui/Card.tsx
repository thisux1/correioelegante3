import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
}

export function Card({ children, className = '', glass = false, hover = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3 }}
      className={`
        rounded-2xl p-6 
        ${glass
          ? 'glass'
          : 'bg-white shadow-lg shadow-black/5 border border-gray-100'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
