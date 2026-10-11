/**
 * Deterministic seeded RNG utilities for the procedural bouquet art.
 *
 * The whole bouquet layout is derived from `props.seed`, so the same props
 * must always produce byte-identical art. Never use Math.random() for layout.
 */

export type RngNext = () => number

/**
 * mulberry32 — tiny, fast, well-distributed 32-bit PRNG.
 * Given the same seed it always yields the same sequence.
 */
export function mulberry32(seed: number): RngNext {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SeededRng {
  /** Next float in [0, 1) */
  next: RngNext
  /** Float in [min, max) */
  range: (min: number, max: number) => number
  /** Integer in [min, max] inclusive */
  int: (min: number, max: number) => number
  /** Pick a random element of a non-empty array */
  pick: <T>(arr: readonly T[]) => T
  /** True with probability p */
  chance: (p: number) => boolean
}

export function makeRng(seed: number): SeededRng {
  const next = mulberry32(seed)
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
  }
}
