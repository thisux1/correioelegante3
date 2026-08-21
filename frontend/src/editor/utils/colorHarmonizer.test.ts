import { describe, expect, it } from 'vitest'
import {
  createPersonaTheme,
  encodePersonaThemeId,
  harmonizePalette,
  hexToHsl,
  hexToRgb,
  hslToHex,
  isPersonaThemeId,
  normalizeHex,
  parsePersonaThemeId,
  rgbToHex,
  rgbToHsl,
} from './colorHarmonizer'

describe('colorHarmonizer utility', () => {
  describe('HEX, RGB and HSL conversion helpers', () => {
    it('normalizes 3-digit and 6-digit hex values correctly', () => {
      expect(normalizeHex('#fff')).toBe('#ffffff')
      expect(normalizeHex('#E11D48')).toBe('#e11d48')
      expect(normalizeHex('invalid', '#ff0000')).toBe('#ff0000')
    })

    it('converts HEX to RGB and back to HEX', () => {
      const rgb = hexToRgb('#e11d48')
      expect(rgb).toEqual({ r: 225, g: 29, b: 72 })
      expect(rgbToHex(rgb)).toBe('#e11d48')
    })

    it('converts RGB to HSL and back to HEX', () => {
      const hsl = hexToHsl('#3b82f6')
      expect(hsl.h).toBeGreaterThanOrEqual(210)
      expect(hsl.h).toBeLessThanOrEqual(225)
      expect(hsl.s).toBeGreaterThan(80)

      const hex = hslToHex(hsl.h, hsl.s, hsl.l)
      expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    })

    it('handles achromatic colors (greyscale)', () => {
      const greyHsl = rgbToHsl({ r: 128, g: 128, b: 128 })
      expect(greyHsl.s).toBe(0)
      const greyHex = hslToHex(0, 0, 50)
      expect(greyHex).toBe('#808080')
    })
  })

  describe('harmonizePalette', () => {
    it('generates a complete romantic light palette with high contrast readability', () => {
      const palette = harmonizePalette('#e11d48', 'light')

      expect(palette.primary).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.accent).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.background).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.surface).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.surfaceGlass).toContain('hsla')
      expect(palette.text).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.textLight).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.border).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.sealColor).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.washiTape.background).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.washiTape.stripe).toMatch(/^#[0-9a-f]{6}$/)

      // Light mode background should be bright, text should be dark
      const bgHsl = hexToHsl(palette.background)
      const textHsl = hexToHsl(palette.text)
      expect(bgHsl.l).toBeGreaterThan(90)
      expect(textHsl.l).toBeLessThan(25)
    })

    it('generates a celestial dark palette with luminous primary and glowing accent', () => {
      const palette = harmonizePalette('#3b82f6', 'dark')

      expect(palette.primary).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.background).toMatch(/^#[0-9a-f]{6}$/)
      expect(palette.text).toMatch(/^#[0-9a-f]{6}$/)

      // Dark mode background should be dark, text should be luminous
      const bgHsl = hexToHsl(palette.background)
      const textHsl = hexToHsl(palette.text)
      expect(bgHsl.l).toBeLessThan(15)
      expect(textHsl.l).toBeGreaterThan(85)
      expect(palette.atmosphere).toBe('stars')
    })

    it('respects custom secondary color when provided', () => {
      const palette = harmonizePalette('#e11d48', 'light', { secondaryColor: '#fbbf24' })
      expect(palette.accent).toBe('#fbbf24')
    })
  })

  describe('createPersonaTheme and ID encoding', () => {
    it('creates a full valid Theme object', () => {
      const theme = createPersonaTheme('#8b5cf6', 'light', { name: 'Lavanda Romântica' })

      expect(theme.id).toBe('persona:8b5cf6:light')
      expect(theme.name).toBe('Lavanda Romântica')
      expect(theme.thumbnail).toContain('linear-gradient')
      expect(theme.variables.primary).toBeDefined()
      expect(theme.variables.background).toBeDefined()
      expect(theme.variables.text).toBeDefined()
      expect(theme.variables.fontCursive).toContain('Dancing Script')
    })

    it('encodes and parses persona theme IDs correctly', () => {
      const idWithoutSecondary = encodePersonaThemeId('#e11d48', 'dark')
      expect(idWithoutSecondary).toBe('persona:e11d48:dark')
      expect(isPersonaThemeId(idWithoutSecondary)).toBe(true)

      const parsed = parsePersonaThemeId(idWithoutSecondary)
      expect(parsed).toEqual({
        primary: '#e11d48',
        mood: 'dark',
        secondary: undefined,
      })

      const idWithSecondary = encodePersonaThemeId('#3b82f6', 'light', '#10b981')
      expect(idWithSecondary).toBe('persona:3b82f6:light:10b981')
      const parsedWithSecondary = parsePersonaThemeId(idWithSecondary)
      expect(parsedWithSecondary).toEqual({
        primary: '#3b82f6',
        mood: 'light',
        secondary: '#10b981',
      })

      expect(isPersonaThemeId('rose-garden')).toBe(false)
      expect(parsePersonaThemeId('rose-garden')).toBeNull()
    })
  })
})
