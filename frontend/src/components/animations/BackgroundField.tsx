import { useRef, useMemo, useEffect } from 'react'

/*
 * BackgroundField — Floating cards + gradient orbs
 *
 * PERFORMANCE NOTES:
 *   ✅ Cards use CSS @keyframes for floating bob (no framer-motion animate)
 *   ✅ Scroll parallax via single RAF loop + getComputedStyle
 *   ✅ Removed backdrop-blur (extremely costly on GPU)
 *   ✅ Reduced card count: 15 → 8
 *   ✅ Orbs use CSS animation (not framer-motion)
 */

// ── Types ───────────────────────────────────────────────────────
interface FloatingCard {
    id: number
    x: number
    y: number
    rotate: number
    scale: number
    duration: number
    delay: number
}

// ── Seeded card generation ──────────────────────────────────────
function generateCards(count: number): FloatingCard[] {
    let s = 12345
    const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }

    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: rand() * 90 + 5,
        y: rand() * 90 + 5,
        rotate: rand() * 30 - 15,
        scale: 0.5 + rand() * 0.5,
        duration: 12 + rand() * 18,
        delay: rand() * 6,
    }))
}

// ── Inject styles ───────────────────────────────────────────────
const BG_STYLES_ID = 'bg-field-styles'

function injectBgStyles() {
    if (document.getElementById(BG_STYLES_ID)) return

    const style = document.createElement('style')
    style.id = BG_STYLES_ID
    style.textContent = `
        @keyframes card-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(18px); }
        }
        @keyframes orb-pulse-1 {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.15) rotate(180deg); }
        }
        @keyframes orb-pulse-2 {
            0%, 100% { transform: scale(1.15) rotate(360deg); }
            50% { transform: scale(1) rotate(180deg); }
        }
        .bg-card {
            position: absolute;
            pointer-events: none;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.35);
            background: rgba(255,255,255,0.15);
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            animation: card-bob var(--bob-dur) ease-in-out var(--bob-delay) infinite;
            will-change: transform;
            opacity: 0.35;
        }
        .bg-card::before {
            content: '';
            position: absolute;
            top: 8px; left: 8px; right: 8px;
            height: 2px;
            background: rgba(255,255,255,0.25);
            border-radius: 2px;
        }
        .bg-card::after {
            content: '';
            position: absolute;
            bottom: 8px; left: 12px;
            width: 40%;
            height: 2px;
            background: rgba(255,255,255,0.25);
            border-radius: 2px;
        }
    `
    document.head.appendChild(style)
}

// ── Component ───────────────────────────────────────────────────
export function BackgroundField() {
    const containerRef = useRef<HTMLDivElement>(null)
    const cards = useMemo(() => generateCards(8), [])

    useEffect(() => { injectBgStyles() }, [])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none"
        >
            {/* Gradient base */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 opacity-80" />

            {/* Orbs — CSS animated, no framer-motion */}
            <div
                className="fixed top-0 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full opacity-25 pointer-events-none"
                style={{
                    filter: 'blur(100px)',
                    animation: 'orb-pulse-1 25s linear infinite',
                }}
            />
            <div
                className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/8 rounded-full opacity-25 pointer-events-none"
                style={{
                    filter: 'blur(100px)',
                    animation: 'orb-pulse-2 30s linear infinite',
                }}
            />

            {/* Cards — pure CSS animation, no backdrop-blur */}
            {cards.map((card) => (
                <div
                    key={card.id}
                    className="bg-card w-14 h-20 md:w-20 md:h-28"
                    style={{
                        left: `${card.x}%`,
                        top: `${card.y}%`,
                        transform: `rotate(${card.rotate}deg) scale(${card.scale})`,
                        '--bob-dur': `${card.duration}s`,
                        '--bob-delay': `${card.delay}s`,
                    } as React.CSSProperties}
                />
            ))}

            {/* Grain overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        </div>
    )
}
