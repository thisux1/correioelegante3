import { describe, expect, it } from 'vitest'
import { reviewBlocks, reviewPage } from './reviewBlocks'
import type { Block } from '@/editor/types'

let seq = 0
function block(type: Block['type'], props: Record<string, unknown>): Block {
  seq += 1
  return {
    id: `b${seq}`,
    type,
    version: 1,
    props,
    meta: { createdAt: 0, updatedAt: 0 },
  } as Block
}

describe('reviewBlocks', () => {
  it('returns no issues for a complete page', () => {
    const blocks = [
      block('text', { text: 'conta tudo.' }),
      block('hints', { hints: [{ id: '1', text: 'dica' }] }),
      block('intimacyGate', { question: '?', answers: ['cappuccino'] }),
      block('ticketRsvp', { evento: { data: 'sábado 19h', lugar: 'café' } }),
    ]
    expect(reviewBlocks(blocks)).toEqual([])
  })

  it('flags an empty text block', () => {
    const issues = reviewBlocks([block('text', { text: '   ' })])
    expect(issues).toHaveLength(1)
    expect(issues[0].blockLabel).toBe('Texto')
  })

  it('flags a scratch card with no secret', () => {
    const issues = reviewBlocks([block('scratch', { coverText: 'raspe', secretType: 'text' })])
    expect(issues[0].problem).toContain('segredo')
  })

  it('flags hints with only blank entries', () => {
    const issues = reviewBlocks([
      block('hints', { hints: [{ id: '1', text: '  ' }] }),
    ])
    expect(issues).toHaveLength(1)
  })

  it('flags an intimacy gate with no accepted answers', () => {
    const issues = reviewBlocks([block('intimacyGate', { question: '?', answers: ['  '] })])
    expect(issues[0].problem).toContain('resposta')
  })

  it('flags a photo book with no pages and one with blank pages', () => {
    expect(reviewBlocks([block('photoBook', { pages: [] })])).toHaveLength(1)
    expect(
      reviewBlocks([block('photoBook', { pages: [{ id: '1', src: '' }] })]),
    ).toHaveLength(1)
    expect(
      reviewBlocks([block('photoBook', { pages: [{ id: '1', src: 'x.png' }] })]),
    ).toHaveLength(0)
  })

  it('flags an RSVP invite without event details', () => {
    const issues = reviewBlocks([block('ticketRsvp', { title: 'bora?' })])
    expect(issues).toHaveLength(1)
    expect(
      reviewBlocks([block('ticketRsvp', { evento: { lugar: 'café Aurora' } })]),
    ).toHaveLength(0)
  })

  it('flags media blocks without sources', () => {
    const issues = reviewBlocks([
      block('image', {}),
      block('gallery', { images: [] }),
      block('youtube', {}),
      block('music', {}),
    ])
    expect(issues).toHaveLength(4)
  })

  it('reports each issue with the block id for jump-to', () => {
    const b = block('timer', { targetDate: '' })
    const issues = reviewBlocks([b])
    expect(issues[0].blockId).toBe(b.id)
    expect(issues[0].blockLabel).toBe('Contagem regressiva')
  })

  it('flags new block types when empty', () => {
    const issues = reviewBlocks([
      block('memoryCard', {}),
      block('hiddenNotes', { notes: [{ id: '1', text: ' ' }] }),
      block('togetherCounter', { startDate: '' }),
    ])
    expect(issues).toHaveLength(3)
    expect(issues.map((i) => i.blockLabel)).toEqual([
      'Memória',
      'Bilhetes Escondidos',
      'Tempo Juntos',
    ])

    expect(
      reviewBlocks([
        block('memoryCard', { text: 'uma história' }),
        block('hiddenNotes', { notes: [{ id: '1', text: 'segredinho' }] }),
        block('togetherCounter', { startDate: '2020-03-14' }),
      ]),
    ).toHaveLength(0)
  })
})

describe('reviewPage — matriz de completude', () => {
  it('returns one row per block, in page order', () => {
    const blocks = [
      block('envelope', {}),
      block('text', { text: 'oi' }),
      block('quiz', { question: 'topa?' }),
    ]
    const reviews = reviewPage(blocks)
    expect(reviews).toHaveLength(3)
    expect(reviews.map((r) => r.blockLabel)).toEqual([
      'Envelope',
      'Texto',
      'Pergunta',
    ])
    expect(reviews.every((r) => r.problem === undefined)).toBe(true)
  })

  it('describes what the recipient does in each part', () => {
    const reviews = reviewPage([
      block('scratch', { secretText: 'segredo' }),
      block('ticketRsvp', { evento: { data: 'sábado' } }),
    ])
    expect(reviews[0].experience).toBe('raspa pra revelar o segredo')
    expect(reviews[1].experience).toBe('responde ao convite')
  })

  it('marks incomplete parts with their problem', () => {
    const reviews = reviewPage([
      block('text', { text: '' }),
      block('bouquet', { flowers: [] }),
    ])
    expect(reviews[0].problem).toContain('vazio')
    expect(reviews[1].problem).toBeUndefined()
  })

  it('falls back to generic label/experience for unknown blocks', () => {
    const reviews = reviewPage([block('video' as Block['type'], { src: 'x.mp4' })])
    expect(reviews[0].blockLabel).toBe('Vídeo')
    expect(reviews[0].experience).toBe('assiste o vídeo')
  })
})
