import { useRef, useMemo, useEffect } from 'react'

/**
 * BackgroundField — Gradient mesh + floating bokeh circles.
 * Fixed behind all content. Mouse-reactive glow on desktop.
 */

const STYLES_ID = 'bg-field-styles'

function injectStyles() {
    if (document.getElementById(STYLES_ID)) return

    const style = document.createElement('style')
    style.id = STYLES_ID
    style.textContent = `
        @keyframes bg-drift-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(5vw, -3vh) scale(1.08); }
            66% { transform: translate(-3vw, 4vh) scale(0.95); }
        }
        @keyframes bg-drift-2 {
            0%, 100% { transform: translate(0, 0) scale(1.05); }
            33% { transform: translate(-4vw, 5vh) scale(1); }
            66% { transform: translate(6vw, -2vh) scale(1.1); }
        }
        @keyframes bg-drift-3 {
            0%, 100% { transform: translate(0, 0) scale(0.95); }
            50% { transform: translate(3vw, 3vh) scale(1.05); }
        }
        @keyframes bokeh-float {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(var(--bk-dx1), var(--bk-dy1)); }
            50% { transform: translate(var(--bk-dx2), var(--bk-dy2)); }
            75% { transform: translate(var(--bk-dx3), var(--bk-dy3)); }
        }
        .bg-glow {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            filter: blur(120px);
            will-change: transform;
        }
        .bg-bokeh {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: bokeh-float var(--bk-dur) ease-in-out var(--bk-delay) infinite;
            will-change: transform;
        }
    `
    document.head.appendChild(style)
}

// Seeded random for consistent positions
function seededRandom(seed: number) {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

interface BokehCircle {
    x: number
    y: number
    size: number
    opacity: number
    color: string
    blur: number
    duration: number
    delay: number
    dx1: string; dy1: string
    dx2: string; dy2: string
    dx3: string; dy3: string
}

const BOKEH_COLORS = [
    'rgba(225, 29, 72, 0.12)',   // primary
    'rgba(244, 63, 94, 0.10)',   // secondary
    'rgba(253, 164, 175, 0.15)', // accent
    'rgba(255, 255, 255, 0.10)', // white
    'rgba(251, 113, 133, 0.08)', // rose
]

function generateBokeh(count: number): BokehCircle[] {
    const rand = seededRandom(42069)
    return Array.from({ length: count }, () => {
        const size = 30 + rand() * 120
        return {
            x: rand() * 100,
            y: rand() * 100,
            size,
            opacity: 0.15 + rand() * 0.25,
            color: BOKEH_COLORS[Math.floor(rand() * BOKEH_COLORS.length)],
            blur: 20 + rand() * 40,
            duration: 20 + rand() * 30,
            delay: rand() * 10,
            dx1: `${(rand() - 0.5) * 80}px`,
            dy1: `${(rand() - 0.5) * 60}px`,
            dx2: `${(rand() - 0.5) * 80}px`,
            dy2: `${(rand() - 0.5) * 60}px`,
            dx3: `${(rand() - 0.5) * 80}px`,
            dy3: `${(rand() - 0.5) * 60}px`,
        }
    })
}

export function BackgroundField() {
    const cursorGlowRef = useRef<HTMLDivElement>(null)
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    const bokeh = useMemo(() => generateBokeh(isMobile ? 8 : 14), [isMobile])

    useEffect(() => {
        injectStyles()

        if (isMobile) return

        const handleMove = (e: MouseEvent) => {
            if (cursorGlowRef.current) {
                cursorGlowRef.current.style.left = `${e.clientX}px`
                cursorGlowRef.current.style.top = `${e.clientY}px`
                cursorGlowRef.current.style.opacity = '1'
            }
        }

        window.addEventListener('mousemove', handleMove, { passive: true })
        return () => window.removeEventListener('mousemove', handleMove)
    }, [isMobile])

    return (
        <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none select-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-secondary/5" />

            {/* Gradient mesh orbs */}
            <div
                className="bg-glow w-[500px] h-[500px] opacity-20"
                style={{
                    top: '10%',
                    right: '-5%',
                    background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15), transparent 70%)',
                    animation: 'bg-drift-1 30s ease-in-out infinite',
                }}
            />
            <div
                className="bg-glow w-[600px] h-[600px] opacity-15"
                style={{
                    bottom: '5%',
                    left: '-10%',
                    background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12), transparent 70%)',
                    animation: 'bg-drift-2 35s ease-in-out infinite',
                }}
            />
            <div
                className="bg-glow w-[400px] h-[400px] opacity-10"
                style={{
                    top: '50%',
                    left: '40%',
                    background: 'radial-gradient(circle, rgba(253, 164, 175, 0.18), transparent 70%)',
                    animation: 'bg-drift-3 25s ease-in-out infinite',
                }}
            />

            {/* Bokeh circles */}
            {bokeh.map((b, i) => (
                <div
                    key={i}
                    className="bg-bokeh"
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: b.size,
                        height: b.size,
                        opacity: b.opacity,
                        background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
                        filter: `blur(${b.blur}px)`,
                        '--bk-dur': `${b.duration}s`,
                        '--bk-delay': `${b.delay}s`,
                        '--bk-dx1': b.dx1,
                        '--bk-dy1': b.dy1,
                        '--bk-dx2': b.dx2,
                        '--bk-dy2': b.dy2,
                        '--bk-dx3': b.dx3,
                        '--bk-dy3': b.dy3,
                    } as React.CSSProperties}
                />
            ))}

            {/* Mouse-reactive glow (desktop only) */}
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
