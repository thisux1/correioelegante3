import { describe, expect, it } from 'vitest'
import { stripHtml } from '@/editor/utils/htmlSanitizer'

describe('stripHtml', () => {
  it('remove tags e retorna texto puro', () => {
    expect(stripHtml('<div>Ola <strong>Mundo</strong></div>')).toBe('Ola Mundo')
  })

  it('remove blocos script/style', () => {
    const input = '<p>inicio</p><script>alert(1)</script><style>.x{}</style><p>fim</p>'
    expect(stripHtml(input)).toBe('inicio fim')
  })

  it('normaliza espacos e nbsp', () => {
    expect(stripHtml('<div> A&nbsp;&nbsp;B <br /> C </div>')).toBe('A B C')
  })

  it('retorna vazio para input vazio', () => {
    expect(stripHtml('')).toBe('')
  })
})
