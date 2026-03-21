import { describe, expect, it } from 'vitest'
import { PAGE_VERSION } from '@/editor/types'
import { migratePage } from '@/editor/migration'

describe('migratePage', () => {
  it('mapeia theme legacy para id novo', () => {
    const migrated = migratePage({ blocks: [], theme: 'classic' })
    expect(migrated.theme).toBe('romantic-sunset')
    expect(migrated.version).toBe(PAGE_VERSION)
  })

  it('normaliza blocos invalidos com defaults seguros', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: '',
          type: 'unknown',
          props: { text: 123, align: 'foo' },
          meta: { createdAt: -2, updatedAt: 'x' },
        },
      ],
    })

    expect(migrated.blocks).toHaveLength(1)
    expect(migrated.blocks[0].type).toBe('text')
    expect(migrated.blocks[0].props).toEqual({ text: '', align: 'left' })
    expect(migrated.blocks[0].id.length).toBeGreaterThan(0)
    expect(migrated.blocks[0].meta.createdAt).toBe(0)
    expect(migrated.blocks[0].meta.updatedAt).toBeGreaterThan(0)
  })

  it('mantem regras de sanitizacao por tipo', () => {
    const migrated = migratePage({
      blocks: [
        { id: 'g1', type: 'gallery', props: { images: ['a', 2], transition: 'x' }, meta: {} },
        { id: 'i1', type: 'image', props: { src: 'https://a', alt: 5 }, meta: {} },
      ],
      theme: 'ocean-breeze',
    })

    expect(migrated.blocks[0].type).toBe('gallery')
    expect(migrated.blocks[0].props).toEqual({
      images: ['a'],
      items: [{ src: 'a' }],
      transition: 'fade',
    })
    expect(migrated.blocks[1].type).toBe('image')
    expect(migrated.blocks[1].props).toEqual({ assetId: undefined, src: 'https://a', alt: '' })
    expect(migrated.theme).toBe('ocean-breeze')
  })

  it('preserva props de video e assetId em musica', () => {
    const migrated = migratePage({
      blocks: [
        { id: 'v1', type: 'video', props: { assetId: 'a1', src: 'https://cdn/video.mp4' }, meta: {} },
        { id: 'm1', type: 'music', props: { assetId: 'a2', src: 'https://cdn/audio.mp3', title: 'x' }, meta: {} },
      ],
    })

    expect(migrated.blocks[0].type).toBe('video')
    expect(migrated.blocks[0].props).toEqual({ assetId: 'a1', src: 'https://cdn/video.mp4' })
    expect(migrated.blocks[1].type).toBe('music')
    expect(migrated.blocks[1].props).toEqual({
      assetId: 'a2',
      src: 'https://cdn/audio.mp3',
      coverSrc: '',
      coverAssetId: undefined,
      tracks: [],
      title: 'x',
      artist: '',
    })
  })
})
