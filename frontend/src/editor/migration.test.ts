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
      tracks: [{
        src: 'https://cdn/audio.mp3',
        assetId: 'a2',
        title: 'x',
        artist: undefined,
        coverSrc: undefined,
        coverAssetId: undefined,
        syncedLyrics: undefined,
        plainLyrics: undefined,
      }],
      title: 'x',
      artist: '',
      playerStyle: 'minimal',
      syncedLyrics: undefined,
      plainLyrics: undefined,
      showLyrics: true,
    })
  })

  it('preserva playerStyle vinyl e syncedLyrics em bloco de musica', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 'm-vinyl',
          type: 'music',
          props: {
            src: 'https://cdn/song.mp3',
            title: 'Yellow',
            artist: 'Coldplay',
            playerStyle: 'vinyl',
            syncedLyrics: '[00:10.00] Look at the stars',
            showLyrics: true,
          },
          meta: {},
        },
      ],
    })

    expect(migrated.blocks[0].type).toBe('music')
    expect(migrated.blocks[0].props).toMatchObject({
      src: 'https://cdn/song.mp3',
      title: 'Yellow',
      artist: 'Coldplay',
      playerStyle: 'vinyl',
      syncedLyrics: '[00:10.00] Look at the stars',
      showLyrics: true,
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

  it('migra blocos de texto com subcategorias, html e propriedades de tipografia', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 't-title',
          type: 'text',
          props: {
            text: 'Meu Amor Eterno',
            category: 'title',
            html: '<h1>Meu <strong>Amor</strong> Eterno</h1>',
            align: 'center',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '32px',
            color: '#e11d48',
            bold: true,
          },
          meta: {},
        },
        {
          id: 't-quote',
          type: 'text',
          props: {
            text: 'Amar nao e olhar um para o outro...',
            category: 'quote',
            html: '<p>“Amar não é olhar um para o outro...”</p>',
            align: 'justify',
            italic: true,
          },
          meta: {},
        },
        {
          id: 't-sig',
          type: 'text',
          props: {
            text: 'Com carinho',
            category: 'signature',
            align: 'right',
            fontFamily: '"Dancing Script", cursive',
          },
          meta: {},
        },
      ],
    })

    expect(migrated.blocks).toHaveLength(3)

    const titleBlock = migrated.blocks[0]
    expect(titleBlock.type).toBe('text')
    if (titleBlock.type === 'text') {
      expect(titleBlock.props.category).toBe('title')
      expect(titleBlock.props.align).toBe('center')
      expect(titleBlock.props.html).toContain('Meu <strong>Amor</strong> Eterno')
      expect(titleBlock.props.fontSize).toBe('32px')
      expect(titleBlock.props.color).toBe('#e11d48')
      expect(titleBlock.props.bold).toBe(true)
    }

    const quoteBlock = migrated.blocks[1]
    expect(quoteBlock.type).toBe('text')
    if (quoteBlock.type === 'text') {
      expect(quoteBlock.props.category).toBe('quote')
      expect(quoteBlock.props.align).toBe('justify')
      expect(quoteBlock.props.italic).toBe(true)
    }

    const sigBlock = migrated.blocks[2]
    expect(sigBlock.type).toBe('text')
    if (sigBlock.type === 'text') {
      expect(sigBlock.props.category).toBe('signature')
      expect(sigBlock.props.align).toBe('right')
      expect(sigBlock.props.fontFamily).toBe('"Dancing Script", cursive')
    }
  })
})


describe('migratePage — sections & placement', () => {
  it('materializa secao stack implicita para blocos legados', () => {
    const migrated = migratePage({
      blocks: [
        { id: 'b1', type: 'text', props: { text: 'oi' }, meta: {} },
        { id: 'b2', type: 'timer', props: { targetDate: '2030-01-01' }, meta: {} },
      ],
    })

    expect(migrated.sections).toEqual([{ id: 'main', layout: 'stack' }])
    expect(migrated.blocks.every((b) => b.sectionId === 'main')).toBe(true)
  })

  it('preserva sections explicitas com grid e rehoming de blocos orfaos', () => {
    const migrated = migratePage({
      blocks: [
        { id: 'b1', type: 'text', props: { text: 'x' }, sectionId: 'fantasma', meta: {} },
      ],
      sections: [
        { id: 'g', layout: 'grid', grid: { cols: 8 }, theme: { accent: '#fff' } },
        { id: 's', layout: 'invalida' },
      ],
    })

    const sections = migrated.sections ?? []
    expect(sections).toHaveLength(2)
    expect(sections[0]).toMatchObject({ id: 'g', layout: 'grid', grid: { cols: 8 } })
    expect(sections[1].layout).toBe('stack')
    expect(migrated.blocks[0].sectionId).toBe('g')
  })

  it('mantem rect valido e descarta placement invalido', () => {
    const migrated = migratePage({
      blocks: [
        { id: 'b1', type: 'text', props: { text: 'x' }, rect: { col: 2, row: 3, w: 4, h: 2 }, meta: {} },
        { id: 'b2', type: 'text', props: { text: 'y' }, rect: { col: 0, row: 1, w: 4, h: 2 }, meta: {} },
      ],
    })

    expect(migrated.blocks[0].rect).toEqual({ col: 2, row: 3, w: 4, h: 2 })
    expect(migrated.blocks[1].rect).toBeUndefined()
  })
})

describe('migratePage — S10 new block types', () => {
  it('normaliza youtube, photoBook e bouquet', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 'y1',
          type: 'youtube',
          props: { url: ' https://youtu.be/abc ', title: 9, extra: 'lixo' },
          meta: {},
        },
        {
          id: 'p1',
          type: 'photoBook',
          props: {
            pages: [
              { id: 'pg1', src: 'https://x/1.jpg', caption: 'um' },
              { src: '' },
              'lixo',
            ],
            coverTitle: 'Livro',
          },
          meta: {},
        },
        {
          id: 'b1',
          type: 'bouquet',
          props: {
            seed: 7.9,
            flowers: [{ species: 'rosa' }, { species: 'fake' }],
            wrap: 'celofane',
          },
          meta: {},
        },
      ],
    })

    const [yt, pb, bq] = migrated.blocks
    expect(yt.type).toBe('youtube')
    if (yt.type === 'youtube') {
      expect(yt.props.url).toBe('https://youtu.be/abc')
      expect(yt.props.title).toBeUndefined()
      expect('extra' in yt.props).toBe(false)
    }

    expect(pb.type).toBe('photoBook')
    if (pb.type === 'photoBook') {
      expect(pb.props.pages).toHaveLength(1)
      expect(pb.props.pages[0].caption).toBe('um')
      expect(pb.props.coverTitle).toBe('Livro')
    }

    expect(bq.type).toBe('bouquet')
    if (bq.type === 'bouquet') {
      expect(bq.props.seed).toBe(7)
      expect(bq.props.flowers).toEqual([{ species: 'rosa' }])
      expect(bq.props.wrap).toBe('celofane')
    }
  })

  it('normaliza hints e intimacyGate', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 'h1',
          type: 'hints',
          props: {
            title: 'Dicas',
            hints: [{ text: 'primeira' }, { text: ' ' }, 'x'],
          },
          meta: {},
        },
        {
          id: 'g1',
          type: 'intimacyGate',
          props: {
            question: 'O que tinha na xícara?',
            answers: ['cappuccino', '', 7],
            hint: 'quente',
            allowSkip: true,
          },
          meta: {},
        },
      ],
    })

    const [hints, gate] = migrated.blocks
    expect(hints.type).toBe('hints')
    if (hints.type === 'hints') {
      expect(hints.props.hints).toHaveLength(1)
      expect(hints.props.hints[0].text).toBe('primeira')
    }

    expect(gate.type).toBe('intimacyGate')
    if (gate.type === 'intimacyGate') {
      expect(gate.props.answers).toEqual(['cappuccino'])
      expect('allowSkip' in gate.props).toBe(false)
    }
  })

  it('normaliza ticketRsvp e preserva o responseToken injetado na leitura publica', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 'r1',
          type: 'ticketRsvp',
          props: {
            title: '  te convido:  ',
            evento: { data: ' 14/03 ', lugar: '', descricao: 'sorvete', extra: 'x' },
            allowText: 'yes',
            responseToken: 'tok.abc',
            lixo: true,
          },
          meta: {},
        },
      ],
    })

    const block = migrated.blocks[0]
    expect(block.type).toBe('ticketRsvp')
    if (block.type === 'ticketRsvp') {
      expect(block.props.title).toBe('te convido:')
      expect(block.props.evento).toEqual({ data: '14/03', lugar: undefined, descricao: 'sorvete' })
      expect(block.props.allowText).toBe(true)
      // Token vem da leitura pública (HMAC no backend) — não deve ser perdido aqui
      expect(block.props.responseToken).toBe('tok.abc')
      expect('lixo' in block.props).toBe(false)
      expect(block.props.evento && 'extra' in block.props.evento).toBe(false)
    }
  })

  it('ticketRsvp sem evento e sem token normaliza com allowText true', () => {
    const migrated = migratePage({
      blocks: [{ id: 'r2', type: 'ticketRsvp', props: {}, meta: {} }],
    })

    const block = migrated.blocks[0]
    expect(block.type).toBe('ticketRsvp')
    if (block.type === 'ticketRsvp') {
      expect(block.props.allowText).toBe(true)
      expect(block.props.evento).toBeUndefined()
      expect(block.props.responseToken).toBeUndefined()
    }
  })

  it('normaliza memoryCard, hiddenNotes e togetherCounter', () => {
    const migrated = migratePage({
      blocks: [
        {
          id: 'mc1',
          type: 'memoryCard',
          props: {
            title: '  Piquenique  ',
            date: 'março/2020',
            place: 'parque',
            imageSrc: 'https://x/f.jpg',
            caption: 'começo',
            text: 'história',
            lixo: true,
          },
          meta: {},
        },
        {
          id: 'hn1',
          type: 'hiddenNotes',
          props: {
            title: 'Bilhetes',
            notes: [{ text: 'um' }, { text: ' ' }, { id: 'n9', text: 'dois' }, 'lixo'],
          },
          meta: {},
        },
        {
          id: 'tc1',
          type: 'togetherCounter',
          props: { startDate: '2020-03-14', label: 'Juntos há', extra: 1 },
          meta: {},
        },
      ],
    })

    const [mc, hn, tc] = migrated.blocks

    expect(mc.type).toBe('memoryCard')
    if (mc.type === 'memoryCard') {
      expect(mc.props.title).toBe('Piquenique')
      expect(mc.props.date).toBe('março/2020')
      expect(mc.props.imageSrc).toBe('https://x/f.jpg')
      expect('lixo' in mc.props).toBe(false)
    }

    expect(hn.type).toBe('hiddenNotes')
    if (hn.type === 'hiddenNotes') {
      expect(hn.props.notes).toHaveLength(2)
      expect(hn.props.notes[0].text).toBe('um')
      expect(hn.props.notes[1].id).toBe('n9')
    }

    expect(tc.type).toBe('togetherCounter')
    if (tc.type === 'togetherCounter') {
      expect(tc.props.startDate).toBe('2020-03-14')
      expect(tc.props.label).toBe('Juntos há')
      expect('extra' in tc.props).toBe(false)
    }
  })
})
