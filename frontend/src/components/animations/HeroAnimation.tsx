import { motion, useTransform, type MotionValue } from 'framer-motion'

// ── Scroll Timeline ─────────────────────────────────────────────
// 0.00 → 0.15  Airplane enters from lower-left
// 0.15 → 0.40  Airplane soars through pink sky, banking gently
// 0.40 → 0.58  Airplane slows, spirals downward
// 0.55 → 0.72  Paper "crumples back" — airplane opacity fades, envelope appears
// 0.70 → 0.85  Envelope settles, flap swings open dramatically
// 0.82 → 1.00  Heart floats up from envelope

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
    return (
        <svg viewBox="0 0 220 60" width="220" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M 210 30 C 160 10, 120 50, 80 28 C 50 10, 20 40, 0 30"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M 200 36 C 155 20, 105 48, 70 35 C 45 25, 20 38, 5 34"
                stroke="rgba(255,200,220,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

// ── Envelope SVG ────────────────────────────────────────────────
function Envelope({ flapProgress }: { flapProgress: MotionValue<number> }) {
    // Flap pivot: rotates from closed (0°) to open (-175°) about the top edge
    const flapRotateX = useTransform(flapProgress, [0, 1], [0, -175])

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

// ── Cloud shapes (matches SiteAtmosphere palette) ────────────────
function Cloud({ w = 320, cx = '0', cy = '0', opacity = 0.28, flip = false }: {
    w?: number; cx?: number | string; cy?: number | string; opacity?: number; flip?: boolean
}) {
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
            <svg viewBox="0 0 320 120" fill="currentColor" width={w} style={{ display: 'block' }}>
                <path d="M280 90c22 0 40-16 40-36s-18-36-40-36c-4 0-8 .5-12 1.5C262 8 248 0 232 0c-20 0-36 12-42 30-4-2-8-2-12-2-26 0-48 18-48 40 0 1 0 2 .1 3H60c-33 0-60 20-60 42h320c0-13-16-23-40-23z" />
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
    // 200vh section → 100vh scroll travel. Full 0→1 range is usable.
    const planeX = useTransform(scrollProgress,
        [0, 0.12, 0.30, 0.44, 0.54],
        ['-12%', '12%', '32%', '46%', '50%']
    )
    const planeY = useTransform(scrollProgress,
        [0, 0.12, 0.24, 0.36, 0.46, 0.54],
        ['40%', '30%', '24%', '32%', '42%', '52%']
    )
    const planeRotate = useTransform(scrollProgress,
        [0, 0.12, 0.24, 0.36, 0.46, 0.54],
        [-6, 8, -12, 4, 22, 80]
    )
    const planeOpacity = useTransform(scrollProgress, [0.40, 0.54], [1, 0])
    const planeScale = useTransform(scrollProgress, [0, 0.40, 0.54], [1, 1.05, 0.1])

    // ── Wind trail ─────────────────────────────────────────────
    const trailOpacity = useTransform(scrollProgress, [0, 0.06, 0.36, 0.48], [0, 0.8, 0.8, 0])
    const trailX = useTransform(scrollProgress, [0, 0.12, 0.36], ['-28%', '-5%', '18%'])
    const trailY = useTransform(scrollProgress, [0, 0.12, 0.24, 0.36], ['40%', '30%', '26%', '34%'])
    const trailRotate = useTransform(scrollProgress, [0, 0.12, 0.28, 0.36], [-6, 8, -12, 4])

    // ── Envelope ── appears at 0.46, drifts gently until 1.0 ──
    const envOpacity = useTransform(scrollProgress, [0.46, 0.58], [0, 1])
    const envY = useTransform(scrollProgress,
        [0.46, 0.64, 0.82, 1.0],
        ['28%', '36%', '35%', '34%']   // settles then barely drifts — always moving
    )
    const envScale = useTransform(scrollProgress, [0.46, 0.62], [0.2, 1])
    const envRotate = useTransform(scrollProgress, [0.46, 0.62], [-20, 0])
    const flapProgress = useTransform(scrollProgress, [0.58, 0.74], [0, 1])

    // ── Heart ── floats all the way to 1.0 ────────────────────
    const heartOpacity = useTransform(scrollProgress, [0.70, 0.80], [0, 1])
    const heartScale = useTransform(scrollProgress, [0.70, 0.82], [0, 1])
    const heartY = useTransform(scrollProgress,
        [0.70, 0.86, 1.0],
        ['48%', '30%', '26%']          // keeps floating — no dead zone
    )

    // ── Cloud parallax ─────────────────────────────────────────
    const c1Y = useTransform(scrollProgress, [0, 1], [0, -55])
    const c2Y = useTransform(scrollProgress, [0, 1], [0, -90])
    const c3Y = useTransform(scrollProgress, [0, 1], [0, -35])

    // ── Hero exit fade (progress 0.82→1.0) ────────────────────
    // Dissolves the whole hero into the page background — no dead zone
    const exitOpacity = useTransform(scrollProgress, [0.82, 1.0], [0, 1])


    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* ── Sky background ─────────────────────────────── */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 140% 90% at 55% 45%, #fbc5cc 0%, #f4a8b4 25%, #e8909e 55%, #f2c5cb 82%, #fad8dc 100%)',
                }}
            />

            {/* ── Far background clouds ──────────────────────── */}
            <motion.div className="absolute inset-0" style={{ y: c1Y }}>
                <Cloud w={500} cx={-60} cy={-20} opacity={0.18} />
                <Cloud w={380} cx="65%" cy={-10} opacity={0.15} flip />
                <Cloud w={280} cx="35%" cy={10} opacity={0.12} />
            </motion.div>

            {/* ── Mid clouds ─────────────────────────────────── */}
            <motion.div className="absolute inset-0" style={{ y: c2Y }}>
                <Cloud w={560} cx={-80} cy="55%" opacity={0.32} />
                <Cloud w={480} cx="68%" cy="60%" opacity={0.28} flip />
            </motion.div>

            {/* ── Foreground clouds ──────────────────────────── */}
            <motion.div className="absolute inset-0" style={{ y: c3Y }}>
                <Cloud w={640} cx={-100} cy="80%" opacity={0.40} />
                <Cloud w={520} cx="62%" cy="82%" opacity={0.36} flip />
                <Cloud w={380} cx="25%" cy="86%" opacity={0.30} />
            </motion.div>


            {/* ── Wind trail ─────────────────────────────────── */}
            <motion.div
                className="absolute"
                style={{
                    left: trailX,
                    top: trailY,
                    opacity: trailOpacity,
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
                className="absolute"
                style={{
                    left: planeX,
                    top: planeY,
                    rotate: planeRotate,
                    opacity: planeOpacity,
                    scale: planeScale,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <PaperAirplane />
            </motion.div>

            {/* ── Envelope ───────────────────────────────────── */}
            <motion.div
                className="absolute"
                style={{
                    left: '50%',
                    top: envY,
                    opacity: envOpacity,
                    scale: envScale,
                    rotate: envRotate,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <Envelope flapProgress={flapProgress} />
            </motion.div>

            {/* ── Heart ──────────────────────────────────────── */}
            <motion.div
                className="absolute"
                style={{
                    left: '50%',
                    top: heartY,
                    opacity: heartOpacity,
                    scale: heartScale,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <Heart />
            </motion.div>

            {/* ── Bottom gradient overlay ─────────────────────── */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />

            {/* ── Exit fade — dissolves hero into next section ──── */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: exitOpacity, backgroundColor: 'hsl(var(--background))' }}
            />
        </div>
    )
}
