import type { ComponentType } from 'react'

export const PAGE_STATUS_VALUES = ['draft', 'published', 'archived'] as const
export const PAGE_VISIBILITY_VALUES = ['public', 'private', 'unlisted'] as const

export type PageStatus = (typeof PAGE_STATUS_VALUES)[number]
export type PageVisibility = (typeof PAGE_VISIBILITY_VALUES)[number]

export type BlockType =
  | 'text'
  | 'image'
  | 'timer'
  | 'gallery'
  | 'music'
  | 'video'
  | 'envelope'
  | 'scratch'
  | 'timeline'
  | 'quiz'
  | 'polaroid'
export type EditorMode = 'edit' | 'preview'

export interface BlockMeta {
  createdAt: number
  updatedAt: number
}

export type TextBlockCategory = 'title' | 'body' | 'quote' | 'signature'
export type TextBlockAlign = 'left' | 'center' | 'right' | 'justify'

export interface TextBlockProps {
  text: string
  category?: TextBlockCategory
  html?: string
  fontFamily?: string
  fontSize?: string
  color?: string
  align?: TextBlockAlign
  letterSpacing?: string
  lineHeight?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export interface ImageBlockProps {
  src: string
  assetId?: string
  alt?: string
}

export interface GalleryItem {
  src: string
  assetId?: string
}

export interface TimerBlockProps {
  targetDate: string
  label?: string
}

export interface GalleryBlockProps {
  images: string[]
  items?: GalleryItem[]
  transition?: 'fade' | 'slide'
}

export type MusicPlayerStyle = 'minimal' | 'vinyl'

export interface MusicTrack {
  src: string
  assetId?: string
  title?: string
  artist?: string
  coverSrc?: string
  coverAssetId?: string
  syncedLyrics?: string
  plainLyrics?: string
}

export interface MusicBlockProps {
  assetId?: string
  src: string
  coverSrc?: string
  coverAssetId?: string
  tracks?: MusicTrack[]
  title?: string
  artist?: string
  playerStyle?: MusicPlayerStyle
  syncedLyrics?: string
  plainLyrics?: string
  showLyrics?: boolean
}

export interface VideoBlockProps {
  assetId?: string
  src: string
}

export interface EnvelopeBlockProps {
  recipientName: string
  senderName?: string
  sealInitial?: string
  sealColor?: string
  messageSnippet?: string
  isOpen?: boolean
}

export interface ScratchBlockProps {
  coverText: string
  secretType: 'text' | 'image'
  secretText?: string
  secretImage?: string
  isRevealed?: boolean
}

export interface TimelineItem {
  id: string
  date: string
  title: string
  description?: string
  image?: string
}

export interface TimelineBlockProps {
  items: TimelineItem[]
}

export interface QuizBlockProps {
  question: string
  yesButtonText: string
  noButtonText: string
  successMessage: string
  isPlayfulNo?: boolean
}

export interface PolaroidPhoto {
  id: string
  src: string
  caption?: string
  rotation?: number
  width?: number
}

export interface PolaroidBlockProps {
  photos: PolaroidPhoto[]
}

export interface BlockPropsByType {
  text: TextBlockProps
  image: ImageBlockProps
  timer: TimerBlockProps
  gallery: GalleryBlockProps
  music: MusicBlockProps
  video: VideoBlockProps
  envelope: EnvelopeBlockProps
  scratch: ScratchBlockProps
  timeline: TimelineBlockProps
  quiz: QuizBlockProps
  polaroid: PolaroidBlockProps
}

interface BlockBase<TType extends BlockType> {
  id: string
  type: TType
  version: number
  props: BlockPropsByType[TType]
  meta: BlockMeta
}

export type Block = {
  [TType in BlockType]: BlockBase<TType>
}[BlockType]

export interface Page {
  id: string
  blocks: Block[]
  theme?: string
  status: PageStatus
  visibility: PageVisibility
  publishedAt: string | null
  version: number
}

export interface PageContent {
  blocks: Block[]
  theme?: string
  version: number
}

export interface BlockComponentProps {
  block: Block
  mode: EditorMode
  onUpdate?: (updater: (block: Block) => Block) => void
}

export type BlockComponent = ComponentType<BlockComponentProps>
export type BlockMap = Partial<Record<BlockType, BlockComponent>>

export const MAX_BLOCKS = 30
export const BLOCK_VERSION = 1
export const PAGE_VERSION = 1
export const PERSIST_DEBOUNCE_MS = 500
export const AUTOSAVE_DEBOUNCE_MS = 3000
export const MAX_PAGE_BYTES = 500_000

export interface PageLifecycle {
  status: PageStatus
  visibility: PageVisibility
  publishedAt: string | null
}

export interface PageContract extends PageLifecycle {
  id: string
  blocks: Block[]
  theme?: string
  version: number
  updatedAt: string
}

export function isPageStatus(value: unknown): value is PageStatus {
  return typeof value === 'string' && PAGE_STATUS_VALUES.includes(value as PageStatus)
}

export function isPageVisibility(value: unknown): value is PageVisibility {
  return typeof value === 'string' && PAGE_VISIBILITY_VALUES.includes(value as PageVisibility)
}
