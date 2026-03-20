import type { Block } from '@/editor/types'
import { BlockRenderer } from '@/editor/components/BlockRenderer'

interface PageRendererProps {
  blocks: Block[]
  className?: string
}

export function PageRenderer({ blocks, className = '' }: PageRendererProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          mode="preview"
        />
      ))}
    </div>
  )
}
