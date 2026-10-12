/**
 * Shared bouquet scene graph.
 *
 * Pure function of `BouquetBlockProps`: same props → same scene. Owns every
 * seeded RNG decision (fan slots, stem curves, leaf placement, filler sprigs,
 * cellophane sparkles) so the pixel painter in `layout.ts` and the vector
 * renderer in `svg.tsx` stay byte-identical given the same props.
 */

import type { BouquetBlockProps, BouquetFlower, BouquetSpecies, BouquetWrap } from '@/editor/types'
import { makeRng } from './rng'
import { rampFromHex, type ColorRamp } from './color'
import { SPECIES, GREEN } from './sprites'

export const ART_W = 96
export const ART_H = 124

export const MAX_FLOWERS = 24

/** Where the stems gather into the wrap. */
export const APEX = { x: 48, y: 86 }

/** Visual weight per species — heavier blooms get central slots. */
const SPECIES_RANK: Record<BouquetSpecies, number> = {
  girassol: 3,
  rosa: 2.4,
  cravo: 2,
  tulipa: 1.7,
  margarida: 1.5,
  lavanda: 1.2,
}

export interface ScenePoint {
  x: number
  y: number
}

export interface SceneStem {
  start: ScenePoint
  ctrl: ScenePoint
  end: ScenePoint
  thickness: number
  color: string
}

export interface SceneLeaf {
  /** Attachment point on the stem curve. */
  x: number
  y: number
  /** Leaf points right when true, left otherwise. */
  right: boolean
}

export interface SceneFlower {
  f: BouquetFlower
  /** Head center in art coordinates. */
  hx: number
  hy: number
  scale: number
  tilt: number
  flipX: boolean
  slotIndex: number
  /** Bloom stagger order — center flowers first. */
  order: number
  stem: SceneStem
  leaves: SceneLeaf[]
}

export interface SceneSprig {
  tip: ScenePoint
  ctrl: ScenePoint
  end: ScenePoint
  /** Bud cluster dots at the sprig tip. */
  buds: { x: number; y: number; color: string }[]
}

export interface SceneTuft {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface BouquetScene {
  /** Flowers in placement order (heaviest species first). */
  flowers: SceneFlower[]
  /** Filler sprigs behind everything. */
  sprigs: SceneSprig[]
  /** Green tuft peeking over the wrap opening. */
  tuft: SceneTuft[]
  /** Cellophane sparkle candidates (empty for other wraps). */
  sparkles: ScenePoint[]
  wrap: BouquetWrap
  ribbon: ColorRamp
  flowerCount: number
}

const r2 = (n: number) => Math.round(n * 100) / 100
const r1 = (n: number) => Math.round(n * 10) / 10

interface Slot {
  t: number
  tier: 0 | 1
}

/** Build fan slots: one arc for small bouquets, two tiers past 8 flowers. */
function buildSlots(n: number): Slot[] {
  if (n === 1) return [{ t: 0, tier: 1 }]
  if (n <= 8) {
    return Array.from({ length: n }, (_, i) => ({
      t: (i / (n - 1)) * 2 - 1,
      tier: 1 as const,
    }))
  }
  // Two tiers: taller back arc (inner, narrower) + front arc (wider, lower).
  const nBack = Math.ceil(n * 0.5)
  const nFront = n - nBack
  const slots: Slot[] = []
  for (let i = 0; i < nBack; i++) {
    slots.push({ t: nBack === 1 ? 0 : (i / (nBack - 1)) * 1.7 - 0.85, tier: 0 })
  }
  for (let i = 0; i < nFront; i++) {
    slots.push({ t: nFront === 1 ? 0 : (i / (nFront - 1)) * 2 - 1, tier: 1 })
  }
  return slots
}

function spriteDims(sprite: readonly string[]) {
  const w = Math.max(...sprite.map((r) => r.length))
  return { w, h: sprite.length }
}

function bezierPoint(p0: ScenePoint, p1: ScenePoint, p2: ScenePoint, t: number) {
  const u = 1 - t
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  }
}

export function buildBouquetScene(props: BouquetBlockProps): BouquetScene {
  const seed = Number.isFinite(props.seed) ? Math.trunc(props.seed) : 1
  const rng = makeRng(seed)

  const flowers = (props.flowers ?? []).filter(
    (f): f is BouquetFlower => !!f && typeof f === 'object' && f.species in SPECIES,
  )
  const n = Math.min(flowers.length, MAX_FLOWERS)
  const wrap = props.wrap ?? 'papel'
  const ribbon = rampFromHex(
    props.ribbonColor && props.ribbonColor.trim() ? props.ribbonColor : '#e11d48',
  )

  /* ---------------------------------------------------------------- *
   * 1. Head slots — heaviest species claim the most central slots.    *
   * ---------------------------------------------------------------- */
  const slots = buildSlots(n || 1)
  const orderByCenter = [...slots.keys()].sort(
    (a, b) => Math.abs(slots[a].t) - Math.abs(slots[b].t),
  )
  const flowerOrder = flowers
    .slice(0, n)
    .map((f, i) => ({ f, i, rank: SPECIES_RANK[f.species] ?? 1 }))
    .sort((a, b) => b.rank - a.rank || a.i - b.i)

  const placed: SceneFlower[] = []
  for (let k = 0; k < n; k++) {
    const { f } = flowerOrder[k]
    const slotIndex = orderByCenter[k]
    const slot = slots[slotIndex]
    const { t, tier } = slot

    const spread = tier === 0 ? 26 : 34
    const topY = tier === 0 ? 13 : 21
    const drop = tier === 0 ? 9 : 14

    const hx = 48 + Math.sin((t * Math.PI) / 180 * 62) * spread + rng.range(-2.5, 2.5)
    const hy = topY + Math.pow(Math.abs(t), 1.35) * drop + rng.range(-2, 2)

    placed.push({
      f,
      hx: r2(hx),
      hy: r2(hy),
      scale: r2(rng.range(0.82, 1.14)),
      tilt: r1(rng.range(-9, 9)),
      flipX: rng.chance(0.5),
      slotIndex,
      order: 0,
      stem: {
        start: { x: 0, y: 0 },
        ctrl: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
        thickness: 1,
        color: GREEN.stem,
      },
      leaves: [],
    })
  }

  /* ---------------------------------------------------------------- *
   * 2. Stems + leaves.                                                *
   * ---------------------------------------------------------------- */
  for (const p of placed) {
    const sprite = SPECIES[p.f.species].sprite
    const { h } = spriteDims(sprite)
    const start = {
      x: p.hx,
      y: p.hy + (h * p.scale) / 2 - 2,
    }
    const end = {
      x: APEX.x + rng.range(-3, 3),
      y: APEX.y + rng.range(-1, 2),
    }
    const outward = Math.sign(p.hx - 48) || (rng.chance(0.5) ? 1 : -1)
    const ctrl = {
      x: (start.x + end.x) / 2 + outward * rng.range(2, 8),
      y: (start.y + end.y) / 2 + rng.range(-3, 3),
    }
    const thickness = p.f.species === 'lavanda' ? 1 : 2
    const stemColor = rng.chance(0.25) ? GREEN.stemLight : GREEN.stem
    p.stem = { start, ctrl, end, thickness, color: stemColor }

    // Leaves along the stem — 0–2 per flower, alternating sides.
    const leafCount = n > 14 ? rng.int(0, 1) : rng.int(0, 2)
    for (let li = 0; li < leafCount; li++) {
      const t = rng.range(0.35, 0.78)
      const pt = bezierPoint(start, ctrl, end, t)
      const right = (li + p.slotIndex) % 2 === 0
      p.leaves.push({ x: pt.x, y: pt.y, right })
    }
  }

  /* ---------------------------------------------------------------- *
   * 3. Filler sprigs + baby's breath poking past the flower fan.      *
   * ---------------------------------------------------------------- */
  const sprigs: SceneSprig[] = []
  const sprigCount = Math.min(7, Math.max(3, Math.round(n * 0.45)))
  for (let i = 0; i < sprigCount; i++) {
    const dir = i % 2 === 0 ? -1 : 1
    const tipX = 48 + dir * rng.range(27, 42)
    const tipY = rng.range(9, 30)
    const end = { x: APEX.x + rng.range(-4, 4), y: APEX.y }
    const ctrl = {
      x: (tipX + end.x) / 2 + dir * rng.range(3, 7),
      y: (tipY + end.y) / 2,
    }
    const buds: SceneSprig['buds'] = [
      { x: tipX, y: tipY, color: GREEN.filler },
      { x: tipX + dir, y: tipY - 1, color: GREEN.stemLight },
    ]
    if (rng.chance(0.8)) buds.push({ x: tipX, y: tipY - 2, color: GREEN.breath })
    if (rng.chance(0.6)) buds.push({ x: tipX + dir, y: tipY, color: GREEN.breath })
    if (rng.chance(0.5)) buds.push({ x: tipX - dir, y: tipY + 1, color: GREEN.filler })
    sprigs.push({ tip: { x: tipX, y: tipY }, ctrl, end, buds })
  }
  // Small green tuft peeking over the wrap opening.
  const tuft: SceneTuft[] = []
  for (let i = 0; i < 5; i++) {
    const x = APEX.x + rng.range(-7, 7)
    tuft.push({
      x1: x,
      y1: APEX.y - 1,
      x2: x + rng.range(-3, 3),
      y2: APEX.y - rng.range(4, 7),
    })
  }

  /* ---------------------------------------------------------------- *
   * 4. Bloom stagger (center first) + cellophane sparkle candidates.  *
   * ---------------------------------------------------------------- */
  const centerRank = new Map<number, number>()
  orderByCenter.forEach((slotIdx, rank) => centerRank.set(slotIdx, rank))
  for (const p of placed) {
    p.order = centerRank.get(p.slotIndex) ?? 0
  }

  const sparkles: ScenePoint[] = []
  if (wrap === 'celofane') {
    for (let i = 0; i < 26; i++) {
      sparkles.push({ x: rng.int(28, 68), y: rng.int(84, 116) })
    }
  }

  return {
    flowers: placed,
    sprigs,
    tuft,
    sparkles,
    wrap,
    ribbon,
    flowerCount: n,
  }
}
