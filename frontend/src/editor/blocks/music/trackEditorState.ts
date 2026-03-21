import type { MusicBlockProps, MusicTrack } from '@/editor/types'
import { isPlayableHttpUrl } from '@/editor/blocks/music/normalizeMusicTracks'

export interface TrackMutationResult {
  tracks: MusicTrack[]
  activeIndex: number
}

function normalizeText(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : undefined
}

export function createEmptyTrack(): MusicTrack {
  return {
    src: '',
    assetId: undefined,
    title: '',
    artist: '',
    coverSrc: '',
    coverAssetId: undefined,
  }
}

export function clampEditorTrackIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  if (!Number.isFinite(index)) {
    return 0
  }
  const rounded = Math.round(index)
  if (rounded < 0) {
    return 0
  }
  if (rounded >= total) {
    return total - 1
  }
  return rounded
}

export function addTrack(tracks: MusicTrack[]): TrackMutationResult {
  const nextTracks = [...tracks, createEmptyTrack()]
  return {
    tracks: nextTracks,
    activeIndex: nextTracks.length - 1,
  }
}

export function removeTrack(tracks: MusicTrack[], index: number, activeIndex: number): TrackMutationResult {
  if (index < 0 || index >= tracks.length) {
    return {
      tracks,
      activeIndex: clampEditorTrackIndex(activeIndex, tracks.length),
    }
  }

  const nextTracks = tracks.filter((_, currentIndex) => currentIndex !== index)
  if (nextTracks.length === 0) {
    return {
      tracks: [],
      activeIndex: 0,
    }
  }

  let nextActiveIndex = clampEditorTrackIndex(activeIndex, tracks.length)
  if (index < nextActiveIndex) {
    nextActiveIndex -= 1
  } else if (index === nextActiveIndex) {
    nextActiveIndex = Math.min(index, nextTracks.length - 1)
  }

  return {
    tracks: nextTracks,
    activeIndex: clampEditorTrackIndex(nextActiveIndex, nextTracks.length),
  }
}

export function moveTrack(tracks: MusicTrack[], index: number, direction: 'up' | 'down', activeIndex: number): TrackMutationResult {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || index >= tracks.length || targetIndex < 0 || targetIndex >= tracks.length) {
    return {
      tracks,
      activeIndex: clampEditorTrackIndex(activeIndex, tracks.length),
    }
  }

  const nextTracks = [...tracks]
  const [moved] = nextTracks.splice(index, 1)
  nextTracks.splice(targetIndex, 0, moved)

  let nextActiveIndex = clampEditorTrackIndex(activeIndex, tracks.length)
  if (nextActiveIndex === index) {
    nextActiveIndex = targetIndex
  } else if (direction === 'up' && nextActiveIndex >= targetIndex && nextActiveIndex < index) {
    nextActiveIndex += 1
  } else if (direction === 'down' && nextActiveIndex <= targetIndex && nextActiveIndex > index) {
    nextActiveIndex -= 1
  }

  return {
    tracks: nextTracks,
    activeIndex: clampEditorTrackIndex(nextActiveIndex, nextTracks.length),
  }
}

export function updateTrackAtIndex(tracks: MusicTrack[], index: number, patch: Partial<MusicTrack>, activeIndex: number): TrackMutationResult {
  if (index < 0 || index >= tracks.length) {
    return {
      tracks,
      activeIndex: clampEditorTrackIndex(activeIndex, tracks.length),
    }
  }

  const nextTracks = tracks.map((track, currentIndex) => {
    if (currentIndex !== index) {
      return track
    }

    return {
      ...track,
      ...patch,
    }
  })

  return {
    tracks: nextTracks,
    activeIndex: clampEditorTrackIndex(activeIndex, nextTracks.length),
  }
}

export function syncLegacyMirror(props: MusicBlockProps, activeIndex: number): Pick<MusicBlockProps, 'src' | 'assetId' | 'title' | 'artist' | 'coverSrc' | 'coverAssetId'> {
  const tracks = Array.isArray(props.tracks) ? props.tracks : []
  const validTrackIndexes = tracks.reduce<number[]>((accumulator, track, index) => {
    if (isPlayableHttpUrl(track.src)) {
      accumulator.push(index)
    }
    return accumulator
  }, [])

  if (validTrackIndexes.length === 0) {
    return {
      src: '',
      assetId: undefined,
      title: '',
      artist: '',
      coverSrc: '',
      coverAssetId: undefined,
    }
  }

  const safeActiveIndex = clampEditorTrackIndex(activeIndex, tracks.length)
  const fallbackIndex = validTrackIndexes[0]
  const mirrorIndex = validTrackIndexes.includes(safeActiveIndex) ? safeActiveIndex : fallbackIndex
  const mirrorTrack = tracks[mirrorIndex]

  return {
    src: normalizeText(mirrorTrack.src),
    assetId: normalizeOptionalText(mirrorTrack.assetId),
    title: normalizeText(mirrorTrack.title),
    artist: normalizeText(mirrorTrack.artist),
    coverSrc: normalizeText(mirrorTrack.coverSrc),
    coverAssetId: normalizeOptionalText(mirrorTrack.coverAssetId),
  }
}
