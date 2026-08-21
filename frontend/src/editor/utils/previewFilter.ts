import type { Block } from '@/editor/types'

function hasContent(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function shouldRenderPreviewBlock(block: Block): boolean {
  switch (block.type) {
    case 'text':
      return hasContent(block.props.text) || hasContent(block.props.html)
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
    case 'envelope':
      return hasContent(block.props.recipientName) || hasContent(block.props.messageSnippet)
    case 'scratch':
      return hasContent(block.props.coverText) || hasContent(block.props.secretText) || hasContent(block.props.secretImage)
    case 'timeline':
      return Array.isArray(block.props.items) && block.props.items.length > 0
    case 'quiz':
      return hasContent(block.props.question)
    case 'polaroid':
      return Array.isArray(block.props.photos) && block.props.photos.length > 0
    default:
      return true
  }
}

export function filterPreviewBlocks(blocks: Block[]): Block[] {
  return blocks.filter(shouldRenderPreviewBlock)
}
