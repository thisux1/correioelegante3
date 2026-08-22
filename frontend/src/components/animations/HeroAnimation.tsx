import { memo } from 'react'
import { motion, useMotionTemplate, useSpring, useTransform, type MotionValue } from 'framer-motion'

// ── Scroll Timeline (chapter-based cyclic) ──────────────────────
// 0.00 → 0.35  Airplane enters, flies, and hands off to envelope
// 0.35 → 0.65  Envelope materialises, letter emerges, and flap opens
// 0.65 → 0.85  Heart and sparkle particles emerge from the envelope
// 0.85 → 1.00  Soft cloud veil transition

// ── Paper Airplane SVG ──────────────────────────────────────────
function PaperAirplane() {
    return (
        <svg viewBox="0 0 160 72" width="300" height="135" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Far wing (peeking above) */}
            <polygon
                points="155,36 20,6 40,42"
                fill="#fbcfe8"
                stroke="#e11d48"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
            {/* Near wing */}
            <polygon
                points="155,36 6,12 40,42"
                fill="#ffffff"
                stroke="#e11d48"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            {/* Near wing detail highlight */}
            <polygon
                points="155,36 70,24 6,12"
                fill="rgba(255,241,245,0.9)"
            />
            {/* Fuselage crease line */}
            <line
                x1="6" y1="12" x2="155" y2="36"
                stroke="#e11d48"
                strokeWidth="1.2"
            />
            {/* Underbody shadow */}
            <polygon
                points="40,42 6,12 80,48"
                fill="#fda4af"
                opacity="0.6"
            />
            {/* Heart badge on airplane */}
            <path
                d="M95 28 C95 24 90 22 88 25 C86 22 81 24 81 28 C81 33 88 37 88 37 C88 37 95 33 95 28 Z"
                fill="#e11d48"
            />
        </svg>
    )
}

// ── Wind Trail (Heart-shaped contrail behind airplane) ───────────
const TRAIL_HEARTS = [
    { x: -50,  y: -2,  size: 7,  opacity: 0.70, delay: 0.00 },
    { x: -110, y: 5,   size: 10, opacity: 0.55, delay: 0.05 },
    { x: -175, y: -4,  size: 13, opacity: 0.45, delay: 0.10 },
    { x: -245, y: 7,   size: 16, opacity: 0.35, delay: 0.15 },
    { x: -320, y: -2,  size: 19, opacity: 0.22, delay: 0.20 },
    { x: -400, y: 4,   size: 22, opacity: 0.12, delay: 0.25 },
] as const

const TrailHeartSVG = memo(function TrailHeartSVG({ size, color }: { size: number; color: string }) {
    return (
        <svg viewBox="0 0 20 18" width={size} height={size * 0.9} fill="none">
            <path
                d="M10 16.5 C10 16.5 1.5 11 1.5 5.5 C1.5 2.5 3.8 0.5 6.5 0.5 C8.2 0.5 9.4 1.5 10 2.5 C10.6 1.5 11.8 0.5 13.5 0.5 C16.2 0.5 18.5 2.5 18.5 5.5 C18.5 11 10 16.5 10 16.5Z"
                fill={color}
            />
        </svg>
    )
})

function WindTrail({ isMobile }: { isMobile: boolean }) {
    const hearts = isMobile ? TRAIL_HEARTS.filter((_, i) => i % 2 === 0) : TRAIL_HEARTS
    return (
        <div className="absolute pointer-events-none" style={{ left: 0, top: 0 }}>
            {hearts.map((h, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        transform: `translate(${h.x}px, ${h.y}px)`,
                        opacity: h.opacity,
                    }}
                >
                    <TrailHeartSVG size={h.size} color="rgba(244,63,94,0.7)" />
                </div>
            ))}
        </div>
    )
}

// ── Envelope SVG ────────────────────────────────────────────────
function Envelope({ flapProgress }: { flapProgress: MotionValue<number> }) {
    const springFlap = useSpring(flapProgress, { stiffness: 150, damping: 20, mass: 0.6 })
    const flapRotateX = useTransform(springFlap, [0, 1], [0, -180])

    return (
        <svg viewBox="0 0 180 130" width="300" height="217" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            {/* Envelope Back Wall */}
            <rect x="0" y="30" width="180" height="100" rx="6"
                fill="#fff0f4"
                stroke="rgba(244,63,94,0.3)"
                strokeWidth="1.2"
            />

            {/* Left inner fold */}
            <polygon
                points="0,30 90,75 0,130"
                fill="rgba(255,228,235,0.7)"
                stroke="rgba(244,63,94,0.25)"
                strokeWidth="0.8"
            />
            {/* Right inner fold */}
            <polygon
                points="180,30 90,75 180,130"
                fill="rgba(255,220,230,0.7)"
                stroke="rgba(244,63,94,0.25)"
                strokeWidth="0.8"
            />
            {/* Bottom inner fold */}
            <polygon
                points="0,130 180,130 90,75"
                fill="rgba(255,235,242,0.6)"
            />

            {/* Letter lines inside pocket */}
            <line x1="30" y1="88" x2="150" y2="88" stroke="rgba(225,29,72,0.25)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="100" x2="150" y2="100" stroke="rgba(225,29,72,0.25)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="112" x2="110" y2="112" stroke="rgba(225,29,72,0.25)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Flap — realistically unfolds upwards around top crease (y=30) */}
            <motion.g
                style={{
                    originX: '90px',
                    originY: '30px',
                    transformBox: 'view-box',
                    transformStyle: 'preserve-3d',
                    rotateX: flapRotateX,
                }}
            >
                {/* Exterior Flap */}
                <polygon
                    points="0,30 180,30 90,75"
                    fill="#ffffff"
                    stroke="rgba(244,63,94,0.45)"
                    strokeWidth="1.2"
                />
                {/* Interior Lining (back side of flap) */}
                <polygon
                    points="0,30 180,30 90,75"
                    fill="#ffe4ec"
                    opacity="0.9"
                    style={{ transform: 'rotateY(180deg)', transformOrigin: '90px 30px' }}
                />
                {/* Wax seal — breaks and fades as the flap opens */}
                <motion.g style={{ opacity: useTransform(springFlap, [0, 0.35], [1, 0]) }}>
                    <circle cx="90" cy="46" r="11" fill="#e11d48" />
                    <circle cx="90" cy="46" r="9" fill="#be123c" />
                    <path
                        d="M90 49 C90 49 84 45 84 41.5 C84 39.5 85.5 38 87.5 38 C88.7 38 89.6 38.7 90 39.5 C90.4 38.7 91.3 38 92.5 38 C94.5 38 96 39.5 96 41.5 C96 45 90 49 90 49Z"
                        fill="white"
                    />
                </motion.g>
            </motion.g>
        </svg>
    )
}

function Heart() {
    return (
        <svg viewBox="0 0 80 72" width="120" height="108" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="40" cy="40" rx="36" ry="32" fill="rgba(225,29,72,0.18)" />
            <path
                d="M40 62 C40 62 8 44 8 24 C8 14 16 8 24 8 C30 8 35 11 40 18 C45 11 50 8 56 8 C64 8 72 14 72 24 C72 44 40 62 40 62Z"
                fill="#e11d48"
            />
            <path
                d="M26 16 C24 20 22 26 24 30"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

function LetterSheet() {
    return (
        <svg viewBox="0 0 180 130" width="220" height="159" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="160" height="110" rx="8" fill="#fffafc" stroke="rgba(244,63,94,0.4)" strokeWidth="1.2" />
            <line x1="28" y1="72" x2="150" y2="72" stroke="rgba(225,29,72,0.25)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="28" y1="86" x2="150" y2="86" stroke="rgba(225,29,72,0.25)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="28" y1="100" x2="120" y2="100" stroke="rgba(225,29,72,0.25)" strokeWidth="1.4" strokeLinecap="round" />
            <text x="26" y="54" fill="#be123c" fontSize="18" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="bold">
                Para você
            </text>
        </svg>
    )
}

interface BurstParticleConfig {
    id: string
    angle: number
    distance: number
    size: number
    spin: number
    kind: 'petal' | 'star'
}

const BURST_PARTICLES: BurstParticleConfig[] = [
    { id: 'p1', angle: -80, distance: 90, size: 12, spin: 180, kind: 'star' },
    { id: 'p2', angle: -42, distance: 120, size: 14, spin: 220, kind: 'petal' },
    { id: 'p3', angle: -8, distance: 135, size: 11, spin: 160, kind: 'star' },
    { id: 'p4', angle: 22, distance: 120, size: 14, spin: 200, kind: 'petal' },
    { id: 'p5', angle: 58, distance: 100, size: 13, spin: 180, kind: 'star' },
    { id: 'p6', angle: 92, distance: 80, size: 12, spin: 140, kind: 'petal' },
    { id: 'p7', angle: 138, distance: 92, size: 13, spin: 200, kind: 'star' },
    { id: 'p8', angle: 176, distance: 110, size: 12, spin: 170, kind: 'petal' },
    { id: 'p9', angle: 216, distance: 96, size: 11, spin: 190, kind: 'star' },
    { id: 'p10', angle: 252, distance: 88, size: 13, spin: 210, kind: 'petal' },
]

const BurstParticle = memo(function BurstParticle({
    particle,
    burstProgress,
    centerY,
}: {
    particle: BurstParticleConfig
    burstProgress: MotionValue<number>
    centerY: MotionValue<string>
    isMobile: boolean
}) {
    const rad = (particle.angle * Math.PI) / 180
    const x = useTransform(burstProgress, [0, 1], [0, Math.cos(rad) * particle.distance])
    const y = useTransform(burstProgress, [0, 1], [0, Math.sin(rad) * particle.distance])
    const scale = useTransform(burstProgress, [0, 0.35, 1], [0.25, 1.15, 0.75])
    const rotate = useTransform(burstProgress, [0, 1], [0, particle.spin])

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: '50%',
                top: centerY,
                x,
                y,
                scale,
                rotate,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            {particle.kind === 'star' ? (
                <svg width={particle.size} height={particle.size} viewBox="0 0 24 24" fill="rgba(255,255,255,0.95)">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                </svg>
            ) : (
                <svg width={particle.size} height={particle.size + 4} viewBox="0 0 24 28" fill="#fda4af">
                    <path d="M12 2C8 2 5 5 5 9c0 5 4 9 7 13 3-4 7-8 7-13 0-4-3-7-7-7z" />
                </svg>
            )}
        </motion.div>
    )
})

const CLOUD_VARIANTS = [
    {
        viewBox: '0 0 320 120',
        path: 'M280 90c22 0 40-16 40-36s-18-36-40-36c-4 0-8 .5-12 1.5C262 8 248 0 232 0c-20 0-36 12-42 30-4-2-8-2-12-2-26 0-48 18-48 40 0 1 0 2 .1 3H60c-33 0-60 20-60 42h320c0-13-16-23-40-23z',
        highlight: 'M34 95c0-14 18-26 40-26 8 0 16 2 22 5 8-10 22-16 38-16 19 0 36 9 43 23 5-2 11-3 17-3 22 0 40 12 40 27H34z',
    },
    {
        viewBox: '0 0 260 100',
        path: 'M230 80c16 0 30-12 30-28s-14-28-30-28c-2 0-4 0-6 .5C220 10 206 0 190 0c-14 0-26 8-32 20-6-4-14-6-22-6-22 0-40 16-40 36 0 2 0 4 .5 6H40c-22 0-40 14-40 32h268c0-4-14-8-38-8z',
        highlight: 'M20 92c0-10 12-18 28-18 5 0 10 1 15 3 5-8 16-13 29-13 14 0 26 7 32 18 4-1 8-2 12-2 18 0 32 10 32 22H20z',
    },
    {
        viewBox: '0 0 200 80',
        path: 'M170 64c16 0 30-11 30-25s-14-25-30-25c-3 0-6 .4-8 1C158 6 146 0 132 0c-12 0-22 6-28 16-4-2-10-4-16-4-18 0-32 13-32 30 0 1 0 3 .2 4H24c-14 0-24 8-24 18h194c0-2-10 0-24 0z',
        highlight: 'M15 72c0-8 10-15 22-15 4 0 8 1 12 2.5 4-6 13-10 24-10 11 0 21 5 26 14 3-1 6-1.5 9-1.5 14 0 24 8 24 18H15z',
    },
] as const

const Cloud = memo(function Cloud({ w = 320, cx = '0', cy = '0', opacity = 0.28, flip = false, variant = 0 as 0 | 1 | 2, blur = 0 }: {
    w?: number; cx?: number | string; cy?: number | string; opacity?: number; flip?: boolean; variant?: 0 | 1 | 2; blur?: number
}) {
    const { viewBox, path, highlight } = CLOUD_VARIANTS[variant]
    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: cx,
                top: cy,
                opacity,
                color: 'rgba(255,240,245,1)',
                transform: flip ? 'scaleX(-1)' : undefined,
            }}
        >
            <svg viewBox={viewBox} fill="currentColor" width={w} style={{ display: 'block', filter: blur > 0 ? `blur(${blur}px)` : undefined }}>
                <path d={path} />
                <path d={highlight} fill="rgba(255,255,255,0.4)" />
            </svg>
        </div>
    )
})

interface HeroAnimationProps {
    scrollProgress: MotionValue<number>
}

export function HeroAnimation({ scrollProgress }: HeroAnimationProps) {
    const isMobile = typeof window !== 'undefined'
        ? window.matchMedia('(max-width: 767px)').matches
        : false
    const burstParticles = isMobile ? BURST_PARTICLES.filter((_, i) => i % 2 === 0) : BURST_PARTICLES

    // ── Airplane Transforms ─────────────────────────────────────
    const planeX = useTransform(scrollProgress,
        [0.00, 0.05, 0.16, 0.32, 0.88, 1.00],
        ['2%', '16%', '36%', '50%', '50%', '2%'],
        { clamp: true }
    )
    const planeY = useTransform(scrollProgress,
        [0.00, 0.05, 0.16, 0.32, 0.88, 1.00],
        ['40%', '30%', '25%', '48%', '48%', '40%'],
        { clamp: true }
    )
    const planeRotate = useTransform(scrollProgress,
        [0.00, 0.05, 0.16, 0.32, 0.88, 1.00],
        [-4, 8, -6, 28, 28, -4],
        { clamp: true }
    )
    const planeOpacity = useTransform(scrollProgress,
        [0.00, 0.015, 0.28, 0.38, 1.00],
        [0, 1, 1, 0, 0],
        { clamp: true }
    )
    const planeScale = useTransform(scrollProgress,
        [0.00, 0.05, 0.18, 0.32, 0.40, 1.00],
        [0.9, 1, 1.05, 0.4, 0.2, 0.9],
        { clamp: true }
    )

    // ── Wind trail ─────────────────────────────────────────────
    const trailOpacity = useTransform(scrollProgress,
        [0.00, 0.015, 0.22, 0.32, 1.00],
        [0, 0.9, 0.9, 0, 0],
        { clamp: true }
    )
    const trailX = useTransform(scrollProgress, [0.00, 0.08, 0.22], ['-12%', '4%', '24%'], { clamp: true })
    const trailY = useTransform(scrollProgress, [0.00, 0.08, 0.18, 0.28], ['38%', '30%', '27%', '36%'], { clamp: true })
    const trailRotate = useTransform(scrollProgress, [0.00, 0.08, 0.18, 0.28], [-4, 8, -6, 12], { clamp: true })

    // ── Envelope Chapter ─────────────────────────────────────────
    const envOpacity = useTransform(scrollProgress,
        [0.26, 0.34, 0.80, 0.88, 1.00],
        [0, 1, 1, 0, 0],
        { clamp: true }
    )
    const envX = useTransform(scrollProgress,
        [0.26, 0.34, 0.50, 0.88, 1.00],
        ['50%', '50%', '50%', '50%', '50%'],
        { clamp: true }
    )
    const envY = useTransform(scrollProgress,
        [0.26, 0.34, 0.50, 0.70, 0.88, 1.00],
        ['48%', '48%', '36%', '35%', '34%', '48%'],
        { clamp: true }
    )
    const envScale = useTransform(scrollProgress,
        [0.26, 0.34, 0.48, 0.84, 0.94, 1.00],
        [0.4, 0.5, 1, 1, 0.4, 0.4],
        { clamp: true }
    )
    const envRotate = useTransform(scrollProgress,
        [0.26, 0.34, 0.48, 0.84, 0.94, 1.00],
        [28, 20, 0, 0, 28, 28],
        { clamp: true }
    )
    const flapProgress = useTransform(scrollProgress,
        [0.46, 0.64, 0.82, 0.92, 1.00],
        [0, 1, 1, 0, 0],
        { clamp: true }
    )
    const envGlowStrength = useTransform(flapProgress, [0.5, 1], [0, 0.25])
    const envGlow = useMotionTemplate`drop-shadow(0 6px 20px rgba(225,29,72,${envGlowStrength}))`

    // ── Letter Emerging ──────────────────────────────────────────
    const letterOpacity = useTransform(scrollProgress,
        [0.48, 0.56, 0.80, 0.88, 1.00],
        [0, 1, 1, 0, 0],
        { clamp: true }
    )
    const letterY = useTransform(scrollProgress,
        [0.26, 0.48, 0.64, 0.84, 1.00],
        ['48%', '37%', '23%', '30%', '48%'],
        { clamp: true }
    )
    const letterScale = useTransform(scrollProgress,
        [0.48, 0.62, 0.84, 1.00],
        [0.35, 1, 1, 0.35],
        { clamp: true }
    )
    const letterRotate = useTransform(scrollProgress,
        [0.48, 0.62, 0.84, 1.00],
        [4, 0, 0, 4],
        { clamp: true }
    )

    // ── Heart & Burst Chapter ────────────────────────────────────
    const heartOpacity = useTransform(scrollProgress,
        [0.60, 0.70, 0.90, 0.98, 1.00],
        [0, 1, 1, 0.35, 0],
        { clamp: true }
    )
    const heartScale = useTransform(scrollProgress,
        [0.60, 0.74, 0.92, 0.98, 1.00],
        [0.2, 1, 1, 0.6, 0.35],
        { clamp: true }
    )
    const heartY = useTransform(scrollProgress,
        [0.60, 0.78, 0.90, 1.00],
        ['44%', '28%', '36%', '44%'],
        { clamp: true }
    )
    const burstOpacity = useTransform(scrollProgress,
        [0.60, 0.68, 0.80, 0.88, 1.00],
        [0, 1, 1, 0, 0],
        { clamp: true }
    )
    const burstProgress = useTransform(scrollProgress,
        [0.60, 0.72, 0.84, 1.00],
        [0, 1, 1, 0],
        { clamp: true }
    )

    // ── Cloud parallax ───────────────────────────────────────────
    const c1Y = useTransform(scrollProgress, [0.00, 0.80], [0, -30], { clamp: true })
    const c2Y = useTransform(scrollProgress, [0.00, 0.80], [0, -90], { clamp: true })
    const c3Y = useTransform(scrollProgress, [0.00, 0.80], [0, -15], { clamp: true })

    const skyCenterX = useTransform(scrollProgress, [0.00, 0.75], [55, 61], { clamp: true })
    const skyBackground = useMotionTemplate`radial-gradient(ellipse 140% 90% at ${skyCenterX}% 45%, #ffffff 0%, #fff8fa 35%, #ffeff4 70%, #ffe4ec 100%)`

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* ── Sky background ─────────────────────────────── */}
            <motion.div
                className="absolute inset-0"
                style={{ background: skyBackground }}
            />

            {/* ── Clouds ─────────────────────────────────────── */}
            {!isMobile && (
                <motion.div className="absolute inset-0" style={{ y: c1Y }}>
                    <Cloud w={500} cx={-60} cy={-20} opacity={0.22} variant={0} />
                    <Cloud w={380} cx="65%" cy={-10} opacity={0.18} variant={1} flip />
                    <Cloud w={280} cx="35%" cy={10} opacity={0.15} variant={2} />
                </motion.div>
            )}

            <motion.div className="absolute inset-0" style={{ y: c2Y }}>
                <Cloud w={560} cx={-80} cy="55%" opacity={0.35} variant={1} />
                {!isMobile && (
                    <>
                        <Cloud w={480} cx="68%" cy="60%" opacity={0.30} variant={0} flip />
                        <Cloud w={320} cx="28%" cy="52%" opacity={0.25} variant={2} blur={1} />
                    </>
                )}
            </motion.div>

            <motion.div className="absolute inset-0" style={{ y: c3Y }}>
                <Cloud w={640} cx={-100} cy="80%" opacity={0.45} variant={0} />
                <Cloud w={520} cx="62%" cy="82%" opacity={0.40} variant={1} flip />
                {!isMobile && (
                    <Cloud w={380} cx="25%" cy="86%" opacity={0.35} variant={2} />
                )}
            </motion.div>

            {/* ── Heart Trail ────────────────────────────────── */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    opacity: trailOpacity,
                    left: trailX,
                    top: trailY,
                    rotate: trailRotate,
                    translateX: '-50%',
                    translateY: '-50%',
                    originX: '100%',
                }}
            >
                <WindTrail isMobile={isMobile} />
            </motion.div>

            {/* ── Paper Airplane ─────────────────────────────── */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    opacity: planeOpacity,
                    left: planeX,
                    top: planeY,
                    rotate: planeRotate,
                    scale: planeScale,
                    translateX: '-50%',
                    translateY: '-50%',
                    filter: 'drop-shadow(0 14px 28px rgba(225,29,72,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.06))',
                }}
            >
                <PaperAirplane />
            </motion.div>

            {/* ── Letter Emerging ────────────────────────────── */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    opacity: letterOpacity,
                    left: envX,
                    top: letterY,
                    scale: letterScale,
                    rotate: letterRotate,
                    translateX: '-50%',
                    translateY: '-50%',
                    filter: 'drop-shadow(0 6px 14px rgba(225,29,72,0.2))',
                }}
            >
                <LetterSheet />
            </motion.div>

            {/* ── Envelope ───────────────────────────────────── */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    opacity: envOpacity,
                    left: envX,
                    top: envY,
                    scale: envScale,
                    rotate: envRotate,
                    filter: envGlow,
                    perspective: 400,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <Envelope flapProgress={flapProgress} />
            </motion.div>

            {/* ── Emotional Burst Particles ──────────────────── */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: burstOpacity }}
            >
                {burstParticles.map((particle) => (
                    <BurstParticle
                        key={particle.id}
                        particle={particle}
                        burstProgress={burstProgress}
                        centerY={heartY}
                        isMobile={isMobile}
                    />
                ))}
            </motion.div>

            {/* ── Heart ──────────────────────────────────────── */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    opacity: heartOpacity,
                    left: '50%',
                    top: heartY,
                    scale: heartScale,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Heart />
                </motion.div>
            </motion.div>

            {/* ── Bottom Fade Overlay ─────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(255,245,247,0.3) 70%, rgba(255,245,247,1) 100%)' }}
            />
        </div>
    )
}
