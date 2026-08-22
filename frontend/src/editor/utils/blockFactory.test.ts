import { describe, expect, it } from 'vitest'
import { BLOCK_VERSION } from '@/editor/types'
import { createBlock } from '@/editor/utils/blockFactory'

describe('createBlock', () => {
  it('cria bloco de texto com defaults', () => {
    const block = createBlock('text')

    expect(block.type).toBe('text')
    expect(block.version).toBe(BLOCK_VERSION)
    expect(block.props).toEqual({
      category: 'body',
      text: 'Escreva sua mensagem aqui...',
      html: '',
      align: 'left',
    })
    expect(block.meta.createdAt).toBe(block.meta.updatedAt)
    expect(block.id.length).toBeGreaterThan(0)
  })

  it('cria bloco de imagem com defaults', () => {
    const block = createBlock('image')

    expect(block.type).toBe('image')
    expect(block.props).toEqual({ src: '', assetId: undefined, alt: '' })
  })

  it('cria bloco de timer com label e targetDate', () => {
    const block = createBlock('timer')

    expect(block.type).toBe('timer')
    expect(block.props.label).toBe('Tempo compartilhado')
    expect(Number.isNaN(Date.parse(block.props.targetDate))).toBe(false)
  })

  it('cria bloco de galeria com transition fade', () => {
    const block = createBlock('gallery')

    expect(block.type).toBe('gallery')
    expect(block.props).toEqual({ images: [], items: [], transition: 'fade' })
  })

  it('cria bloco de musica com defaults', () => {
    const block = createBlock('music')

    expect(block.type).toBe('music')
    expect(block.props).toEqual({
      assetId: undefined,
      src: '',
      coverSrc: '',
      coverAssetId: undefined,
      tracks: [],
      title: 'Nossa Trilha Sonora',
      artist: 'Coleção de Afeto',
      playerStyle: 'vinyl',
      showLyrics: true,
      syncedLyrics: '[00:00.00]Quando a agulha toca o vinil, tudo faz sentido\n[00:04.00]Cada acorde lembra o som da sua risada\n[00:08.50]Uma melodia gravada no tempo\n[00:13.00]Feita especialmente para nós dois',
      plainLyrics: 'Quando a agulha toca o vinil, tudo faz sentido\nCada acorde lembra o som da sua risada\nUma melodia gravada no tempo\nFeita especialmente para nós dois',
    })
  })

  it('cria bloco de envelope com defaults autenticos e elegantes', () => {
    const block = createBlock('envelope')

    expect(block.type).toBe('envelope')
    expect(block.props.recipientName).toBe('Para quem ilumina meus dias')
    expect(block.props.sealInitial).toBe('C')
    expect(block.props.sealColor).toBe('#e11d48')
    expect(block.props.isOpen).toBe(false)
  })

  it('cria bloco de scratch com defaults', () => {
    const block = createBlock('scratch')

    expect(block.type).toBe('scratch')
    expect(block.props.secretType).toBe('text')
    expect(block.props.isRevealed).toBe(false)
    expect(block.props.coverText.length).toBeGreaterThan(0)
    expect(block.props.secretText?.length).toBeGreaterThan(0)
  })

  it('cria bloco de timeline com marcos padrao', () => {
    const block = createBlock('timeline')

    expect(block.type).toBe('timeline')
    expect(block.props.items.length).toBe(3)
    expect(block.props.items[0]?.title).toBe('Primeiro encontro')
  })

  it('cria bloco de quiz com pergunta e playful no ativo', () => {
    const block = createBlock('quiz')

    expect(block.type).toBe('quiz')
    expect(block.props.question).toBe('Quer namorar comigo?')
    expect(block.props.isPlayfulNo).toBe(true)
    expect(block.props.yesButtonText).toContain('Sim')
  })

  it('cria bloco de polaroid com fotos iniciais e angulos suaves', () => {
    const block = createBlock('polaroid')

    expect(block.type).toBe('polaroid')
    expect(block.props.photos.length).toBe(2)
    expect(block.props.photos[0]?.rotation).toBe(-2)
  })
})
