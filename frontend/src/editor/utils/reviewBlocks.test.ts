import { describe, expect, it } from 'vitest'
import { reviewBlocks } from './reviewBlocks'
import type { Block } from '@/editor/types'

let seq = 0
function block(type: Block['type'], props: Record<string, unknown>): Block {
  seq += 1
  return {
    id: `b${seq}`,
    type,
    version: 1,
    props,
    meta: { createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() },
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
})
