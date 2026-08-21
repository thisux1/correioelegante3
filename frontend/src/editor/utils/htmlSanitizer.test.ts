import { describe, expect, it } from 'vitest'
import { sanitizeHtml, stripHtml } from '@/editor/utils/htmlSanitizer'

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

describe('sanitizeHtml', () => {
  it('preserva tags de formatacao seguras (bold, italic, underline, strike, mark, span)', () => {
    const input = '<p>Texto em <strong>negrito</strong>, <em>italico</em>, <u>sublinhado</u>, <s>tachado</s> e <mark style="background-color: rgb(254, 240, 138);">destaque</mark></p>'
    const output = sanitizeHtml(input)
    expect(output).toContain('<strong>negrito</strong>')
    expect(output).toContain('<em>italico</em>')
    expect(output).toContain('<u>sublinhado</u>')
    expect(output).toContain('<s>tachado</s>')
    expect(output).toContain('<mark')
  })

  it('remove scripts, handlers de evento e tags perigosas', () => {
    const input = '<div>Ola<script>alert("hack")</script><img src="x" onerror="alert(1)" /><button onclick="alert(2)">Clique</button></div>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('<script>')
    expect(output).not.toContain('onerror')
    expect(output).not.toContain('onclick')
    expect(output).not.toContain('<button>')
  })

  it('preserva estilos inline seguros e remove CSS malicioso', () => {
    const input = '<span style="color: #e11d48; font-size: 18px; background: url(javascript:alert(1));">Texto</span>'
    const output = sanitizeHtml(input)
    expect(output).toContain('color: #e11d48')
    expect(output).toContain('font-size: 18px')
    expect(output).not.toContain('javascript:')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})

