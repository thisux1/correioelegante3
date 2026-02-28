import { useState, useEffect, type ReactNode } from 'react'
import { CustomCursor } from '@/components/animations/CustomCursor'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [showCursor, setShowCursor] = useState(false)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const handler = () => setShowCursor(true)
    window.addEventListener('mousemove', handler, { once: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <>
      {showCursor && <CustomCursor />}
      {children}
    </>
  )
}
