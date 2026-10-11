import { useMemo } from 'react'
import type { Block } from '@/editor/types'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { PageRuntimeProvider, type PageRuntimeContext } from '@/editor/context'
import { buildThemeStyle, getThemeAtmosphere, type Theme } from '@/editor/themes'
import { filterPreviewBlocks } from '@/editor/utils/previewFilter'
import { AtmosphereCanvas } from '@/components/animations/AtmosphereCanvas'

interface PageRendererProps {
  blocks: Block[]
  theme?: Theme | string
  className?: string
  showAtmosphere?: boolean
  atmospherePosition?: 'fixed' | 'absolute'
  /** Presente só na leitura pública real (PageCard). Sem ele, blocos
   *  interativos rodam em modo demonstração. */
  pageId?: string
}

export function PageRenderer({
  blocks,
  theme,
  className = '',
  showAtmosphere = true,
  atmospherePosition = 'absolute',
  pageId,
}: PageRendererProps) {
  const visibleBlocks = filterPreviewBlocks(blocks)
  const atmosphere = getThemeAtmosphere(theme)
  const runtime = useMemo<PageRuntimeContext>(() => ({ pageId }), [pageId])

  return (
    <PageRuntimeProvider value={runtime}>
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
    </PageRuntimeProvider>
  )
}
