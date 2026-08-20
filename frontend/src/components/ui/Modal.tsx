import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}

export function Modal({ isOpen, onClose, children, title, className = '' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClose()
              }
            }}
          >
            <div className={`relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-rose-100/80 ring-1 ring-black/5 text-text ${className}`}>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-text-light hover:bg-black/10 hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
              {title && (
                <h2 className="font-display text-2xl font-bold text-text mb-6 pr-8">
                  {title}
                </h2>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
