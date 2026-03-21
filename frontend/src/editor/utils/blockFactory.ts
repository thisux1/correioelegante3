import {
  BLOCK_VERSION,
  type Block,
  type BlockType,
} from '@/editor/types'

function generateBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createBlock(type: 'text'): Extract<Block, { type: 'text' }>
export function createBlock(type: 'image'): Extract<Block, { type: 'image' }>
export function createBlock(type: 'timer'): Extract<Block, { type: 'timer' }>
export function createBlock(type: 'gallery'): Extract<Block, { type: 'gallery' }>
export function createBlock(type: 'music'): Extract<Block, { type: 'music' }>
export function createBlock(type: 'video'): Extract<Block, { type: 'video' }>
export function createBlock(type: BlockType): Block
export function createBlock(type: BlockType): Block {
  const now = Date.now()

  switch (type) {
    case 'text':
      return {
        id: generateBlockId(),
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Novo texto',
          align: 'left',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'image':
      return {
        id: generateBlockId(),
        type: 'image',
        version: BLOCK_VERSION,
        props: {
          src: '',
          assetId: undefined,
          alt: '',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'timer':
      return {
        id: generateBlockId(),
        type: 'timer',
        version: BLOCK_VERSION,
        props: {
          targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          label: 'Contagem regressiva',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'gallery':
      return {
        id: generateBlockId(),
        type: 'gallery',
        version: BLOCK_VERSION,
        props: {
          images: [],
          items: [],
          transition: 'fade',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'music':
      return {
        id: generateBlockId(),
        type: 'music',
        version: BLOCK_VERSION,
        props: {
          src: '',
          coverSrc: '',
          tracks: [],
          title: 'Nova musica',
          artist: '',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'video':
      return {
        id: generateBlockId(),
        type: 'video',
        version: BLOCK_VERSION,
        props: {
          src: '',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    default: {
      const exhaustiveTypeCheck: never = type
      return exhaustiveTypeCheck
    }
  }
}
