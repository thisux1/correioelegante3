'use client'
import { type ReactNode, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ReactLenis, type LenisRef } from 'lenis/react'
import { cancelFrame, frame } from 'framer-motion'

interface SmoothScrollProps {
  children: ReactNode
}

function useSafeLocation() {
  try {
    return useLocation()
  } catch {
    return null
  }
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null)
  const location = useSafeLocation()
  const pathname = location?.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '')
  const isEditor = pathname.startsWith('/editor')

  useEffect(() => {
    if (isEditor) return

    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [isEditor])

  if (isEditor) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  )
}
