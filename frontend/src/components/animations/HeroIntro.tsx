import { motion } from 'framer-motion'
import { useState, useEffect, startTransition } from 'react'

// ── Plays once per browser session; respects the sessionStorage flag ──
const INTRO_KEY = 'heroIntroDone'

// ── Cloud SVG paths (same shapes as SiteAtmosphere/HeroAnimation) ──
const PATHS = [
    { d: 'M280 90c22 0 40-16 40-36s-18-36-40-36c-4 0-8 .5-12 1.5C262 8 248 0 232 0c-20 0-36 12-42 30-4-2-8-2-12-2-26 0-48 18-48 40 0 1 0 2 .1 3H60c-33 0-60 20-60 42h320c0-13-16-23-40-23z', vb: '0 0 320 120' },
    { d: 'M230 80c16 0 30-12 30-28s-14-28-30-28c-2 0-4 0-6 .5C220 10 206 0 190 0c-14 0-26 8-32 20-6-4-14-6-22-6-22 0-40 16-40 36 0 2 0 4 .5 6H40c-22 0-40 14-40 32h268c0-4-14-8-38-8z', vb: '0 0 260 100' },
    { d: 'M170 64c16 0 30-11 30-25s-14-25-30-25c-3 0-6 .4-8 1C158 6 146 0 132 0c-12 0-22 6-28 16-4-2-10-4-16-4-18 0-32 13-32 30 0 1 0 3 .2 4H24c-14 0-24 8-24 18h194c0-2-10 0-24 0z', vb: '0 0 200 80' },
]

// ── Each cloud group: starts near the centre, bursts toward an edge ──
// initialX/Y: start position (vw/vh)
// exitX/Y: exit offset RELATIVE to start (vw/vh)
// depth 1 = front (fastest, most scale), 3 = back (slowest)
const INTRO_CLOUDS = [
    // Front layer (z=30) — fastest exit
    { path: 0, w: 520, ix: '-8vw', iy: '10vh', ex: '-95vw', ey: '-5vh', is: 1.30, es: 2.00, op: 0.92, dur: 0.95, delay: 0.00, flip: false },
    { path: 1, w: 480, ix: '55vw', iy: '5vh',  ex: '110vw', ey: '-8vh', is: 1.20, es: 1.85, op: 0.88, dur: 0.95, delay: 0.04, flip: true  },

    // Mid layer (z=20)
    { path: 2, w: 420, ix: '18vw', iy: '-3vh', ex: '12vw', ey: '-85vh', is: 1.00, es: 1.55, op: 0.78, dur: 1.30, delay: 0.05, flip: false },
    { path: 0, w: 460, ix: '-4vw', iy: '55vh', ex: '-100vw', ey: '8vh', is: 1.10, es: 1.70, op: 0.75, dur: 1.30, delay: 0.08, flip: true  },

    // Back layer (z=10) — slowest exit
    { path: 1, w: 360, ix: '60vw', iy: '58vh', ex: '120vw', ey: '6vh',  is: 0.85, es: 1.35, op: 0.62, dur: 1.65, delay: 0.10, flip: false },
    { path: 2, w: 320, ix: '28vw', iy: '68vh', ex: '5vw',  ey: '130vh', is: 0.75, es: 1.15, op: 0.58, dur: 1.65, delay: 0.14, flip: true  },
] as const

// ── Component ───────────────────────────────────────────────────
export function HeroIntro() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (!sessionStorage.getItem(INTRO_KEY)) {
            startTransition(() => setShow(true))
        }
    }, [])

    if (!show) return null

    const handleOverlayComplete = () => {
        sessionStorage.setItem(INTRO_KEY, '1')
        setShow(false)
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 60 }}>
            {/* Soft background veil that fades away as clouds part */}
            <motion.div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(253,242,248,0.88)' }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.85, ease: 'easeOut' }}
                onAnimationComplete={handleOverlayComplete}
            />

            {/* Cloud groups */}
            {INTRO_CLOUDS.map((c, i) => {
                const depth = i < 2 ? 30 : i < 4 ? 20 : 10
                return (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                            color: 'rgba(255,240,245,1)',
                            zIndex: depth,
                        }}
                        initial={{ x: c.ix, y: c.iy, scale: c.is, opacity: c.op }}
                        animate={{
                            x: `calc(${c.ix} + ${c.ex})`,
                            y: `calc(${c.iy} + ${c.ey})`,
                            scale: c.es,
                            opacity: 0,
                        }}
                        transition={{
                            duration: c.dur,
                            delay: c.delay,
                            ease: [0.22, 0.44, 0.42, 0.92],
                        }}
                    >
                        <svg
                            viewBox={PATHS[c.path].vb}
                            fill="currentColor"
                            width={c.w}
                            style={{
                                display: 'block',
                                transform: c.flip ? 'scaleX(-1)' : undefined,
                                filter: 'drop-shadow(0 6px 28px rgba(255,180,210,0.35))',
                            }}
                        >
                            <path d={PATHS[c.path].d} />
                        </svg>
                    </motion.div>
                )
            })}
        </div>
    )
}
