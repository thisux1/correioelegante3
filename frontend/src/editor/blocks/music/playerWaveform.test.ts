import { describe, expect, it } from 'vitest'
import {
  buildWaveformBarsModel,
  DESKTOP_WAVEFORM_BARS,
  MOBILE_WAVEFORM_BARS,
  resolveBarIndexFromClientX,
  resolveProgressBarIndex,
  resolveSeekTimeFromBarIndex,
  resolveWaveformBarsCount,
} from '@/editor/blocks/music/playerWaveform'

describe('playerWaveform helpers', () => {
  it('resolve quantidade de barras por viewport', () => {
    expect(resolveWaveformBarsCount(1280)).toBe(DESKTOP_WAVEFORM_BARS)
    expect(resolveWaveformBarsCount(390)).toBe(MOBILE_WAVEFORM_BARS)
  })

  it('resolve indice de seek pelo clique na waveform', () => {
    expect(resolveBarIndexFromClientX(50, 0, 100, 44)).toBe(22)
    expect(resolveBarIndexFromClientX(-10, 0, 100, 44)).toBe(0)
    expect(resolveBarIndexFromClientX(200, 0, 100, 44)).toBe(43)
  })

  it('resolve tempo de seek por indice da barra', () => {
    expect(resolveSeekTimeFromBarIndex(22, 44, 220)).toBe(110)
    expect(resolveSeekTimeFromBarIndex(0, 44, 220)).toBe(0)
  })

  it('calcula barra ativa do progresso', () => {
    expect(resolveProgressBarIndex(55, 220, 44)).toBe(11)
    expect(resolveProgressBarIndex(300, 220, 44)).toBe(43)
    expect(resolveProgressBarIndex(0, 0, 44)).toBe(-1)
  })

  it('mantem barra unificada com altura e progresso simultaneos', () => {
    const model = buildWaveformBarsModel([0.2, 0.4, 0.8], 1, 3)
    expect(model).toEqual([
      { heightRatio: 0.2, isPlayed: true },
      { heightRatio: 0.4, isPlayed: true },
      { heightRatio: 0.8, isPlayed: false },
    ])
  })
})
