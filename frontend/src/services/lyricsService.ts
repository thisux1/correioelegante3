export interface LrcLine {
  time: number
  text: string
}

export interface LyricsSearchResult {
  id: number
  trackName: string
  artistName: string
  albumName?: string
  duration?: number
  plainLyrics?: string
  syncedLyrics?: string
}

export function parseLrc(lrcText: string): LrcLine[] {
  if (!lrcText || typeof lrcText !== 'string') {
    return []
  }

  const lines = lrcText.split(/\r?\n/)
  const parsed: LrcLine[] = []

  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const matches = Array.from(trimmed.matchAll(timeRegex))
    if (matches.length === 0) continue

    const text = trimmed.replace(timeRegex, '').trim()
    if (!text) continue

    for (const match of matches) {
      const minutes = parseInt(match[1] ?? '0', 10)
      const seconds = parseInt(match[2] ?? '0', 10)
      const fractionRaw = match[3] ?? '0'
      const fraction = fractionRaw.length === 2 ? parseInt(fractionRaw, 10) / 100 : parseInt(fractionRaw, 10) / 1000

      const totalSeconds = minutes * 60 + seconds + fraction
      parsed.push({ time: totalSeconds, text })
    }
  }

  return parsed.sort((a, b) => a.time - b.time)
}

export function guessMetadataFromFileName(fileName: string): { title: string; artist: string } {
  if (!fileName) return { title: '', artist: '' }

  // Remove file extension
  let cleanName = fileName.replace(/\.[a-zA-Z0-9]+$/, '')

  // Remove common video/audio suffixes
  cleanName = cleanName
    .replace(/\(.*?(official|video|audio|lyrics|clipe|remaster|hd|hq).*?\)/gi, '')
    .replace(/\[.*?(official|video|audio|lyrics|clipe|remaster|hd|hq).*?\]/gi, '')
    .replace(/^(?:\d{1,3}[\s._-]+)/, '') // Remove track numbers like "01. " or "01 - "
    .trim()

  // Try "Artist - Title" pattern
  const dashSplit = cleanName.split(/\s+-\s+/)
  if (dashSplit.length >= 2) {
    return {
      artist: dashSplit[0]?.trim() || '',
      title: dashSplit.slice(1).join(' - ').trim(),
    }
  }

  // Try "Artist _ Title" pattern
  const underscoreSplit = cleanName.split(/_/)
  if (underscoreSplit.length >= 2) {
    return {
      artist: underscoreSplit[0]?.trim() || '',
      title: underscoreSplit.slice(1).join(' ').trim(),
    }
  }

  return {
    artist: '',
    title: cleanName,
  }
}

export async function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  if (!query || !query.trim()) return []

  try {
    const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query.trim())}`, {
      headers: {
        'User-Agent': 'CorreioElegante/2.0 (https://correioelegante.studio)',
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map((item) => ({
      id: item.id,
      trackName: item.trackName || item.name || '',
      artistName: item.artistName || '',
      albumName: item.albumName || '',
      duration: item.duration || 0,
      plainLyrics: item.plainLyrics || '',
      syncedLyrics: item.syncedLyrics || '',
    }))
  } catch {
    return []
  }
}

export async function getLyrics(trackName: string, artistName: string, duration?: number): Promise<LyricsSearchResult | null> {
  if (!trackName || !trackName.trim()) return null

  try {
    let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName.trim())}`
    if (artistName && artistName.trim()) {
      url += `&artist_name=${encodeURIComponent(artistName.trim())}`
    }
    if (duration && duration > 0) {
      url += `&duration=${Math.round(duration)}`
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CorreioElegante/2.0 (https://correioelegante.studio)',
      },
    })

    if (!res.ok) {
      // Fallback to search if exact get fails
      const searchResults = await searchLyrics(`${artistName} ${trackName}`.trim())
      return searchResults[0] ?? null
    }

    const item = await res.json()
    return {
      id: item.id,
      trackName: item.trackName || item.name || '',
      artistName: item.artistName || '',
      albumName: item.albumName || '',
      duration: item.duration || 0,
      plainLyrics: item.plainLyrics || '',
      syncedLyrics: item.syncedLyrics || '',
    }
  } catch {
    return null
  }
}
