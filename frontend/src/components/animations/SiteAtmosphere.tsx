import { useEffect, useRef, useMemo } from 'react'

/*
 * SiteAtmosphere — Global clouds + twinkling stars
 *
 * PERFORMANCE STRATEGY:
 *   ✅ All animations use CSS @keyframes (GPU-composited)
 *   ✅ Single mousemove handler, applied via CSS custom properties
 *   ✅ No framer-motion animate/useTransform per-element
 *   ✅ No React state updates during animations
 *   ✅ will-change only on the two layer containers
 */

// ── Seeded random ───────────────────────────────────────────────
function seededRandom(seed: number) {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

// ── Star generation ─────────────────────────────────────────────
interface StarData {
    x: number; y: number; size: number
    delay: number; duration: number
    name: string // unique animation name suffix
}

function generateStars(count: number, seed: number, sizeMin: number, sizeMax: number): StarData[] {
    const rand = seededRandom(seed)
    return Array.from({ length: count }, (_, i) => ({
        x: rand() * 96 + 2,
        y: rand() * 96 + 2,
        size: Math.round(sizeMin + rand() * (sizeMax - sizeMin)),
        delay: Math.round(rand() * 80) / 10,  // 0-8s
        duration: Math.round((25 + rand() * 40)) / 10, // 2.5-6.5s
        name: `s${seed}_${i}`,
    }))
}

// ── CSS Keyframes (injected once) ───────────────────────────────
const STYLES_ID = 'site-atmosphere-styles'
type DeviceOrientationCtor = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
}

function injectStyles() {
    if (document.getElementById(STYLES_ID)) return

    const style = document.createElement('style')
    style.id = STYLES_ID
    style.textContent = `
        /* ── Cloud drift ─────────────────────── */
        @keyframes cloud-drift-1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(5vw,-8px)} }
        @keyframes cloud-drift-2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-6vw,-6px)} }
        @keyframes cloud-drift-3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8vw,-10px)} }
        @keyframes cloud-drift-4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-4vw,-5px)} }
        @keyframes cloud-drift-5 { 0%,100%{transform:translate(0,0)} 35%{transform:translate(3vw,-14px)} 70%{transform:translate(-3vw,-7px)} }
        @keyframes cloud-drift-6 { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(-7vw,-4px) rotate(0.3deg)} }

        /* ── Star twinkle ────────────────────── */
        @keyframes twinkle {
            0%   { opacity: 0; transform: scale(0.2) rotate(0deg); }
            20%  { opacity: 0.9; transform: scale(1) rotate(20deg); }
            50%  { opacity: 1; transform: scale(0.85) rotate(45deg); }
            80%  { opacity: 0.9; transform: scale(1) rotate(70deg); }
            100% { opacity: 0; transform: scale(0.2) rotate(90deg); }
        }

        /* ── Layer mouse parallax via CSS vars ── */
        .atm-bg-layer {
            transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .atm-fg-layer {
            transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* ── Cloud base ──────────────────────── */
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

        /* ── Star base ───────────────────────── */
        .atm-star {
            position: absolute;
            pointer-events: none;
            animation: twinkle var(--dur) ease-in-out var(--delay) infinite;
            color: rgba(255, 255, 255, 0.95);
        }
        .atm-star-bg {
            filter: drop-shadow(0 0 var(--glow) rgba(255, 210, 230, 0.7));
        }
        .atm-star-fg {
            filter: drop-shadow(0 0 var(--glow) rgba(255, 255, 255, 0.5));
        }
    `
    document.head.appendChild(style)
}

// ── Cloud SVG paths (inline, no React component overhead) ───────
const CLOUD_PATHS = [
    'M280 90c22 0 40-16 40-36s-18-36-40-36c-4 0-8 .5-12 1.5C262 8 248 0 232 0c-20 0-36 12-42 30-4-2-8-2-12-2-26 0-48 18-48 40 0 1 0 2 .1 3H60c-33 0-60 20-60 42h320c0-13-16-23-40-23z',
    'M230 80c16 0 30-12 30-28s-14-28-30-28c-2 0-4 0-6 .5C220 10 206 0 190 0c-14 0-26 8-32 20-6-4-14-6-22-6-22 0-40 16-40 36 0 2 0 4 .5 6H40c-22 0-40 14-40 32h268c0-4-14-8-38-8z',
    'M170 64c16 0 30-11 30-25s-14-25-30-25c-3 0-6 .4-8 1C158 6 146 0 132 0c-12 0-22 6-28 16-4-2-10-4-16-4-18 0-32 13-32 30 0 1 0 3 .2 4H24c-14 0-24 8-24 18h194c0-2-10 0-24 0z',
]

// ── Inner highlight paths (subtle brightness layer inside each cloud) ──
const CLOUD_HIGHLIGHTS = [
    'M34 95c0-14 18-26 40-26 8 0 16 2 22 5 8-10 22-16 38-16 19 0 36 9 43 23 5-2 11-3 17-3 22 0 40 12 40 27H34z',
    'M20 92c0-10 12-18 28-18 5 0 10 1 15 3 5-8 16-13 29-13 14 0 26 7 32 18 4-1 8-2 12-2 18 0 32 10 32 22H20z',
    'M15 72c0-8 10-15 22-15 4 0 8 1 12 2.5 4-6 13-10 24-10 11 0 21 5 26 14 3-1 6-1.5 9-1.5 14 0 24 8 24 18H15z',
]

const CLOUD_VIEWBOXES = ['0 0 320 120', '0 0 260 100', '0 0 200 80']

// ── 4-pointed star path ─────────────────────────────────────────
const STAR_PATH = 'M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z'

// ── Cloud definitions ───────────────────────────────────────────
interface CloudDef {
    path: number  // index into CLOUD_PATHS
    x: string; y: string
    opacity: number
    drift: string     // keyframe name
    duration: number  // seconds
    flip?: boolean
    scale?: number
    blur?: number      // extra blur radius in px (adds to CSS default 0.5px)
    highlight?: boolean // render inner brightness layer
}

const CLOUDS: CloudDef[] = [
    // Top (hero area)
    { path: 0, x: '-3%', y: '3%', opacity: 0.35, drift: 'cloud-drift-1', duration: 50, scale: 1.1, highlight: true },
    { path: 1, x: '65%', y: '2%', opacity: 0.30, drift: 'cloud-drift-2', duration: 65, flip: true },
    { path: 2, x: '30%', y: '6%', opacity: 0.25, drift: 'cloud-drift-3', duration: 55, scale: 0.7 },

    // Upper-mid
    { path: 0, x: '-6%', y: '18%', opacity: 0.30, drift: 'cloud-drift-4', duration: 60, flip: true, highlight: true },
    { path: 1, x: '72%', y: '22%', opacity: 0.28, drift: 'cloud-drift-1', duration: 70 },

    // Mid
    { path: 2, x: '3%', y: '38%', opacity: 0.28, drift: 'cloud-drift-2', duration: 55, scale: 1.1 },
    { path: 0, x: '60%', y: '42%', opacity: 0.25, drift: 'cloud-drift-3', duration: 65, flip: true, scale: 0.8, highlight: true },

    // Lower-mid
    { path: 1, x: '-8%', y: '58%', opacity: 0.32, drift: 'cloud-drift-4', duration: 45, scale: 1.2, highlight: true },
    { path: 2, x: '75%', y: '62%', opacity: 0.28, drift: 'cloud-drift-1', duration: 55, flip: true },

    // Bottom
    { path: 0, x: '8%', y: '78%', opacity: 0.35, drift: 'cloud-drift-2', duration: 40, scale: 1.3, highlight: true },
    { path: 1, x: '55%', y: '82%', opacity: 0.30, drift: 'cloud-drift-3', duration: 50, flip: true },
    { path: 2, x: '-3%', y: '92%', opacity: 0.28, drift: 'cloud-drift-4', duration: 60, scale: 0.9 },

    // Tiny distant clusters
    { path: 2, x: '48%', y: '10%', opacity: 0.22, drift: 'cloud-drift-5', duration: 72, scale: 0.42 },
    { path: 1, x: '16%', y: '30%', opacity: 0.20, drift: 'cloud-drift-6', duration: 78, scale: 0.48, flip: true },

    // Large slow banks
    { path: 0, x: '-12%', y: '46%', opacity: 0.26, drift: 'cloud-drift-5', duration: 52, scale: 1.65, flip: true, blur: 1 },
    { path: 1, x: '50%', y: '50%', opacity: 0.22, drift: 'cloud-drift-6', duration: 64, scale: 1.45 },

    // Very distant (extra blurred)
    { path: 2, x: '10%', y: '68%', opacity: 0.18, drift: 'cloud-drift-1', duration: 90, scale: 1.85, blur: 2 },
    { path: 0, x: '38%', y: '86%', opacity: 0.20, drift: 'cloud-drift-2', duration: 80, scale: 0.52, highlight: true },
]

// ── Component ───────────────────────────────────────────────────
export function SiteAtmosphere() {
    const bgRef = useRef<HTMLDivElement>(null)
    const fgRef = useRef<HTMLDivElement>(null)

    // Background stars: fewer but BIGGER (12-36px)
    const bgStars = useMemo(() => generateStars(18, 42, 12, 36), [])
    // Foreground stars: fewer, medium (6-18px)
    const fgStars = useMemo(() => generateStars(12, 99, 6, 18), [])

    // Inject CSS keyframes once
    useEffect(() => { injectStyles() }, [])

    // Pointer/gyroscope parallax via CSS transform (single handler, no React re-renders)
    useEffect(() => {
        let rafId: number | null = null
        let targetX = 0, targetY = 0
        let currentX = 0, currentY = 0
        let orientationBaseX: number | null = null
        let orientationBaseY: number | null = null

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        const hasOrientationSupport = typeof window.DeviceOrientationEvent !== 'undefined'
        const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

        const handleMove = (e: MouseEvent) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 2
            targetY = (e.clientY / window.innerHeight - 0.5) * 2
        }

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return

            if (orientationBaseX === null || orientationBaseY === null) {
                orientationBaseX = e.gamma
                orientationBaseY = e.beta
            }

            targetX = clamp((e.gamma - orientationBaseX) / 25, -1, 1)
            targetY = clamp((e.beta - orientationBaseY) / 25, -1, 1)
        }

        const tick = () => {
            // Smooth lerp (no spring/React overhead)
            currentX += (targetX - currentX) * 0.04
            currentY += (targetY - currentY) * 0.04

            const bgX = currentX * 15
            const bgY = currentY * 8
            const fgX = currentX * 28
            const fgY = currentY * 14

            if (bgRef.current) {
                bgRef.current.style.transform = `translate(${bgX}px, ${bgY}px)`
            }
            if (fgRef.current) {
                fgRef.current.style.transform = `translate(${fgX}px, ${fgY}px)`
            }

            rafId = requestAnimationFrame(tick)
        }

        let cleanupInput = () => { }

        if (isTouchDevice && hasOrientationSupport) {
            const orientationEvent = window.DeviceOrientationEvent as DeviceOrientationCtor
            const requestPermission = orientationEvent.requestPermission

            if (typeof requestPermission === 'function') {
                let permissionRequested = false

                const requestOrientation = () => {
                    if (permissionRequested) return
                    permissionRequested = true

                    requestPermission()
                        .then((permission) => {
                            if (permission === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation, { passive: true })
                            }
                        })
                        .catch((error: unknown) => {
                            console.error('Falha ao solicitar permissao do giroscopio', error)
                        })
                }

                window.addEventListener('touchstart', requestOrientation, { passive: true })
                cleanupInput = () => {
                    window.removeEventListener('touchstart', requestOrientation)
                    window.removeEventListener('deviceorientation', handleOrientation)
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientation, { passive: true })
                cleanupInput = () => {
                    window.removeEventListener('deviceorientation', handleOrientation)
                }
            }
        } else {
            window.addEventListener('mousemove', handleMove, { passive: true })
            cleanupInput = () => {
                window.removeEventListener('mousemove', handleMove)
            }
        }

        rafId = requestAnimationFrame(tick)

        return () => {
            cleanupInput()
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <>
            {/* ── Background: clouds + big stars (z-1, behind most content) ── */}
            <div
                ref={bgRef}
                className="fixed inset-0 overflow-hidden pointer-events-none atm-bg-layer"
                style={{ zIndex: 1 }}
            >
                {CLOUDS.map((c, i) => (
                    <div
                        key={`c${i}`}
                        className="atm-cloud"
                        style={{
                            left: c.x,
                            top: c.y,
                            opacity: c.opacity,
                            transform: `scale(${c.scale ?? 1})${c.flip ? ' scaleX(-1)' : ''}`,
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
                            {c.highlight && <path d={CLOUD_HIGHLIGHTS[c.path]} fill="rgba(255,255,255,0.30)" />}
                        </svg>
                    </div>
                ))}

                {bgStars.map((s) => (
                    <div
                        key={s.name}
                        className="atm-star atm-star-bg"
                        style={{
                            left: `${s.x}%`,
                            top: `${s.y}%`,
                            '--dur': `${s.duration}s`,
                            '--delay': `${s.delay}s`,
                            '--glow': `${s.size * 0.4}px`,
                        } as React.CSSProperties}
                    >
                        <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="currentColor">
                            <path d={STAR_PATH} />
                        </svg>
                    </div>
                ))}
            </div>

            {/* ── Foreground: small delicate stars (z-50, over content) ── */}
            <div
                ref={fgRef}
                className="fixed inset-0 overflow-hidden pointer-events-none atm-fg-layer"
                style={{ zIndex: 50 }}
            >
                {fgStars.map((s) => (
                    <div
                        key={s.name}
                        className="atm-star atm-star-fg"
                        style={{
                            left: `${s.x}%`,
                            top: `${s.y}%`,
                            '--dur': `${s.duration}s`,
                            '--delay': `${s.delay}s`,
                            '--glow': `${s.size * 0.3}px`,
                        } as React.CSSProperties}
                    >
                        <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="currentColor">
                            <path d={STAR_PATH} />
                        </svg>
                    </div>
                ))}
            </div>
        </>
    )
}
