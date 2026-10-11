/**
 * Color helpers for the procedural bouquet.
 *
 * Flower `color` overrides arrive as a single hex value; the pixel-art
 * shading model needs a full 5-step ramp (outline → dark → mid → light →
 * highlight), so we derive it here via HSL manipulation.
 */

const HEX_RE = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_RE.test(value.trim())
}

/** Normalize `#rgb`/`#rrggbb` (with or without #) to lowercase `#rrggbb`. */
export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '')
  if (!HEX_RE.test(raw)) return null
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  return `#${full.toLowerCase()}`
}

export interface Hsl {
  h: number // 0..360
  s: number // 0..1
  l: number // 0..1
}

export function hexToHsl(hex: string): Hsl | null {
  const norm = normalizeHex(hex)
  if (!norm) return null
  const r = parseInt(norm.slice(1, 3), 16) / 255
  const g = parseInt(norm.slice(3, 5), 16) / 255
  const b = parseInt(norm.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / d + 2
      break
    default:
      h = (r - g) / d + 4
      break
  }
  return { h: h * 60, s, l }
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t
  if (tt < 0) tt += 1
  if (tt > 1) tt -= 1
  if (tt < 1 / 6) return p + (q - p) * 6 * tt
  if (tt < 1 / 2) return q
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
  return p
}

export function hslToHex(hsl: Hsl): string {
  const h = (((hsl.h % 360) + 360) % 360) / 360
  const s = Math.min(1, Math.max(0, hsl.s))
  const l = Math.min(1, Math.max(0, hsl.l))

  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, h + 1 / 3)
    g = hueToRgb(p, q, h)
    b = hueToRgb(p, q, h - 1 / 3)
  }

  const to2 = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * 5-step pixel shading ramp used by every sprite:
 *  o = outline (deepest), d = shadow, m = base, l = lit, h = highlight.
 */
export interface ColorRamp {
  o: string
  d: string
  m: string
  l: string
  h: string
}

export function rampFromHex(baseHex: string, fallback = '#e11d48'): ColorRamp {
  const hsl = hexToHsl(baseHex) ?? hexToHsl(fallback) ?? { h: 348, s: 0.8, l: 0.47 }
  const mk = (dl: number, ds = 0, dh = 0) =>
    hslToHex({ h: hsl.h + dh, s: clamp01(hsl.s + ds), l: clamp01(hsl.l + dl) })

  return {
    o: mk(-0.3, 0.05),
    d: mk(-0.16, 0.02),
    m: mk(0),
    l: mk(0.14, -0.04),
    h: mk(0.27, -0.1),
  }
}
