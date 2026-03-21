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
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function asGalleryItems(value: unknown): Array<{ src: string; assetId?: string }> {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<Array<{ src: string; assetId?: string }>>((accumulator, item) => {
    const record = asRecord(item)
    const src = asText(record.src)
    if (!src) {
      return accumulator
    }

    accumulator.push({
      src,
      assetId: asOptionalText(record.assetId),
    })

    return accumulator
  }, [])
}

function asTimestamp(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }

  return fallback
}

function asBlockType(value: unknown): BlockType {
  const supported: BlockType[] = ['text', 'image', 'timer', 'gallery', 'music', 'video']
  if (typeof value === 'string' && supported.includes(value as BlockType)) {
    return value as BlockType
  }

  return 'text'
}

function asMusicTracks(value: unknown): Array<{
  src: string
  assetId?: string
  title?: string
  artist?: string
  coverSrc?: string
  coverAssetId?: string
}> {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<Array<{
    src: string
    assetId?: string
    title?: string
    artist?: string
    coverSrc?: string
    coverAssetId?: string
  }>>((accumulator, track) => {
    const trackRecord = asRecord(track)
    const trackSrc = asText(trackRecord.src)
    if (!trackSrc) {
      return accumulator
    }

    accumulator.push({
      src: trackSrc,
      assetId: asOptionalText(trackRecord.assetId),
      title: asOptionalText(trackRecord.title),
      artist: asOptionalText(trackRecord.artist),
      coverSrc: asOptionalText(trackRecord.coverSrc),
      coverAssetId: asOptionalText(trackRecord.coverAssetId),
    })

    return accumulator
  }, []).slice(0, 30)
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
          assetId: typeof props.assetId === 'string' ? props.assetId : undefined,
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
      {
        const legacyImages = Array.isArray(props.images)
          ? props.images.filter((item): item is string => typeof item === 'string')
          : []
        const items = asGalleryItems(props.items)
        const mergedItems = items.length > 0
          ? items
          : legacyImages.map((src) => ({ src }))

      return {
        ...base,
        type: 'gallery',
        props: {
          images: mergedItems.map((item) => item.src),
          items: mergedItems,
          transition: props.transition === 'slide' ? 'slide' : 'fade',
        },
      }
      }
    case 'music':
      {
      const legacySrc = asText(props.src)
      const legacyAssetId = asOptionalText(props.assetId)
      const legacyTitle = asOptionalText(props.title)
      const legacyArtist = asOptionalText(props.artist)
      const legacyCoverSrc = asOptionalText(props.coverSrc)
      const legacyCoverAssetId = asOptionalText(props.coverAssetId)
      const normalizedTracks = asMusicTracks(props.tracks)
      const tracks = normalizedTracks.length > 0
        ? normalizedTracks
        : (legacySrc
          ? [{
              src: legacySrc,
              assetId: legacyAssetId,
              title: legacyTitle,
              artist: legacyArtist,
              coverSrc: legacyCoverSrc,
              coverAssetId: legacyCoverAssetId,
            }]
          : [])
      const mirrorTrack = tracks[0]

      return {
        ...base,
        type: 'music',
        props: {
          assetId: legacyAssetId ?? mirrorTrack?.assetId,
          src: legacySrc || mirrorTrack?.src || '',
          coverSrc: legacyCoverSrc ?? mirrorTrack?.coverSrc ?? '',
          coverAssetId: legacyCoverAssetId ?? mirrorTrack?.coverAssetId,
          tracks,
          title: (typeof props.title === 'string' ? props.title : undefined) ?? mirrorTrack?.title ?? '',
          artist: (typeof props.artist === 'string' ? props.artist : undefined) ?? mirrorTrack?.artist ?? '',
        },
      }
      }
    case 'video':
      return {
        ...base,
        type: 'video',
        props: {
          assetId: typeof props.assetId === 'string' ? props.assetId : undefined,
          src: asText(props.src),
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
  const normalizedTheme = resolveThemeId(typeof record.theme === 'string' ? record.theme : undefined)

  return {
    blocks: maybeBlocks.map((block, index) => migrateBlock(block, index)),
    theme: normalizedTheme,
    version: PAGE_VERSION,
  }
}
