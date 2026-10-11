/**
 * Pixel-art sprite data for the procedural bouquet.
 *
 * Each flower head is a string-art sprite. Characters map to colors via two
 * sources:
 *   - the petal ramp chars `o d m l h` (outline → shadow → mid → lit →
 *     highlight) derived from the species default color or the flower's
 *     `color` override;
 *   - `fixed` chars that never recolor (seed disks, daisy hearts, calyx
 *     greens, sparkle white).
 *
 * '.' and ' ' are transparent. Rows may be ragged.
 */

import type { BouquetSpecies, BouquetWrap } from '@/editor/types'
import { rampFromHex } from './color'

export const SPECIES_LABELS: Record<BouquetSpecies, string> = {
  rosa: 'Rosa',
  girassol: 'Girassol',
  tulipa: 'Tulipa',
  margarida: 'Margarida',
  cravo: 'Cravo',
  lavanda: 'Lavanda',
}

export const WRAP_LABELS: Record<BouquetWrap, string> = {
  papel: 'Papel',
  juta: 'Juta',
  celofane: 'Celofane',
}

export interface SpeciesDef {
  sprite: readonly string[]
  /** Base hex used to derive the o/d/m/l/h shading ramp. */
  petal: string
  /** Fixed (non-recolorable) palette chars used by the sprite. */
  fixed: Record<string, string>
}

const CALYX = { g: '#3e8a4e', G: '#2c5e38' } as const

export const SPECIES: Record<BouquetSpecies, SpeciesDef> = {
  /* Face-on rose — spiral of dark cells curling off-center. */
  rosa: {
    petal: '#e11d48',
    fixed: { ...CALYX },
    sprite: [
      '...oooooo...',
      '.oollllmddo.',
      '.ollllmmmddo',
      '.olmlddmmddo',
      'ollmldoodmdo',
      'olmlldomdddo',
      'omlmdddomddo',
      'ommmdddommdo',
      '.ommmdddmmdo',
      '..ommmmmmdo.',
      '...oooooo...',
      '....gGGg....',
      '.....gg.....',
    ],
  },

  /* Sunflower — pointed petal ring around a big dithered seed disk. */
  girassol: {
    petal: '#f6a90c',
    fixed: { c: '#5d3a1a', e: '#7d4e24', k: '#3a2410', ...CALYX },
    sprite: [
      '....m..m..m....',
      '..lm.m.m.m.ml..',
      '..lmmmmmmmmml..',
      '.lmmcccccccmml.',
      '.lmccecececmml.',
      'lmmcececececmml',
      'lmccececececmml',
      'lmmcecekcecmml.',
      '.lmccecececmml.',
      '.lmmcececcemml.',
      '..lmmcccccmml..',
      '..lm.m.m.m.ml..',
      '....m..m..m....',
    ],
  },

  /* Tulip — three lobe tips over a U-shaped cup, calyx at base. */
  tulipa: {
    petal: '#f43f5e',
    fixed: { ...CALYX },
    sprite: [
      'l...m...d',
      'll..m..dd',
      'lmo.m.omd',
      'lmmmmmmmd',
      'lmmmmmmdd',
      'olmmmmddo',
      '.lmmmmmd.',
      '.lmmmmdd.',
      '..mmmmd..',
      '..mmmmd..',
      '...mmd...',
      '...gGg...',
      '....g....',
    ],
  },

  /* Daisy — thin radial white petals, small yellow heart. */
  margarida: {
    petal: '#fdf8ee',
    fixed: { y: '#f2b705', c: '#d99a06', e: '#ffd54a', ...CALYX },
    sprite: [
      '....h.h....',
      '.h..h.h..h.',
      '..lh.h.hl..',
      '..llhlhll..',
      'h.lllyell.h',
      'hhlyyeyylhh',
      'h.lllyell.h',
      '..llhlhll..',
      '..lh.h.hl..',
      '.h..h.h..h.',
      '....h.h....',
    ],
  },

  /* Carnation — ruffled ball with zigzag crown and calyx. */
  cravo: {
    petal: '#ec4899',
    fixed: { ...CALYX },
    sprite: [
      '.m.m.m.m.m.',
      'momomomomom',
      'lmmmmmmddmo',
      'lmmmmdmmddo',
      'lmddmmddmdo',
      'lmdmmmdddmo',
      '.mmmmmdddmo',
      '.mmmmdddoo.',
      '..mmmddoo..',
      '...gGGg....',
      '....gg.....',
    ],
  },

  /* Lavender — staggered bud spike, tapering to a tip. */
  lavanda: {
    petal: '#9d6bd8',
    fixed: {},
    sprite: [
      '..h..',
      '.lml.',
      '.mmd.',
      'lmlml',
      'mmmdd',
      'lmldm',
      'mmmdd',
      '.lml.',
      'lmldm',
      'mmmdd',
      '.mmd.',
      '.lml.',
      '..m..',
    ],
  },
}

/** Full char→color map for a flower, honoring the `color` override. */
export function flowerPalette(
  species: BouquetSpecies,
  override?: string,
): Record<string, string> {
  const def = SPECIES[species] ?? SPECIES.rosa
  const ramp = rampFromHex(override ?? def.petal, def.petal)
  return { ...ramp, ...def.fixed }
}

/* ------------------------------------------------------------------ */
/* Greens shared by stems, leaves and filler sprigs.                   */
/* ------------------------------------------------------------------ */

export const GREEN = {
  stem: '#3e8a4e',
  stemDark: '#2c5e38',
  stemLight: '#57a667',
  leaf: '#3e8a4e',
  leafLight: '#6fbb7d',
  leafDark: '#2c5e38',
  filler: '#4d9d5f',
  breath: '#fffdf5',
} as const

export const LEAF_PALETTE: Record<string, string> = {
  g: GREEN.leafDark,
  G: GREEN.leaf,
  L: GREEN.leafLight,
}

/** Leaf pointing left; flipped horizontally when placed on the right. */
export const LEAF_SPRITE = ['g...gg', 'gGgGGg', 'gGLGGg', '.gggg.'] as const

/* ------------------------------------------------------------------ */
/* Wrap palettes (paper / jute / cellophane).                          */
/* ------------------------------------------------------------------ */

export interface WrapPalette {
  light: string
  base: string
  shade: string
  deep: string
  outline: string
}

export const WRAP_PALETTES: Record<BouquetWrap, WrapPalette> = {
  papel: {
    light: '#ffe9f0',
    base: '#ffd3e0',
    shade: '#f3aebe',
    deep: '#e58ca0',
    outline: '#c96b83',
  },
  juta: {
    light: '#e8c9a0',
    base: '#d4a574',
    shade: '#b98a5c',
    deep: '#9a6f45',
    outline: '#7d5733',
  },
  celofane: {
    light: '#ffffff',
    base: '#fdeef3',
    shade: '#fbd9e5',
    deep: '#f3bccd',
    outline: '#e89ab2',
  },
}
