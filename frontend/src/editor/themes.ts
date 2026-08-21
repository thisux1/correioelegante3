import type { CSSProperties } from 'react'

export type AtmosphereType = 'petals' | 'stars' | 'sparkles' | 'hearts' | 'sakura' | 'fireflies' | 'none'

export interface Theme {
  id: string
  name: string
  thumbnail: string
  atmosphere?: AtmosphereType
  variables: {
    primary: string
    background: string
    text: string
    accent: string
    font: string
    fontDisplay?: string
    fontCursive?: string
    surface?: string
    surfaceGlass?: string
    border?: string
    textLight?: string
  }
}

export const DEFAULT_THEME_ID = 'romantic-sunset'

const themeAliases = {
  classic: DEFAULT_THEME_ID,
  romantic: DEFAULT_THEME_ID,
  friendship: 'ocean-breeze',
  secret: 'midnight-ink',
  poetic: 'golden-letter',
} as const

export const themeCatalog: Theme[] = [
  {
    id: 'rose-garden',
    name: 'Jardim de Rosas',
    thumbnail: 'linear-gradient(135deg, #be123c 0%, #fb7185 50%, #ffe4e6 100%)',
    atmosphere: 'petals',
    variables: {
      primary: '#be123c',
      background: '#fff1f2',
      text: '#4c0519',
      accent: '#fb7185',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Dancing Script", "Brush Script MT", cursive',
      surface: '#fff8f9',
      surfaceGlass: 'rgba(255, 241, 242, 0.85)',
      border: '#fecdd3',
      textLight: '#881337',
    },
  },
  {
    id: 'romantic-sunset',
    name: 'Romântico Sunset',
    thumbnail: 'linear-gradient(135deg, #d9466b 0%, #f59bb5 55%, #ffe0ea 100%)',
    atmosphere: 'hearts',
    variables: {
      primary: '#d9466b',
      background: '#fff4f7',
      text: '#3a1d2a',
      accent: '#f59bb5',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Dancing Script", "Brush Script MT", cursive',
      surface: '#fff9fb',
      surfaceGlass: 'rgba(255, 244, 247, 0.85)',
      border: '#f6c4d4',
      textLight: '#703a53',
    },
  },
  {
    id: 'midnight-galaxy',
    name: 'Galáxia da Meia-Noite',
    thumbnail: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #38bdf8 100%)',
    atmosphere: 'stars',
    variables: {
      primary: '#818cf8',
      background: '#090d16',
      text: '#f8fafc',
      accent: '#38bdf8',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Great Vibes", "Brush Script MT", cursive',
      surface: '#111827',
      surfaceGlass: 'rgba(17, 24, 39, 0.85)',
      border: '#312e81',
      textLight: '#94a3b8',
    },
  },
  {
    id: 'vintage-parchment',
    name: 'Pergaminho Vintage',
    thumbnail: 'linear-gradient(135deg, #78350f 0%, #d97706 45%, #fef3c7 100%)',
    atmosphere: 'sparkles',
    variables: {
      primary: '#78350f',
      background: '#fcf8ef',
      text: '#451a03',
      accent: '#b45309',
      font: '"Libre Baskerville", Georgia, serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Kaushan Script", "Brush Script MT", cursive',
      surface: '#faf3e0',
      surfaceGlass: 'rgba(250, 243, 224, 0.85)',
      border: '#e7d7b5',
      textLight: '#78350f',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    thumbnail: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fef3c7 100%)',
    atmosphere: 'sparkles',
    variables: {
      primary: '#d97706',
      background: '#fffbeb',
      text: '#451a03',
      accent: '#fbbf24',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Satisfy", "Brush Script MT", cursive',
      surface: '#fffdf5',
      surfaceGlass: 'rgba(255, 251, 235, 0.85)',
      border: '#fde68a',
      textLight: '#92400e',
    },
  },
  {
    id: 'cherry-blossom',
    name: 'Sakura em Flor',
    thumbnail: 'linear-gradient(135deg, #e11d48 0%, #fda4af 50%, #fff1f2 100%)',
    atmosphere: 'sakura',
    variables: {
      primary: '#e11d48',
      background: '#fff5f7',
      text: '#4c0519',
      accent: '#fb7185',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Dancing Script", "Brush Script MT", cursive',
      surface: '#fffbfc',
      surfaceGlass: 'rgba(255, 245, 247, 0.85)',
      border: '#fecdd3',
      textLight: '#9f1239',
    },
  },
  {
    id: 'cozy-candlelight',
    name: 'Luz de Velas',
    thumbnail: 'linear-gradient(135deg, #1c1917 0%, #431407 50%, #f97316 100%)',
    atmosphere: 'fireflies',
    variables: {
      primary: '#f97316',
      background: '#1c1917',
      text: '#fff7ed',
      accent: '#fb923c',
      font: '"Merriweather", Georgia, serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Caveat", "Brush Script MT", cursive',
      surface: '#292524',
      surfaceGlass: 'rgba(41, 37, 36, 0.85)',
      border: '#7c2d12',
      textLight: '#d6d3d1',
    },
  },
  {
    id: 'cyber-love',
    name: 'Cyber Love',
    thumbnail: 'linear-gradient(135deg, #030712 0%, #db2777 50%, #06b6d4 100%)',
    atmosphere: 'hearts',
    variables: {
      primary: '#f43f5e',
      background: '#030712',
      text: '#f9fafb',
      accent: '#06b6d4',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Dancing Script", "Brush Script MT", cursive',
      surface: '#0f172a',
      surfaceGlass: 'rgba(15, 23, 42, 0.85)',
      border: '#831843',
      textLight: '#94a3b8',
    },
  },
  {
    id: 'dark-aesthetic',
    name: 'Dark Aesthetic',
    thumbnail: 'linear-gradient(135deg, #09090b 0%, #27272a 50%, #e11d48 100%)',
    atmosphere: 'stars',
    variables: {
      primary: '#e11d48',
      background: '#09090b',
      text: '#fafafa',
      accent: '#fb7185',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Caveat", "Brush Script MT", cursive',
      surface: '#18181b',
      surfaceGlass: 'rgba(24, 24, 27, 0.85)',
      border: '#3f3f46',
      textLight: '#a1a1aa',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    thumbnail: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #d9fbff 100%)',
    atmosphere: 'sparkles',
    variables: {
      primary: '#0f766e',
      background: '#ecfeff',
      text: '#143840',
      accent: '#2dd4bf',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Merriweather", Georgia, serif',
      fontCursive: '"Caveat", "Brush Script MT", cursive',
      surface: '#f3ffff',
      surfaceGlass: 'rgba(236, 254, 255, 0.85)',
      border: '#bdebe6',
      textLight: '#155e75',
    },
  },
  {
    id: 'golden-letter',
    name: 'Golden Letter',
    thumbnail: 'linear-gradient(135deg, #8b5e34 0%, #e6b86a 45%, #fff4da 100%)',
    atmosphere: 'sparkles',
    variables: {
      primary: '#8b5e34',
      background: '#fff7e7',
      text: '#3f2a18',
      accent: '#e6b86a',
      font: '"Playfair Display", Georgia, serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Great Vibes", "Brush Script MT", cursive',
      surface: '#fffaf0',
      surfaceGlass: 'rgba(255, 247, 231, 0.85)',
      border: '#edd4a7',
      textLight: '#7c4a1e',
    },
  },
  {
    id: 'forest-dream',
    name: 'Forest Dream',
    thumbnail: 'linear-gradient(135deg, #2f6f4f 0%, #7bbf97 52%, #eaf8ee 100%)',
    atmosphere: 'fireflies',
    variables: {
      primary: '#2f6f4f',
      background: '#eef8f1',
      text: '#1f3328',
      accent: '#7bbf97',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Libre Baskerville", Georgia, serif',
      fontCursive: '"Satisfy", "Brush Script MT", cursive',
      surface: '#f5fcf7',
      surfaceGlass: 'rgba(238, 248, 241, 0.85)',
      border: '#c4decf',
      textLight: '#23533b',
    },
  },
  {
    id: 'midnight-ink',
    name: 'Midnight Ink',
    thumbnail: 'linear-gradient(135deg, #1f3a8a 0%, #60a5fa 50%, #e7efff 100%)',
    atmosphere: 'stars',
    variables: {
      primary: '#1f3a8a',
      background: '#ecf3ff',
      text: '#1a2747',
      accent: '#60a5fa',
      font: '"Playfair Display", Georgia, serif',
      fontDisplay: '"Merriweather", Georgia, serif',
      fontCursive: '"Kaushan Script", "Brush Script MT", cursive',
      surface: '#f3f7ff',
      surfaceGlass: 'rgba(236, 243, 255, 0.85)',
      border: '#c4d5f6',
      textLight: '#1e3a8a',
    },
  },
]

function findThemeById(themeId?: string | null): Theme | undefined {
  if (!themeId) {
    return undefined
  }

  return themeCatalog.find((theme) => theme.id === themeId)
}

function withAlphaHex(color: string, alphaHex: string): string {
  const normalized = color.trim()

  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return `${normalized}${alphaHex}`
  }

  return normalized
}

export function resolveThemeId(themeId?: string | null): string {
  if (!themeId) {
    return DEFAULT_THEME_ID
  }

  const normalized = themeId.trim()
  if (!normalized) {
    return DEFAULT_THEME_ID
  }

  const byId = findThemeById(normalized)
  if (byId) {
    return byId.id
  }

  const alias = themeAliases[normalized as keyof typeof themeAliases]
  if (alias) {
    return alias
  }

  return DEFAULT_THEME_ID
}

export function getThemeById(themeId?: string | null): Theme {
  const resolvedId = resolveThemeId(themeId)
  const theme = findThemeById(resolvedId)

  if (theme) {
    return theme
  }

  return themeCatalog[0]
}

export function getThemeAtmosphere(themeOrId?: Theme | string | null): AtmosphereType {
  if (!themeOrId) {
    return themeCatalog[0].atmosphere ?? 'none'
  }
  const theme = typeof themeOrId === 'object' && themeOrId !== null
    ? themeOrId
    : getThemeById(themeOrId)

  return theme.atmosphere ?? 'none'
}

type ThemeCssVariables = CSSProperties & {
  '--color-primary': string
  '--color-primary-light': string
  '--color-primary-dark': string
  '--color-secondary': string
  '--color-accent': string
  '--color-background': string
  '--color-surface': string
  '--color-surface-glass': string
  '--color-border': string
  '--color-text': string
  '--color-text-light': string
  '--font-sans': string
  '--font-display': string
  '--font-cursive': string
}

function resolveThemeVariable(theme: Theme) {
  const surface = theme.variables.surface ?? theme.variables.background
  const surfaceGlass = theme.variables.surfaceGlass ?? withAlphaHex(surface, 'B8')
  const border = theme.variables.border ?? withAlphaHex(theme.variables.accent, '66')
  const textLight = theme.variables.textLight ?? withAlphaHex(theme.variables.text, 'A6')
  const fontDisplay = theme.variables.fontDisplay ?? theme.variables.font
  const fontCursive = theme.variables.fontCursive ?? theme.variables.font

  return {
    surface,
    surfaceGlass,
    border,
    textLight,
    fontDisplay,
    fontCursive,
  }
}

export function buildThemeStyle(themeOrId?: Theme | string | null): CSSProperties {
  const theme = typeof themeOrId === 'object' && themeOrId !== null
    ? themeOrId
    : getThemeById(themeOrId)

  const resolved = resolveThemeVariable(theme)

  const style: ThemeCssVariables = {
    '--color-primary': theme.variables.primary,
    '--color-primary-light': theme.variables.accent,
    '--color-primary-dark': theme.variables.primary,
    '--color-secondary': theme.variables.accent,
    '--color-accent': theme.variables.accent,
    '--color-background': theme.variables.background,
    '--color-surface': resolved.surface,
    '--color-surface-glass': resolved.surfaceGlass,
    '--color-border': resolved.border,
    '--color-text': theme.variables.text,
    '--color-text-light': resolved.textLight,
    '--font-sans': theme.variables.font,
    '--font-display': resolved.fontDisplay,
    '--font-cursive': resolved.fontCursive,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
  }

  return style
}
