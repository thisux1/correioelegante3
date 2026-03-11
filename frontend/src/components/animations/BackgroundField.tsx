import { useRef, useMemo, useEffect } from 'react'
import { scheduleRenderer } from './animationScheduler'

/**
 * BackgroundField — Canvas-rendered gradient mesh + floating bokeh.
 * Fixed behind all content. Mouse-reactive glow remains DOM.
 *
 * PERFORMANCE STRATEGY:
 *   ✅ Bokeh + gradient orbs on a single Canvas 2D (was: N animated DOM elements each with filter:blur)
 *   ✅ Bokeh drawn with ctx.arc + radialGradient; blur batched by quantized level
 *   ✅ Orbs drawn with large radialGradient + single ctx.filter pass
 *   ✅ Shared RAF via animationScheduler — no independent loop
 *   ✅ Canvas at 60% resolution on mobile, CSS-scaled to 100% (reduced fill-rate)
 *   ✅ Reduced particle counts on mobile: bokeh=6 (vs 14 desktop)
 *   ✅ Cursor glow stays DOM — single element, trivially cheap
 */

// ── Seeded random ────────────────────────────────────────────────
function seededRandom(seed: number) {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

// ── Bokeh particle ───────────────────────────────────────────────
interface BokehParticle {
    x: number         // normalized 0..1
    y: number
    size: number      // diameter in viewport pixels
    opacity: number
    r: number; g: number; b: number; a: number  // pre-parsed color components
    blur: number      // blur radius in viewport pixels (20–60)
    speed: number     // drift angular speed (rad/sec)
    phase: number     // drift phase offset
    driftAmp: number  // max drift distance in viewport pixels
}

const BOKEH_COLORS = [
    { r: 225, g: 29,  b: 72,  a: 0.12 },
    { r: 244, g: 63,  b: 94,  a: 0.10 },
    { r: 253, g: 164, b: 175, a: 0.15 },
    { r: 255, g: 255, b: 255, a: 0.10 },
    { r: 251, g: 113, b: 133, a: 0.08 },
]

function generateBokeh(count: number): BokehParticle[] {
    const rand = seededRandom(42069)
    return Array.from({ length: count }, () => {
        const c = BOKEH_COLORS[Math.floor(rand() * BOKEH_COLORS.length)]
        return {
            x: rand(),
            y: rand(),
            size: 30 + rand() * 120,
            opacity: 0.15 + rand() * 0.25,
            r: c.r, g: c.g, b: c.b, a: c.a,
            blur: 20 + rand() * 40,
            speed: 0.02 + rand() * 0.04,
            phase: rand() * Math.PI * 2,
            driftAmp: 40 + rand() * 40,
        }
    })
}

// ── Gradient orb definitions ─────────────────────────────────────
// Positions mirror the original CSS (top/right/bottom/left percentages → normalized 0..1).
interface OrbDef {
    cx: number; cy: number  // center normalized 0..1
    size: number            // diameter in viewport pixels
    r: number; g: number; b: number; a: number
    blurVp: number          // blur in viewport pixels
    speed: number           // drift speed (rad/sec)
    phase: number
    driftX: number          // max horizontal drift as fraction of viewport width
    driftY: number
}

const ORBS: OrbDef[] = [
    { cx: 0.95, cy: 0.10, size: 500, r: 225, g: 29,  b: 72,  a: 0.15, blurVp: 120, speed: 0.018, phase: 0, driftX: 0.08, driftY: 0.06 },
    { cx: -0.10, cy: 0.90, size: 600, r: 244, g: 63,  b: 94,  a: 0.12, blurVp: 120, speed: 0.015, phase: 2, driftX: 0.08, driftY: 0.07 },
    { cx: 0.40, cy: 0.50, size: 400, r: 253, g: 164, b: 175, a: 0.18, blurVp: 120, speed: 0.022, phase: 4, driftX: 0.06, driftY: 0.05 },
]

// ── Canvas helpers ───────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────────
export function BackgroundField() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cursorGlowRef = useRef<HTMLDivElement>(null)
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    const bokeh = useMemo(() => generateBokeh(isMobile ? 6 : 14), [isMobile])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const cScale = isMobile ? 0.6 : 1.0
        initCanvas(canvas, cScale)

        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return

        // Cursor glow — remains DOM, handled separately
        let cleanupGlow = () => {}
        if (!isMobile) {
            const handleMove = (e: MouseEvent) => {
                if (cursorGlowRef.current) {
                    cursorGlowRef.current.style.left = `${e.clientX}px`
                    cursorGlowRef.current.style.top = `${e.clientY}px`
                    cursorGlowRef.current.style.opacity = '1'
                }
            }
            window.addEventListener('mousemove', handleMove, { passive: true })
            cleanupGlow = () => window.removeEventListener('mousemove', handleMove)
        }

        // Debounced resize
        let resizeTimer: ReturnType<typeof setTimeout> | null = null
        const handleResize = () => {
            if (resizeTimer !== null) clearTimeout(resizeTimer)
            resizeTimer = setTimeout(() => initCanvas(canvas, cScale), 200)
        }
        window.addEventListener('resize', handleResize, { passive: true })

        const unschedule = scheduleRenderer((timeMs: number) => {
            const w = canvas.width
            const h = canvas.height
            const t = timeMs / 1000

            ctx.clearRect(0, 0, w, h)

            // ── Gradient orbs (large, blurred) ──────────────────
            // All orbs share the same blur level — one filter state change.
            const orbBlur = Math.round(120 * cScale)
            ctx.filter = `blur(${orbBlur}px)`
            for (const o of ORBS) {
                const dx = Math.sin(t * o.speed + o.phase) * o.driftX * w
                const dy = Math.cos(t * o.speed * 0.7 + o.phase + 1) * o.driftY * h
                const cx = o.cx * w + dx
                const cy = o.cy * h + dy
                const radius = (o.size * cScale) / 2
                const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
                grd.addColorStop(0, `rgba(${o.r},${o.g},${o.b},${o.a})`)
                grd.addColorStop(0.7, `rgba(${o.r},${o.g},${o.b},0.02)`)
                grd.addColorStop(1, 'rgba(0,0,0,0)')
                ctx.fillStyle = grd
                ctx.beginPath()
                ctx.arc(cx, cy, radius, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.filter = 'none'

            // ── Bokeh circles ────────────────────────────────────
            // Sort-free batching: bokeh is already generated in ascending blur order
            // (seeded, so consistent). Group by quantized blur to minimize filter switches.
            let lastBlurLevel = -1
            for (const b of bokeh) {
                // Lissajous drift — organic motion without CSS keyframes
                const dx = Math.sin(t * b.speed + b.phase) * b.driftAmp * cScale
                const dy = Math.cos(t * b.speed * 0.73 + b.phase + 1.2) * b.driftAmp * cScale
                const bx = b.x * w + dx
                const by = b.y * h + dy
                const radius = (b.size * cScale) / 2

                const blurLevel = Math.round(b.blur / 10) * 10
                if (blurLevel !== lastBlurLevel) {
                    ctx.filter = `blur(${Math.round(blurLevel * cScale)}px)`
                    lastBlurLevel = blurLevel
                }

                const grd = ctx.createRadialGradient(bx, by, 0, bx, by, radius)
                grd.addColorStop(0, `rgba(${b.r},${b.g},${b.b},${b.a})`)
                grd.addColorStop(0.6, `rgba(${b.r},${b.g},${b.b},${(b.a * 0.3).toFixed(3)})`)
                grd.addColorStop(1, 'rgba(0,0,0,0)')
                ctx.globalAlpha = b.opacity
                ctx.fillStyle = grd
                ctx.beginPath()
                ctx.arc(bx, by, radius, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.filter = 'none'
            ctx.globalAlpha = 1
        })

        return () => {
            unschedule()
            cleanupGlow()
            window.removeEventListener('resize', handleResize)
            if (resizeTimer !== null) clearTimeout(resizeTimer)
        }
    }, [isMobile, bokeh])

    return (
        <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none select-none">
            {/* Static base gradient — pure CSS, no animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-secondary/5" />

            {/* Canvas — renders bokeh circles + gradient orbs */}
            <canvas ref={canvasRef} />

            {/* Cursor glow — single DOM element, trivially cheap */}
            <div
                ref={cursorGlowRef}
                className="fixed w-[300px] h-[300px] rounded-full pointer-events-none opacity-0 transition-opacity duration-500"
                style={{
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(225, 29, 72, 0.08), transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Grain overlay */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>
    )
}
