/**
 * Tiny pixel-grid rasterizer.
 *
 * The bouquet is drawn on a coarse virtual grid (one SVG <rect> per pixel).
 * Layers collect colored cells; `toRects()` run-length merges each row so the
 * emitted SVG stays compact while remaining perfectly crisp
 * (`shape-rendering: crispEdges`).
 */

export interface PixelRect {
  x: number
  y: number
  w: number
  color: string
}

export type SpriteRows = readonly string[]
export type PaletteMap = Record<string, string>

/** Round to 2 decimals — keeps emitted markup deterministic and compact. */
const r2 = (n: number) => Math.round(n * 100) / 100

export class PixelLayer {
  private cells = new Map<string, string>()

  private key(x: number, y: number) {
    return `${x},${y}`
  }

  set(x: number, y: number, color: string) {
    const xi = Math.round(x)
    const yi = Math.round(y)
    this.cells.set(this.key(xi, yi), color)
  }

  get(x: number, y: number): string | undefined {
    return this.cells.get(this.key(Math.round(x), Math.round(y)))
  }

  has(x: number, y: number): boolean {
    return this.get(x, y) !== undefined
  }

  /**
   * Recolor cells inside a bounding box that are already painted.
   * `fn` receives the current color + coords and returns the replacement
   * (or null/undefined to leave the cell untouched). Used for dithered
   * shading and weave/sparkle textures clipped to a shape.
   */
  applyPattern(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    fn: (existing: string, x: number, y: number) => string | null | undefined,
  ) {
    for (let y = Math.round(y0); y <= Math.round(y1); y++) {
      for (let x = Math.round(x0); x <= Math.round(x1); x++) {
        const existing = this.get(x, y)
        if (existing === undefined) continue
        const next = fn(existing, x, y)
        if (next != null) this.cells.set(this.key(x, y), next)
      }
    }
  }

  fillRect(x0: number, y0: number, x1: number, y1: number, color: string) {
    for (let y = Math.round(y0); y <= Math.round(y1); y++) {
      for (let x = Math.round(x0); x <= Math.round(x1); x++) {
        this.set(x, y, color)
      }
    }
  }

  /** Checkerboard dither fill — the pixel-art shading signature. */
  fillDither(x0: number, y0: number, x1: number, y1: number, a: string, b: string) {
    for (let y = Math.round(y0); y <= Math.round(y1); y++) {
      for (let x = Math.round(x0); x <= Math.round(x1); x++) {
        this.set(x, y, (x + y) % 2 === 0 ? a : b)
      }
    }
  }

  /**
   * Rasterized line (supersampled walk). `thickness` widens perpendicular
   * by stamping a small square brush.
   */
  line(x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 3
    const half = Math.floor(thickness / 2)
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = x0 + (x1 - x0) * t
      const y = y0 + (y1 - y0) * t
      for (let oy = -half; oy <= half; oy++) {
        for (let ox = -half; ox <= half; ox++) {
          this.set(x + ox, y + oy, color)
        }
      }
    }
  }

  /** Quadratic bezier rasterized by sampling — used for curved stems. */
  curve(
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    color: string,
    thickness = 1,
  ) {
    const approxLen =
      Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y)
    const steps = Math.max(8, Math.round(approxLen * 2.5))
    const half = Math.floor(thickness / 2)
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const u = 1 - t
      const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x
      const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
      for (let oy = -half; oy <= half; oy++) {
        for (let ox = -half; ox <= half; ox++) {
          this.set(x + ox, y + oy, color)
        }
      }
    }
  }

  /**
   * Scanline polygon fill. `outline` (optional) strokes the edges with the
   * line rasterizer afterwards.
   */
  polygon(
    points: readonly { x: number; y: number }[],
    fill: string,
    outline?: string,
  ) {
    if (points.length < 3) return
    const ys = points.map((p) => p.y)
    const minY = Math.floor(Math.min(...ys))
    const maxY = Math.ceil(Math.max(...ys))

    for (let y = minY; y <= maxY; y++) {
      const yc = y + 0.5
      const xs: number[] = []
      for (let i = 0; i < points.length; i++) {
        const a = points[i]
        const b = points[(i + 1) % points.length]
        if (a.y === b.y) continue
        if (yc < Math.min(a.y, b.y) || yc >= Math.max(a.y, b.y)) continue
        xs.push(a.x + ((yc - a.y) / (b.y - a.y)) * (b.x - a.x))
      }
      xs.sort((p, q) => p - q)
      for (let i = 0; i + 1 < xs.length; i += 2) {
        for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) {
          this.set(x, y, fill)
        }
      }
    }

    if (outline) {
      for (let i = 0; i < points.length; i++) {
        const a = points[i]
        const b = points[(i + 1) % points.length]
        this.line(a.x, a.y, b.x, b.y, outline)
      }
    }
  }

  /**
   * Blit a string-art sprite. Each character maps to a palette color;
   * '.' and ' ' are transparent. `flipX` mirrors horizontally.
   * `dye` lets a call override specific chars (per-flower color override).
   */
  sprite(
    rows: SpriteRows,
    ox: number,
    oy: number,
    palette: PaletteMap,
    opts: { flipX?: boolean; skip?: Set<string> } = {},
  ) {
    const height = rows.length
    for (let r = 0; r < height; r++) {
      const row = rows[r]
      const width = row.length
      for (let c = 0; c < width; c++) {
        const ch = row[opts.flipX ? width - 1 - c : c]
        if (ch === '.' || ch === ' ' || opts.skip?.has(ch)) continue
        const color = palette[ch]
        if (!color) continue
        this.set(ox + c, oy + r, color)
      }
    }
  }

  /** Run-length merge rows into minimal <rect> data. */
  toRects(): PixelRect[] {
    const byRow = new Map<number, Map<number, string>>()
    for (const [key, color] of this.cells) {
      const comma = key.indexOf(',')
      const x = Number(key.slice(0, comma))
      const y = Number(key.slice(comma + 1))
      let row = byRow.get(y)
      if (!row) {
        row = new Map()
        byRow.set(y, row)
      }
      row.set(x, color)
    }

    const rects: PixelRect[] = []
    const rows = [...byRow.keys()].sort((a, b) => a - b)
    for (const y of rows) {
      const row = byRow.get(y)
      if (!row) continue
      const xs = [...row.keys()].sort((a, b) => a - b)
      let runStart = xs[0]
      let runColor = row.get(xs[0]) as string
      let prevX = xs[0]
      const flush = (endX: number) => {
        rects.push({ x: runStart, y, w: r2(endX - runStart + 1), color: runColor })
      }
      for (let i = 1; i < xs.length; i++) {
        const x = xs[i]
        const color = row.get(x) as string
        if (x === prevX + 1 && color === runColor) {
          prevX = x
          continue
        }
        flush(prevX)
        runStart = x
        runColor = color
        prevX = x
      }
      flush(prevX)
    }
    return rects
  }
}
