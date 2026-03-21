export type MusicPlayerUIMode = 'minimal' | 'playlist'

export const MUSIC_PLAYER_HAS_AUTOPLAY_TOGGLE = false
export const MUSIC_PLAYER_HAS_SHUFFLE_TOGGLE = true

export function getMusicPlayerUIMode(trackCount: number): MusicPlayerUIMode {
  return trackCount > 1 ? 'playlist' : 'minimal'
}

export function shouldShowPlaylistControls(trackCount: number): boolean {
  return getMusicPlayerUIMode(trackCount) === 'playlist'
}

export function shouldShowShuffleControl(trackCount: number): boolean {
  return MUSIC_PLAYER_HAS_SHUFFLE_TOGGLE && shouldShowPlaylistControls(trackCount)
}
