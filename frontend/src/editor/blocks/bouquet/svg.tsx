/**
 * Premium vector renderer for the bouquet.
 *
 * Draws the same deterministic scene as the pixel painter (`scene.ts`) as
 * smooth SVG: gradient-shaded species heads, curved stems that grow from the
 * wrap upward, leaves that unfurl, a ribbon that ties itself, and a gentle
 * idle sway. Growth choreography only runs when `bloom` is true — in edit
 * mode or under prefers-reduced-motion the art renders in its final state.
 */

import { useId } from 'react'
import { motion } from 'framer-motion'
import type { BouquetSpecies } from '@/editor/types'
import { rampFromHex, type ColorRamp } from './color'
import { SPECIES, GREEN, WRAP_PALETTES } from './sprites'
import type { BouquetScene, SceneFlower } from './scene'

const fmt = (n: number) => Math.round(n * 100) / 100

/* ------------------------------------------------------------------ */
/* Choreography                                                        */
/* ------------------------------------------------------------------ */

const stemDelay = (order: number) => 0.35 + order * 0.08
const headDelay = (order: number) => stemDelay(order) + 0.72
const leafDelay = (order: number) => stemDelay(order) + 0.45

const BLOOM_SPRING = { type: 'spring', stiffness: 300, damping: 17 } as const

/* ------------------------------------------------------------------ */
/* Species heads — drawn in local coordinates, origin at head center.  */
/* ------------------------------------------------------------------ */

function PetalGradient({ id, ramp }: { id: string; ramp: ColorRamp }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={ramp.l} />
      <stop offset="0.55" stopColor={ramp.m} />
      <stop offset="1" stopColor={ramp.d} />
    </linearGradient>
  )
}

/** Wavy closed path — r(θ) = r + amp·sin(lobes·θ + phase). For the carnation ruffle. */
function wavyCircle(r: number, amp: number, lobes: number, phase = 0): string {
  const steps = lobes * 6
  const pts: string[] = []
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const rr = r + amp * Math.sin(lobes * a + phase)
    pts.push(`${i === 0 ? 'M' : 'L'}${fmt(rr * Math.cos(a))} ${fmt(rr * Math.sin(a))}`)
  }
  return pts.join('') + 'Z'
}

function RosaHead({ ramp, gid }: { ramp: ColorRamp; gid: string }) {
  const petal = 'M0 1 C-4.6 0 -6.6 -3.6 -4.4 -6.4 C-2.5 -8.6 2.5 -8.6 4.4 -6.4 C6.6 -3.6 4.6 0 0 1 Z'
  return (
    <>
      <defs>
        <PetalGradient id={gid} ramp={ramp} />
      </defs>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={petal}
          transform={`rotate(${a})`}
          fill={`url(#${gid})`}
          stroke={ramp.o}
          strokeWidth={0.35}
        />
      ))}
      {[36, 108, 180, 252, 324].map((a) => (
        <path
          key={a}
          d={petal}
          transform={`rotate(${a}) scale(0.6)`}
          fill={ramp.m}
          stroke={ramp.o}
          strokeWidth={0.3}
        />
      ))}
      <circle r={2.1} fill={ramp.d} />
      <path
        d="M-1 0.2 A1.15 1.15 0 1 1 1.05 -0.55 A0.7 0.7 0 1 1 -0.45 0.95"
        fill="none"
        stroke={ramp.h}
        strokeWidth={0.55}
        strokeLinecap="round"
      />
      <path
        d="M-3.1 4.6 C-1.4 6.7 1.4 6.7 3.1 4.6 L1.9 7 L0 7.9 L-1.9 7 Z"
        fill={GREEN.leafDark}
      />
    </>
  )
}

function GirassolHead({ ramp, gid }: { ramp: ColorRamp; gid: string }) {
  const petal = 'M0 -3 C-1.9 -4.9 -1.8 -8.1 0 -10.4 C1.8 -8.1 1.9 -4.9 0 -3 Z'
  return (
    <>
      <defs>
        <PetalGradient id={gid} ramp={ramp} />
        <radialGradient id={`${gid}-disk`} cx="0.42" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#7d4e24" />
          <stop offset="0.6" stopColor="#5d3a1a" />
          <stop offset="1" stopColor="#3a2410" />
        </radialGradient>
      </defs>
      {Array.from({ length: 14 }, (_, i) => (
        <path
          key={i}
          d={petal}
          transform={`rotate(${fmt(i * (360 / 14))}) scale(${i % 2 === 0 ? 1 : 0.9})`}
          fill={`url(#${gid})`}
          stroke={ramp.d}
          strokeWidth={0.28}
        />
      ))}
      <circle r={3.7} fill={`url(#${gid}-disk)`} stroke="#2a1709" strokeWidth={0.3} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.4
        return (
          <circle
            key={i}
            cx={fmt(2.1 * Math.cos(a))}
            cy={fmt(2.1 * Math.sin(a))}
            r={0.42}
            fill={i % 2 === 0 ? '#e0a83c' : '#8a5a2a'}
          />
        )
      })}
      <circle r={0.8} fill="#4a2c14" />
    </>
  )
}

function TulipaHead({ ramp, gid }: { ramp: ColorRamp; gid: string }) {
  return (
    <>
      <defs>
        <PetalGradient id={gid} ramp={ramp} />
      </defs>
      {[-24, 24].map((a) => (
        <path
          key={a}
          d="M0 3 C-3.8 2.6 -5.4 -1.4 -3.8 -5 C-2.6 -7.6 2.6 -7.6 3.8 -5 C5.4 -1.4 3.8 2.6 0 3 Z"
          transform={`rotate(${a})`}
          fill={ramp.d}
          stroke={ramp.o}
          strokeWidth={0.28}
        />
      ))}
      <path
        d="M0 3.4 C-3.4 3.2 -4.8 -0.8 -3.4 -4 L-1.7 -6.8 L0 -5.4 L1.7 -6.8 L3.4 -4 C4.8 -0.8 3.4 3.2 0 3.4 Z"
        fill={`url(#${gid})`}
        stroke={ramp.o}
        strokeWidth={0.32}
      />
      <path
        d="M0 -4.6 L0 1.8"
        stroke={ramp.d}
        strokeWidth={0.4}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path d="M-2.4 3 L0 6.9 L2.4 3 L0 4.2 Z" fill={GREEN.leafDark} />
    </>
  )
}

function MargaridaHead({ ramp, gid }: { ramp: ColorRamp; gid: string }) {
  return (
    <>
      <defs>
        <PetalGradient id={gid} ramp={ramp} />
        <radialGradient id={`${gid}-disk`} cx="0.42" cy="0.38" r="0.8">
          <stop offset="0" stopColor="#ffd54a" />
          <stop offset="1" stopColor="#d99a06" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-3.9}
          rx={1.15}
          ry={4}
          transform={`rotate(${i * 30})`}
          fill={`url(#${gid})`}
          stroke="#e8b8c4"
          strokeWidth={0.22}
        />
      ))}
      <circle r={2.4} fill={`url(#${gid}-disk)`} stroke="#b87e04" strokeWidth={0.28} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <circle
            key={i}
            cx={fmt(1.2 * Math.cos(a))}
            cy={fmt(1.2 * Math.sin(a))}
            r={0.3}
            fill="#b87e04"
            opacity={0.6}
          />
        )
      })}
    </>
  )
}

function CravoHead({ ramp, gid }: { ramp: ColorRamp; gid: string }) {
  return (
    <>
      <defs>
        <PetalGradient id={gid} ramp={ramp} />
      </defs>
      <path
        d={wavyCircle(6.3, 0.85, 9)}
        fill={`url(#${gid})`}
        stroke={ramp.o}
        strokeWidth={0.35}
      />
      <path d={wavyCircle(4.5, 0.7, 8, 1.2)} fill={ramp.m} stroke={ramp.d} strokeWidth={0.28} />
      <path d={wavyCircle(2.9, 0.55, 7, 2.4)} fill={ramp.l} stroke={ramp.m} strokeWidth={0.26} />
      {[0.5, 2.2, 3.9].map((a, i) => (
        <path
          key={i}
          d={`M${fmt(1.4 * Math.cos(a))} ${fmt(1.4 * Math.sin(a))} Q${fmt(3.2 * Math.cos(a + 0.5))} ${fmt(3.2 * Math.sin(a + 0.5))} ${fmt(4.6 * Math.cos(a + 0.9))} ${fmt(4.6 * Math.sin(a + 0.9))}`}
          fill="none"
          stroke={ramp.h}
          strokeWidth={0.4}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
      <path
        d="M-3.4 4.8 C-1.6 6.9 1.6 6.9 3.4 4.8 L2.1 7.2 L0 8 L-2.1 7.2 Z"
        fill={GREEN.leafDark}
      />
    </>
  )
}

function LavandaHead({ ramp, gid }: { ramp: ColorRamp; gid: string }) {
  const buds: { x: number; y: number; s: number; c: string }[] = []
  for (let i = 0; i < 5; i++) {
    const y = 3.4 - i * 2.1
    const s = 1 - i * 0.09
    const side = i % 2 === 0 ? 1 : -1
    buds.push({ x: side * 1.5, y, s, c: i % 2 === 0 ? ramp.m : ramp.l })
    buds.push({ x: -side * 1.1, y: y - 1, s: s * 0.9, c: ramp.m })
  }
  return (
    <>
      <defs>
        <PetalGradient id={gid} ramp={ramp} />
      </defs>
      <path d="M0 4.8 L0 7.6" stroke={GREEN.stem} strokeWidth={0.9} strokeLinecap="round" />
      {buds.map((b, i) => (
        <ellipse
          key={i}
          cx={fmt(b.x)}
          cy={fmt(b.y)}
          rx={fmt(1.35 * b.s)}
          ry={fmt(1.9 * b.s)}
          fill={b.c}
          stroke={ramp.d}
          strokeWidth={0.22}
        />
      ))}
      <ellipse cx={0} cy={-6.8} rx={1.15} ry={2} fill={ramp.l} stroke={ramp.d} strokeWidth={0.22} />
      <ellipse cx={0} cy={-8.2} rx={0.7} ry={1.2} fill={ramp.h} />
    </>
  )
}

const HEAD_RENDERERS: Record<
  BouquetSpecies,
  (props: { ramp: ColorRamp; gid: string }) => React.ReactNode
> = {
  rosa: RosaHead,
  girassol: GirassolHead,
  tulipa: TulipaHead,
  margarida: MargaridaHead,
  cravo: CravoHead,
  lavanda: LavandaHead,
}

/* ------------------------------------------------------------------ */
/* Plant pieces                                                        */
/* ------------------------------------------------------------------ */

function Leaf({
  x,
  y,
  right,
  delay,
  bloom,
}: {
  x: number
  y: number
  right: boolean
  delay: number
  bloom: boolean
}) {
  const rotate = right ? -24 : 204
  return (
    <g transform={`translate(${fmt(x)} ${fmt(y)})`}>
      <motion.g
        transform={`rotate(${rotate})`}
        initial={bloom ? { scale: 0, opacity: 0 } : false}
        animate={bloom ? { scale: 1, opacity: 1 } : undefined}
        transition={bloom ? { ...BLOOM_SPRING, delay } : undefined}
        style={{ transformBox: 'fill-box', transformOrigin: '0% 50%' }}
      >
        <path
          d="M0 0 C1.9 -1.7 4.2 -2 6 -0.9 C4.2 0.5 1.9 0.7 0 0 Z"
          fill={GREEN.leaf}
          stroke={GREEN.leafDark}
          strokeWidth={0.3}
        />
        <path
          d="M0.7 -0.2 L5 -0.75"
          stroke={GREEN.leafDark}
          strokeWidth={0.32}
          strokeLinecap="round"
          opacity={0.7}
        />
      </motion.g>
    </g>
  )
}

function FlowerHead({
  f,
  bloom,
  uid,
  index,
}: {
  f: SceneFlower
  bloom: boolean
  uid: string
  index: number
}) {
  const ramp = rampFromHex(f.f.color ?? SPECIES[f.f.species].petal)
  const gid = `${uid}-f${index}`
  const Head = HEAD_RENDERERS[f.f.species]
  return (
    <g transform={`translate(${f.hx} ${f.hy})`} data-flower-head="">
      <motion.g
        initial={bloom ? { scale: 0, rotate: f.tilt * 2.2, opacity: 0 } : false}
        animate={bloom ? { scale: 1, rotate: f.tilt, opacity: 1 } : undefined}
        transition={bloom ? { ...BLOOM_SPRING, delay: headDelay(f.order) } : undefined}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <g transform={`scale(${f.scale}) scale(${f.flipX ? -1 : 1} 1)`}>
          <Head ramp={ramp} gid={gid} />
        </g>
      </motion.g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Wrap + ribbon                                                       */
/* ------------------------------------------------------------------ */

const SIL_D = 'M27 82 C36 84.6 60 84.6 69 82 L58.5 117 C52 118.6 44 118.6 37.5 117 Z'
const FLAP_L = 'M27 82 C34 84.8 44 86.5 50 88 L50 117 C45 117.9 40.6 117.7 37.5 117 Z'
const FLAP_R = 'M69 82 C62 84.8 52 86.5 46 88 L46 117 C51 117.9 55.4 117.7 58.5 117 Z'

function WrapAndRibbon({
  scene,
  bloom,
  ribbonDelay,
  uid,
}: {
  scene: BouquetScene
  bloom: boolean
  ribbonDelay: number
  uid: string
}) {
  const wrapPal = WRAP_PALETTES[scene.wrap]
  const ribbon = scene.ribbon
  const celofane = scene.wrap === 'celofane'
  const opacity = celofane ? 0.92 : 1

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-wdeep`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wrapPal.shade} />
          <stop offset="1" stopColor={wrapPal.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-wbase`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wrapPal.light} />
          <stop offset="1" stopColor={wrapPal.base} />
        </linearGradient>
        <linearGradient id={`${uid}-wshade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wrapPal.base} />
          <stop offset="1" stopColor={wrapPal.shade} />
        </linearGradient>
        <linearGradient id={`${uid}-rib`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ribbon.l} />
          <stop offset="1" stopColor={ribbon.m} />
        </linearGradient>
        <clipPath id={`${uid}-wclip`}>
          <path d={SIL_D} />
        </clipPath>
      </defs>

      <motion.g
        initial={bloom ? { y: 9, opacity: 0 } : false}
        animate={bloom ? { y: 0, opacity: 1 } : undefined}
        transition={bloom ? { duration: 0.45, ease: 'easeOut' } : undefined}
      >
        <path d={SIL_D} fill={`url(#${uid}-wdeep)`} opacity={opacity} />
        <path d={FLAP_L} fill={`url(#${uid}-wbase)`} opacity={opacity} />
        <path d={FLAP_R} fill={`url(#${uid}-wshade)`} opacity={opacity} />
        <path d="M40 82 L56 82 L48 91 Z" fill={wrapPal.deep} />

        {scene.wrap === 'papel' && (
          <g opacity={0.5}>
            <path d="M33 94 L39.5 115" stroke={wrapPal.shade} strokeWidth={0.55} strokeLinecap="round" />
            <path d="M63 92 L57 113" stroke={wrapPal.shade} strokeWidth={0.55} strokeLinecap="round" />
            <path
              d="M38 117 C44 118.4 52 118.4 58 117"
              stroke={wrapPal.deep}
              strokeWidth={0.6}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        {scene.wrap === 'juta' && (
          <g clipPath={`url(#${uid}-wclip)`} opacity={0.4}>
            {[32, 38, 44, 50, 56, 62].map((x) => (
              <path key={`v${x}`} d={`M${x} 82 L${x - 3} 118`} stroke={wrapPal.deep} strokeWidth={0.45} />
            ))}
            {[88, 94, 100, 106, 112].map((y) => (
              <path key={`h${y}`} d={`M25 ${y} L71 ${y}`} stroke={wrapPal.shade} strokeWidth={0.45} />
            ))}
          </g>
        )}
        {celofane && (
          <g>
            {scene.sparkles.map((sp, i) => (
              <circle key={i} cx={sp.x} cy={sp.y} r={0.55} fill="#ffffff" opacity={0.85} />
            ))}
            <path d="M33 88 L38 99" stroke={wrapPal.light} strokeWidth={0.9} strokeLinecap="round" />
            <path d="M60 90 L55 102" stroke={wrapPal.light} strokeWidth={0.9} strokeLinecap="round" />
            <path d="M40 106 L45 114" stroke={wrapPal.light} strokeWidth={0.9} strokeLinecap="round" />
          </g>
        )}

        <path
          d="M27 82 C36 84.6 60 84.6 69 82"
          fill="none"
          stroke={wrapPal.light}
          strokeWidth={0.85}
          strokeLinecap="round"
        />
        <path d={SIL_D} fill="none" stroke={wrapPal.outline} strokeWidth={0.4} opacity={0.7} />
        <path d="M25 82 L32 82 L28.5 77.8 Z" fill={wrapPal.light} />
        <path d="M64 82 L71 82 L67.5 77.8 Z" fill={wrapPal.light} />
      </motion.g>

      <motion.g
        initial={bloom ? { opacity: 0 } : false}
        animate={bloom ? { opacity: 1 } : undefined}
        transition={bloom ? { duration: 0.3, delay: ribbonDelay } : undefined}
      >
        <motion.g
          initial={bloom ? { y: -4, opacity: 0 } : false}
          animate={bloom ? { y: 0, opacity: 1 } : undefined}
          transition={bloom ? { duration: 0.35, delay: ribbonDelay, ease: 'easeOut' } : undefined}
        >
          <path d="M46.5 86.5 L41.5 97.5 L44.5 96 L47.5 98.6 Z" fill={ribbon.d} />
          <path d="M49.5 86.5 L54.5 98.5 L51.5 97 L48.8 99.2 Z" fill={ribbon.m} />
        </motion.g>
        <path
          d="M41 84 L55 84 L55 87.5 L41 87.5 Z"
          fill={`url(#${uid}-rib)`}
          stroke={ribbon.o}
          strokeWidth={0.35}
        />
        <motion.path
          d="M48 85 C45.5 80.4 41.4 79.4 41.9 82.9 C42.3 85.8 45.4 87.6 48 85 Z"
          fill={ribbon.l}
          stroke={ribbon.o}
          strokeWidth={0.35}
          initial={bloom ? { scale: 0 } : false}
          animate={bloom ? { scale: 1 } : undefined}
          transition={bloom ? { ...BLOOM_SPRING, delay: ribbonDelay + 0.15 } : undefined}
          style={{ transformBox: 'fill-box', transformOrigin: 'right bottom' }}
        />
        <motion.path
          d="M48 85 C50.5 80.4 54.6 79.4 54.1 82.9 C53.7 85.8 50.6 87.6 48 85 Z"
          fill={ribbon.l}
          stroke={ribbon.o}
          strokeWidth={0.35}
          initial={bloom ? { scale: 0 } : false}
          animate={bloom ? { scale: 1 } : undefined}
          transition={bloom ? { ...BLOOM_SPRING, delay: ribbonDelay + 0.22 } : undefined}
          style={{ transformBox: 'fill-box', transformOrigin: 'left bottom' }}
        />
        <motion.g
          initial={bloom ? { scale: 0 } : false}
          animate={bloom ? { scale: 1 } : undefined}
          transition={bloom ? { ...BLOOM_SPRING, delay: ribbonDelay + 0.32 } : undefined}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <rect
            x={45.8}
            y={82.6}
            width={4.4}
            height={3.9}
            rx={1.2}
            fill={ribbon.m}
            stroke={ribbon.o}
            strokeWidth={0.35}
          />
          <path d="M46.5 83.6 L49.5 83.6" stroke={ribbon.l} strokeWidth={0.45} strokeLinecap="round" />
          <path d="M46.5 85.6 L49.5 85.6" stroke={ribbon.d} strokeWidth={0.4} strokeLinecap="round" />
        </motion.g>
      </motion.g>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function SvgBouquet({
  scene,
  bloom,
  ariaLabel,
}: {
  scene: BouquetScene
  bloom: boolean
  ariaLabel: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const maxOrder = Math.max(0, ...scene.flowers.map((f) => f.order))
  const ribbonDelay = headDelay(maxOrder) + 0.4

  // Heads paint back-to-front (top of the fan first), like the pixel pass.
  const headsByDepth = [...scene.flowers].sort(
    (a, b) => a.hy - b.hy || a.slotIndex - b.slotIndex,
  )

  return (
    <motion.svg
      viewBox="0 0 96 124"
      className="mx-auto h-auto w-full max-w-[320px] drop-shadow-sm"
      role="img"
      aria-label={ariaLabel}
      data-testid="bouquet-art"
      data-art-style="svg"
      animate={bloom ? { scale: [1, 1.012, 1] } : undefined}
      transition={bloom ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Sway pivots where the stems gather into the wrap. */}
      <g transform="translate(48 82)">
        <motion.g
          animate={bloom ? { rotate: [-0.9, 0.9, -0.9] } : undefined}
          transition={
            bloom
              ? { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: ribbonDelay + 0.6 }
              : undefined
          }
        >
          <g transform="translate(-48 -82)">
            {scene.sprigs.map((s, i) => (
              <g key={`sp${i}`}>
                <motion.path
                  d={`M${fmt(s.tip.x)} ${fmt(s.tip.y)} Q${fmt(s.ctrl.x)} ${fmt(s.ctrl.y)} ${fmt(s.end.x)} ${fmt(s.end.y)}`}
                  fill="none"
                  stroke={GREEN.filler}
                  strokeWidth={0.65}
                  strokeLinecap="round"
                  initial={bloom ? { pathLength: 0 } : false}
                  animate={bloom ? { pathLength: 1 } : undefined}
                  transition={
                    bloom
                      ? { duration: 0.55, delay: 0.15 + i * 0.05, ease: 'easeOut' }
                      : undefined
                  }
                />
                {s.buds.map((b, bi) => (
                  <motion.circle
                    key={bi}
                    cx={fmt(b.x)}
                    cy={fmt(b.y)}
                    r={0.65}
                    fill={b.color}
                    initial={bloom ? { scale: 0, opacity: 0 } : false}
                    animate={bloom ? { scale: 1, opacity: 1 } : undefined}
                    transition={
                      bloom
                        ? { ...BLOOM_SPRING, delay: 0.45 + i * 0.05 + bi * 0.04 }
                        : undefined
                    }
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                ))}
              </g>
            ))}

            {scene.flowers.map((f, i) => (
              <motion.path
                key={`st${i}`}
                d={`M${fmt(f.stem.end.x)} ${fmt(f.stem.end.y)} Q${fmt(f.stem.ctrl.x)} ${fmt(f.stem.ctrl.y)} ${fmt(f.stem.start.x)} ${fmt(f.stem.start.y)}`}
                fill="none"
                stroke={f.stem.color}
                strokeWidth={f.stem.thickness === 2 ? 1.5 : 0.95}
                strokeLinecap="round"
                initial={bloom ? { pathLength: 0 } : false}
                animate={bloom ? { pathLength: 1 } : undefined}
                transition={
                  bloom
                    ? { duration: 0.75, delay: stemDelay(f.order), ease: 'easeOut' }
                    : undefined
                }
              />
            ))}

            {scene.tuft.map((t, i) => (
              <motion.path
                key={`tu${i}`}
                d={`M${fmt(t.x1)} ${fmt(t.y1)} L${fmt(t.x2)} ${fmt(t.y2)}`}
                fill="none"
                stroke={GREEN.filler}
                strokeWidth={0.65}
                strokeLinecap="round"
                initial={bloom ? { pathLength: 0, opacity: 0 } : false}
                animate={bloom ? { pathLength: 1, opacity: 1 } : undefined}
                transition={
                  bloom ? { duration: 0.3, delay: 0.5 + i * 0.03, ease: 'easeOut' } : undefined
                }
              />
            ))}

            {scene.flowers.flatMap((f, fi) =>
              f.leaves.map((leaf, li) => (
                <Leaf
                  key={`lf${fi}-${li}`}
                  x={leaf.x}
                  y={leaf.y}
                  right={leaf.right}
                  delay={leafDelay(f.order) + li * 0.12}
                  bloom={bloom}
                />
              )),
            )}

            {headsByDepth.map((f) => (
              <FlowerHead
                key={`h${scene.flowers.indexOf(f)}`}
                f={f}
                bloom={bloom}
                uid={uid}
                index={scene.flowers.indexOf(f)}
              />
            ))}
          </g>
        </motion.g>
      </g>

      <WrapAndRibbon scene={scene} bloom={bloom} ribbonDelay={ribbonDelay} uid={uid} />
    </motion.svg>
  )
}
