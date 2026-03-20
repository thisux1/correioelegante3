import { memo } from 'react'
import type { Block, BlockComponentProps, BlockMap, EditorMode } from '@/editor/types'
import { TextBlock } from '@/editor/blocks/TextBlock'
import { ImageBlock } from '@/editor/blocks/ImageBlock'
import { TimerBlock } from '@/editor/blocks/TimerBlock'
import { GalleryBlock } from '@/editor/blocks/GalleryBlock'
import { MusicBlock } from '@/editor/blocks/MusicBlock'

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
}

function renderFallback(block: Block) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
      Tipo de bloco nao suportado: <strong>{block.type}</strong>
    </div>
  )
}

function BlockRendererComponent({ block, mode, onUpdate }: BlockRendererProps) {
  const Component = blockMap[block.type]

  if (!Component) {
    return renderFallback(block)
  }

  if (!onUpdate) {
    return <Component block={block} mode={mode} />
  }

  const handleUpdate: BlockComponentProps['onUpdate'] = (updater) => {
    onUpdate(block.id, updater)
  }

  return <Component block={block} mode={mode} onUpdate={handleUpdate} />
}

function areBlockRendererPropsEqual(prev: BlockRendererProps, next: BlockRendererProps) {
  return (
    prev.mode === next.mode
    && prev.block.id === next.block.id
    && prev.block.meta.updatedAt === next.block.meta.updatedAt
    && prev.onUpdate === next.onUpdate
  )
}

export const BlockRenderer = memo(BlockRendererComponent, areBlockRendererPropsEqual)
