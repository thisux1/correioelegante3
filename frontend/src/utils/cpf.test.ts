import { describe, it, expect } from 'vitest'
import { cleanCpf, formatCpf, isValidCpf } from './cpf'

describe('CPF Utils', () => {
  describe('cleanCpf', () => {
    it('remove caracteres não numéricos', () => {
      expect(cleanCpf('123.456.789-00')).toBe('12345678900')
      expect(cleanCpf('abc-123')).toBe('123')
    })
  })

  describe('formatCpf', () => {
    it('formata progressivamente conforme a digitação', () => {
      expect(formatCpf('123')).toBe('123')
      expect(formatCpf('1234')).toBe('123.4')
      expect(formatCpf('1234567')).toBe('123.456.7')
      expect(formatCpf('12345678901')).toBe('123.456.789-01')
      expect(formatCpf('12345678901999')).toBe('123.456.789-01')
    })
  })

  describe('isValidCpf', () => {
    it('valida CPFs com dígitos verificadores corretos', () => {
      // Exemplos matematicamente válidos
      expect(isValidCpf('19119119100')).toBe(true)
      expect(isValidCpf('191.191.191-00')).toBe(true)
    })

    it('rejeita CPFs inválidos ou com dígitos iguais', () => {
      expect(isValidCpf('')).toBe(false)
      expect(isValidCpf('123')).toBe(false)
      expect(isValidCpf('11111111111')).toBe(false)
      expect(isValidCpf('00000000000')).toBe(false)
      expect(isValidCpf('12345678901')).toBe(false)
    })
  })
})
