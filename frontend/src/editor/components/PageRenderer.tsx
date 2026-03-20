import type { Block } from '@/editor/types'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { buildThemeStyle, type Theme } from '@/editor/themes'

interface PageRendererProps {
  blocks: Block[]
  theme?: Theme | string
  className?: string
}

export function PageRenderer({ blocks, theme, className = '' }: PageRendererProps) {
  return (
    <div
      className={`space-y-4 ${className}`}
      style={buildThemeStyle(theme)}
      data-theme-renderer
    >
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
