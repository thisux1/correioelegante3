import type { AtmosphereType, Theme } from '@/editor/themes'

export interface WashiTapeColors {
  background: string
  stripe: string
}

export interface HarmonizedPalette {
  primary: string
  accent: string
  surface: string
  surfaceGlass: string
  background: string
  text: string
  textLight: string
  border: string
  sealColor: string
  washiTape: WashiTapeColors
  atmosphere?: AtmosphereType
}

export interface PersonaThemeOptions {
  name?: string
  secondaryColor?: string
  atmosphere?: AtmosphereType
}

interface HSL {
  h: number // 0 - 360
  s: number // 0 - 100
  l: number // 0 - 100
}

interface RGB {
  r: number // 0 - 255
  g: number // 0 - 255
  b: number // 0 - 255
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function normalizeHex(color: string, fallback = '#e11d48'): string {
  const trimmed = color.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(trimmed)) {
    return trimmed
  }
  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return fallback
}

export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex)
  const num = parseInt(normalized.slice(1), 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex(rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255).toString(16).padStart(2, '0')
  const g = clamp(Math.round(rgb.g), 0, 255).toString(16).padStart(2, '0')
  const b = clamp(Math.round(rgb.b), 0, 255).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60
        break
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) * 60
        break
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) * 60
        break
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hNorm = ((h % 360) + 360) % 360 / 360
  const sNorm = clamp(s, 0, 100) / 100
  const lNorm = clamp(l, 0, 100) / 100

  if (sNorm === 0) {
    const grey = Math.round(lNorm * 255)
    return { r: grey, g: grey, b: grey }
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tAdj = t
    if (tAdj < 0) tAdj += 1
    if (tAdj > 1) tAdj -= 1
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj
    if (tAdj < 1 / 2) return q
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6
    return p
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
  const p = 2 * lNorm - q

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  }
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex))
}

export function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(hslToRgb({ h, s, l }))
}

export function toHslaString(h: number, s: number, l: number, alpha: number): string {
  const clampedAlpha = clamp(alpha, 0, 1)
  return `hsla(${Math.round(((h % 360) + 360) % 360)}, ${clamp(Math.round(s), 0, 100)}%, ${clamp(Math.round(l), 0, 100)}%, ${clampedAlpha})`
}

/**
 * Harmonizes a color into a full letter design system palette.
 *
 * @param primaryColor The user's chosen base color (e.g. favorite color of their loved one).
 * @param mood 'light' for soft parchment/stationery feel, 'dark' for moody celestial feel.
 * @param options Optional secondary color override and atmosphere.
 */
export function harmonizePalette(
  primaryColor: string,
  mood: 'light' | 'dark' = 'light',
  options: PersonaThemeOptions = {},
): HarmonizedPalette {
  const normPrimary = normalizeHex(primaryColor, '#e11d48')
  const hsl = hexToHsl(normPrimary)

  const isLight = mood === 'light'

  // Accent determination: if secondaryColor provided, use it; otherwise compute harmonious analogous/triadic accent
  let accentHex: string
  if (options.secondaryColor) {
    accentHex = normalizeHex(options.secondaryColor)
  } else {
    const accentHue = (hsl.h + (isLight ? 24 : 32)) % 360
    const accentSat = clamp(isLight ? hsl.s * 0.95 : Math.max(hsl.s, 75), 45, 95)
    const accentLight = isLight ? clamp(hsl.l + 18, 55, 78) : clamp(hsl.l + 12, 60, 75)
    accentHex = hslToHex(accentHue, accentSat, accentLight)
  }

  const accentHsl = hexToHsl(accentHex)

  if (isLight) {
    // Light Mode: Soft, elegant romantic stationery
    const primary = hslToHex(hsl.h, clamp(Math.max(hsl.s, 50), 45, 88), clamp(hsl.l, 34, 52))
    const background = hslToHex(hsl.h, clamp(Math.min(hsl.s, 30), 12, 28), 98)
    const surface = hslToHex(hsl.h, clamp(Math.min(hsl.s, 22), 8, 20), 99.5)
    const surfaceGlass = toHslaString(hsl.h, 25, 98, 0.88)
    const border = hslToHex(hsl.h, clamp(Math.min(hsl.s, 45), 25, 45), 88)
    const text = hslToHex(hsl.h, clamp(Math.min(hsl.s, 45), 20, 50), 12)
    const textLight = hslToHex(hsl.h, clamp(Math.min(hsl.s, 35), 18, 40), 38)
    const sealColor = hslToHex(hsl.h, clamp(Math.max(hsl.s, 70), 65, 95), 45)

    const washiBg = hslToHex(accentHsl.h, clamp(Math.min(accentHsl.s, 55), 25, 50), 92)
    const washiStripe = hslToHex(accentHsl.h, clamp(Math.max(accentHsl.s, 50), 40, 75), 78)

    return {
      primary,
      accent: accentHex,
      surface,
      surfaceGlass,
      background,
      text,
      textLight,
      border,
      sealColor,
      washiTape: {
        background: washiBg,
        stripe: washiStripe,
      },
      atmosphere: options.atmosphere ?? 'hearts',
    }
  }

  // Dark Mode: Midnight celestial & rich velvety aesthetic
  const primary = hslToHex(hsl.h, clamp(Math.max(hsl.s, 70), 60, 95), clamp(hsl.l, 55, 70))
  const background = hslToHex(hsl.h, clamp(Math.min(hsl.s, 35), 15, 32), 7)
  const surface = hslToHex(hsl.h, clamp(Math.min(hsl.s, 30), 12, 28), 12)
  const surfaceGlass = toHslaString(hsl.h, 25, 12, 0.92)
  const border = hslToHex(hsl.h, clamp(Math.min(hsl.s, 45), 25, 45), 30)
  const text = hslToHex(hsl.h, clamp(Math.min(hsl.s, 15), 5, 20), 96)
  const textLight = hslToHex(hsl.h, clamp(Math.min(hsl.s, 20), 8, 25), 74)
  const sealColor = hslToHex(hsl.h, clamp(Math.max(hsl.s, 80), 70, 98), 58)

  const washiBg = hslToHex(accentHsl.h, clamp(Math.min(accentHsl.s, 40), 15, 35), 22)
  const washiStripe = hslToHex(accentHsl.h, clamp(Math.max(accentHsl.s, 50), 35, 65), 42)

  return {
    primary,
    accent: accentHex,
    surface,
    surfaceGlass,
    background,
    text,
    textLight,
    border,
    sealColor,
    washiTape: {
      background: washiBg,
      stripe: washiStripe,
    },
    atmosphere: options.atmosphere ?? 'stars',
  }
}

/**
 * Creates a valid Theme object dynamically from harmonized colors.
 */
export function createPersonaTheme(
  primaryColor: string,
  mood: 'light' | 'dark' = 'light',
  options: PersonaThemeOptions = {},
): Theme {
  const normPrimary = normalizeHex(primaryColor, '#e11d48')
  const palette = harmonizePalette(normPrimary, mood, options)
  const id = encodePersonaThemeId(normPrimary, mood, options.secondaryColor)
  const name = options.name || (mood === 'dark' ? 'Cores da Sua Pessoa (Noite)' : 'Cores da Sua Pessoa')

  const thumbnail = `linear-gradient(135deg, ${palette.primary} 0%, ${palette.accent} 50%, ${palette.background} 100%)`

  return {
    id,
    name,
    thumbnail,
    atmosphere: palette.atmosphere ?? (mood === 'dark' ? 'stars' : 'hearts'),
    variables: {
      primary: palette.primary,
      background: palette.background,
      text: palette.text,
      accent: palette.accent,
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Dancing Script", "Brush Script MT", cursive',
      surface: palette.surface,
      surfaceGlass: palette.surfaceGlass,
      border: palette.border,
      textLight: palette.textLight,
    },
  }
}

const PERSONA_PREFIX = 'persona:'

export function encodePersonaThemeId(primary: string, mood: 'light' | 'dark', secondary?: string): string {
  const normPrimary = normalizeHex(primary).replace('#', '')
  const normSecondary = secondary ? normalizeHex(secondary).replace('#', '') : ''
  if (normSecondary) {
    return `${PERSONA_PREFIX}${normPrimary}:${mood}:${normSecondary}`
  }
  return `${PERSONA_PREFIX}${normPrimary}:${mood}`
}

export function parsePersonaThemeId(themeId?: string | null): {
  primary: string
  mood: 'light' | 'dark'
  secondary?: string
} | null {
  if (!themeId || !themeId.startsWith(PERSONA_PREFIX)) {
    return null
  }

  const rest = themeId.slice(PERSONA_PREFIX.length)
  const parts = rest.split(':')
  if (parts.length < 2) {
    return null
  }

  const primaryHex = `#${parts[0]}`
  const mood = parts[1] === 'dark' ? 'dark' : 'light'
  const secondaryHex = parts[2] ? `#${parts[2]}` : undefined

  return {
    primary: normalizeHex(primaryHex),
    mood,
    secondary: secondaryHex ? normalizeHex(secondaryHex) : undefined,
  }
}

export function isPersonaThemeId(themeId?: string | null): boolean {
  return typeof themeId === 'string' && themeId.startsWith(PERSONA_PREFIX)
}
