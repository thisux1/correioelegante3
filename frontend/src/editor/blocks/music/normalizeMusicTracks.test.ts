import { describe, expect, it } from 'vitest'
import { normalizeMusicTracks } from '@/editor/blocks/music/normalizeMusicTracks'

describe('normalizeMusicTracks', () => {
  it('usa tracks validas como fonte canonica e ignora fallback legado', () => {
    const result = normalizeMusicTracks({
      src: 'https://legacy.example/audio.mp3',
      title: 'Legacy',
      artist: 'Legacy Artist',
      coverSrc: 'https://legacy.example/cover.png',
      tracks: [
        { src: 'https://cdn.example/song-a.mp3', title: 'Song A' },
        { src: 'https://cdn.example/song-a.mp3', title: 'Duplicada' },
        { src: 'notaurl' },
      ],
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.src).toBe('https://cdn.example/song-a.mp3')
    expect(result[0]?.title).toBe('Song A')
  })

  it('usa fallback legado de topo quando tracks esta vazio', () => {
    const result = normalizeMusicTracks({
      src: 'https://legacy.example/audio.mp3',
      title: 'Topo',
      artist: 'Artista Topo',
      coverSrc: 'https://legacy.example/cover.png',
      assetId: 'asset-1',
      coverAssetId: 'cover-1',
      tracks: [],
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      src: 'https://legacy.example/audio.mp3',
      title: 'Topo',
      artist: 'Artista Topo',
      coverSrc: 'https://legacy.example/cover.png',
      assetId: 'asset-1',
      coverAssetId: 'cover-1',
    })
  })
})
