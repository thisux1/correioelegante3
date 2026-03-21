import { describe, expect, it } from 'vitest'
import {
  clampTrackIndex,
  computeProgressRatio,
  getAdjacentTrackIndex,
  resolveIsActuallyPlaying,
  resolveNextTrackIndex,
  shouldAutoPlayOnTrackChange,
} from '@/editor/blocks/music/useMusicPlayback'

describe('useMusicPlayback helpers', () => {
  it('calcula indice adjacente de next/prev com limites', () => {
    expect(getAdjacentTrackIndex(0, 3, 'next')).toBe(1)
    expect(getAdjacentTrackIndex(2, 3, 'next')).toBe(2)
    expect(getAdjacentTrackIndex(2, 3, 'prev')).toBe(1)
    expect(getAdjacentTrackIndex(0, 3, 'prev')).toBe(0)
  })

  it('clampa indice ativo para evitar overflow', () => {
    expect(clampTrackIndex(-2, 4)).toBe(0)
    expect(clampTrackIndex(0, 4)).toBe(0)
    expect(clampTrackIndex(6, 4)).toBe(3)
    expect(clampTrackIndex(1, 0)).toBe(0)
  })

  it('calcula progresso entre 0 e 1 com seguranca', () => {
    expect(computeProgressRatio(30, 120)).toBe(0.25)
    expect(computeProgressRatio(200, 120)).toBe(1)
    expect(computeProgressRatio(20, 0)).toBe(0)
  })

  it('mantem auto-play na troca de faixa quando estava tocando', () => {
    expect(shouldAutoPlayOnTrackChange(true)).toBe(true)
  })

  it('mantem pausado na troca de faixa quando estava pausado', () => {
    expect(shouldAutoPlayOnTrackChange(false)).toBe(false)
  })

  it('sincroniza estado real de play/pause considerando intencao de continuar tocando', () => {
    // se deve continuar tocando, mantem visual de play ativo mesmo se audio estiver pausado (carregando)
    expect(resolveIsActuallyPlaying(false, true, true)).toBe(true)
    
    // se nao continua tocando, segue o estado real
    expect(resolveIsActuallyPlaying(true, false, false)).toBe(true)
    expect(resolveIsActuallyPlaying(true, false, true)).toBe(false)
    expect(resolveIsActuallyPlaying(false, false, false)).toBe(false)
  })

  it('altera comportamento de next com shuffle ligado', () => {
    expect(resolveNextTrackIndex(1, 4, false)).toBe(2)
    const randomFn = () => 0.95
    expect(resolveNextTrackIndex(1, 4, true, randomFn)).toBe(3)
  })

  it('prev em shuffle usa selecao aleatoria sem repetir quando possivel', () => {
    const randomFn = () => 0.1
    const shuffledPrev = resolveNextTrackIndex(2, 4, true, randomFn)
    expect(shuffledPrev).toBe(0)
  })

  it('termino de faixa sem proxima retorna null', () => {
    expect(resolveNextTrackIndex(0, 1, false)).toBeNull()
    expect(resolveNextTrackIndex(2, 3, false)).toBeNull()
  })
})
