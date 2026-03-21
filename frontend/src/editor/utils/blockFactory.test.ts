import { describe, expect, it } from 'vitest'
import { BLOCK_VERSION } from '@/editor/types'
import { createBlock } from '@/editor/utils/blockFactory'

describe('createBlock', () => {
  it('cria bloco de texto com defaults', () => {
    const block = createBlock('text')

    expect(block.type).toBe('text')
    expect(block.version).toBe(BLOCK_VERSION)
    expect(block.props).toEqual({ text: 'Novo texto', align: 'left' })
    expect(block.meta.createdAt).toBe(block.meta.updatedAt)
    expect(block.id.length).toBeGreaterThan(0)
  })

  it('cria bloco de imagem com defaults', () => {
    const block = createBlock('image')

    expect(block.type).toBe('image')
    expect(block.props).toEqual({ src: '', alt: '' })
  })

  it('cria bloco de timer com label e targetDate', () => {
    const block = createBlock('timer')

    expect(block.type).toBe('timer')
    expect(block.props.label).toBe('Contagem regressiva')
    expect(Number.isNaN(Date.parse(block.props.targetDate))).toBe(false)
  })

  it('cria bloco de galeria com transition fade', () => {
    const block = createBlock('gallery')

    expect(block.type).toBe('gallery')
    expect(block.props).toEqual({ images: [], transition: 'fade' })
  })

  it('cria bloco de musica com defaults', () => {
    const block = createBlock('music')

    expect(block.type).toBe('music')
    expect(block.props).toEqual({
      src: '',
      title: 'Nova musica',
      artist: '',
    })
  })
})
