import {
  BLOCK_VERSION,
  BOUQUET_SPECIES_VALUES,
  PAGE_VERSION,
  type Block,
  type BlockType,
  type BouquetFlower,
  type BouquetWrap,
  type HiddenNoteItem,
  type HintItem,
  type PageContent,
  type PageSection,
  type PhotoBookPage,
  type SectionLayout,
  type SectionRect,
  type TextBlockAlign,
  type TextBlockCategory,
} from '@/editor/types'
import { resolveThemeId } from '@/editor/themes'
import { sanitizeHtml } from '@/editor/utils/htmlSanitizer'

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

function asTextCategory(value: unknown): TextBlockCategory | undefined {
  if (value === 'title' || value === 'body' || value === 'quote' || value === 'signature') {
    return value
  }
  return undefined
}

function asTextAlign(value: unknown): TextBlockAlign {
  if (value === 'center' || value === 'right' || value === 'justify') {
    return value
  }
  return 'left'
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
  const supported: BlockType[] = [
    'text',
    'image',
    'timer',
    'gallery',
    'music',
    'video',
    'envelope',
    'scratch',
    'timeline',
    'quiz',
    'polaroid',
    'youtube',
    'photoBook',
    'bouquet',
    'hints',
    'intimacyGate',
    'ticketRsvp',
    'memoryCard',
    'hiddenNotes',
    'togetherCounter',
  ]
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
  syncedLyrics?: string
  plainLyrics?: string
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
    syncedLyrics?: string
    plainLyrics?: string
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
      syncedLyrics: asOptionalText(trackRecord.syncedLyrics),
      plainLyrics: asOptionalText(trackRecord.plainLyrics),
    })

    return accumulator
  }, []).slice(0, 30)
}

function asTimelineItems(value: unknown): Array<{
  id: string
  date: string
  title: string
  description?: string
  image?: string
}> {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<Array<{
    id: string
    date: string
    title: string
    description?: string
    image?: string
  }>>((accumulator, item, index) => {
    const record = asRecord(item)
    const title = asText(record.title)
    const date = asText(record.date)
    const description = asOptionalText(record.description)
    const image = asOptionalText(record.image)
    const id = asOptionalText(record.id) || `timeline-item-${index}-${Math.random().toString(36).slice(2, 7)}`

    if (!title && !date && !description && !image) {
      return accumulator
    }

    accumulator.push({
      id,
      date,
      title,
      description,
      image,
    })

    return accumulator
  }, []).slice(0, 50)
}

function asPolaroidPhotos(value: unknown): Array<{
  id: string
  src: string
  caption?: string
  rotation?: number
  width?: number
}> {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<Array<{
    id: string
    src: string
    caption?: string
    rotation?: number
    width?: number
  }>>((accumulator, item, index) => {
    const record = asRecord(item)
    const src = asText(record.src)
    const caption = asOptionalText(record.caption)
    const rotation = typeof record.rotation === 'number' && Number.isFinite(record.rotation)
      ? Math.max(-45, Math.min(45, record.rotation))
      : 0
    const width = typeof record.width === 'number' && Number.isFinite(record.width)
      ? Math.max(160, Math.min(480, record.width))
      : undefined
    const id = asOptionalText(record.id) || `polaroid-${index}-${Math.random().toString(36).slice(2, 7)}`

    accumulator.push({
      id,
      src,
      caption,
      rotation,
      width,
    })

    return accumulator
  }, []).slice(0, 50)
}

function asPhotoBookPages(value: unknown): PhotoBookPage[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<PhotoBookPage[]>((accumulator, item, index) => {
    const record = asRecord(item)
    const src = asText(record.src)
    if (!src) {
      return accumulator
    }

    accumulator.push({
      id: asOptionalText(record.id) || `page-${index}-${Math.random().toString(36).slice(2, 7)}`,
      src,
      assetId: asOptionalText(record.assetId),
      caption: asOptionalText(record.caption),
    })

    return accumulator
  }, []).slice(0, 24)
}

function asBouquetFlowers(value: unknown): BouquetFlower[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<BouquetFlower[]>((accumulator, item) => {
    const record = asRecord(item)
    const species = asText(record.species)
    if (!BOUQUET_SPECIES_VALUES.includes(species as BouquetFlower['species'])) {
      return accumulator
    }

    const color = asOptionalText(record.color)
    accumulator.push({
      species: species as BouquetFlower['species'],
      ...(color ? { color } : {}),
    })

    return accumulator
  }, []).slice(0, 24)
}

function asBouquetWrap(value: unknown): BouquetWrap {
  return value === 'juta' || value === 'celofane' ? value : 'papel'
}

function asHintItems(value: unknown): HintItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<HintItem[]>((accumulator, item, index) => {
    const record = asRecord(item)
    const text = asText(record.text)
    if (!text) {
      return accumulator
    }

    accumulator.push({
      id: asOptionalText(record.id) || `hint-${index}-${Math.random().toString(36).slice(2, 7)}`,
      text,
    })

    return accumulator
  }, []).slice(0, 12)
}

function asNoteItems(value: unknown): HiddenNoteItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.reduce<HiddenNoteItem[]>((accumulator, item, index) => {
    const record = asRecord(item)
    const text = asText(record.text)
    if (!text) {
      return accumulator
    }

    accumulator.push({
      id: asOptionalText(record.id) || `note-${index}-${Math.random().toString(36).slice(2, 7)}`,
      text,
    })

    return accumulator
  }, []).slice(0, 8)
}

function asStringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => asText(item))
    .filter((item) => item.length > 0)
    .slice(0, max)
}

const SECTION_LAYOUT_VALUES: readonly SectionLayout[] = [
  'stack',
  'columns',
  'overlap',
  'grid',
  'freezone',
  'fullbleed',
]

const IMPLICIT_SECTION_ID = 'main'
const MAX_SECTIONS = 12

function asIntInRange(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined
  }
  return value >= min && value <= max ? value : undefined
}

function asRect(value: unknown): SectionRect | undefined {
  const record = asRecord(value)
  const col = asIntInRange(record.col, 1, 24)
  const w = asIntInRange(record.w, 1, 24)
  const h = asIntInRange(record.h, 1, 40)
  if (
    col === undefined
    || w === undefined
    || h === undefined
    || typeof record.row !== 'number'
    || !Number.isInteger(record.row)
    || record.row < 1
  ) {
    return undefined
  }
  return { col, row: record.row, w, h }
}

function asSectionLayout(value: unknown): SectionLayout {
  return typeof value === 'string' && SECTION_LAYOUT_VALUES.includes(value as SectionLayout)
    ? (value as SectionLayout)
    : 'stack'
}

function migrateSections(value: unknown): PageSection[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const sections: PageSection[] = []

  for (const [index, item] of value.slice(0, MAX_SECTIONS).entries()) {
    const record = asRecord(item)
    const rawId = asText(record.id)
    const id = rawId && !seen.has(rawId) ? rawId : `section-${index}`
    if (seen.has(id)) {
      continue
    }
    seen.add(id)

    const section: PageSection = { id, layout: asSectionLayout(record.layout) }
    const cols = asIntInRange(asRecord(record.grid).cols, 1, 24)
    if (cols !== undefined) {
      section.grid = { cols }
    }
    if (record.theme && typeof record.theme === 'object' && !Array.isArray(record.theme)) {
      section.theme = record.theme as Record<string, unknown>
    }
    sections.push(section)
  }

  return sections
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

  const sectionId = typeof record.sectionId === 'string' && record.sectionId.trim().length > 0 && record.sectionId.length <= 80
    ? record.sectionId
    : undefined
  const rect = asRect(record.rect)

  const base = {
    id,
    type,
    version: BLOCK_VERSION,
    ...(sectionId !== undefined ? { sectionId } : {}),
    ...(rect !== undefined ? { rect } : {}),
    meta: {
      createdAt: asTimestamp(meta.createdAt, now),
      updatedAt: asTimestamp(meta.updatedAt, now),
    },
  }

  switch (type) {
    case 'text': {
      const textCategory = asTextCategory(props.category)
      const textHtml = typeof props.html === 'string' ? sanitizeHtml(props.html) : undefined
      const fontFamily = asOptionalText(props.fontFamily)
      const fontSize = asOptionalText(props.fontSize)
      const color = asOptionalText(props.color)
      const letterSpacing = asOptionalText(props.letterSpacing)
      const lineHeight = asOptionalText(props.lineHeight)
      const bold = typeof props.bold === 'boolean' ? props.bold : undefined
      const italic = typeof props.italic === 'boolean' ? props.italic : undefined
      const underline = typeof props.underline === 'boolean' ? props.underline : undefined

      return {
        ...base,
        type: 'text',
        props: {
          text: asText(props.text),
          align: asTextAlign(props.align),
          ...(textCategory ? { category: textCategory } : {}),
          ...(textHtml !== undefined ? { html: textHtml } : {}),
          ...(fontFamily ? { fontFamily } : {}),
          ...(fontSize ? { fontSize } : {}),
          ...(color ? { color } : {}),
          ...(letterSpacing ? { letterSpacing } : {}),
          ...(lineHeight ? { lineHeight } : {}),
          ...(bold !== undefined ? { bold } : {}),
          ...(italic !== undefined ? { italic } : {}),
          ...(underline !== undefined ? { underline } : {}),
        },
      }
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
      const legacySyncedLyrics = asOptionalText(props.syncedLyrics)
      const legacyPlainLyrics = asOptionalText(props.plainLyrics)
      const playerStyle = props.playerStyle === 'vinyl' ? 'vinyl' : 'minimal'
      const showLyrics = typeof props.showLyrics === 'boolean' ? props.showLyrics : true
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
              syncedLyrics: legacySyncedLyrics,
              plainLyrics: legacyPlainLyrics,
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
          playerStyle,
          syncedLyrics: legacySyncedLyrics ?? mirrorTrack?.syncedLyrics,
          plainLyrics: legacyPlainLyrics ?? mirrorTrack?.plainLyrics,
          showLyrics,
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
    case 'envelope':
      return {
        ...base,
        type: 'envelope',
        props: {
          recipientName: asText(props.recipientName) || 'Para quem ilumina meus dias',
          senderName: asOptionalText(props.senderName),
          sealInitial: asOptionalText(props.sealInitial) || 'C',
          sealColor: asOptionalText(props.sealColor) || '#e11d48',
          messageSnippet: asOptionalText(props.messageSnippet) || '',
          isOpen: typeof props.isOpen === 'boolean' ? props.isOpen : false,
        },
      }
    case 'scratch':
      return {
        ...base,
        type: 'scratch',
        props: {
          coverText: asText(props.coverText) || 'Raspe suavemente para revelar a mensagem...',
          secretType: props.secretType === 'image' ? 'image' : 'text',
          secretText: asOptionalText(props.secretText) || '',
          secretImage: asOptionalText(props.secretImage) || '',
          isRevealed: typeof props.isRevealed === 'boolean' ? props.isRevealed : false,
        },
      }
    case 'timeline':
      return {
        ...base,
        type: 'timeline',
        props: {
          items: asTimelineItems(props.items),
        },
      }
    case 'quiz':
      return {
        ...base,
        type: 'quiz',
        props: {
          question: asText(props.question) || 'Quer namorar comigo?',
          yesButtonText: asText(props.yesButtonText) || 'Sim, com todo o coração',
          noButtonText: asText(props.noButtonText) || 'Não',
          successMessage: asText(props.successMessage) || 'Prometo honrar cada um dos nossos dias com respeito, carinho e cumplicidade.',
          isPlayfulNo: typeof props.isPlayfulNo === 'boolean' ? props.isPlayfulNo : true,
        },
      }
    case 'polaroid':
      return {
        ...base,
        type: 'polaroid',
        props: {
          photos: asPolaroidPhotos(props.photos),
        },
      }
    case 'youtube':
      return {
        ...base,
        type: 'youtube',
        props: {
          url: asText(props.url),
          title: asOptionalText(props.title),
          caption: asOptionalText(props.caption),
        },
      }
    case 'photoBook':
      return {
        ...base,
        type: 'photoBook',
        props: {
          pages: asPhotoBookPages(props.pages),
          coverTitle: asOptionalText(props.coverTitle),
          coverSubtitle: asOptionalText(props.coverSubtitle),
        },
      }
    case 'bouquet':
      return {
        ...base,
        type: 'bouquet',
        props: {
          seed:
            typeof props.seed === 'number' && Number.isFinite(props.seed)
              ? Math.trunc(props.seed)
              : 1,
          flowers: asBouquetFlowers(props.flowers),
          wrap: asBouquetWrap(props.wrap),
          ribbonColor: asOptionalText(props.ribbonColor),
          message: asOptionalText(props.message),
        },
      }
    case 'hints':
      return {
        ...base,
        type: 'hints',
        props: {
          title: asOptionalText(props.title),
          hints: asHintItems(props.hints),
        },
      }
    case 'intimacyGate':
      return {
        ...base,
        type: 'intimacyGate',
        props: {
          question: asText(props.question),
          answers: asStringList(props.answers, 8),
          title: asOptionalText(props.title),
          hint: asOptionalText(props.hint),
          successMessage: asOptionalText(props.successMessage),
        },
      }
    case 'ticketRsvp': {
      const evento = asRecord(props.evento)
      const data = asOptionalText(evento.data)
      const lugar = asOptionalText(evento.lugar)
      const descricao = asOptionalText(evento.descricao)
      const hasEvento = Boolean(data || lugar || descricao)

      // responseToken chega injetado pelo backend na leitura pública — é
      // preservado aqui (mapBackendPage migra o content recebido), mas nunca
      // é editável no editor nem enviado de volta em saves.
      const responseToken = asOptionalText(props.responseToken)

      return {
        ...base,
        type: 'ticketRsvp',
        props: {
          title: asOptionalText(props.title),
          ...(hasEvento ? { evento: { data, lugar, descricao } } : {}),
          allowText: typeof props.allowText === 'boolean' ? props.allowText : true,
          ...(responseToken ? { responseToken: responseToken.slice(0, 200) } : {}),
        },
      }
    }
    case 'memoryCard':
      return {
        ...base,
        type: 'memoryCard',
        props: {
          title: asOptionalText(props.title),
          date: asOptionalText(props.date),
          place: asOptionalText(props.place),
          imageSrc: asOptionalText(props.imageSrc),
          assetId: asOptionalText(props.assetId),
          caption: asOptionalText(props.caption),
          text: asOptionalText(props.text),
        },
      }
    case 'hiddenNotes':
      return {
        ...base,
        type: 'hiddenNotes',
        props: {
          title: asOptionalText(props.title),
          notes: asNoteItems(props.notes),
        },
      }
    case 'togetherCounter':
      return {
        ...base,
        type: 'togetherCounter',
        props: {
          startDate: asText(props.startDate),
          label: asOptionalText(props.label),
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

  const blocks = maybeBlocks.map((block, index) => migrateBlock(block, index))

  // Legacy pages carried a flat blocks list; they materialize as a single
  // implicit "stack" section so every block lands in a known section.
  const sections = migrateSections(record.sections)
  if (sections.length === 0 && blocks.length > 0) {
    sections.push({ id: IMPLICIT_SECTION_ID, layout: 'stack' })
  }

  const knownSectionIds = new Set(sections.map((section) => section.id))
  const fallbackSectionId = sections[0]?.id
  for (const block of blocks) {
    if (!block.sectionId || !knownSectionIds.has(block.sectionId)) {
      block.sectionId = fallbackSectionId
    }
  }

  return {
    blocks,
    sections,
    theme: normalizedTheme,
    version: PAGE_VERSION,
  }
}
