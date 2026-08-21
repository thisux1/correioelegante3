import { useEffect, useRef } from 'react'
import type { AtmosphereType } from '@/editor/themes'

export interface AtmosphereCanvasProps {
  atmosphere?: AtmosphereType
  className?: string
  style?: React.CSSProperties
  position?: 'fixed' | 'absolute'
  particleCount?: number
  intensity?: number
  disabled?: boolean
}

// ── Shared Types ──────────────────────────────────────────────────
interface BaseParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  maxAlpha: number
  phase: number
  speed: number
}

interface PetalParticle extends BaseParticle {
  swayDist: number
  swaySpeed: number
  rotX: number
  rotSpeedX: number
  rotZ: number
  rotSpeedZ: number
  color: string
}

interface StarParticle extends BaseParticle {
  isMajor: boolean
  color: string
  twinkleSpeed: number
}

interface SparkleParticle extends BaseParticle {
  glintAngle: number
  glintSpeed: number
  color: string
  glowSize: number
}

interface HeartParticle extends BaseParticle {
  swayDist: number
  swaySpeed: number
  pulseSpeed: number
  color: string
  rotZ: number
}

interface SakuraParticle extends BaseParticle {
  flutter: number
  flutterSpeed: number
  rotZ: number
  rotSpeedZ: number
  color: string
}

interface FireflyParticle extends BaseParticle {
  targetVx: number
  targetVy: number
  glowRadius: number
  color: string
  coreColor: string
}

interface Comet {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  length: number
  alpha: number
  maxAlpha: number
}

// ── Helper Math Functions ─────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Particle Generators ───────────────────────────────────────────
const PETAL_COLORS = [
  '#be123c', // rose-700
  '#e11d48', // rose-600
  '#f43f5e', // rose-500
  '#fb7185', // rose-400
  '#9f1239', // rose-800
]

function createPetal(w: number, h: number, isInitial = false): PetalParticle {
  return {
    x: rand(0, w),
    y: isInitial ? rand(-h * 0.2, h) : rand(-50, -10),
    vx: rand(-0.4, 0.4),
    vy: rand(0.9, 2.2),
    size: rand(10, 20),
    alpha: rand(0.5, 0.85),
    maxAlpha: rand(0.65, 0.9),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.5, 1.5),
    swayDist: rand(15, 35),
    swaySpeed: rand(0.015, 0.035),
    rotX: rand(0, Math.PI * 2),
    rotSpeedX: rand(0.02, 0.05),
    rotZ: rand(-Math.PI, Math.PI),
    rotSpeedZ: rand(-0.02, 0.02),
    color: randChoice(PETAL_COLORS),
  }
}

const STAR_COLORS = ['#ffffff', '#f8fafc', '#e0e7ff', '#fef08a', '#fbcfe8']

function createStar(w: number, h: number): StarParticle {
  const isMajor = Math.random() < 0.22
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx: 0,
    vy: 0,
    size: isMajor ? rand(2.2, 4.2) : rand(1.0, 2.0),
    alpha: rand(0.2, 0.8),
    maxAlpha: isMajor ? rand(0.75, 1.0) : rand(0.4, 0.8),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.8, 2.2),
    twinkleSpeed: rand(0.02, 0.05),
    isMajor,
    color: randChoice(STAR_COLORS),
  }
}

const SPARKLE_COLORS = ['#fbbf24', '#f59e0b', '#fde047', '#ffffff', '#fed7aa']

function createSparkle(w: number, h: number, isInitial = false): SparkleParticle {
  return {
    x: rand(0, w),
    y: isInitial ? rand(0, h) : rand(h, h + 20),
    vx: rand(-0.3, 0.3),
    vy: rand(-0.4, -1.2),
    size: rand(2.5, 5.5),
    alpha: rand(0.1, 0.7),
    maxAlpha: rand(0.6, 0.95),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.6, 1.8),
    glintAngle: rand(0, Math.PI),
    glintSpeed: rand(0.01, 0.04),
    color: randChoice(SPARKLE_COLORS),
    glowSize: rand(6, 14),
  }
}

const HEART_COLORS = ['#f43f5e', '#fb7185', '#ec4899', '#f472b6', '#fda4af']

function createHeart(w: number, h: number, isInitial = false): HeartParticle {
  return {
    x: rand(0, w),
    y: isInitial ? rand(0, h) : rand(h + 10, h + 50),
    vx: rand(-0.2, 0.2),
    vy: rand(-0.6, -1.6),
    size: rand(10, 22),
    alpha: rand(0.3, 0.7),
    maxAlpha: rand(0.5, 0.85),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.8, 1.6),
    swayDist: rand(12, 30),
    swaySpeed: rand(0.015, 0.035),
    pulseSpeed: rand(0.02, 0.05),
    rotZ: rand(-0.2, 0.2),
    color: randChoice(HEART_COLORS),
  }
}

const SAKURA_COLORS = ['#fbcfe8', '#f472b6', '#fda4af', '#fce7f3', '#ffffff']

function createSakura(w: number, h: number, isInitial = false): SakuraParticle {
  return {
    x: isInitial ? rand(-50, w) : rand(-50, 0),
    y: isInitial ? rand(0, h) : rand(-40, h * 0.7),
    vx: rand(1.2, 2.6),
    vy: rand(0.7, 1.8),
    size: rand(10, 18),
    alpha: rand(0.4, 0.8),
    maxAlpha: rand(0.65, 0.9),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.6, 1.4),
    flutter: rand(0, Math.PI * 2),
    flutterSpeed: rand(0.025, 0.06),
    rotZ: rand(0, Math.PI * 2),
    rotSpeedZ: rand(0.01, 0.03),
    color: randChoice(SAKURA_COLORS),
  }
}

const FIREFLY_COLORS = [
  { core: '#ffffff', glow: 'rgba(250, 204, 21, ' },  // yellow
  { core: '#fffbeb', glow: 'rgba(251, 146, 60, ' },  // orange-amber
  { core: '#f0fdf4', glow: 'rgba(163, 230, 53, ' },  // warm lime
]

function createFirefly(w: number, h: number): FireflyParticle {
  const chosen = randChoice(FIREFLY_COLORS)
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx: rand(-0.4, 0.4),
    vy: rand(-0.4, 0.4),
    targetVx: rand(-0.5, 0.5),
    targetVy: rand(-0.5, 0.5),
    size: rand(2.5, 4.5),
    alpha: rand(0.1, 0.8),
    maxAlpha: rand(0.6, 0.95),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.8, 1.8),
    glowRadius: rand(14, 28),
    color: chosen.glow,
    coreColor: chosen.core,
  }
}

// ── Particle Drawing Routines ─────────────────────────────────────
function drawPetal(ctx: CanvasRenderingContext2D, p: PetalParticle) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotZ)
  // Simulate 3D tumbling via X scale
  const scaleX = Math.cos(p.rotX)
  ctx.scale(scaleX, 1)

  ctx.globalAlpha = p.alpha
  ctx.fillStyle = p.color

  ctx.beginPath()
  const s = p.size
  ctx.moveTo(0, -s)
  ctx.bezierCurveTo(s * 0.9, -s * 0.7, s * 1.1, s * 0.4, 0, s)
  ctx.bezierCurveTo(-s * 1.1, s * 0.4, -s * 0.9, -s * 0.7, 0, -s)
  ctx.fill()

  // Gentle center vein highlight
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 0.8
  ctx.moveTo(0, -s * 0.7)
  ctx.lineTo(0, s * 0.6)
  ctx.stroke()

  ctx.restore()
}

function drawStar(ctx: CanvasRenderingContext2D, p: StarParticle) {
  ctx.save()
  ctx.globalAlpha = p.alpha

  if (p.isMajor) {
    const s = p.size
    // 4-point diamond sparkle
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.moveTo(p.x, p.y - s * 2.2)
    ctx.quadraticCurveTo(p.x + s * 0.3, p.y, p.x + s * 2.2, p.y)
    ctx.quadraticCurveTo(p.x + s * 0.3, p.y, p.x, p.y + s * 2.2)
    ctx.quadraticCurveTo(p.x - s * 0.3, p.y, p.x - s * 2.2, p.y)
    ctx.quadraticCurveTo(p.x - s * 0.3, p.y, p.x, p.y - s * 2.2)
    ctx.fill()

    // Soft center core
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(p.x, p.y, s * 0.6, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawComet(ctx: CanvasRenderingContext2D, comet: Comet) {
  if (!comet.active) return

  ctx.save()
  ctx.globalAlpha = comet.alpha

  const endX = comet.x - comet.vx * (comet.length / Math.hypot(comet.vx, comet.vy))
  const endY = comet.y - comet.vy * (comet.length / Math.hypot(comet.vx, comet.vy))

  const grad = ctx.createLinearGradient(comet.x, comet.y, endX, endY)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  grad.addColorStop(0.3, 'rgba(165, 243, 252, 0.6)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.strokeStyle = grad
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(comet.x, comet.y)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // Head glow
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(comet.x, comet.y, 2.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawSparkle(ctx: CanvasRenderingContext2D, p: SparkleParticle) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.glintAngle)
  ctx.globalAlpha = p.alpha

  const s = p.size

  // Soft ambient glow
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.glowSize)
  glowGrad.addColorStop(0, 'rgba(253, 224, 71, 0.4)')
  glowGrad.addColorStop(1, 'rgba(253, 224, 71, 0)')
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(0, 0, p.glowSize, 0, Math.PI * 2)
  ctx.fill()

  // Cross glint
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -s * 2)
  ctx.quadraticCurveTo(s * 0.2, 0, s * 2, 0)
  ctx.quadraticCurveTo(s * 0.2, 0, 0, s * 2)
  ctx.quadraticCurveTo(-s * 0.2, 0, -s * 2, 0)
  ctx.quadraticCurveTo(-s * 0.2, 0, 0, -s * 2)
  ctx.fill()

  ctx.restore()
}

function drawHeart(ctx: CanvasRenderingContext2D, p: HeartParticle) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotZ)

  // Subtle heartbeat pulse
  const pulseScale = 1 + 0.15 * Math.sin(p.phase)
  ctx.scale(pulseScale, pulseScale)

  ctx.globalAlpha = p.alpha
  ctx.fillStyle = p.color

  const s = p.size
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.3)
  ctx.bezierCurveTo(-s * 0.6, -s * 0.85, -s * 1.1, -s * 0.1, 0, s * 0.85)
  ctx.bezierCurveTo(s * 1.1, -s * 0.1, s * 0.6, -s * 0.85, 0, -s * 0.3)
  ctx.fill()

  ctx.restore()
}

function drawSakura(ctx: CanvasRenderingContext2D, p: SakuraParticle) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotZ)

  const scaleX = Math.cos(p.flutter)
  ctx.scale(scaleX, 1)

  ctx.globalAlpha = p.alpha
  ctx.fillStyle = p.color

  const s = p.size
  ctx.beginPath()
  ctx.moveTo(0, -s)
  // Notched petal apex
  ctx.bezierCurveTo(s * 0.5, -s * 0.9, s * 0.9, -s * 0.4, s * 0.7, s * 0.3)
  ctx.bezierCurveTo(s * 0.5, s * 0.8, 0, s, 0, s)
  ctx.bezierCurveTo(0, s, -s * 0.5, s * 0.8, -s * 0.7, s * 0.3)
  ctx.bezierCurveTo(-s * 0.9, -s * 0.4, -s * 0.5, -s * 0.9, 0, -s)
  ctx.fill()

  ctx.restore()
}

function drawFirefly(ctx: CanvasRenderingContext2D, p: FireflyParticle) {
  ctx.save()
  ctx.globalAlpha = p.alpha

  // Ambient radial glow
  const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius)
  glowGrad.addColorStop(0, `${p.color}${Math.min(1, p.alpha * 1.2)})`)
  glowGrad.addColorStop(0.4, `${p.color}${p.alpha * 0.5})`)
  glowGrad.addColorStop(1, `${p.color}0)`)

  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2)
  ctx.fill()

  // Bright core
  ctx.fillStyle = p.coreColor
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function AtmosphereCanvas({
  atmosphere = 'none',
  className = '',
  style,
  position = 'fixed',
  particleCount,
  intensity = 1.0,
  disabled = false,
}: AtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (disabled || atmosphere === 'none' || typeof window === 'undefined') {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let animationFrameId: number | null = null
    let isVisible = true
    let lastTime = performance.now()

    // Determine particle count based on screen width & override
    const updateSize = () => {
      if (!canvas) return
      const parent = position === 'absolute' ? canvas.parentElement : null
      const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight }

      width = Math.max(rect.width, 100)
      height = Math.max(rect.height, 100)
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    updateSize()

    const isMobile = width < 768
    const baseCount = particleCount ?? (
      atmosphere === 'stars'
        ? (isMobile ? 35 : 70)
        : atmosphere === 'petals'
        ? (isMobile ? 16 : 28)
        : atmosphere === 'sparkles'
        ? (isMobile ? 22 : 42)
        : atmosphere === 'hearts'
        ? (isMobile ? 14 : 24)
        : atmosphere === 'sakura'
        ? (isMobile ? 18 : 32)
        : atmosphere === 'fireflies'
        ? (isMobile ? 12 : 20)
        : 20
    )
    const effectiveCount = Math.round(baseCount * Math.max(0.2, Math.min(2.0, intensity)))

    // Initialize particles
    const particles: (PetalParticle | StarParticle | SparkleParticle | HeartParticle | SakuraParticle | FireflyParticle)[] = []
    for (let i = 0; i < effectiveCount; i++) {
      if (atmosphere === 'petals') particles.push(createPetal(width, height, true))
      else if (atmosphere === 'stars') particles.push(createStar(width, height))
      else if (atmosphere === 'sparkles') particles.push(createSparkle(width, height, true))
      else if (atmosphere === 'hearts') particles.push(createHeart(width, height, true))
      else if (atmosphere === 'sakura') particles.push(createSakura(width, height, true))
      else if (atmosphere === 'fireflies') particles.push(createFirefly(width, height))
    }

    // Occasional shooting comet for stars
    const comet: Comet = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      length: 80,
      alpha: 0,
      maxAlpha: 0.9,
    }
    let nextCometTime = performance.now() + rand(4000, 9000)

    // Render loop
    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const dt = Math.min((time - lastTime) / 16.666, 3.0) // normalized ~1 frame step
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      // When reduced motion is preferred, render static gentle particles once
      if (prefersReducedMotion) {
        for (const p of particles) {
          if (atmosphere === 'petals') drawPetal(ctx, p as PetalParticle)
          else if (atmosphere === 'stars') drawStar(ctx, p as StarParticle)
          else if (atmosphere === 'sparkles') drawSparkle(ctx, p as SparkleParticle)
          else if (atmosphere === 'hearts') drawHeart(ctx, p as HeartParticle)
          else if (atmosphere === 'sakura') drawSakura(ctx, p as SakuraParticle)
          else if (atmosphere === 'fireflies') drawFirefly(ctx, p as FireflyParticle)
        }
        return
      }

      // Handle comet for stars atmosphere
      if (atmosphere === 'stars') {
        if (!comet.active && time > nextCometTime) {
          comet.active = true
          comet.x = rand(width * 0.1, width * 0.8)
          comet.y = rand(0, height * 0.4)
          const angle = rand(Math.PI * 0.15, Math.PI * 0.35)
          const speed = rand(8, 14)
          comet.vx = Math.cos(angle) * speed
          comet.vy = Math.sin(angle) * speed
          comet.length = rand(60, 110)
          comet.alpha = 0
          nextCometTime = time + rand(6000, 14000)
        }

        if (comet.active) {
          comet.x += comet.vx * dt
          comet.y += comet.vy * dt
          if (comet.alpha < comet.maxAlpha) comet.alpha = Math.min(comet.maxAlpha, comet.alpha + 0.08 * dt)

          drawComet(ctx, comet)

          if (comet.x > width + 100 || comet.y > height + 100) {
            comet.active = false
          }
        }
      }

      // Update and draw each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (atmosphere === 'petals') {
          const petal = p as PetalParticle
          petal.phase += petal.swaySpeed * dt
          petal.x += (petal.vx + Math.sin(petal.phase) * 0.8) * dt
          petal.y += petal.vy * dt
          petal.rotX += petal.rotSpeedX * dt
          petal.rotZ += petal.rotSpeedZ * dt

          // Reset if below bottom
          if (petal.y > height + 30 || petal.x < -40 || petal.x > width + 40) {
            particles[i] = createPetal(width, height, false)
          } else {
            drawPetal(ctx, petal)
          }
        } else if (atmosphere === 'stars') {
          const star = p as StarParticle
          star.phase += star.twinkleSpeed * dt
          // Twinkle pulse
          star.alpha = 0.2 + (star.maxAlpha - 0.2) * ((Math.sin(star.phase) + 1) / 2)
          drawStar(ctx, star)
        } else if (atmosphere === 'sparkles') {
          const sparkle = p as SparkleParticle
          sparkle.phase += 0.03 * dt
          sparkle.glintAngle += sparkle.glintSpeed * dt
          sparkle.y += sparkle.vy * dt
          sparkle.x += (sparkle.vx + Math.sin(sparkle.phase) * 0.3) * dt
          sparkle.alpha = 0.15 + (sparkle.maxAlpha - 0.15) * ((Math.sin(sparkle.phase * 2) + 1) / 2)

          if (sparkle.y < -30 || sparkle.x < -30 || sparkle.x > width + 30) {
            particles[i] = createSparkle(width, height, false)
          } else {
            drawSparkle(ctx, sparkle)
          }
        } else if (atmosphere === 'hearts') {
          const heart = p as HeartParticle
          heart.phase += heart.swaySpeed * dt
          heart.y += heart.vy * dt
          heart.x += (heart.vx + Math.sin(heart.phase) * 0.7) * dt
          heart.rotZ = Math.sin(heart.phase) * 0.2

          if (heart.y < -40 || heart.x < -40 || heart.x > width + 40) {
            particles[i] = createHeart(width, height, false)
          } else {
            drawHeart(ctx, heart)
          }
        } else if (atmosphere === 'sakura') {
          const sakura = p as SakuraParticle
          sakura.flutter += sakura.flutterSpeed * dt
          sakura.rotZ += sakura.rotSpeedZ * dt
          sakura.x += sakura.vx * dt
          sakura.y += (sakura.vy + Math.sin(sakura.flutter) * 0.5) * dt

          if (sakura.x > width + 40 || sakura.y > height + 40) {
            particles[i] = createSakura(width, height, false)
          } else {
            drawSakura(ctx, sakura)
          }
        } else if (atmosphere === 'fireflies') {
          const firefly = p as FireflyParticle
          firefly.phase += 0.025 * dt
          firefly.alpha = 0.1 + (firefly.maxAlpha - 0.1) * ((Math.sin(firefly.phase) + 1) / 2)

          // Smooth wandering steering
          if (Math.random() < 0.03) {
            firefly.targetVx = rand(-0.7, 0.7)
            firefly.targetVy = rand(-0.7, 0.7)
          }
          firefly.vx += (firefly.targetVx - firefly.vx) * 0.05 * dt
          firefly.vy += (firefly.targetVy - firefly.vy) * 0.05 * dt
          firefly.x += firefly.vx * dt
          firefly.y += firefly.vy * dt

          // Screen boundaries wrap
          if (firefly.x < -20) firefly.x = width + 20
          if (firefly.x > width + 20) firefly.x = -20
          if (firefly.y < -20) firefly.y = height + 20
          if (firefly.y > height + 20) firefly.y = -20

          drawFirefly(ctx, firefly)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    // Visibility change listener
    const handleVisibilityChange = () => {
      isVisible = !document.hidden
      if (isVisible) {
        lastTime = performance.now()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Resize observer or window listener
    const resizeObserver = new ResizeObserver(() => {
      updateSize()
    })

    if (position === 'absolute' && canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    } else {
      window.addEventListener('resize', updateSize)
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (position === 'absolute') {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', updateSize)
      }
    }
  }, [atmosphere, disabled, intensity, particleCount, position])

  if (atmosphere === 'none' || disabled) {
    return null
  }

  const basePositionClass =
    position === 'fixed'
      ? 'fixed inset-0 z-0'
      : 'absolute inset-0 z-0'

  return (
    <canvas
      ref={canvasRef}
      className={`${basePositionClass} pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
