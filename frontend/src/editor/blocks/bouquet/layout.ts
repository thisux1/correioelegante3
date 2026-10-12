/**
 * Pixel-art painter for the bouquet.
 *
 * Pure function of `BouquetBlockProps`: same props → same art. All seeded
 * placement lives in `scene.ts` (`buildBouquetScene`); this file only
 * rasterizes the scene into pixel rects — fan arrangement, stems, leaves,
 * filler sprigs, wrap texture dithering and cellophane sparkles.
 */

import type { BouquetBlockProps } from '@/editor/types'
import { PixelLayer, type PixelRect } from './pixels'
import {
  SPECIES,
  flowerPalette,
  LEAF_SPRITE,
  LEAF_PALETTE,
  GREEN,
  WRAP_PALETTES,
} from './sprites'
import {
  ART_W,
  ART_H,
  MAX_FLOWERS,
  buildBouquetScene,
  type BouquetScene,
} from './scene'

export { ART_W, ART_H, MAX_FLOWERS }

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

function spriteDims(sprite: readonly string[]) {
  const w = Math.max(...sprite.map((r) => r.length))
  return { w, h: sprite.length }
}

export function buildBouquetArt(props: BouquetBlockProps): BouquetArt {
  const scene: BouquetScene = buildBouquetScene(props)
  const wrap = scene.wrap
  const ribbon = scene.ribbon
  const wrapPal = WRAP_PALETTES[wrap]

  const back = new PixelLayer()
  const stems = new PixelLayer()
  const front = new PixelLayer()

  /* ---------------------------------------------------------------- *
   * 1. Stems + leaves (drawn before heads so heads sit on top).       *
   * ---------------------------------------------------------------- */
  for (const p of scene.flowers) {
    stems.curve(p.stem.start, p.stem.ctrl, p.stem.end, p.stem.color, p.stem.thickness)
    for (const leaf of p.leaves) {
      const ox = Math.round(leaf.x + (leaf.right ? 0 : -LEAF_SPRITE[0].length))
      const oy = Math.round(leaf.y - 2)
      stems.sprite(LEAF_SPRITE, ox, oy, LEAF_PALETTE, { flipX: leaf.right })
    }
  }

  /* ---------------------------------------------------------------- *
   * 2. Filler sprigs + baby's breath poking past the flower fan.      *
   * ---------------------------------------------------------------- */
  for (const s of scene.sprigs) {
    back.curve(s.tip, s.ctrl, s.end, GREEN.filler, 1)
    for (const b of s.buds) {
      back.set(b.x, b.y, b.color)
    }
  }
  // Small green tuft peeking over the wrap opening.
  for (const t of scene.tuft) {
    back.line(t.x1, t.y1, t.x2, t.y2, GREEN.filler, 1)
  }

  /* ---------------------------------------------------------------- *
   * 3. Head sprites → per-flower rect groups (local coordinates).     *
   * ---------------------------------------------------------------- */
  const headArts: { art: FlowerArt; hy: number; seq: number }[] = []
  for (const p of scene.flowers) {
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
        order: p.order,
      },
      hy: p.hy,
      seq: p.slotIndex,
    })
  }
  headArts.sort((a, b) => a.hy - b.hy || a.seq - b.seq)

  /* ---------------------------------------------------------------- *
   * 4. Wrap — paper cone with two folded flaps + texture.             *
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
    front.applyPattern(27, 100, 69, 117, (_existing, x, y) =>
      (x + y) % 3 === 0 ? wrapPal.deep : undefined,
    )
  } else if (wrap === 'juta') {
    // Burlap weave: vertical threads + horizontal shading rows.
    front.applyPattern(27, 83, 69, 117, (_existing, x, y) => {
      if (x % 3 === 0) return wrapPal.deep
      if (y % 3 === 0) return wrapPal.shade
      return undefined
    })
  } else {
    // Cellophane: scattered sparkle pixels + crinkle shine streaks.
    for (const sp of scene.sparkles) {
      if (front.has(sp.x, sp.y)) front.set(sp.x, sp.y, '#ffffff')
    }
    front.line(33, 88, 38, 99, wrapPal.light)
    front.line(60, 90, 55, 102, wrapPal.light)
    front.line(40, 106, 45, 114, wrapPal.light)
  }

  /* ---------------------------------------------------------------- *
   * 5. Ribbon — band, bow loops, knot and tails at the gather point.  *
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
    flowerCount: scene.flowerCount,
  }
}
