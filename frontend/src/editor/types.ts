import type { ComponentType } from 'react'

export const PAGE_STATUS_VALUES = ['draft', 'published', 'archived'] as const
export const PAGE_VISIBILITY_VALUES = ['public', 'private', 'unlisted'] as const

export type PageStatus = (typeof PAGE_STATUS_VALUES)[number]
export type PageVisibility = (typeof PAGE_VISIBILITY_VALUES)[number]

export type BlockType = 'text' | 'image' | 'timer' | 'gallery' | 'music'
export type EditorMode = 'edit' | 'preview'

export interface BlockMeta {
  createdAt: number
  updatedAt: number
}

export interface TextBlockProps {
  text: string
  align?: 'left' | 'center' | 'right'
}

export interface ImageBlockProps {
  src: string
  alt?: string
}

export interface TimerBlockProps {
  targetDate: string
  label?: string
}

export interface GalleryBlockProps {
  images: string[]
  transition?: 'fade' | 'slide'
}

export interface MusicBlockProps {
  src: string
  title?: string
}

export interface BlockPropsByType {
  text: TextBlockProps
  image: ImageBlockProps
  timer: TimerBlockProps
  gallery: GalleryBlockProps
  music: MusicBlockProps
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
