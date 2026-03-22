import { memo, useCallback } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react'
import type { BlockType, EditorMode } from '@/editor/types'
import type { SortableHandleProps } from '@/editor/components/BlockWrapper'

interface BlockControlsProps {
  mode: EditorMode
  blockType: BlockType
  isSelected: boolean
  isHovered: boolean
  isMobile: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  isCollapsed: boolean
  collapseContentId?: string
  handleProps?: SortableHandleProps
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleCollapsed: () => void
}

const blockTypeLabels: Record<BlockType, string> = {
  text: 'Texto',
  image: 'Imagem',
  timer: 'Timer',
  gallery: 'Galeria',
  music: 'Musica',
  video: 'Video',
}

function BlockControlsComponent({
  mode,
  blockType,
  isSelected,
  isHovered,
  isMobile,
  canMoveUp,
  canMoveDown,
  isCollapsed,
  collapseContentId,
  handleProps,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleCollapsed,
}: BlockControlsProps) {
  const shouldRender = mode === 'edit' && (isSelected || isHovered)

  const setHandleRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!handleProps) {
        return
      }

      handleProps.setActivatorNodeRef(node)
    },
    [handleProps],
  )

  if (!shouldRender) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-2 top-0 z-20 -translate-y-1/2">
      <div className="pointer-events-auto ml-auto flex w-fit items-center gap-1 rounded-xl border border-primary/25 bg-white/95 px-2 py-1 shadow-lg backdrop-blur-sm">
        {!isMobile && handleProps ? (
          <button
            type="button"
            ref={setHandleRef}
            {...handleProps.attributes}
            {...handleProps.listeners}
            onClick={(event) => {
              event.stopPropagation()
            }}
            className="flex h-11 w-11 cursor-grab items-center justify-center rounded-lg text-text-light transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing"
            aria-label="Arrastar bloco"
          >
            <GripVertical size={16} />
          </button>
        ) : null}

        {isMobile ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onMoveUp()
              }}
              disabled={!canMoveUp}
              className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-primary/20 px-2 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Mover para cima"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onMoveDown()
              }}
              disabled={!canMoveDown}
              className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-primary/20 px-2 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Mover para baixo"
            >
              <ArrowDown size={16} />
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleCollapsed()
          }}
          className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-primary/20 px-2 text-text-light transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={isCollapsed ? 'Expandir bloco' : 'Colapsar bloco'}
          aria-expanded={!isCollapsed}
          aria-controls={collapseContentId}
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {blockTypeLabels[blockType]}
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
          aria-label="Remover bloco"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

function areControlsEqual(prev: BlockControlsProps, next: BlockControlsProps) {
  return (
    prev.mode === next.mode
    && prev.blockType === next.blockType
    && prev.isSelected === next.isSelected
    && prev.isHovered === next.isHovered
    && prev.isMobile === next.isMobile
    && prev.canMoveUp === next.canMoveUp
    && prev.canMoveDown === next.canMoveDown
    && prev.isCollapsed === next.isCollapsed
    && prev.collapseContentId === next.collapseContentId
    && prev.handleProps === next.handleProps
    && prev.onDelete === next.onDelete
    && prev.onMoveUp === next.onMoveUp
    && prev.onMoveDown === next.onMoveDown
    && prev.onToggleCollapsed === next.onToggleCollapsed
  )
}

export const BlockControls = memo(BlockControlsComponent, areControlsEqual)
