import { Suspense, lazy, memo } from 'react'
import type { Block, BlockComponentProps, BlockMap, EditorMode } from '@/editor/types'
import { TextBlock } from '@/editor/blocks/TextBlock'
import { ImageBlock } from '@/editor/blocks/ImageBlock'
import { TimerBlock } from '@/editor/blocks/TimerBlock'

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
}

function renderFallback(block: Block) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
      Tipo de bloco nao suportado: <strong>{block.type}</strong>
    </div>
  )
}

function renderLoadingFallback(block: Block) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-white/75 p-4" role="status" aria-live="polite">
      <div className="mb-2 h-4 w-32 animate-pulse rounded bg-primary/15" />
      <div className="h-20 animate-pulse rounded-xl bg-primary/10" />
      <p className="mt-2 text-xs text-text-light">Carregando bloco de {block.type}...</p>
    </div>
  )
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
