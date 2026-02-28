import { useState, useEffect, type ReactNode } from 'react'
import { CustomCursor } from '@/components/animations/CustomCursor'
import { useAuthStore } from '@/store/authStore'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [showCursor, setShowCursor] = useState(false)
  const initAuth = useAuthStore((s) => s.initAuth)

  // Restore session from refresh cookie on app mount
  useEffect(() => {
    initAuth()
  }, [initAuth])

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
