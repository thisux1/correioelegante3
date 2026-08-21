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
      tracks: [{ src: 'https://cdn/audio.mp3', assetId: 'a2', title: 'x', artist: undefined, coverSrc: undefined, coverAssetId: undefined }],
      title: 'x',
      artist: '',
    })
  })

  it('usa tracks como fonte de verdade, preserva ordem e aplica limite de 30', () => {
    const migrated = migratePage({
      blocks: [{
        id: 'm2',
        type: 'music',
        props: {
          src: 'https://cdn/legacy.mp3',
          tracks: Array.from({ length: 34 }, (_, index) => ({
            src: `https://cdn/t${index}.mp3`,
            title: `Track ${index}`,
          })),
        },
        meta: {},
      }],
    })

    const music = migrated.blocks[0]
    expect(music?.type).toBe('music')
    if (music?.type !== 'music') {
      return
    }

    expect(music.props.tracks).toHaveLength(30)
    expect(music.props.tracks?.[0]?.src).toBe('https://cdn/t0.mp3')
    expect(music.props.tracks?.[1]?.src).toBe('https://cdn/t1.mp3')
    expect(music.props.tracks?.[29]?.src).toBe('https://cdn/t29.mp3')
    expect(music.props.src).toBe('https://cdn/legacy.mp3')
  })

  it('remove tracks invalidas e faz fallback para legado quando necessario', () => {
    const migrated = migratePage({
      blocks: [{
        id: 'm3',
        type: 'music',
        props: {
          src: 'https://cdn/legacy-only.mp3',
          assetId: 'asset-1',
          title: 'Titulo legado',
          artist: 'Artista legado',
          coverSrc: 'https://cdn/legacy-cover.jpg',
          coverAssetId: 'cover-1',
          tracks: [{ src: '   ' }, { foo: 'bar' }],
        },
        meta: {},
      }],
    })

    const music = migrated.blocks[0]
    expect(music?.type).toBe('music')
    if (music?.type !== 'music') {
      return
    }

    expect(music.props.tracks).toEqual([
      {
        src: 'https://cdn/legacy-only.mp3',
        assetId: 'asset-1',
        title: 'Titulo legado',
        artist: 'Artista legado',
        coverSrc: 'https://cdn/legacy-cover.jpg',
        coverAssetId: 'cover-1',
      },
    ])
  })

  it('migra novos blocos interativos com sanitizacao completa', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 'env-1',
          type: 'envelope',
          props: {
            recipientName: '  Amor da minha vida  ',
            senderName: '  Thiago  ',
            sealInitial: '💌',
            sealColor: '#e11d48',
            messageSnippet: '  Uma linda carta de amor  ',
            isOpen: true,
          },
          meta: {},
        },
        {
          id: 'scr-1',
          type: 'scratch',
          props: {
            coverText: 'Raspe aqui',
            secretType: 'text',
            secretText: 'Te amo',
            isRevealed: false,
          },
          meta: {},
        },
        {
          id: 'time-1',
          type: 'timeline',
          props: {
            items: [
              { id: 'item-1', date: '2024', title: 'Primeiro Beijo', description: 'Inesquecível', image: 'https://img' },
            ],
          },
          meta: {},
        },
        {
          id: 'quiz-1',
          type: 'quiz',
          props: {
            question: 'Quer namorar comigo?',
            yesButtonText: 'Sim!',
            noButtonText: 'Não',
            successMessage: 'Eba!',
            isPlayfulNo: true,
          },
          meta: {},
        },
        {
          id: 'pol-1',
          type: 'polaroid',
          props: {
            photos: [
              { id: 'p1', src: 'https://photo.jpg', caption: 'Viagem', rotation: 3 },
            ],
          },
          meta: {},
        },
      ],
    })

    expect(migrated.blocks).toHaveLength(5)
    expect(migrated.blocks[0].type).toBe('envelope')
    expect(migrated.blocks[0].props).toEqual({
      recipientName: 'Amor da minha vida',
      senderName: 'Thiago',
      sealInitial: '💌',
      sealColor: '#e11d48',
      messageSnippet: 'Uma linda carta de amor',
      isOpen: true,
    })

    expect(migrated.blocks[1].type).toBe('scratch')
    expect(migrated.blocks[1].props).toEqual({
      coverText: 'Raspe aqui',
      secretType: 'text',
      secretText: 'Te amo',
      secretImage: '',
      isRevealed: false,
    })

    expect(migrated.blocks[2].type).toBe('timeline')
    expect(migrated.blocks[2].props).toEqual({
      items: [
        { id: 'item-1', date: '2024', title: 'Primeiro Beijo', description: 'Inesquecível', image: 'https://img' },
      ],
    })

    expect(migrated.blocks[3].type).toBe('quiz')
    expect(migrated.blocks[3].props).toEqual({
      question: 'Quer namorar comigo?',
      yesButtonText: 'Sim!',
      noButtonText: 'Não',
      successMessage: 'Eba!',
      isPlayfulNo: true,
    })

    expect(migrated.blocks[4].type).toBe('polaroid')
    expect(migrated.blocks[4].props).toEqual({
      photos: [
        { id: 'p1', src: 'https://photo.jpg', caption: 'Viagem', rotation: 3 },
      ],
    })
  })
})
