import type { CSSProperties } from 'react'

export interface Theme {
  id: string
  name: string
  thumbnail: string
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
    id: 'romantic-sunset',
    name: 'Romantico Sunset',
    thumbnail: 'linear-gradient(135deg, #d9466b 0%, #f59bb5 55%, #ffe0ea 100%)',
    variables: {
      primary: '#d9466b',
      background: '#fff4f7',
      text: '#3a1d2a',
      accent: '#f59bb5',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Dancing Script", "Brush Script MT", cursive',
      surface: '#fff9fb',
      border: '#f6c4d4',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    thumbnail: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #d9fbff 100%)',
    variables: {
      primary: '#0f766e',
      background: '#ecfeff',
      text: '#143840',
      accent: '#2dd4bf',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Merriweather", Georgia, serif',
      fontCursive: '"Caveat", "Brush Script MT", cursive',
      surface: '#f3ffff',
      border: '#bdebe6',
    },
  },
  {
    id: 'golden-letter',
    name: 'Golden Letter',
    thumbnail: 'linear-gradient(135deg, #8b5e34 0%, #e6b86a 45%, #fff4da 100%)',
    variables: {
      primary: '#8b5e34',
      background: '#fff7e7',
      text: '#3f2a18',
      accent: '#e6b86a',
      font: '"Playfair Display", Georgia, serif',
      fontDisplay: '"Playfair Display", Georgia, serif',
      fontCursive: '"Great Vibes", "Brush Script MT", cursive',
      surface: '#fffaf0',
      border: '#edd4a7',
    },
  },
  {
    id: 'forest-dream',
    name: 'Forest Dream',
    thumbnail: 'linear-gradient(135deg, #2f6f4f 0%, #7bbf97 52%, #eaf8ee 100%)',
    variables: {
      primary: '#2f6f4f',
      background: '#eef8f1',
      text: '#1f3328',
      accent: '#7bbf97',
      font: '"Inter", system-ui, sans-serif',
      fontDisplay: '"Libre Baskerville", Georgia, serif',
      fontCursive: '"Satisfy", "Brush Script MT", cursive',
      surface: '#f5fcf7',
      border: '#c4decf',
    },
  },
  {
    id: 'midnight-ink',
    name: 'Midnight Ink',
    thumbnail: 'linear-gradient(135deg, #1f3a8a 0%, #60a5fa 50%, #e7efff 100%)',
    variables: {
      primary: '#1f3a8a',
      background: '#ecf3ff',
      text: '#1a2747',
      accent: '#60a5fa',
      font: '"Playfair Display", Georgia, serif',
      fontDisplay: '"Merriweather", Georgia, serif',
      fontCursive: '"Kaushan Script", "Brush Script MT", cursive',
      surface: '#f3f7ff',
      border: '#c4d5f6',
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
