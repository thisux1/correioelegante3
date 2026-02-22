import { useState, useEffect, type RefObject } from 'react'

interface MousePosition {
  x: number
  y: number
  normalizedX: number
  normalizedY: number
}

export function useMousePosition(ref?: RefObject<HTMLElement | null>): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  })

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setPosition({
          x,
          y,
          normalizedX: (x / rect.width) * 2 - 1,
          normalizedY: (y / rect.height) * 2 - 1,
        })
      } else {
        setPosition({
          x: e.clientX,
          y: e.clientY,
          normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
          normalizedY: (e.clientY / window.innerHeight) * 2 - 1,
        })
      }
    }

    const target = ref?.current || window
    target.addEventListener('mousemove', handleMouseMove as EventListener)
    return () => target.removeEventListener('mousemove', handleMouseMove as EventListener)
  }, [ref])

  return position
}
