/**
 * Deterministic bouquet layout engine.
 *
 * Pure function of `BouquetBlockProps`: same props → same art. The seed feeds
 * a mulberry32 stream that drives the fan arrangement, per-flower size/tilt
 * jitter, leaf placement, filler sprigs, wrap texture dithering and cellophane
 * sparkles. Nothing here reads Math.random().
 */

import type { BouquetBlockProps, BouquetFlower, BouquetSpecies } from '@/editor/types'
import { makeRng } from './rng'
import { rampFromHex } from './color'
import { PixelLayer, type PixelRect } from './pixels'
import {
  SPECIES,
  flowerPalette,
  LEAF_SPRITE,
  LEAF_PALETTE,
  GREEN,
  WRAP_PALETTES,
} from './sprites'

export const ART_W = 96
export const ART_H = 124

export const MAX_FLOWERS = 24

/** Where the stems gather into the wrap. */
const APEX = { x: 48, y: 86 }

/** Visual weight per species — heavier blooms get central slots. */
const SPECIES_RANK: Record<BouquetSpecies, number> = {
  girassol: 3,
  rosa: 2.4,
  cravo: 2,
  tulipa: 1.7,
  margarida: 1.5,
  lavanda: 1.2,
}

export interface FlowerArt {
  /** <rect> run data in head-local coordinates (origin = sprite center). */
  rects: PixelRect[]
  /** Placement transform for the wrapping <g>. */
  transform: string
  /** Bloom stagger order — center flowers first. */
  order: number
}

export interface BouquetArt {
  width: number
  height: number
  /** Filler sprigs behind everything. */
  backRects: PixelRect[]
  /** Stems + leaves. */
  stemRects: PixelRect[]
  /** Head groups, back-to-front draw order. */
  flowers: FlowerArt[]
  /** Wrap + ribbon, drawn over the stems. */
  frontRects: PixelRect[]
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

function bezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number,
) {
  const u = 1 - t
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  }
}

export function buildBouquetArt(props: BouquetBlockProps): BouquetArt {
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
  const wrapPal = WRAP_PALETTES[wrap]

  const back = new PixelLayer()
  const stems = new PixelLayer()
  const front = new PixelLayer()

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

  interface Placed {
    f: BouquetFlower
    hx: number
    hy: number
    scale: number
    tilt: number
    flipX: boolean
    slotIndex: number
  }
  const placed: Placed[] = []
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
    })
  }

  /* ---------------------------------------------------------------- *
   * 2. Stems + leaves (drawn before heads so heads sit on top).       *
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
    stems.curve(start, ctrl, end, stemColor, thickness)

    // Leaves along the stem — 0–2 per flower, alternating sides.
    const leafCount = n > 14 ? rng.int(0, 1) : rng.int(0, 2)
    for (let li = 0; li < leafCount; li++) {
      const t = rng.range(0.35, 0.78)
      const pt = bezierPoint(start, ctrl, end, t)
      const sideRight = (li + p.slotIndex) % 2 === 0
      const ox = Math.round(pt.x + (sideRight ? 0 : -LEAF_SPRITE[0].length))
      const oy = Math.round(pt.y - 2)
      stems.sprite(LEAF_SPRITE, ox, oy, LEAF_PALETTE, { flipX: sideRight })
    }
  }

  /* ---------------------------------------------------------------- *
   * 3. Filler sprigs + baby's breath poking past the flower fan.      *
   * ---------------------------------------------------------------- */
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
    back.curve({ x: tipX, y: tipY }, ctrl, end, GREEN.filler, 1)
    // Bud cluster at the tip — tiny greens + baby's-breath white dots.
    back.set(tipX, tipY, GREEN.filler)
    back.set(tipX + dir, tipY - 1, GREEN.stemLight)
    if (rng.chance(0.8)) back.set(tipX, tipY - 2, GREEN.breath)
    if (rng.chance(0.6)) back.set(tipX + dir, tipY, GREEN.breath)
    if (rng.chance(0.5)) back.set(tipX - dir, tipY + 1, GREEN.filler)
  }
  // Small green tuft peeking over the wrap opening.
  for (let i = 0; i < 5; i++) {
    const x = APEX.x + rng.range(-7, 7)
    back.line(x, APEX.y - 1, x + rng.range(-3, 3), APEX.y - rng.range(4, 7), GREEN.filler, 1)
  }

  /* ---------------------------------------------------------------- *
   * 4. Head sprites → per-flower rect groups (local coordinates).     *
   * ---------------------------------------------------------------- */
  const headArts: { art: FlowerArt; hy: number; seq: number }[] = []
  const centerRank = new Map<number, number>() // slotIndex → stagger order
  orderByCenter.forEach((slotIdx, rank) => centerRank.set(slotIdx, rank))

  for (const p of placed) {
    const def = SPECIES[p.f.species]
    const { w, h } = spriteDims(def.sprite)
    const palette = flowerPalette(p.f.species, p.f.color)
    const layer = new PixelLayer()
    layer.sprite(def.sprite, -Math.floor(w / 2), -Math.floor(h / 2), palette, {
      flipX: p.flipX,
    })
    headArts.push({
      art: {
        rects: layer.toRects(),
        transform: `translate(${p.hx} ${p.hy}) rotate(${p.tilt}) scale(${p.scale})`,
        order: centerRank.get(p.slotIndex) ?? 0,
      },
      hy: p.hy,
      seq: p.slotIndex,
    })
  }
  headArts.sort((a, b) => a.hy - b.hy || a.seq - b.seq)

  /* ---------------------------------------------------------------- *
   * 5. Wrap — paper cone with two folded flaps + texture.             *
   * ---------------------------------------------------------------- */
  const sil = [
    { x: 27, y: 82 },
    { x: 69, y: 82 },
    { x: 58, y: 117 },
    { x: 38, y: 117 },
  ]
  front.polygon(sil, wrapPal.deep)
  // Left flap (lit side) folded over to the center.
  front.polygon(
    [
      { x: 27, y: 82 },
      { x: 50, y: 88 },
      { x: 50, y: 117 },
      { x: 38, y: 117 },
    ],
    wrapPal.base,
  )
  // Right flap (shaded side) overlapping — creates the center fold.
  front.polygon(
    [
      { x: 69, y: 82 },
      { x: 46, y: 88 },
      { x: 46, y: 117 },
      { x: 58, y: 117 },
    ],
    wrapPal.shade,
  )
  // Dark inner notch where the stems dive into the wrap.
  front.polygon(
    [
      { x: 40, y: 82 },
      { x: 56, y: 82 },
      { x: 48, y: 91 },
    ],
    wrapPal.deep,
  )
  // Outline the silhouette edges (stroke only — fill already painted).
  for (let i = 0; i < sil.length; i++) {
    const a = sil[i]
    const b = sil[(i + 1) % sil.length]
    front.line(a.x, a.y, b.x, b.y, wrapPal.outline)
  }
  // Paper lip highlight along the opening + tiny corner points.
  front.line(27, 81, 69, 81, wrapPal.light)
  front.polygon(
    [
      { x: 25, y: 82 },
      { x: 32, y: 82 },
      { x: 28, y: 78 },
    ],
    wrapPal.light,
  )
  front.polygon(
    [
      { x: 64, y: 82 },
      { x: 71, y: 82 },
      { x: 68, y: 78 },
    ],
    wrapPal.light,
  )

  // Wrap-specific texture passes (dithering clipped to painted cells).
  if (wrap === 'papel') {
    // Soft paper: dithered shade creeping up from the bottom fold.
    front.applyPattern(27, 100, 69, 117, (existing, x, y) =>
      (x + y) % 3 === 0 ? wrapPal.deep : undefined,
    )
  } else if (wrap === 'juta') {
    // Burlap weave: vertical threads + horizontal shading rows.
    front.applyPattern(27, 83, 69, 117, (existing, x, y) => {
      if (x % 3 === 0) return wrapPal.deep
      if (y % 3 === 0) return wrapPal.shade
      return undefined
    })
  } else {
    // Cellophane: scattered sparkle pixels + crinkle shine streaks.
    for (let i = 0; i < 26; i++) {
      const x = rng.int(28, 68)
      const y = rng.int(84, 116)
      if (front.has(x, y)) front.set(x, y, '#ffffff')
    }
    front.line(33, 88, 38, 99, wrapPal.light)
    front.line(60, 90, 55, 102, wrapPal.light)
    front.line(40, 106, 45, 114, wrapPal.light)
  }

  /* ---------------------------------------------------------------- *
   * 6. Ribbon — band, bow loops, knot and tails at the gather point.  *
   * ---------------------------------------------------------------- */
  // Tails first (behind band + bow).
  front.line(46, 87, 42, 97, ribbon.d, 2)
  front.line(50, 87, 54, 98, ribbon.m, 2)
  front.set(42, 97, ribbon.o)
  front.set(54, 98, ribbon.o)
  // Band across the gather.
  front.fillRect(41, 84, 55, 87, ribbon.m)
  front.line(41, 84, 41, 87, ribbon.o)
  front.line(55, 84, 55, 87, ribbon.o)
  front.line(41, 84, 55, 84, ribbon.l)
  // Bow loops.
  front.polygon(
    [
      { x: 48, y: 85 },
      { x: 41, y: 79 },
      { x: 43, y: 88 },
    ],
    ribbon.l,
    ribbon.o,
  )
  front.polygon(
    [
      { x: 48, y: 85 },
      { x: 55, y: 79 },
      { x: 53, y: 88 },
    ],
    ribbon.l,
    ribbon.o,
  )
  // Knot.
  front.fillRect(46, 83, 50, 86, ribbon.m)
  front.line(46, 83, 50, 83, ribbon.l)
  front.line(46, 86, 50, 86, ribbon.d)

  return {
    width: ART_W,
    height: ART_H,
    backRects: back.toRects(),
    stemRects: stems.toRects(),
    flowers: headArts.map((h) => h.art),
    frontRects: front.toRects(),
    flowerCount: n,
  }
}
