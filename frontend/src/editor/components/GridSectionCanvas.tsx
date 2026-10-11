import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { useEditorStore } from '@/editor/store/editorStore'
import type { Block, PageSection, SectionRect } from '@/editor/types'

const ROW_HEIGHT = 56
const GRID_GAP = 8
const COLLAPSE_WIDTH = 640

interface GridMetrics {
  cols: number
  colWidth: number
}

function fallbackRect(index: number, cols: number): SectionRect {
  return { col: 1, row: index * 5 + 1, w: cols, h: 4 }
}

function blockRect(block: Block, index: number, cols: number): SectionRect {
  return block.rect ?? fallbackRect(index, cols)
}

function rectToStyle(rect: SectionRect, metrics: GridMetrics): React.CSSProperties {
  const cellW = metrics.colWidth + GRID_GAP
  const cellH = ROW_HEIGHT + GRID_GAP
  return {
    left: (rect.col - 1) * cellW,
    top: (rect.row - 1) * cellH,
    width: rect.w * metrics.colWidth + (rect.w - 1) * GRID_GAP,
    height: rect.h * ROW_HEIGHT + (rect.h - 1) * GRID_GAP,
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return Boolean(
    target.closest('input, textarea, select, button, a, [contenteditable="true"], [data-no-drag]'),
  )
}

interface DragState {
  blockId: string
  mode: 'move' | 'resize'
  pointerId: number
  startX: number
  startY: number
  startRect: SectionRect
}

interface GridBlockProps {
  block: Block
  rect: SectionRect
  metrics: GridMetrics
  isSelected: boolean
  onSelect: (id: string) => void
  onRequestDelete: (id: string) => void
  onDragStart: (event: React.PointerEvent<HTMLElement>, block: Block, rect: SectionRect, mode: 'move' | 'resize') => void
}

function GridBlockComponent({
  block,
  rect,
  metrics,
  isSelected,
  onSelect,
  onRequestDelete,
  onDragStart,
}: GridBlockProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock)
  const updateBlockRect = useEditorStore((state) => state.updateBlockRect)
  const style = rectToStyle(rect, metrics)

  // Keyboard nudge: arrows move, shift+arrows resize. Operates on cell units.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 'resize' : 'move'
      let next: SectionRect | null = null
      switch (event.key) {
        case 'ArrowLeft':
          next = step === 'move'
            ? { ...rect, col: Math.max(1, rect.col - 1) }
            : { ...rect, w: Math.max(1, rect.w - 1) }
          break
        case 'ArrowRight':
          next = step === 'move'
            ? { ...rect, col: Math.min(metrics.cols - rect.w + 1, rect.col + 1) }
            : { ...rect, w: Math.min(metrics.cols - rect.col + 1, rect.w + 1) }
          break
        case 'ArrowUp':
          next = step === 'move'
            ? { ...rect, row: Math.max(1, rect.row - 1) }
            : { ...rect, h: Math.max(1, rect.h - 1) }
          break
        case 'ArrowDown':
          next = step === 'move'
            ? { ...rect, row: rect.row + 1 }
            : { ...rect, h: Math.min(40, rect.h + 1) }
          break
        default:
          return
      }
      event.preventDefault()
      event.stopPropagation()
      updateBlockRect(block.id, next)
    },
    [block.id, metrics.cols, rect, updateBlockRect],
  )

  return (
    <div
      role="group"
      aria-label={`Bloco ${block.type} — use setas para mover, shift+setas para redimensionar`}
      tabIndex={0}
      data-grid-block
      className={`absolute rounded-2xl border bg-surface text-text transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${
        isSelected
          ? 'border-primary/60 shadow-lg ring-2 ring-primary/30 z-30'
          : 'border-border shadow-sm z-10 hover:border-primary/30'
      }`}
      style={{ ...style, overflow: 'hidden', touchAction: 'none' }}
      onPointerDown={(event) => onDragStart(event, block, rect, 'move')}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect(block.id)}
    >
      <div
        className="h-full w-full overflow-y-auto overflow-x-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        <BlockRenderer block={block} mode="edit" onUpdate={updateBlock} />
      </div>

      {isSelected ? (
        <>
          <button
            type="button"
            aria-label="Remover bloco"
            onClick={(event) => {
              event.stopPropagation()
              onRequestDelete(block.id)
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="absolute right-2 top-2 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text-light shadow-sm transition-colors hover:border-red-300 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            aria-label="Redimensionar bloco — arraste ou use shift+setas"
            onPointerDown={(event) => onDragStart(event, block, rect, 'resize')}
            className="absolute bottom-0 right-0 z-40 flex h-11 w-11 cursor-nwse-resize items-end justify-end rounded-tl-xl text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="m-2">
              <path d="M16 2 L2 16 M16 8 L8 16 M16 14 L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  )
}

const GridBlock = memo(GridBlockComponent)

function GridStackedCard({ block }: { block: Block }) {
  const updateBlock = useEditorStore((state) => state.updateBlock)
  const selectBlock = useEditorStore((state) => state.selectBlock)
  return (
    <div
      className="rounded-2xl border border-border bg-surface text-text shadow-sm"
      onClick={() => selectBlock(block.id)}
    >
      <BlockRenderer block={block} mode="edit" onUpdate={updateBlock} />
    </div>
  )
}

interface GridSectionCanvasProps {
  section: PageSection
  blocks: Block[]
  onRequestDelete: (id: string) => void
}

export function GridSectionCanvas({ section, blocks, onRequestDelete }: GridSectionCanvasProps) {
  const cols = Math.min(Math.max(section.grid?.cols ?? 12, 1), 24)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [ghostRect, setGhostRect] = useState<SectionRect | null>(null)
  const selectBlock = useEditorStore((state) => state.selectBlock)
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId)
  const updateBlockRect = useEditorStore((state) => state.updateBlockRect)
  const { setDragging } = useEditorStore(
    useShallow((state) => ({ setDragging: state.setDragging })),
  )

  useEffect(() => {
    const node = containerRef.current
    if (!node || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setContainerWidth(width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const metrics = useMemo<GridMetrics>(() => {
    const usable = Math.max(containerWidth - (cols - 1) * GRID_GAP, cols * 8)
    return { cols, colWidth: usable / cols }
  }, [cols, containerWidth])

  const maxRow = useMemo(
    () => blocks.reduce((max, block, index) => {
      const rect = blockRect(block, index, cols)
      return Math.max(max, rect.row + rect.h - 1)
    }, 0),
    [blocks, cols],
  )
  const canvasHeight = maxRow * (ROW_HEIGHT + GRID_GAP) + ROW_HEIGHT

  const candidateRect = useCallback(
    (state: DragState, clientX: number, clientY: number): SectionRect => {
      const cellW = metrics.colWidth + GRID_GAP
      const cellH = ROW_HEIGHT + GRID_GAP
      const dx = clientX - state.startX
      const dy = clientY - state.startY

      if (state.mode === 'resize') {
        const w = Math.min(
          Math.max(1, Math.round((state.startRect.w * metrics.colWidth + (state.startRect.w - 1) * GRID_GAP + dx + GRID_GAP) / cellW)),
          cols - state.startRect.col + 1,
        )
        const h = Math.min(
          Math.max(1, Math.round((state.startRect.h * ROW_HEIGHT + (state.startRect.h - 1) * GRID_GAP + dy + GRID_GAP) / cellH)),
          40,
        )
        return { ...state.startRect, w, h }
      }

      const col = Math.min(
        Math.max(1, Math.round((state.startRect.col - 1) * cellW + dx) / cellW + 1),
        cols - state.startRect.w + 1,
      )
      const row = Math.max(1, Math.round(((state.startRect.row - 1) * cellH + dy) / cellH) + 1)
      return { ...state.startRect, col, row }
    },
    [cols, metrics.colWidth],
  )

  const handleDragStart = useCallback(
    (event: React.PointerEvent<HTMLElement>, block: Block, rect: SectionRect, mode: 'move' | 'resize') => {
      if (event.button !== 0) {
        return
      }
      if (mode === 'move' && isInteractiveTarget(event.target)) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      const state: DragState = {
        blockId: block.id,
        mode,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startRect: rect,
      }
      setDrag(state)
      setGhostRect(rect)
      setDragging(true)
      selectBlock(block.id)
      event.currentTarget.setPointerCapture?.(event.pointerId)

      const handleMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== state.pointerId) {
          return
        }
        setGhostRect(candidateRect(state, moveEvent.clientX, moveEvent.clientY))
      }

      const finish = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== state.pointerId) {
          return
        }
        const next = candidateRect(state, upEvent.clientX, upEvent.clientY)
        updateBlockRect(state.blockId, next)
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', finish)
        window.removeEventListener('pointercancel', cancel)
        setDrag(null)
        setGhostRect(null)
        setDragging(false)
      }

      const cancel = (cancelEvent: PointerEvent) => {
        if (cancelEvent.pointerId !== state.pointerId) {
          return
        }
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', finish)
        window.removeEventListener('pointercancel', cancel)
        setDrag(null)
        setGhostRect(null)
        setDragging(false)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', finish)
      window.addEventListener('pointercancel', cancel)
    },
    [candidateRect, selectBlock, setDragging, updateBlockRect],
  )

  // D12 collapse: below ~640px the placed layout degrades to a plain stack.
  // Covers mobile AND narrow desktop windows — no dependence on pointer
  // media detection alone (which also flashes grid on the first frame).
  if (containerWidth > 0 && containerWidth < COLLAPSE_WIDTH) {
    return (
      <div ref={containerRef} className="space-y-4" data-section-id={section.id}>
        {blocks.map((block) => (
          <GridStackedCard key={block.id} block={block} />
        ))}
        {blocks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary/20 p-6 text-center text-sm text-text-light">
            Seção vazia — adicione blocos para começar.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      data-section-id={section.id}
      className="relative w-full rounded-2xl border border-dashed border-primary/20 bg-primary/[0.02]"
      style={{ minHeight: canvasHeight }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          selectBlock(null)
        }
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${metrics.colWidth}px, rgba(225, 29, 72, 0.06) ${metrics.colWidth}px, rgba(225, 29, 72, 0.06) ${metrics.colWidth + GRID_GAP}px)`,
        }}
      />

      {drag && ghostRect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10"
          style={rectToStyle(ghostRect, metrics)}
        />
      ) : null}

      {blocks.map((block, index) => {
        const rect = blockRect(block, index, cols)
        return (
          <GridBlock
            key={block.id}
            block={block}
            rect={rect}
            metrics={metrics}
            isSelected={selectedBlockId === block.id}
            onSelect={selectBlock}
            onRequestDelete={onRequestDelete}
            onDragStart={handleDragStart}
          />
        )
      })}

      {blocks.length === 0 ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-text-light">
          Seção em grade vazia — arraste blocos para cá ou adicione novos.
        </p>
      ) : null}
    </div>
  )
}
