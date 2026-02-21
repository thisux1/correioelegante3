import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

// ── Configuration ──────────────────────────────────────────────
const TOTAL_FRAMES = 211
const FRAME_PATH = '/hero-frames/frame_'
const FRAME_EXT = '.webp'

/** Generate the URL for a given frame index (1-based) */
function frameUrl(index: number): string {
    return `${FRAME_PATH}${String(index).padStart(3, '0')}${FRAME_EXT}`
}

// ── Types ──────────────────────────────────────────────────────
interface HeroVideoProps {
    /** Scroll progress from 0 to 1, provided by parent via useScroll */
    scrollProgress: MotionValue<number>
}

// ── Component ──────────────────────────────────────────────────
export function HeroVideo({ scrollProgress }: HeroVideoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const imagesRef = useRef<HTMLImageElement[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const lastFrameRef = useRef(-1)
    const isVisibleRef = useRef(true)

    // Direct mapping: scroll progress → frame index (0 to TOTAL_FRAMES-1)
    const frameIndex = useTransform(
        scrollProgress,
        [0, 1],
        [0, TOTAL_FRAMES - 1]
    )

    // Preload all frame images
    useEffect(() => {
        let cancelled = false
        const images: HTMLImageElement[] = []
        let loaded = 0

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image()
            img.src = frameUrl(i)
            img.onload = () => {
                if (cancelled) return
                loaded++
                if (loaded === TOTAL_FRAMES) {
                    imagesRef.current = images
                    setIsLoaded(true)
                }
            }
            img.onerror = () => {
                console.warn(`Failed to load hero frame ${i}`)
            }
            images.push(img)
        }

        return () => {
            cancelled = true
        }
    }, [])

    // Track visibility with IntersectionObserver — stop RAF when offscreen
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = entry.isIntersecting
            },
            { threshold: 0 } // trigger as soon as any part enters/exits
        )

        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    // Draw the correct frame on canvas
    const drawFrame = useCallback((index: number) => {
        const canvas = canvasRef.current
        const images = imagesRef.current
        if (!canvas || images.length === 0) return

        const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)))

        // Skip if same frame is already drawn
        if (i === lastFrameRef.current) return
        lastFrameRef.current = i

        const img = images[i]
        if (!img || !img.complete) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
        }

        ctx.drawImage(img, 0, 0)
    }, [])

    // RAF loop — only runs when visible
    useEffect(() => {
        if (!isLoaded) return

        drawFrame(frameIndex.get())

        let rafId: number

        function tick() {
            // Only draw when the hero section is on screen
            if (isVisibleRef.current) {
                drawFrame(frameIndex.get())
            }
            rafId = requestAnimationFrame(tick)
        }

        rafId = requestAnimationFrame(tick)

        return () => cancelAnimationFrame(rafId)
    }, [isLoaded, frameIndex, drawFrame])

    return (
        <>
            {/* Loading state */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-primary/30"
                    />
                </div>
            )}

            {/* Canvas — ref on outer div for IntersectionObserver */}
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                    style={{ pointerEvents: 'none' }}
                />
            </motion.div>

            {/* Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/60 pointer-events-none" />
        </>
    )
}
