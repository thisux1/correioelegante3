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
  }
}

export const DEFAULT_THEME_ID = 'romantic-sunset'

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
    },
  },
]

const legacyThemeAlias: Record<string, string> = {
  classic: 'romantic-sunset',
  romantic: 'romantic-sunset',
  friendship: 'ocean-breeze',
  secret: 'midnight-ink',
  poetic: 'golden-letter',
}

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

  const alias = legacyThemeAlias[normalized]
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
  '--color-surface-glass': string
  '--color-border': string
  '--color-text': string
  '--color-text-light': string
  '--font-sans': string
}

export function buildThemeStyle(themeOrId?: Theme | string | null): CSSProperties {
  const theme = typeof themeOrId === 'object' && themeOrId !== null
    ? themeOrId
    : getThemeById(themeOrId)

  const style: ThemeCssVariables = {
    '--color-primary': theme.variables.primary,
    '--color-primary-light': theme.variables.accent,
    '--color-primary-dark': theme.variables.primary,
    '--color-secondary': theme.variables.accent,
    '--color-accent': theme.variables.accent,
    '--color-background': theme.variables.background,
    '--color-surface-glass': 'rgba(255, 255, 255, 0.72)',
    '--color-border': 'rgba(255, 255, 255, 0.55)',
    '--color-text': theme.variables.text,
    '--color-text-light': withAlphaHex(theme.variables.text, 'A6'),
    '--font-sans': theme.variables.font,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
  }

  return style
}
