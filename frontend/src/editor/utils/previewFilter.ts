import type { Block } from '@/editor/types'

function hasContent(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function shouldRenderPreviewBlock(block: Block): boolean {
  switch (block.type) {
    case 'text':
      return hasContent(block.props.text)
    case 'image':
      return hasContent(block.props.src)
    case 'music':
      return hasContent(block.props.src)
        || hasContent(block.props.assetId)
        || (Array.isArray(block.props.tracks)
          && block.props.tracks.some((track) => hasContent(track.src) || hasContent(track.assetId)))
    case 'video':
      return hasContent(block.props.src) || hasContent(block.props.assetId)
    case 'gallery':
      return block.props.images.some((image) => hasContent(image))
    case 'timer':
      return hasContent(block.props.targetDate)
    default:
      return true
  }
}

export function filterPreviewBlocks(blocks: Block[]): Block[] {
  return blocks.filter(shouldRenderPreviewBlock)
}
