import { memo, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface SortableHandleProps {
  attributes: DraggableAttributes
  listeners?: DraggableSyntheticListeners
  setActivatorNodeRef: (element: HTMLElement | null) => void
}

interface BlockWrapperProps {
  blockId: string
  blockUpdatedAt: number
  isSelected: boolean
  isMobile: boolean
  isDraggingGlobal: boolean
  onSelect: (id: string) => void
  renderControls: (args: {
    isHovered: boolean
    handleProps?: SortableHandleProps
  }) => ReactNode
  children: ReactNode
}

function BlockWrapperComponent({
  blockId,
  blockUpdatedAt,
  isSelected,
  isMobile,
  isDraggingGlobal,
  onSelect,
  renderControls,
  children,
}: BlockWrapperProps) {
  const [isHovered, setIsHovered] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: blockId, disabled: isMobile })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleProps = useMemo<SortableHandleProps | undefined>(() => {
    if (isMobile) {
      return undefined
    }

    return {
      attributes,
      listeners: listeners as DraggableSyntheticListeners,
      setActivatorNodeRef,
    }
  }, [attributes, isMobile, listeners, setActivatorNodeRef])

  const frameClassName = [
    'relative rounded-[20px] border-2 p-1 transition-all duration-200',
    isSelected
      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
      : isHovered
        ? 'border-primary/70 bg-primary/5'
        : 'border-transparent',
    isDraggingGlobal ? 'opacity-70' : 'opacity-100',
    isDragging ? 'border-dashed border-primary/50 bg-primary/10 opacity-35' : '',
    isOver && isDraggingGlobal ? 'border-primary ring-2 ring-primary/30' : '',
  ].join(' ')

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={frameClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(event) => {
        event.stopPropagation()
      onSelect(blockId)
    }}
      data-block-id={blockId}
      data-updated-at={blockUpdatedAt}
    >
      {renderControls({
        isHovered,
        handleProps,
      })}
      {children}
    </div>
  )
}

function areWrappersEqual(prev: BlockWrapperProps, next: BlockWrapperProps) {
  return (
    prev.blockId === next.blockId
    && prev.blockUpdatedAt === next.blockUpdatedAt
    && prev.isSelected === next.isSelected
    && prev.isMobile === next.isMobile
    && prev.isDraggingGlobal === next.isDraggingGlobal
    && prev.onSelect === next.onSelect
    && prev.renderControls === next.renderControls
  )
}

export const BlockWrapper = memo(BlockWrapperComponent, areWrappersEqual)
