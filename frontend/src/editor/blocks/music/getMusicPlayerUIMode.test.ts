import { describe, expect, it } from 'vitest'
import {
  getMusicPlayerUIMode,
  MUSIC_PLAYER_HAS_AUTOPLAY_TOGGLE,
  MUSIC_PLAYER_HAS_SHUFFLE_TOGGLE,
  shouldShowShuffleControl,
  shouldShowPlaylistControls,
} from '@/editor/blocks/music/getMusicPlayerUIMode'
import { resolveSelectedTrackIndex } from '@/editor/blocks/music/useMusicPlayback'

describe('getMusicPlayerUIMode', () => {
  it('returns minimal for zero tracks', () => {
    expect(getMusicPlayerUIMode(0)).toBe('minimal')
  })

  it('returns minimal for one track', () => {
    expect(getMusicPlayerUIMode(1)).toBe('minimal')
  })

  it('returns playlist for two or more tracks', () => {
    expect(getMusicPlayerUIMode(2)).toBe('playlist')
    expect(getMusicPlayerUIMode(5)).toBe('playlist')
  })

  it('shows playlist controls only when mode is playlist', () => {
    expect(shouldShowPlaylistControls(1)).toBe(false)
    expect(shouldShowPlaylistControls(2)).toBe(true)
  })

  it('keeps autoplay disabled and enables conditional shuffle', () => {
    expect(MUSIC_PLAYER_HAS_AUTOPLAY_TOGGLE).toBe(false)
    expect(MUSIC_PLAYER_HAS_SHUFFLE_TOGGLE).toBe(true)
    expect(shouldShowShuffleControl(1)).toBe(false)
    expect(shouldShowShuffleControl(3)).toBe(true)
  })

  it('resolves selected track index safely', () => {
    expect(resolveSelectedTrackIndex(0, 2)).toBe(0)
    expect(resolveSelectedTrackIndex(1, 2)).toBe(1)
    expect(resolveSelectedTrackIndex(999, 2)).toBe(1)
    expect(resolveSelectedTrackIndex(-10, 2)).toBe(0)
    expect(resolveSelectedTrackIndex(Number.NaN, 2)).toBe(0)
  })
})
