import { useRef, useLayoutEffect } from 'react'
import { motion, useMotionTemplate, useSpring, useTransform, type MotionValue } from 'framer-motion'

// ── Scroll Timeline (chapter-based cyclic) ──────────────────────
// 0.00 → 0.30  Airplane enters, flies, and hands off the scene
// 0.30 → 0.65  Envelope materialises, letter emerges, and flap opens
// 0.65 → 0.80  Heart emerges from the open envelope
// 0.80 → 1.00  Cloud/light veil masks a scene reset to frame 0
//
// Start and end frames are identical, but the reset is a forward
// transition chapter (not a mirrored rewind).
//
// NOTE — Motion v12 WAAPI bug: MotionValues whose initial value is 0
// get stuck at 0 when placed in style.opacity.  Fix: keep opacity out of
// the style/prop entirely; drive it imperatively via refs in useLayoutEffect.

// ── Paper Airplane SVG ──────────────────────────────────────────
function PaperAirplane() {
    return (
        <svg viewBox="0 0 160 72" width="260" height="117" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft drop shadow */}
            <ellipse cx="78" cy="68" rx="50" ry="4" fill="rgba(160,80,100,0.12)" />

            {/* Upper wing */}
            <polygon
                points="155,36 0,4 58,36"
                fill="white"
                stroke="rgba(180,130,150,0.2)"
                strokeWidth="0.6"
            />
            {/* Upper fold detail */}
            <polygon
                points="155,36 90,36 75,28"
                fill="rgba(240,230,238,0.9)"
            />

            {/* Lower body/tail */}
            <polygon
                points="155,36 0,68 58,36"
                fill="#f0eaf0"
                stroke="rgba(180,130,150,0.2)"
                strokeWidth="0.6"
            />
            {/* Lower fold detail */}
            <polygon
                points="155,36 90,36 75,44"
                fill="rgba(225,210,228,0.8)"
            />

            {/* Rear tail panel */}
            <polygon
                points="0,4 0,68 58,36"
                fill="#f8f0f4"
                stroke="rgba(180,130,150,0.15)"
                strokeWidth="0.4"
            />

            {/* Fuselage centre crease */}
            <line x1="0" y1="4" x2="155" y2="36" stroke="rgba(160,100,130,0.2)" strokeWidth="0.8" />
            <line x1="58" y1="36" x2="155" y2="36" stroke="rgba(160,100,130,0.25)" strokeWidth="0.8" />
        </svg>
    )
}

// ── Wind Trail SVG ──────────────────────────────────────────────
function WindTrail() {
    const hearts = [
        { x: 206, y: 30, size: 16, opacity: 0.95 },
        { x: 176, y: 36, size: 14, opacity: 0.82 },
        { x: 150, y: 27, size: 12, opacity: 0.72 },
        { x: 122, y: 39, size: 11, opacity: 0.62 },
        { x: 94, y: 31, size: 10, opacity: 0.52 },
        { x: 68, y: 41, size: 9, opacity: 0.42 },
        { x: 44, y: 34, size: 8, opacity: 0.35 },
        { x: 22, y: 44, size: 7, opacity: 0.28 },
    ] as const

    return (
        <svg viewBox="0 0 240 84" width="240" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="trail-heart-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255, 210, 230, 0.7)" />
                    <stop offset="100%" stopColor="rgba(255, 210, 230, 0)" />
                </radialGradient>
            </defs>
            <motion.g
                animate={{ x: [0, -8, 0], y: [0, -3, 0] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            >
                {hearts.map((heart, i) => (
                    <g key={i} opacity={heart.opacity}>
                        <circle cx={heart.x} cy={heart.y} r={heart.size * 0.65} fill="url(#trail-heart-glow)" />
                        <text
                            x={heart.x}
                            y={heart.y + heart.size * 0.35}
                            textAnchor="middle"
                            fontSize={heart.size}
                            fill="rgba(255,255,255,0.95)"
                            fontFamily="serif"
                        >
                            ♥
                        </text>
                    </g>
                ))}
            </motion.g>
        </svg>
    )
}

// ── Envelope SVG ────────────────────────────────────────────────
function Envelope({ flapProgress }: { flapProgress: MotionValue<number> }) {
    // Flap pivot: rotates from closed (0°) to open (-175°) about the top edge
    const springFlap = useSpring(flapProgress, { stiffness: 180, damping: 22, mass: 0.6 })
    const flapRotateX = useTransform(springFlap, [0, 1], [0, -175])

    return (
        <svg viewBox="0 0 180 130" width="300" height="217" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            {/* Body */}
            <rect x="0" y="30" width="180" height="100" rx="4"
                fill="white"
                stroke="rgba(220,160,180,0.5)"
                strokeWidth="1.5"
            />

            {/* Left inner fold */}
            <polygon
                points="0,30 90,75 0,130"
                fill="rgba(255,220,230,0.6)"
                stroke="rgba(220,160,180,0.3)"
                strokeWidth="0.8"
            />
            {/* Right inner fold */}
            <polygon
                points="180,30 90,75 180,130"
                fill="rgba(255,215,228,0.6)"
                stroke="rgba(220,160,180,0.3)"
                strokeWidth="0.8"
            />
            {/* Bottom inner fold */}
            <polygon
                points="0,130 180,130 90,75"
                fill="rgba(255,228,238,0.5)"
            />

            {/* Letter lines inside envelope */}
            <line x1="30" y1="88" x2="150" y2="88" stroke="rgba(200,150,170,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="100" x2="150" y2="100" stroke="rgba(200,150,170,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="112" x2="110" y2="112" stroke="rgba(200,150,170,0.4)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Flap — rotates open around the top edge (y=30) */}
            <motion.g
                style={{
                    originX: '90px',
                    originY: '30px',
                    transformStyle: 'preserve-3d',
                    rotateX: flapRotateX,
                }}
            >
                {/* Flap triangle (closed = pointing down) */}
                <polygon
                    points="0,30 180,30 90,75"
                    fill="#fce8f0"
                    stroke="rgba(220,160,180,0.5)"
                    strokeWidth="1.2"
                />
                {/* Oval wax seal */}
                <circle cx="90" cy="46" r="10" fill="#e05878" opacity="0.9" />
                <text x="90" y="50" textAnchor="middle" fontSize="12" fill="white" fontFamily="serif">♥</text>
            </motion.g>
        </svg>
    )
}

// ── Heart SVG ───────────────────────────────────────────────────
function Heart() {
    return (
        <svg viewBox="0 0 80 72" width="120" height="108" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glow */}
            <ellipse cx="40" cy="40" rx="36" ry="32" fill="rgba(224,88,120,0.15)" />
            {/* Heart */}
            <path
                d="M40 62 C40 62 8 44 8 24 C8 14 16 8 24 8 C30 8 35 11 40 18 C45 11 50 8 56 8 C64 8 72 14 72 24 C72 44 40 62 40 62Z"
                fill="#e05878"
            />
            {/* Specular highlight */}
            <path
                d="M26 16 C24 20 22 26 24 30"
                stroke="rgba(255,255,255,0.5)"
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
            <rect x="10" y="10" width="160" height="110" rx="8" fill="#fffafc" stroke="rgba(214,150,174,0.5)" strokeWidth="1.2" />
            <line x1="28" y1="72" x2="150" y2="72" stroke="rgba(210,150,172,0.35)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="28" y1="86" x2="150" y2="86" stroke="rgba(210,150,172,0.35)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="28" y1="100" x2="120" y2="100" stroke="rgba(210,150,172,0.35)" strokeWidth="1.4" strokeLinecap="round" />
            <text x="26" y="54" fill="#bf4b6b" fontSize="18" fontFamily="'Dancing Script', cursive">
                Para você 💌
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

function BurstParticle({
    particle,
    burstProgress,
    centerY,
}: {
    particle: BurstParticleConfig
    burstProgress: MotionValue<number>
    centerY: MotionValue<string>
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
                filter: 'drop-shadow(0 0 8px rgba(255, 196, 224, 0.7))',
            }}
        >
            {particle.kind === 'star' ? (
                <svg width={particle.size} height={particle.size} viewBox="0 0 24 24" fill="rgba(255,255,255,0.92)">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                </svg>
            ) : (
                <svg width={particle.size} height={particle.size + 4} viewBox="0 0 24 28" fill="#f6a7c2">
                    <path d="M12 2C8 2 5 5 5 9c0 5 4 9 7 13 3-4 7-8 7-13 0-4-3-7-7-7z" />
                </svg>
            )}
        </motion.div>
    )
}

// ── Cloud variants (3 shapes with inner highlight) ───────────────
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

// ── Cloud shapes (matches SiteAtmosphere palette) ────────────────
function Cloud({ w = 320, cx = '0', cy = '0', opacity = 0.28, flip = false, variant = 0 as 0 | 1 | 2, blur = 0 }: {
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
                <path d={highlight} fill="rgba(255,255,255,0.35)" />
            </svg>
        </div>
    )
}

// ── Main Component ──────────────────────────────────────────────
interface HeroAnimationProps {
    scrollProgress: MotionValue<number>
}

export function HeroAnimation({ scrollProgress }: HeroAnimationProps) {
    // ── Airplane ──────────────────────────────────────────────
    const planeX = useTransform(scrollProgress,
        [0.00, 0.10, 0.22, 0.34, 0.88, 0.98, 1.00],
        ['-18%', '10%', '34%', '52%', '52%', '-18%', '-18%']
    )
    const planeY = useTransform(scrollProgress,
        [0.00, 0.10, 0.22, 0.34, 0.88, 0.98, 1.00],
        ['42%', '30%', '24%', '50%', '50%', '42%', '42%']
    )
    const planeRotate = useTransform(scrollProgress,
        [0.00, 0.10, 0.22, 0.34, 0.88, 0.98, 1.00],
        [-8, 8, -10, 34, 34, -8, -8]
    )
    const planeOpacity = useTransform(scrollProgress, [0.00, 0.03, 0.32, 0.40, 1.00], [0, 1, 1, 0, 0])
    const planeScale = useTransform(scrollProgress, [0.00, 0.08, 0.24, 0.34, 0.40, 0.98, 1.00], [0.85, 1, 1.04, 0.35, 0.2, 0.85, 0.85])

    // ── Wind trail ─────────────────────────────────────────────
    const trailOpacity = useTransform(scrollProgress, [0.00, 0.03, 0.24, 0.33, 1.00], [0, 0.8, 0.8, 0, 0])
    const trailX = useTransform(scrollProgress, [0.00, 0.12, 0.28], ['-28%', '-5%', '24%'])
    const trailY = useTransform(scrollProgress, [0.00, 0.12, 0.24, 0.32], ['40%', '30%', '26%', '36%'])
    const trailRotate = useTransform(scrollProgress, [0.00, 0.12, 0.24, 0.32], [-8, 8, -10, 12])

    // ── Envelope chapter (0.30→0.65), with plane→envelope morph handoff ─────────
    const envOpacity = useTransform(scrollProgress, [0.30, 0.38, 0.78, 0.88, 1.00], [0, 1, 1, 0, 0])
    const envX = useTransform(scrollProgress,
        [0.30, 0.36, 0.50, 0.88, 0.98, 1.00],
        ['52%', '52%', '50%', '50%', '52%', '52%']
    )
    const envY = useTransform(scrollProgress,
        [0.30, 0.36, 0.50, 0.70, 0.88, 0.98, 1.00],
        ['50%', '50%', '36%', '35%', '34%', '50%', '50%']
    )
    const envScale = useTransform(scrollProgress, [0.30, 0.36, 0.48, 0.86, 0.96, 1.00], [0.35, 0.35, 1, 1, 0.35, 0.35])
    const envRotate = useTransform(scrollProgress, [0.30, 0.36, 0.50, 0.86, 0.96, 1.00], [34, 34, 0, 0, 34, 34])
    const flapProgress = useTransform(scrollProgress, [0.54, 0.70, 0.82, 0.92, 1.00], [0, 1, 1, 0, 0])
    const envGlowStrength = useTransform(flapProgress, [0.5, 1], [0, 0.25])
    const envGlow = useMotionTemplate`drop-shadow(0 4px 16px rgba(224,88,120,${envGlowStrength}))`

    // ── Letter chapter (emerges as flap opens) ────────────────────
    // Keep letter riding with envelope first, then reveal once flap is opening.
    const letterOpacity = useTransform(scrollProgress, [0.54, 0.60, 0.78, 0.88, 1.00], [0, 1, 1, 0, 0])
    const letterY = useTransform(scrollProgress, [0.30, 0.50, 0.54, 0.70, 0.84, 1.00], ['51%', '37%', '37%', '23%', '30%', '51%'])
    const letterScale = useTransform(scrollProgress, [0.54, 0.66, 0.84, 1.00], [0.32, 1, 1, 0.32])
    const letterRotate = useTransform(scrollProgress, [0.54, 0.66, 0.84, 1.00], [4, 0, 0, 4])

    // ── Heart chapter (0.65→0.80), then masked reset ─────────────
    const heartOpacity = useTransform(scrollProgress, [0.66, 0.74, 0.90, 0.97, 1.00], [0, 1, 1, 0.35, 0])
    const heartScale = useTransform(scrollProgress, [0.66, 0.78, 0.92, 0.98, 1.00], [0.2, 1, 1, 0.62, 0.35])
    const heartY = useTransform(scrollProgress,
        [0.66, 0.82, 0.90, 1.00],
        ['44%', '29%', '36%', '44%']
    )
    const burstOpacity = useTransform(scrollProgress, [0.66, 0.70, 0.80, 0.88, 1.00], [0, 1, 1, 0, 0])
    const burstProgress = useTransform(scrollProgress, [0.66, 0.74, 0.84, 1.00], [0, 1, 1, 0])

    // ── Cloud parallax + return-to-start frame at the end ───────
    const c1Y = useTransform(scrollProgress, [0.00, 0.80, 1.00], [0, -30, 0])
    const c2Y = useTransform(scrollProgress, [0.00, 0.80, 1.00], [0, -90, 0])
    const c3Y = useTransform(scrollProgress, [0.00, 0.80, 1.00], [0, -15, 0])

    // ── Chapter 4 veil (mask reset), then reveal frame 0 at 1.0 ───
    const exitOpacity = useTransform(scrollProgress, [0.80, 0.90, 0.97, 1.00], [0, 0.85, 0.85, 0])
    const skyCenterX = useTransform(scrollProgress, [0.00, 0.75, 1.00], [55, 61, 55])
    const skyBackground = useMotionTemplate`radial-gradient(ellipse 140% 90% at ${skyCenterX}% 45%, #fbc5cc 0%, #f4a8b4 25%, #e8909e 55%, #f2c5cb 82%, #fad8dc 100%)`

    // ── Imperative opacity refs (Motion v12 WAAPI workaround) ─────
    // Opacity MotionValues that start at 0 are stuck if used in style/prop.
    // Instead: start elements hidden via CSS class, update via .on('change').
    const planeRef  = useRef<HTMLDivElement>(null)
    const trailRef  = useRef<HTMLDivElement>(null)
    const letterRef = useRef<HTMLDivElement>(null)
    const envRef    = useRef<HTMLDivElement>(null)
    const burstRef  = useRef<HTMLDivElement>(null)
    const heartRef  = useRef<HTMLDivElement>(null)
    const exitRef   = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const pairs = [
            [planeRef, planeOpacity],
            [trailRef, trailOpacity],
            [letterRef, letterOpacity],
            [envRef, envOpacity],
            [burstRef, burstOpacity],
            [heartRef, heartOpacity],
            [exitRef, exitOpacity],
        ] as const
        // Set initial values then subscribe to every change
        const unsubs = pairs.map(([ref, mv]) => {
            if (ref.current) ref.current.style.opacity = String(mv.get())
            return mv.on('change', v => { if (ref.current) ref.current.style.opacity = String(v) })
        })
        return () => unsubs.forEach(u => u())
    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* ── Sky background ─────────────────────────────── */}
            <motion.div
                className="absolute inset-0"
                style={{
                    background: skyBackground,
                }}
            />

            {/* ── Far background clouds ──────────────────────── */}
            <motion.div className="absolute inset-0" style={{ y: c1Y }}>
                <Cloud w={500} cx={-60} cy={-20} opacity={0.18} variant={0} />
                <Cloud w={380} cx="65%" cy={-10} opacity={0.15} variant={1} flip />
                <Cloud w={280} cx="35%" cy={10} opacity={0.12} variant={2} />
            </motion.div>

            {/* ── Mid clouds ─────────────────────────────────── */}
            <motion.div className="absolute inset-0" style={{ y: c2Y }}>
                <Cloud w={560} cx={-80} cy="55%" opacity={0.32} variant={1} />
                <Cloud w={480} cx="68%" cy="60%" opacity={0.28} variant={0} flip />
                <Cloud w={320} cx="28%" cy="52%" opacity={0.20} variant={2} blur={1} />
            </motion.div>

            {/* ── Foreground clouds ──────────────────────────── */}
            <motion.div className="absolute inset-0" style={{ y: c3Y }}>
                <Cloud w={640} cx={-100} cy="80%" opacity={0.40} variant={0} />
                <Cloud w={520} cx="62%" cy="82%" opacity={0.36} variant={1} flip />
                <Cloud w={380} cx="25%" cy="86%" opacity={0.30} variant={2} />
            </motion.div>

            {/* ── Transition cloud bank (masks hero/content seam) ── */}
            <div className="absolute inset-0">
                <Cloud w={760} cx={-130} cy="76%" opacity={0.70} variant={0} />
                <Cloud w={680} cx="52%" cy="80%" opacity={0.62} variant={1} flip />
                <Cloud w={580} cx="18%" cy="86%" opacity={0.58} variant={2} />
                <Cloud w={700} cx={-60} cy="90%" opacity={0.75} variant={0} flip blur={1} />
                <Cloud w={540} cx="65%" cy="88%" opacity={0.65} variant={1} />
                <Cloud w={480} cx="32%" cy="93%" opacity={0.60} variant={2} flip />
            </div>


            {/* ── Heart trail ────────────────────────────────── */}
            <motion.div
                ref={trailRef}
                className="absolute opacity-0"
                style={{
                    left: trailX,
                    top: trailY,
                    rotate: trailRotate,
                    translateX: '-50%',
                    translateY: '-50%',
                    originX: '100%',
                }}
            >
                <WindTrail />
            </motion.div>

            {/* ── Paper airplane ─────────────────────────────── */}
            <motion.div
                ref={planeRef}
                className="absolute opacity-0"
                style={{
                    left: planeX,
                    top: planeY,
                    rotate: planeRotate,
                    scale: planeScale,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <PaperAirplane />
            </motion.div>

            {/* ── Letter emerging from envelope ──────────────── */}
            <motion.div
                ref={letterRef}
                className="absolute opacity-0 pointer-events-none"
                style={{
                    left: envX,
                    top: letterY,
                    scale: letterScale,
                    rotate: letterRotate,
                    translateX: '-50%',
                    translateY: '-50%',
                    filter: 'drop-shadow(0 4px 10px rgba(194,109,138,0.24))',
                }}
            >
                <LetterSheet />
            </motion.div>

            {/* ── Envelope ───────────────────────────────────── */}
            <motion.div
                ref={envRef}
                className="absolute opacity-0"
                style={{
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

            {/* ── Emotional burst particles ───────────────────── */}
            <div ref={burstRef} className="absolute inset-0 pointer-events-none opacity-0">
                {BURST_PARTICLES.map((particle) => (
                    <BurstParticle
                        key={particle.id}
                        particle={particle}
                        burstProgress={burstProgress}
                        centerY={heartY}
                    />
                ))}
            </div>

            {/* ── Heart ──────────────────────────────────────── */}
            <motion.div
                ref={heartRef}
                className="absolute opacity-0"
                style={{
                    left: '50%',
                    top: heartY,
                    scale: heartScale,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                >
                    <Heart />
                </motion.div>
            </motion.div>

            {/* ── Bottom gradient overlay ─────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 52%, rgba(253,242,248,0.25) 68%, rgba(253,242,248,0.75) 84%, rgba(253,242,248,1) 100%)' }}
            />

            {/* ── Chapter 4 veil — masks reset to frame 0 ────────── */}
            <motion.div
                ref={exitRef}
                className="absolute inset-0 pointer-events-none opacity-0"
                style={{ backgroundColor: 'hsl(var(--background))' }}
            />
        </div>
    )
}
