import { describe, expect, it, vi } from 'vitest'
import { getAudioContextCtor, setupVisualizerGraph } from '@/editor/blocks/music/useMusicVisualizer'

describe('useMusicVisualizer helpers', () => {
  it('retorna fallback quando nao ha AudioContext', () => {
    const fakeWindow = { AudioContext: undefined, webkitAudioContext: undefined } as unknown as Window
    const ctor = getAudioContextCtor(fakeWindow)
    expect(ctor).toBeNull()
  })

  it('retorna fallback quando setup do analyser falha', () => {
    const audio = {
      captureStream: vi.fn(() => ({})),
    } as unknown as HTMLAudioElement

    class BrokenAudioContext {
      constructor() {
        throw new Error('failed')
      }
    }

    const graph = setupVisualizerGraph(audio, BrokenAudioContext as unknown as typeof AudioContext)
    expect(graph.mode).toBe('fallback')
  })

  it('nao depende de graph analyser para fluxo de playback', () => {
    const audioPlay = vi.fn().mockResolvedValue(undefined)
    const fakeAudio = { play: audioPlay } as unknown as HTMLAudioElement

    expect(() => {
      void fakeAudio.play()
      setupVisualizerGraph(fakeAudio, null)
    }).not.toThrow()
    expect(audioPlay).toHaveBeenCalled()
  })
})
