import React, { useRef, useEffect } from 'react'

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  maxTilt?: number
  perspective?: number
  scale?: number
  className?: string
  children: React.ReactNode
}

export function TiltCard({
  maxTilt = 7,
  perspective = 1000,
  scale = 1.02,
  className = '',
  children,
  style,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const isReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReducedMotion) return

    const isFinePointer =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches
    if (!isFinePointer) return

    let rafId: number | null = null
    let targetRotateX = 0
    let targetRotateY = 0
    let targetScale = 1
    let targetNormX = 0
    let targetNormY = 0

    let currentRotateX = 0
    let currentRotateY = 0
    let currentScale = 1
    let currentNormX = 0
    let currentNormY = 0

    let isHovering = false

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const render = () => {
      const factor = isHovering ? 0.14 : 0.08

      currentRotateX = lerp(currentRotateX, targetRotateX, factor)
      currentRotateY = lerp(currentRotateY, targetRotateY, factor)
      currentScale = lerp(currentScale, targetScale, factor)
      currentNormX = lerp(currentNormX, targetNormX, factor)
      currentNormY = lerp(currentNormY, targetNormY, factor)

      el.style.transform = `perspective(${perspective}px) rotateX(${currentRotateX.toFixed(
        2
      )}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(${currentScale.toFixed(
        3
      )}, ${currentScale.toFixed(3)}, 1)`
      el.style.setProperty('--tilt-x', currentNormX.toFixed(3))
      el.style.setProperty('--tilt-y', currentNormY.toFixed(3))

      const diff =
        Math.abs(targetRotateX - currentRotateX) +
        Math.abs(targetRotateY - currentRotateY) +
        Math.abs(targetScale - currentScale)

      if (isHovering || diff > 0.01) {
        rafId = requestAnimationFrame(render)
      } else {
        rafId = null
        if (!isHovering) {
          el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
          el.style.setProperty('--tilt-x', '0')
          el.style.setProperty('--tilt-y', '0')
        }
      }
    }

    const startLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(render)
      }
    }

    const handlePointerMove = (e: MouseEvent) => {
      isHovering = true
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const relativeX = e.clientX - rect.left
      const relativeY = e.clientY - rect.top

      el.style.setProperty('--spotlight-x', `${relativeX.toFixed(1)}px`)
      el.style.setProperty('--spotlight-y', `${relativeY.toFixed(1)}px`)

      const normX = (relativeX / rect.width - 0.5) * 2
      const normY = (relativeY / rect.height - 0.5) * 2

      targetNormX = Math.max(-1, Math.min(1, normX))
      targetNormY = Math.max(-1, Math.min(1, normY))

      targetRotateY = targetNormX * maxTilt
      targetRotateX = -targetNormY * maxTilt
      targetScale = scale

      startLoop()
    }

    const handlePointerLeave = () => {
      isHovering = false
      targetRotateX = 0
      targetRotateY = 0
      targetScale = 1
      targetNormX = 0
      targetNormY = 0
      startLoop()
    }

    el.addEventListener('mousemove', handlePointerMove, { passive: true })
    el.addEventListener('mouseleave', handlePointerLeave, { passive: true })

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      el.removeEventListener('mousemove', handlePointerMove)
      el.removeEventListener('mouseleave', handlePointerLeave)
    }
  }, [maxTilt, perspective, scale])

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`.trim()}
      style={{
        transformStyle: 'preserve-3d',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'geometricPrecision',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
