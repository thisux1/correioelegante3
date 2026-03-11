import { motion, useTransform, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'

// ── Cloud SVG Shapes ────────────────────────────────────────────

function CloudShape1({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 320 120" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M280 90c22 0 40-16 40-36s-18-36-40-36c-4 0-8 0.5-12 1.5C262 8 248 0 232 0c-20 0-36 12-42 30-4-2-8-2-12-2-26 0-48 18-48 40 0 1 0 2 0.1 3H60c-33 0-60 20-60 42h320c0-13-16-23-40-23z" />
        </svg>
    )
}

function CloudShape2({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 260 100" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M230 80c16 0 30-12 30-28s-14-28-30-28c-2 0-4 0-6 0.5C220 10 206 0 190 0c-14 0-26 8-32 20-6-4-14-6-22-6-22 0-40 16-40 36 0 2 0 4 0.5 6H40c-22 0-40 14-40 32h268c0-4-14-8-38-8z" />
        </svg>
    )
}

function CloudShape3({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 80" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M170 64c16 0 30-11 30-25s-14-25-30-25c-3 0-6 0.4-8 1C158 6 146 0 132 0c-12 0-22 6-28 16-4-2-10-4-16-4-18 0-32 13-32 30 0 1 0 3 0.2 4H24c-14 0-24 8-24 18h194c0-2-10-0-24-0z" />
        </svg>
    )
}

// ── 4-Pointed Star SVG ──────────────────────────────────────────

function FourPointStar({ size = 16, className }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
    )
}

// ── Cloud config ────────────────────────────────────────────────
interface CloudConfig {
    Shape: React.FC<{ className?: string }>
    drift: number
    duration: number
    x: string
    y: string
    scale: number
    opacity: number
    z: number
    parallax: number
    flip?: boolean
}

const clouds: CloudConfig[] = [
    // Far background — slow, more visible now
    { Shape: CloudShape1, drift: 8, duration: 60, x: '-5%', y: '8%', scale: 1.3, opacity: 0.25, z: 1, parallax: 0.05 },
    { Shape: CloudShape2, drift: 6, duration: 80, x: '65%', y: '5%', scale: 1.0, opacity: 0.22, z: 1, parallax: 0.05, flip: true },

    // Mid layer — moderate speed
    { Shape: CloudShape3, drift: 12, duration: 45, x: '80%', y: '18%', scale: 0.9, opacity: 0.32, z: 2, parallax: 0.12 },
    { Shape: CloudShape1, drift: 10, duration: 55, x: '-10%', y: '25%', scale: 0.7, opacity: 0.28, z: 2, parallax: 0.12, flip: true },
    { Shape: CloudShape2, drift: 14, duration: 50, x: '40%', y: '12%', scale: 0.6, opacity: 0.26, z: 2, parallax: 0.10 },

    // Foreground — larger, more opaque
    { Shape: CloudShape1, drift: 20, duration: 35, x: '-15%', y: '70%', scale: 1.6, opacity: 0.38, z: 3, parallax: 0.25 },
    { Shape: CloudShape3, drift: 18, duration: 40, x: '75%', y: '75%', scale: 1.4, opacity: 0.34, z: 3, parallax: 0.25, flip: true },
    { Shape: CloudShape2, drift: 16, duration: 38, x: '20%', y: '80%', scale: 1.1, opacity: 0.30, z: 3, parallax: 0.20 },
]

// Mobile: keep 1 from each layer = 3 clouds total (instead of 8)
const MOBILE_CLOUD_INDICES = [0, 2, 5]
const mobileClouds = MOBILE_CLOUD_INDICES.map(i => clouds[i])

// ── Star config ─────────────────────────────────────────────────
interface StarConfig {
    x: number    // % position
    y: number    // % position
    size: number // px
    delay: number // animation delay
    duration: number // twinkle cycle duration
}

function generateStars(count: number, seed: number): StarConfig[] {
    const stars: StarConfig[] = []
    // Simple seeded pseudo-random for consistent layout
    let s = seed
    const rand = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }

    for (let i = 0; i < count; i++) {
        stars.push({
            x: rand() * 100,
            y: rand() * 90,
            size: 6 + rand() * 18,
            delay: rand() * 8,
            duration: 2.5 + rand() * 4,
        })
    }
    return stars
}

// ── Mouse tracking hook ─────────────────────────────────────────
function useMouseParallax(containerRef: React.RefObject<HTMLDivElement | null>, strength: number = 1) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const smoothX = useSpring(mouseX, { stiffness: 40, damping: 30, restDelta: 0.001 })
    const smoothY = useSpring(mouseY, { stiffness: 40, damping: 30, restDelta: 0.001 })

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect()
            // Normalize to -1 to 1 range from center
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
            mouseX.set(nx * strength * 20)
            mouseY.set(ny * strength * 10)
        }

        const handleLeave = () => {
            mouseX.set(0)
            mouseY.set(0)
        }

        el.addEventListener('mousemove', handleMove)
        el.addEventListener('mouseleave', handleLeave)
        return () => {
            el.removeEventListener('mousemove', handleMove)
            el.removeEventListener('mouseleave', handleLeave)
        }
    }, [containerRef, mouseX, mouseY, strength])

    return { smoothX, smoothY }
}

// ── Main Component ──────────────────────────────────────────────
interface HeroCloudsProps {
    scrollProgress: MotionValue<number>
}

export function HeroClouds({ scrollProgress }: HeroCloudsProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Mobile detection — consistent with CSS media queries
    const isMobile = typeof window !== 'undefined'
        ? window.matchMedia('(max-width: 767px)').matches
        : false

    // Mouse parallax disabled on mobile (no mouse on touch devices)
    const { smoothX, smoothY } = useMouseParallax(containerRef, isMobile ? 0 : 1)

    // Mobile: 8 stars, Desktop: 25
    const stars = useMemo(() => generateStars(isMobile ? 8 : 25, 42), [isMobile])

    // Mobile: 3 clouds (1 per layer), Desktop: all 8
    const activeClouds = isMobile ? mobileClouds : clouds

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={{ zIndex: 5, pointerEvents: isMobile ? 'none' : 'auto' }}
        >
            {/* Cloud layers */}
            {activeClouds.map((cloud, i) => (
                <CloudLayer
                    key={`cloud-${i}`}
                    config={cloud}
                    scrollProgress={scrollProgress}
                    mouseX={smoothX}
                    mouseY={smoothY}
                    index={i}
                />
            ))}

            {/* Star particles */}
            {stars.map((star, i) => (
                <StarParticle
                    key={`star-${i}`}
                    config={star}
                    mouseX={smoothX}
                    mouseY={smoothY}
                />
            ))}
        </div>
    )
}

// ── Cloud Layer ─────────────────────────────────────────────────
function CloudLayer({
    config,
    scrollProgress,
    mouseX,
    mouseY,
    index,
}: {
    config: CloudConfig
    scrollProgress: MotionValue<number>
    mouseX: MotionValue<number>
    mouseY: MotionValue<number>
    index: number
}) {
    const { Shape, drift, duration, x, y, scale, opacity, parallax, flip, z } = config

    // Scroll parallax
    const scrollY = useTransform(scrollProgress, [0, 1], [0, -parallax * 100])

    // Mouse parallax — deeper layers move less
    const mouseStrength = z === 1 ? 0.3 : z === 2 ? 0.6 : 1.0
    const mX = useTransform(mouseX, (v) => v * mouseStrength)
    const mY = useTransform(mouseY, (v) => v * mouseStrength)

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: x,
                top: y,
                y: scrollY,
                x: mX,
                translateY: mY,
                scale: scale,
                scaleX: flip ? -1 : 1,
                opacity,
                color: 'rgba(255, 240, 245, 1)',
                willChange: 'transform',
            }}
        >
            <motion.div
                animate={{
                    x: [`0vw`, `${drift}vw`, `0vw`],
                    y: [0, -drift * 0.3, 0],
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 2.5,
                }}
            >
                <Shape className="w-[200px] sm:w-[280px] md:w-[360px] lg:w-[420px]" />
                <div
                    className="absolute inset-0 blur-2xl rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)',
                    }}
                />
            </motion.div>
        </motion.div>
    )
}

// ── Star Particle ───────────────────────────────────────────────
function StarParticle({
    config,
    mouseX,
    mouseY,
}: {
    config: StarConfig
    mouseX: MotionValue<number>
    mouseY: MotionValue<number>
}) {
    const { x, y, size, delay, duration } = config
    const [pos, setPos] = useState({ x, y })

    // Mouse parallax for stars (subtle)
    const mX = useTransform(mouseX, (v) => v * 0.5)
    const mY = useTransform(mouseY, (v) => v * 0.5)

    // Relocate star to a new random position after each twinkle cycle
    const handleAnimationComplete = useCallback(() => {
        setPos({
            x: Math.random() * 95 + 2,
            y: Math.random() * 85 + 2,
        })
    }, [])

    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                x: mX,
                y: mY,
                color: 'rgba(255, 255, 255, 0.9)',
                filter: `drop-shadow(0 0 ${size * 0.4}px rgba(255, 220, 240, 0.8))`,
                willChange: 'transform, opacity',
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1, 0.8, 0.2],
                rotate: [0, 45, 90, 135],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
                repeatDelay: 0.5,
            }}
            onAnimationComplete={handleAnimationComplete}
        >
            <FourPointStar size={size} />
        </motion.div>
    )
}
