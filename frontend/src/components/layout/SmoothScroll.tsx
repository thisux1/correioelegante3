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
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  useEffect(() => {
    if (isEditor || isTouchDevice) return

    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [isEditor, isTouchDevice])

  if (isEditor || isTouchDevice) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: 1.8,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 1.15,
        touchMultiplier: 1,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  )
}
