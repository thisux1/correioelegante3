import type { MusicBlockProps, MusicTrack } from '@/editor/types'

export interface RuntimeMusicTrack extends MusicTrack {
  src: string
}

export function isPlayableHttpUrl(value: string | undefined | null): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const normalized = value.trim()
  if (!normalized) {
    return false
  }

  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeTrack(track: MusicTrack): RuntimeMusicTrack | null {
  if (!isPlayableHttpUrl(track.src)) {
    return null
  }

  return {
    ...track,
    src: track.src.trim(),
  }
}

function withLegacyMirrorFallback(track: RuntimeMusicTrack, props: Pick<MusicBlockProps, 'title' | 'artist' | 'coverSrc' | 'assetId' | 'coverAssetId'>): RuntimeMusicTrack {
  return {
    ...track,
    title: track.title ?? props.title,
    artist: track.artist ?? props.artist,
    coverSrc: track.coverSrc ?? props.coverSrc,
    assetId: track.assetId ?? props.assetId,
    coverAssetId: track.coverAssetId ?? props.coverAssetId,
  }
}

export function normalizeMusicTracks(props: Pick<MusicBlockProps, 'tracks' | 'src' | 'title' | 'artist' | 'coverSrc' | 'assetId' | 'coverAssetId'>): RuntimeMusicTrack[] {
  const rawTracks = Array.isArray(props.tracks) ? props.tracks : []
  const normalizedTracks = rawTracks
    .map(normalizeTrack)
    .filter((track): track is RuntimeMusicTrack => track !== null)
    .map((track) => withLegacyMirrorFallback(track, props))

  if (normalizedTracks.length > 0) {
    const seen = new Set<string>()
    return normalizedTracks.filter((track) => {
      if (seen.has(track.src)) {
        return false
      }
      seen.add(track.src)
      return true
    })
  }

  if (!isPlayableHttpUrl(props.src)) {
    return []
  }

  return [{
    src: props.src.trim(),
    assetId: props.assetId,
    title: props.title,
    artist: props.artist,
    coverSrc: props.coverSrc,
    coverAssetId: props.coverAssetId,
  }]
}
