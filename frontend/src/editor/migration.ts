import {
  BLOCK_VERSION,
  PAGE_VERSION,
  type Block,
  type BlockType,
  type PageContent,
} from '@/editor/types'
import { resolveThemeId } from '@/editor/themes'

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {}
  }

  return value as UnknownRecord
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asTimestamp(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }

  return fallback
}

function asBlockType(value: unknown): BlockType {
  const supported: BlockType[] = ['text', 'image', 'timer', 'gallery', 'music']
  if (typeof value === 'string' && supported.includes(value as BlockType)) {
    return value as BlockType
  }

  return 'text'
}

function migrateBlock(input: unknown, index: number): Block {
  const now = Date.now()
  const record = asRecord(input)
  const type = asBlockType(record.type)
  const props = asRecord(record.props)
  const meta = asRecord(record.meta)

  const id = typeof record.id === 'string' && record.id.trim().length > 0
    ? record.id
    : `legacy-block-${index}-${Math.random().toString(36).slice(2, 8)}`

  const base = {
    id,
    type,
    version: BLOCK_VERSION,
    meta: {
      createdAt: asTimestamp(meta.createdAt, now),
      updatedAt: asTimestamp(meta.updatedAt, now),
    },
  }

  switch (type) {
    case 'text':
      return {
        ...base,
        type: 'text',
        props: {
          text: asText(props.text),
          align: props.align === 'center' || props.align === 'right' ? props.align : 'left',
        },
      }
    case 'image':
      return {
        ...base,
        type: 'image',
        props: {
          src: asText(props.src),
          alt: typeof props.alt === 'string' ? props.alt : '',
        },
      }
    case 'timer':
      return {
        ...base,
        type: 'timer',
        props: {
          targetDate: asText(props.targetDate),
          label: typeof props.label === 'string' ? props.label : 'Contagem regressiva',
        },
      }
    case 'gallery':
      return {
        ...base,
        type: 'gallery',
        props: {
          images: Array.isArray(props.images)
            ? props.images.filter((item): item is string => typeof item === 'string')
            : [],
          transition: props.transition === 'slide' ? 'slide' : 'fade',
        },
      }
    case 'music':
      return {
        ...base,
        type: 'music',
        props: {
          src: asText(props.src),
          title: typeof props.title === 'string' ? props.title : 'Nova musica',
          artist: typeof props.artist === 'string' ? props.artist : '',
        },
      }
    default:
      return {
        ...base,
        type: 'text',
        props: {
          text: '',
          align: 'left',
        },
      }
  }
}

export function migratePage(input: unknown): PageContent {
  const record = asRecord(input)
  const maybeBlocks = Array.isArray(record.blocks) ? record.blocks : []

  return {
    blocks: maybeBlocks.map((block, index) => migrateBlock(block, index)),
    theme: resolveThemeId(typeof record.theme === 'string' ? record.theme : undefined),
    version: PAGE_VERSION,
  }
}
