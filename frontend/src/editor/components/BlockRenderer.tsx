import { Suspense, lazy, memo } from 'react'
import type { Block, BlockComponentProps, BlockMap, EditorMode } from '@/editor/types'
import { TextBlock } from '@/editor/blocks/TextBlock'
import { ImageBlock } from '@/editor/blocks/ImageBlock'
import { TimerBlock } from '@/editor/blocks/TimerBlock'
import { BlockSkeleton } from '@/editor/components/BlockSkeleton'

const GalleryBlock = lazy(async () => {
  const module = await import('@/editor/blocks/GalleryBlock')
  return { default: module.GalleryBlock }
})

const MusicBlock = lazy(async () => {
  const module = await import('@/editor/blocks/MusicBlock')
  return { default: module.MusicBlock }
})

const VideoBlock = lazy(async () => {
  const module = await import('@/editor/blocks/VideoBlock')
  return { default: module.VideoBlock }
})

const EnvelopeBlock = lazy(async () => {
  const module = await import('@/editor/blocks/EnvelopeBlock')
  return { default: module.EnvelopeBlock }
})

const ScratchBlock = lazy(async () => {
  const module = await import('@/editor/blocks/ScratchBlock')
  return { default: module.ScratchBlock }
})

const TimelineBlock = lazy(async () => {
  const module = await import('@/editor/blocks/TimelineBlock')
  return { default: module.TimelineBlock }
})

const QuizBlock = lazy(async () => {
  const module = await import('@/editor/blocks/QuizBlock')
  return { default: module.QuizBlock }
})

const PolaroidBlock = lazy(async () => {
  const module = await import('@/editor/blocks/PolaroidBlock')
  return { default: module.PolaroidBlock }
})

const YoutubeBlock = lazy(async () => {
  const module = await import('@/editor/blocks/YoutubeBlock')
  return { default: module.YoutubeBlock }
})

const PhotoBookBlock = lazy(async () => {
  const module = await import('@/editor/blocks/PhotoBookBlock')
  return { default: module.PhotoBookBlock }
})

const BouquetBlock = lazy(async () => {
  const module = await import('@/editor/blocks/BouquetBlock')
  return { default: module.BouquetBlock }
})

const HintsBlock = lazy(async () => {
  const module = await import('@/editor/blocks/HintsBlock')
  return { default: module.HintsBlock }
})

const IntimacyGateBlock = lazy(async () => {
  const module = await import('@/editor/blocks/IntimacyGateBlock')
  return { default: module.IntimacyGateBlock }
})

const TicketRsvpBlock = lazy(async () => {
  const module = await import('@/editor/blocks/TicketRsvpBlock')
  return { default: module.TicketRsvpBlock }
})

interface BlockRendererProps {
  block: Block
  mode: EditorMode
  onUpdate?: (id: string, updater: (block: Block) => Block) => void
}

const blockMap: BlockMap = {
  text: TextBlock,
  image: ImageBlock,
  timer: TimerBlock,
  gallery: GalleryBlock,
  music: MusicBlock,
  video: VideoBlock,
  envelope: EnvelopeBlock,
  scratch: ScratchBlock,
  timeline: TimelineBlock,
  quiz: QuizBlock,
  polaroid: PolaroidBlock,
  youtube: YoutubeBlock,
  photoBook: PhotoBookBlock,
  bouquet: BouquetBlock,
  hints: HintsBlock,
  intimacyGate: IntimacyGateBlock,
  ticketRsvp: TicketRsvpBlock,
}

function renderFallback(block: Block) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
      Tipo de bloco nao suportado: <strong>{block.type}</strong>
    </div>
  )
}

function renderLoadingFallback(block: Block) {
  return <BlockSkeleton block={block} />
}

function BlockRendererComponent({ block, mode, onUpdate }: BlockRendererProps) {
  const Component = blockMap[block.type]

  if (!Component) {
    return renderFallback(block)
  }

  if (!onUpdate) {
    return (
      <Suspense fallback={renderLoadingFallback(block)}>
        <Component block={block} mode={mode} />
      </Suspense>
    )
  }

  const handleUpdate: BlockComponentProps['onUpdate'] = (updater) => {
    onUpdate(block.id, updater)
  }

  return <Suspense fallback={renderLoadingFallback(block)}><Component block={block} mode={mode} onUpdate={handleUpdate} /></Suspense>
}

function areBlockRendererPropsEqual(prev: BlockRendererProps, next: BlockRendererProps) {
  return (
    prev.mode === next.mode
    && prev.block === next.block
    && prev.onUpdate === next.onUpdate
  )
}

export const BlockRenderer = memo(BlockRendererComponent, areBlockRendererPropsEqual)
