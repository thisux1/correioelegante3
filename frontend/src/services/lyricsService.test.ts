import { describe, it, expect } from 'vitest'
import { parseLrc, guessMetadataFromFileName } from './lyricsService'

describe('lyricsService', () => {
  describe('parseLrc', () => {
    it('deve retornar array vazio se a string for vazia ou inválida', () => {
      expect(parseLrc('')).toEqual([])
      expect(parseLrc('   ')).toEqual([])
    })

    it('deve parsear linhas LRC com timestamp e ordenar cronologicamente', () => {
      const sampleLrc = `
        [00:10.50] Primeira linha de amor
        [00:05.00] Introdução
        [01:02.345] Refrão emocionante
      `
      const parsed = parseLrc(sampleLrc)
      expect(parsed).toHaveLength(3)
      expect(parsed[0]).toEqual({ time: 5, text: 'Introdução' })
      expect(parsed[1]).toEqual({ time: 10.5, text: 'Primeira linha de amor' })
      expect(parsed[2]).toEqual({ time: 62.345, text: 'Refrão emocionante' })
    })

    it('deve ignorar linhas vazias ou sem texto', () => {
      const sampleLrc = `
        [00:01.00] 
        [00:02.00] Olá mundo
      `
      const parsed = parseLrc(sampleLrc)
      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.text).toBe('Olá mundo')
    })
  })

  describe('guessMetadataFromFileName', () => {
    it('deve extrair artista e título no padrão "Artista - Título"', () => {
      const res = guessMetadataFromFileName('Coldplay - Yellow (Official Video).mp3')
      expect(res.artist).toBe('Coldplay')
      expect(res.title).toBe('Yellow')
    })

    it('deve limpar sufixos de clipes e faixas numeradas', () => {
      const res = guessMetadataFromFileName('01. Alok - Hear Me Now [Audio HD].m4a')
      expect(res.artist).toBe('Alok')
      expect(res.title).toBe('Hear Me Now')
    })

    it('deve retornar o nome limpo como título se não houver hífen separador', () => {
      const res = guessMetadataFromFileName('Minha Musica Especial.mp3')
      expect(res.title).toBe('Minha Musica Especial')
      expect(res.artist).toBe('')
    })
  })
})
