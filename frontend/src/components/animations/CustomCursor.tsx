import { useEffect, useRef } from 'react'
import quillSrc from '@/assets/quill-svgrepo-com.svg'

interface InkPoint {
  x: number
  y: number
  lineWidth: number
  age: number
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLImageElement>(null)
  const pointsRef = useRef<InkPoint[]>([])

  const lastPosRef = useRef({ x: 0, y: 0 })
  const isVisibleRef = useRef(false)
  const isTextRef = useRef(false)
  const isClickingRef = useRef(false)
  const rafRef = useRef<number>(0)
  const lastMoveTimeRef = useRef(0)
  const cursorRotationRef = useRef(0)
  const heartAnimRef = useRef({ t: 0, active: false, startPos: { x: 0, y: 0 } })
  const magneticTargetRef = useRef<DOMRect | null>(null)
  const isNoInkRef = useRef(false)
  const isCursorLightRef = useRef(false)
  const mousePosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return
    lastMoveTimeRef.current = Date.now()

    // Hide native cursor globally
    document.body.style.cursor = 'none'
    const styleEl = document.createElement('style')
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(styleEl)

    const canvas = canvasRef.current
    const cursorEl = cursorRef.current
    if (!canvas || !cursorEl) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Size the canvas to the viewport
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    // ── Mouse Handlers ──────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e

      // Show cursor on first move
      if (!isVisibleRef.current) {
        isVisibleRef.current = true
        cursorEl.style.opacity = '1'
        canvas.style.opacity = '1'
      }

      // Reset idle timer
      lastMoveTimeRef.current = Date.now()

      // If resuming from idle animation, reset position without drawing a line
      if (heartAnimRef.current.active) {
        heartAnimRef.current.active = false
        lastPosRef.current = { x, y }
        cursorEl.style.transform = `translate(${x}px, ${y - 28}px) rotate(0deg)`
      }

      // Always track raw mouse position for magnetic lerp
      mousePosRef.current = { x, y }

      // ── Detect magnetic targets & Ink blockers ──
      const target = e.target as HTMLElement

      // Magnetic Buttons
      const magneticBtn = target.closest('[data-magnetic-target="true"]')
      if (magneticBtn) {
        magneticTargetRef.current = magneticBtn.getBoundingClientRect()
      } else {
        magneticTargetRef.current = null
      }

      // Cursor light areas (e.g. CTA gradient section)
      const lightArea = target.closest('[data-cursor-light="true"]')
      isCursorLightRef.current = !!lightArea

      // No-Ink Areas (text inputs OR data-no-ink containers)
      const noInkArea = target.closest('[data-no-ink="true"]')
      const textInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        window.getComputedStyle(target).cursor === 'text'

      isTextRef.current = !!textInput
      isNoInkRef.current = !!(textInput || noInkArea || magneticBtn)

      // Hide cursor element if over text input
      cursorEl.style.opacity = textInput ? '0' : '1'

      // We ONLY update lastPos/draw line if NOT magnetic
      if (!magneticTargetRef.current) {
        // Position the quill image directly (instant, no lerp)
        cursorRotationRef.current = 0
        cursorEl.style.transform = `translate(${x}px, ${y - 28}px) rotate(0deg)`

        // Only add ink when allowed
        if (!isNoInkRef.current) {
          const dx = x - lastPosRef.current.x
          const dy = y - lastPosRef.current.y
          const speed = Math.hypot(dx, dy)

          // Pressure formula: slow → thin, fast → thick
          const lineWidth = Math.min(8, 2 + speed * 0.15)

          // Interpolate to avoid gaps
          const dist = Math.hypot(dx, dy)
          const steps = Math.max(1, Math.ceil(dist / 2))
          for (let i = 0; i < steps; i++) {
            const t = i / steps
            pointsRef.current.push({
              x: lastPosRef.current.x + dx * t,
              y: lastPosRef.current.y + dy * t,
              lineWidth,
              age: 0,
            })
          }
        }

        // Always update mouse tracking
        lastPosRef.current = { x, y }
      }
    }

    const onDown = () => {
      isClickingRef.current = true
      // Click rotation animation
      const pos = lastPosRef.current
      cursorRotationRef.current = -12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.x}px, ${pos.y - 28}px) rotate(-12deg)`
      }
    }

    const onUp = () => {
      isClickingRef.current = false
      // Reset rotation
      const pos = lastPosRef.current
      cursorRotationRef.current = 0
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.x}px, ${pos.y - 28}px) rotate(0deg)`
      }
    }

    const onLeave = () => {
      isVisibleRef.current = false
      if (cursorEl) cursorEl.style.opacity = '0'
      if (canvas) canvas.style.opacity = '0'
    }

    // ── Render Loop ─────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ─── Ink Trail (pink / primary with opacity) ──────────────
      const maxAge = 60
      const pts = pointsRef.current
      for (let i = pts.length - 1; i >= 0; i--) {
        pts[i].age++
        if (pts[i].age > maxAge) {
          pts.splice(i, 1)
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const opacity = (1 - p.age / maxAge) * 0.6 // Max 60% opacity
        const radius = p.lineWidth / 2

        ctx.beginPath()
        // Primary color: #e11d48 = rgb(225, 29, 72)
        ctx.fillStyle = `rgba(225, 29, 72, ${opacity})`
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ─── Idle Heart Drawing ───────────────────────────────────
      const timeSinceMove = Date.now() - lastMoveTimeRef.current

      if (timeSinceMove > 2000 && isVisibleRef.current && !isTextRef.current) {
        if (!heartAnimRef.current.active) {
          heartAnimRef.current.active = true
          heartAnimRef.current.t = 0
          heartAnimRef.current.startPos = { ...lastPosRef.current }
        }

        const { startPos } = heartAnimRef.current
        const scale = 4
        const speed = 0.02

        heartAnimRef.current.t += speed
        const t = heartAnimRef.current.t

        // Parametric heart curve
        const hx = 16 * Math.pow(Math.sin(t), 3)
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        )

        // Offset: y starts at -5 at t=0
        const x = startPos.x + hx * scale
        const y = startPos.y + (hy + 5) * scale

        if (t <= Math.PI * 2) {
          // Move cursor
          if (cursorEl) {
            cursorEl.style.transform = `translate(${x}px, ${y - 28}px) rotate(0deg)`
          }

          // Add ink point
          pointsRef.current.push({
            x,
            y,
            lineWidth: 3,
            age: 0,
          })

          // Update lastPos so tracking remains continuous
          lastPosRef.current = { x, y }
        } else {
          // Loop animation
          heartAnimRef.current.t = 0
        }
      } else {
        heartAnimRef.current.active = false
      }

      // ─── Magnetic Attraction (subtle pull) ─────────────────────
      if (magneticTargetRef.current && cursorEl) {
        const rect = magneticTargetRef.current
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const mx = mousePosRef.current.x
        const my = mousePosRef.current.y

        // Subtle pull: blend 30% toward button center, 70% follows mouse
        const pullStrength = 0.3
        const visualX = mx + (centerX - mx) * pullStrength
        const visualY = my + (centerY - my) * pullStrength

        cursorEl.style.transition = 'none'
        cursorEl.style.transform = `translate(${visualX}px, ${visualY - 28}px) rotate(0deg)`
      }

      // ─── Cursor color on light backgrounds ─────────────────────
      if (cursorEl) {
        cursorEl.style.filter = isCursorLightRef.current
          ? 'brightness(0) invert(1) opacity(0.92)'
          : 'none'
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    // ── Attach ──────────────────────────────────────────────────
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafRef.current)
      document.body.style.cursor = ''
      styleEl.remove()
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{ opacity: 0 }}
      />
      <img
        ref={cursorRef}
        src={quillSrc}
        alt=""
        draggable={false}
        className="fixed top-0 left-0 w-7 h-7 pointer-events-none z-[9999] drop-shadow-md"
        style={{ opacity: 0, willChange: 'transform' }}
      />
    </>
  )
}
