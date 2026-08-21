import type { Block } from '@/editor/types'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { buildThemeStyle, getThemeAtmosphere, type Theme } from '@/editor/themes'
import { filterPreviewBlocks } from '@/editor/utils/previewFilter'
import { AtmosphereCanvas } from '@/components/animations/AtmosphereCanvas'

interface PageRendererProps {
  blocks: Block[]
  theme?: Theme | string
  className?: string
  showAtmosphere?: boolean
  atmospherePosition?: 'fixed' | 'absolute'
}

export function PageRenderer({
  blocks,
  theme,
  className = '',
  showAtmosphere = true,
  atmospherePosition = 'absolute',
}: PageRendererProps) {
  const visibleBlocks = filterPreviewBlocks(blocks)
  const atmosphere = getThemeAtmosphere(theme)

  return (
    <div
      className={`relative space-y-4 ${className}`}
      style={buildThemeStyle(theme)}
      data-theme-renderer
    >
      {showAtmosphere && atmosphere !== 'none' && (
        <AtmosphereCanvas
          atmosphere={atmosphere}
          position={atmospherePosition}
        />
      )}
      {visibleBlocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          mode="preview"
        />
      ))}
    </div>
  )
}
