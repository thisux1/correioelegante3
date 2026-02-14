import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window
    if (isTouchDevice) return

    function handleMouseMove(e: MouseEvent) {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      const target = e.target as HTMLElement
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer'
      setIsPointer(!!isClickable)
    }

    function handleMouseLeave() {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      <motion.div
        animate={{
          x: position.x - 4,
          y: position.y - 4,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 500 }}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />
      <motion.div
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="fixed top-0 left-0 w-10 h-10 border-2 border-primary/40 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />
    </>
  )
}
