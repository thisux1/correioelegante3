import { useEffect, useRef, useMemo } from 'react'
import { scheduleRenderer } from './animationScheduler'

/*
 * SiteAtmosphere — Global clouds + Canvas 2D twinkling stars
 *
 * PERFORMANCE STRATEGY:
 *   ✅ Stars rendered on Canvas 2D via shared RAF scheduler (was: N DOM elements)
 *   ✅ Sprite-based star rendering — pre-rendered offscreen canvas, reused via drawImage
 *   ✅ ctx.setTransform for per-particle transforms (avoids save/restore stack)
 *   ✅ Parallax applied to cloud DOM container (bgRef) AND canvas via canvas-space offset
 *   ✅ Clouds remain CSS DOM (complex SVG paths, few elements, GPU-composited)
 *   ✅ Single mousemove/gyroscope handler with JS lerp, no React state updates
 *   ✅ Canvas at 60% resolution on mobile, CSS-scaled to 100% (reduced fill-rate)
 *   ✅ Reduced particle counts on mobile: bg=10, fg=6
 */

// ── Seeded random ────────────────────────────────────────────────
function seededRandom(seed: number) {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

// ── Star particle data ───────────────────────────────────────────
interface StarParticle {
    x: number        // normalized viewport position 0..1
    y: number
    size: number     // star size in viewport pixels at 1x scale
    phase: number    // twinkle cycle phase offset (0..2π)
    speed: number    // twinkle cycles per second  (~2.5–6.5s per cycle)
    rotSpeed: number // rotation speed (rad/sec)
}

function generateStarParticles(count: number, seed: number, sizeMin: number, sizeMax: number): StarParticle[] {
    const rand = seededRandom(seed)
    return Array.from({ length: count }, () => ({
        x: rand() * 0.96 + 0.02,
        y: rand() * 0.96 + 0.02,
        size: sizeMin + rand() * (sizeMax - sizeMin),
        phase: rand() * Math.PI * 2,
        speed: 0.15 + rand() * 0.25,
        rotSpeed: 0.1 + rand() * 0.2,
    }))
}

// ── Star sprite pre-rendering ────────────────────────────────────
// Renders a 4-point star with a soft shadowBlur glow to an offscreen canvas once.
// shadowBlur avoids the premultiplied-alpha dark-fringe artifacts that radial gradients
// ending in rgba(0,0,0,0) produce on canvas. All per-frame draws reuse via drawImage.
const SPRITE_SIZE = 96  // large enough to contain the glow without clipping
const SPRITE_HALF = SPRITE_SIZE / 2

function createStarSprite(glowColor: string): HTMLCanvasElement {
    const sprite = document.createElement('canvas')
    sprite.width = SPRITE_SIZE
    sprite.height = SPRITE_SIZE
    const ctx = sprite.getContext('2d')!

    // Star shape: ~32% of sprite width, centered
    const starScale = (SPRITE_SIZE * 0.32) / 24  // original path viewBox is 24×24

    // shadowBlur provides clean anti-aliased glow — no dark fringe artifacts
    ctx.shadowBlur = SPRITE_SIZE * 0.28
    ctx.shadowColor = glowColor
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'

    ctx.save()
    ctx.translate(SPRITE_HALF, SPRITE_HALF)
    ctx.scale(starScale, starScale)
    ctx.translate(-12, -12)
    ctx.fill(new Path2D('M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z'))
    ctx.restore()

    return sprite
}

// Module-level singletons — created once, reused across re-renders
let _bgSprite: HTMLCanvasElement | null = null
let _fgSprite: HTMLCanvasElement | null = null
function getBgSprite() { return (_bgSprite ??= createStarSprite('rgba(255, 210, 230, 0.7)')) }
function getFgSprite() { return (_fgSprite ??= createStarSprite('rgba(255, 255, 255, 0.5)')) }

// ── Canvas setup ─────────────────────────────────────────────────
// Sets buffer resolution + display size WITHOUT overwriting z-index or other styles.
// cssText was wiping the React-set zIndex — use individual properties instead.
function initCanvas(canvas: HTMLCanvasElement, scale: number) {
    canvas.width = Math.round(window.innerWidth * scale)
    canvas.height = Math.round(window.innerHeight * scale)
    const s = canvas.style
    s.position = 'fixed'
    s.inset = '0'
    s.width = '100%'
    s.height = '100%'
    s.pointerEvents = 'none'
}

// ── Per-particle star render ─────────────────────────────────────
// Uses ctx.setTransform instead of save/restore to minimize state stack operations.
function renderStarParticle(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLCanvasElement,
    p: StarParticle,
    canvasW: number,
    canvasH: number,
    canvasScale: number,
    offsetX: number,
    offsetY: number,
    timeMs: number,
) {
    const cycle = ((timeMs / 1000 * p.speed + p.phase / (Math.PI * 2)) % 1 + 1) % 1
    // Twinkle envelope matching original CSS: fast rise → hold → slow fall
    const alpha = cycle < 0.15
        ? cycle / 0.15
        : cycle < 0.60
            ? 1
            : (1 - cycle) / 0.40
    if (alpha < 0.01) return

    const scaleV = 0.2 + 0.8 * alpha
    const rotation = cycle * (Math.PI / 2)
    const drawSize = p.size * canvasScale * scaleV
    const s = drawSize / SPRITE_SIZE
    const cos = Math.cos(rotation) * s
    const sin = Math.sin(rotation) * s

    ctx.globalAlpha = alpha
    ctx.setTransform(cos, sin, -sin, cos, offsetX + p.x * canvasW, offsetY + p.y * canvasH)
    ctx.drawImage(sprite, -SPRITE_HALF, -SPRITE_HALF)
}

// ── Cloud CSS (injected once) ────────────────────────────────────
const STYLES_ID = 'site-atmosphere-styles'
type DeviceOrientationCtor = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
}

function injectStyles() {
    if (document.getElementById(STYLES_ID)) return
    const style = document.createElement('style')
    style.id = STYLES_ID
    style.textContent = `
        @keyframes cloud-drift-1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(5vw,-8px)} }
        @keyframes cloud-drift-2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-6vw,-6px)} }
        @keyframes cloud-drift-3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8vw,-10px)} }
        @keyframes cloud-drift-4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-4vw,-5px)} }
        @keyframes cloud-drift-5 { 0%,100%{transform:translate(0,0)} 35%{transform:translate(3vw,-14px)} 70%{transform:translate(-3vw,-7px)} }
        @keyframes cloud-drift-6 { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(-7vw,-4px) rotate(0.3deg)} }
        .atm-cloud {
            position: absolute;
            pointer-events: none;
            color: rgba(255, 240, 245, 1);
        }
        .atm-cloud svg {
            width: 300px;
            filter: blur(0.5px);
        }
        @media (min-width: 768px) { .atm-cloud svg { width: 450px; } }
        @media (min-width: 1024px) { .atm-cloud svg { width: 550px; } }
    `
    document.head.appendChild(style)
}

// ── Cloud SVG data ───────────────────────────────────────────────
const CLOUD_PATHS = [
    'M280 90c22 0 40-16 40-36s-18-36-40-36c-4 0-8 .5-12 1.5C262 8 248 0 232 0c-20 0-36 12-42 30-4-2-8-2-12-2-26 0-48 18-48 40 0 1 0 2 .1 3H60c-33 0-60 20-60 42h320c0-13-16-23-40-23z',
    'M230 80c16 0 30-12 30-28s-14-28-30-28c-2 0-4 0-6 .5C220 10 206 0 190 0c-14 0-26 8-32 20-6-4-14-6-22-6-22 0-40 16-40 36 0 2 0 4 .5 6H40c-22 0-40 14-40 32h268c0-4-14-8-38-8z',
    'M170 64c16 0 30-11 30-25s-14-25-30-25c-3 0-6 .4-8 1C158 6 146 0 132 0c-12 0-22 6-28 16-4-2-10-4-16-4-18 0-32 13-32 30 0 1 0 3 .2 4H24c-14 0-24 8-24 18h194c0-2-10 0-24 0z',
]
const CLOUD_HIGHLIGHTS = [
    'M34 95c0-14 18-26 40-26 8 0 16 2 22 5 8-10 22-16 38-16 19 0 36 9 43 23 5-2 11-3 17-3 22 0 40 12 40 27H34z',
    'M20 92c0-10 12-18 28-18 5 0 10 1 15 3 5-8 16-13 29-13 14 0 26 7 32 18 4-1 8-2 12-2 18 0 32 10 32 22H20z',
    'M15 72c0-8 10-15 22-15 4 0 8 1 12 2.5 4-6 13-10 24-10 11 0 21 5 26 14 3-1 6-1.5 9-1.5 14 0 24 8 24 18H15z',
]
const CLOUD_VIEWBOXES = ['0 0 320 120', '0 0 260 100', '0 0 200 80']

interface CloudDef {
    path: number
    x: string; y: string
    opacity: number
    drift: string
    duration: number
    flip?: boolean
    scale?: number
    blur?: number
    highlight?: boolean
}

const CLOUDS: CloudDef[] = [
    { path: 0, x: '-3%',  y: '3%',  opacity: 0.35, drift: 'cloud-drift-1', duration: 50, scale: 1.1,  highlight: true },
    { path: 1, x: '65%',  y: '2%',  opacity: 0.30, drift: 'cloud-drift-2', duration: 65, flip: true },
    { path: 2, x: '30%',  y: '6%',  opacity: 0.25, drift: 'cloud-drift-3', duration: 55, scale: 0.7 },
    { path: 0, x: '-6%',  y: '18%', opacity: 0.30, drift: 'cloud-drift-4', duration: 60, flip: true,  highlight: true },
    { path: 1, x: '72%',  y: '22%', opacity: 0.28, drift: 'cloud-drift-1', duration: 70 },
    { path: 2, x: '3%',   y: '38%', opacity: 0.28, drift: 'cloud-drift-2', duration: 55, scale: 1.1 },
    { path: 0, x: '60%',  y: '42%', opacity: 0.25, drift: 'cloud-drift-3', duration: 65, flip: true,  scale: 0.8, highlight: true },
    { path: 1, x: '-8%',  y: '58%', opacity: 0.32, drift: 'cloud-drift-4', duration: 45, scale: 1.2,  highlight: true },
    { path: 2, x: '75%',  y: '62%', opacity: 0.28, drift: 'cloud-drift-1', duration: 55, flip: true },
    { path: 0, x: '8%',   y: '78%', opacity: 0.35, drift: 'cloud-drift-2', duration: 40, scale: 1.3,  highlight: true },
    { path: 1, x: '55%',  y: '82%', opacity: 0.30, drift: 'cloud-drift-3', duration: 50, flip: true },
    { path: 2, x: '-3%',  y: '92%', opacity: 0.28, drift: 'cloud-drift-4', duration: 60, scale: 0.9 },
    { path: 2, x: '48%',  y: '10%', opacity: 0.22, drift: 'cloud-drift-5', duration: 72, scale: 0.42 },
    { path: 1, x: '16%',  y: '30%', opacity: 0.20, drift: 'cloud-drift-6', duration: 78, scale: 0.48, flip: true },
    { path: 0, x: '-12%', y: '46%', opacity: 0.26, drift: 'cloud-drift-5', duration: 52, scale: 1.65, flip: true, blur: 1 },
    { path: 1, x: '50%',  y: '50%', opacity: 0.22, drift: 'cloud-drift-6', duration: 64, scale: 1.45 },
    { path: 2, x: '10%',  y: '68%', opacity: 0.18, drift: 'cloud-drift-1', duration: 90, scale: 1.85, blur: 2 },
    { path: 0, x: '38%',  y: '86%', opacity: 0.20, drift: 'cloud-drift-2', duration: 80, scale: 0.52, highlight: true },
]

const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

// ── Component ────────────────────────────────────────────────────
export function SiteAtmosphere() {
    const bgRef = useRef<HTMLDivElement>(null)           // cloud parallax container
    const bgStarCanvasRef = useRef<HTMLCanvasElement>(null)
    const fgStarCanvasRef = useRef<HTMLCanvasElement>(null)
    const isMobile = useMemo(() => getIsMobile(), [])

    const activeClouds = useMemo(() => isMobile ? CLOUDS.slice(0, 8) : CLOUDS, [isMobile])
    const bgParticles = useMemo(() => generateStarParticles(isMobile ? 10 : 18, 42, 14, 110), [isMobile])
    const fgParticles = useMemo(() => generateStarParticles(isMobile ? 6 : 12, 99, 8, 48), [isMobile])

    useEffect(() => { injectStyles() }, [])

    useEffect(() => {
        const bgCanvas = bgStarCanvasRef.current
        const fgCanvas = fgStarCanvasRef.current
        if (!bgCanvas || !fgCanvas) return

        const cScale = isMobile ? 0.6 : 1.0
        initCanvas(bgCanvas, cScale)
        initCanvas(fgCanvas, cScale)

        const bgCtx = bgCanvas.getContext('2d', { alpha: true })
        const fgCtx = fgCanvas.getContext('2d', { alpha: true })
        if (!bgCtx || !fgCtx) return

        const bgSprite = getBgSprite()
        const fgSprite = getFgSprite()

        // Parallax state
        let targetX = 0, targetY = 0
        let currentX = 0, currentY = 0
        const lerpFactor = isMobile ? 0.02 : 0.04
        const bgAmpX = isMobile ? 8 : 15
        const bgAmpY = isMobile ? 4 : 8
        const fgAmpX = isMobile ? 14 : 28
        const fgAmpY = isMobile ? 7 : 14

        let orientationBaseX: number | null = null
        let orientationBaseY: number | null = null
        const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

        const handleMove = (e: MouseEvent) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 2
            targetY = (e.clientY / window.innerHeight - 0.5) * 2
        }
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return
            if (orientationBaseX === null) orientationBaseX = e.gamma
            if (orientationBaseY === null) orientationBaseY = e.beta
            targetX = clamp((e.gamma - orientationBaseX) / 25, -1, 1)
            targetY = clamp((e.beta  - orientationBaseY) / 25, -1, 1)
        }

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        const hasOrientationSupport = typeof window.DeviceOrientationEvent !== 'undefined'
        let cleanupInput = () => {}

        if (isTouchDevice && hasOrientationSupport) {
            const orientationEvent = window.DeviceOrientationEvent as DeviceOrientationCtor
            if (typeof orientationEvent.requestPermission === 'function') {
                let permissionRequested = false
                const requestOrientation = () => {
                    if (permissionRequested) return
                    permissionRequested = true
                    orientationEvent.requestPermission!()
                        .then(perm => {
                            if (perm === 'granted')
                                window.addEventListener('deviceorientation', handleOrientation, { passive: true })
                        })
                        .catch((err: unknown) => console.error('Falha ao solicitar permissão do giroscópio', err))
                }
                window.addEventListener('touchstart', requestOrientation, { passive: true })
                cleanupInput = () => {
                    window.removeEventListener('touchstart', requestOrientation)
                    window.removeEventListener('deviceorientation', handleOrientation)
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientation, { passive: true })
                cleanupInput = () => window.removeEventListener('deviceorientation', handleOrientation)
            }
        } else {
            window.addEventListener('mousemove', handleMove, { passive: true })
            cleanupInput = () => window.removeEventListener('mousemove', handleMove)
        }

        // Debounced resize — re-init canvas dimensions (particles use normalized coords, no regen needed)
        let resizeTimer: ReturnType<typeof setTimeout> | null = null
        const handleResize = () => {
            if (resizeTimer !== null) clearTimeout(resizeTimer)
            resizeTimer = setTimeout(() => {
                initCanvas(bgCanvas, cScale)
                initCanvas(fgCanvas, cScale)
            }, 200)
        }
        window.addEventListener('resize', handleResize, { passive: true })

        // Single render function registered with the shared RAF scheduler
        const unschedule = scheduleRenderer((timeMs: number) => {
            currentX += (targetX - currentX) * lerpFactor
            currentY += (targetY - currentY) * lerpFactor

            // Clouds: CSS transform on container div
            if (bgRef.current) {
                bgRef.current.style.transform =
                    `translate(${currentX * bgAmpX}px, ${currentY * bgAmpY}px)`
            }

            const bw = bgCanvas.width, bh = bgCanvas.height
            const fw = fgCanvas.width, fh = fgCanvas.height
            // Convert viewport parallax offset → canvas-space pixels
            const bgOffX = currentX * bgAmpX * cScale
            const bgOffY = currentY * bgAmpY * cScale
            const fgOffX = currentX * fgAmpX * cScale
            const fgOffY = currentY * fgAmpY * cScale

            bgCtx.clearRect(0, 0, bw, bh)
            for (const p of bgParticles)
                renderStarParticle(bgCtx, bgSprite, p, bw, bh, cScale, bgOffX, bgOffY, timeMs)
            bgCtx.globalAlpha = 1
            bgCtx.setTransform(1, 0, 0, 1, 0, 0)

            fgCtx.clearRect(0, 0, fw, fh)
            for (const p of fgParticles)
                renderStarParticle(fgCtx, fgSprite, p, fw, fh, cScale, fgOffX, fgOffY, timeMs)
            fgCtx.globalAlpha = 1
            fgCtx.setTransform(1, 0, 0, 1, 0, 0)
        })

        return () => {
            unschedule()
            cleanupInput()
            window.removeEventListener('resize', handleResize)
            if (resizeTimer !== null) clearTimeout(resizeTimer)
        }
    }, [isMobile, bgParticles, fgParticles])

    return (
        <>
            {/* Canvas — background stars (z=2, above clouds, visible in hero) */}
            <canvas
                ref={bgStarCanvasRef}
                style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}
            />

            {/* Cloud layer — CSS-animated SVGs, parallax via bgRef transform */}
            <div
                ref={bgRef}
                className="fixed inset-0 overflow-hidden pointer-events-none"
                style={{ zIndex: 1 }}
            >
                {activeClouds.map((c, i) => (
                    <div
                        key={`c${i}`}
                        className="atm-cloud"
                        style={{
                            left: c.x,
                            top: c.y,
                            opacity: c.opacity,
                            transform: `scale(${c.scale ?? 1})${c.flip ? ' scaleX(-1)' : ''}`,
                        }}
                    >
                        <div
                            style={{
                                animation: `${c.drift} ${c.duration}s ease-in-out infinite`,
                                animationDelay: `${i * 2.5}s`,
                            }}
                        >
                            <svg
                                viewBox={CLOUD_VIEWBOXES[c.path]}
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                style={c.blur ? { filter: `blur(${c.blur}px)` } : undefined}
                            >
                                <path d={CLOUD_PATHS[c.path]} />
                                {c.highlight && (
                                    <path d={CLOUD_HIGHLIGHTS[c.path]} fill="rgba(255,255,255,0.30)" />
                                )}
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Canvas — foreground stars, above most content */}
            <canvas
                ref={fgStarCanvasRef}
                style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}
            />
        </>
    )
}
