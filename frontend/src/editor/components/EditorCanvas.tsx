import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Film, Image as ImageIcon, Music2, Sparkles, Type } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Modal } from '@/components/ui/Modal'
import { BlockControls } from '@/editor/components/BlockControls'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { BlockWrapper } from '@/editor/components/BlockWrapper'
import { useEditorStore } from '@/editor/store/editorStore'
import type { Block } from '@/editor/types'

function normalizeId(id: UniqueIdentifier): string {
  return String(id)
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || (target instanceof HTMLElement && target.isContentEditable)
  )
}

function useIsCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const sync = () => setIsCoarsePointer(mediaQuery.matches)

    sync()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', sync)
      return () => {
        mediaQuery.removeEventListener('change', sync)
      }
    }

    mediaQuery.addListener(sync)
    return () => {
      mediaQuery.removeListener(sync)
    }
  }, [])

  return isCoarsePointer
}

function formatTimerPreviewDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Sem conteudo'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

interface CollapsedPreviewProps {
  block: Block
  onExpand: () => void
}

function CollapsedPreview({ block, onExpand }: CollapsedPreviewProps) {
  const content = (() => {
    if (block.type === 'text') {
      const textValue = block.props.text.trim()
      return (
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-white/80 text-primary">
            <Type size={14} />
          </span>
          <p className="min-w-0 flex-1 truncate font-cursive text-lg text-text">
            {textValue || 'Sem conteudo'}
          </p>
        </div>
      )
    }

    if (block.type === 'image') {
      const src = block.props.src.trim()
      const alt = block.props.alt?.trim() || 'Sem conteudo'
      return (
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-white/80">
            {src ? (
              <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-light">
                <ImageIcon size={16} />
              </div>
            )}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm text-text-light">{src ? alt : 'Sem conteudo'}</p>
        </div>
      )
    }

    if (block.type === 'gallery') {
      const items = Array.isArray(block.props.items) && block.props.items.length > 0
        ? block.props.items
        : (block.props.images ?? []).map((src) => ({ src }))
      const first = items[0]?.src?.trim() || ''
      const count = items.length
      return (
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-white/80">
            {first ? (
              <img src={first} alt="Preview da galeria" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-light">
                <ImageIcon size={16} />
              </div>
            )}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm text-text-light">
            {count > 0 ? `${count} ${count === 1 ? 'imagem' : 'imagens'}` : 'Sem conteudo'}
          </p>
        </div>
      )
    }

    if (block.type === 'music') {
      const tracks = block.props.tracks ?? []
      const resolvedTracks = tracks.length > 0
        ? tracks
        : [{
          src: block.props.src,
          title: block.props.title,
          artist: block.props.artist,
          coverSrc: block.props.coverSrc,
        }]
      const firstTrack = resolvedTracks[0]
      const cover = firstTrack?.coverSrc?.trim() || ''
      const title = firstTrack?.title?.trim() || 'Sem titulo'
      const artist = firstTrack?.artist?.trim() || 'Sem artista'
      const compactTracks = resolvedTracks
        .map((track, index) => {
          const trackTitle = track.title?.trim() || `Faixa ${index + 1}`
          const trackArtist = track.artist?.trim() || 'Sem artista'
          return `${trackTitle} - ${trackArtist}`
        })
        .join(' | ')

      return (
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-white/80">
            {cover ? (
              <img src={cover} alt={`Capa de ${title}`} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-light">
                <Music2 size={16} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{title}</p>
            <p className="truncate text-xs text-text-light">{artist}</p>
            <p className="truncate text-xs text-text-light/90">{compactTracks || 'Sem conteudo'}</p>
          </div>
        </div>
      )
    }

    if (block.type === 'video') {
      const src = block.props.src.trim()
      const canPlay = src.startsWith('http://') || src.startsWith('https://')
      return (
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-white/80 text-primary">
            <Film size={14} />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm text-text-light">
            {canPlay ? src : 'Sem conteudo'}
          </p>
        </div>
      )
    }

    const label = block.props.label?.trim() || 'Sem conteudo'
    const targetDate = block.props.targetDate?.trim()
    return (
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-white/80 text-primary">
          <CalendarDays size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{label}</p>
          <p className="truncate text-xs text-text-light">{targetDate ? formatTimerPreviewDate(targetDate) : 'Sem conteudo'}</p>
        </div>
      </div>
    )
  })()

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onExpand()
      }}
      className="glass group relative w-full min-w-0 rounded-2xl border border-primary/20 px-3 py-3 text-left transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
      aria-label="Reabrir bloco"
    >
      {content}
    </button>
  )
}

interface CanvasBlockProps {
  blockId: string
  index: number
  total: number
  isMobile: boolean
  isDraggingGlobal: boolean
  onRequestDelete: (id: string) => void
}

function CanvasBlockComponent({
  blockId,
  index,
  total,
  isMobile,
  isDraggingGlobal,
  onRequestDelete,
}: CanvasBlockProps) {
  const block = useEditorStore(
    useCallback((state) => state.blocks.find((current) => current.id === blockId) ?? null, [blockId]),
  )
  const isSelected = useEditorStore(useCallback((state) => state.selectedBlockId === blockId, [blockId]))
  const selectBlock = useEditorStore((state) => state.selectBlock)
  const updateBlock = useEditorStore((state) => state.updateBlock)
  const moveBlockUp = useEditorStore((state) => state.moveBlockUp)
  const moveBlockDown = useEditorStore((state) => state.moveBlockDown)
  const isCollapsed = useEditorStore(useCallback((state) => Boolean(state.collapsedById[blockId]), [blockId]))
  const toggleBlockCollapsed = useEditorStore((state) => state.toggleBlockCollapsed)
  const setBlockCollapsed = useEditorStore((state) => state.setBlockCollapsed)

  const collapseContentId = `editor-block-content-${blockId}`
  const expandedRef = useRef<HTMLDivElement | null>(null)
  const collapsedRef = useRef<HTMLDivElement | null>(null)
  const [animatedHeight, setAnimatedHeight] = useState<number | null>(null)

  const handleSelect = useCallback((id: string) => {
    selectBlock(id)
  }, [selectBlock])

  const handleDelete = useCallback(() => {
    onRequestDelete(blockId)
  }, [blockId, onRequestDelete])

  const handleMoveUp = useCallback(() => {
    moveBlockUp(blockId)
  }, [blockId, moveBlockUp])

  const handleMoveDown = useCallback(() => {
    moveBlockDown(blockId)
  }, [blockId, moveBlockDown])

  const handleToggleCollapsed = useCallback(() => {
    if (!isCollapsed && isSelected) {
      selectBlock(null)
    }

    toggleBlockCollapsed(blockId)
  }, [blockId, isCollapsed, isSelected, selectBlock, toggleBlockCollapsed])

  const handleExpand = useCallback(() => {
    setBlockCollapsed(blockId, false)
    selectBlock(blockId)
  }, [blockId, selectBlock, setBlockCollapsed])

  const syncAnimatedHeight = useCallback(() => {
    const nextHeight = isCollapsed
      ? collapsedRef.current?.offsetHeight ?? 0
      : expandedRef.current?.offsetHeight ?? 0

    if (nextHeight > 0) {
      setAnimatedHeight(nextHeight)
    }
  }, [isCollapsed])

  useLayoutEffect(() => {
    syncAnimatedHeight()
  }, [syncAnimatedHeight, block.meta.updatedAt])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      syncAnimatedHeight()
    })

    if (expandedRef.current) {
      observer.observe(expandedRef.current)
    }

    if (collapsedRef.current) {
      observer.observe(collapsedRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [syncAnimatedHeight])

  if (!block) {
    return null
  }

  return (
    <BlockWrapper
      blockId={block.id}
      blockUpdatedAt={block.meta.updatedAt}
      isSelected={isSelected}
      isMobile={isMobile}
      isDraggingGlobal={isDraggingGlobal}
      onSelect={handleSelect}
      renderControls={({ isHovered, handleProps }) => (
        <BlockControls
          mode="edit"
          blockType={block.type}
          isSelected={isSelected}
          isHovered={isHovered}
          isMobile={isMobile}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
          isCollapsed={isCollapsed}
          collapseContentId={collapseContentId}
          handleProps={handleProps}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onToggleCollapsed={handleToggleCollapsed}
        />
      )}
    >
      <motion.div
        id={collapseContentId}
        className="relative overflow-hidden"
        initial={false}
        animate={animatedHeight ? { height: animatedHeight } : undefined}
        transition={{ type: 'spring', stiffness: 190, damping: 28, mass: 1.02 }}
      >
        <motion.div
          ref={expandedRef}
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            y: isCollapsed ? -10 : 0,
            scale: isCollapsed ? 0.995 : 1,
            filter: isCollapsed ? 'blur(0.6px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.42, ease: [0.19, 1, 0.22, 1] }}
          style={{
            position: isCollapsed ? 'absolute' : 'relative',
            inset: 0,
            width: '100%',
            pointerEvents: isCollapsed ? 'none' : 'auto',
          }}
          aria-hidden={isCollapsed}
        >
          <BlockRenderer block={block} mode="edit" onUpdate={updateBlock} />
        </motion.div>

        <motion.div
          ref={collapsedRef}
          initial={false}
          animate={{
            opacity: isCollapsed ? 1 : 0,
            y: isCollapsed ? 0 : 10,
            scale: isCollapsed ? 1 : 0.995,
            filter: isCollapsed ? 'blur(0px)' : 'blur(0.6px)',
          }}
          transition={{ duration: 0.42, ease: [0.19, 1, 0.22, 1] }}
          style={{
            position: isCollapsed ? 'relative' : 'absolute',
            inset: 0,
            width: '100%',
            pointerEvents: isCollapsed ? 'auto' : 'none',
          }}
          aria-hidden={!isCollapsed}
        >
          <CollapsedPreview block={block} onExpand={handleExpand} />
        </motion.div>
      </motion.div>
    </BlockWrapper>
  )
}

const CanvasBlock = memo(CanvasBlockComponent)

export function EditorCanvas() {
  const blocks = useEditorStore((state) => state.blocks)
  const blockIds = useMemo(() => blocks.map((block) => block.id), [blocks])
  const {
    selectedBlockId,
    isDragging,
    selectBlock,
    setDragging,
    reorderBlocks,
    removeBlock,
  } = useEditorStore(
    useShallow((state) => ({
      selectedBlockId: state.selectedBlockId,
      isDragging: state.isDragging,
      selectBlock: state.selectBlock,
      setDragging: state.setDragging,
      reorderBlocks: state.reorderBlocks,
      removeBlock: state.removeBlock,
    })),
  )

  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null)
  const isMobile = useIsCoarsePointer()

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeId) ?? null,
    [activeId, blocks],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (isMobile) {
      return
    }

    setDragging(true)
    selectBlock(null)
    setActiveId(normalizeId(event.active.id))
  }, [isMobile, selectBlock, setDragging])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (isMobile) {
      return
    }

    const activeBlockId = normalizeId(event.active.id)
    const overBlockId = event.over ? normalizeId(event.over.id) : null

    if (overBlockId && activeBlockId !== overBlockId) {
      const oldIndex = blocks.findIndex((block) => block.id === activeBlockId)
      const newIndex = blocks.findIndex((block) => block.id === overBlockId)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(arrayMove(blocks, oldIndex, newIndex))
      }
    }

    setDragging(false)
    setActiveId(null)
  }, [blocks, isMobile, reorderBlocks, setDragging])

  const handleDragCancel = useCallback(() => {
    setDragging(false)
    setActiveId(null)
  }, [setDragging])

  const requestDelete = useCallback((id: string) => {
    setPendingDeletionId(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!pendingDeletionId) {
      return
    }

    removeBlock(pendingDeletionId)
    setPendingDeletionId(null)
  }, [pendingDeletionId, removeBlock])

  const cancelDelete = useCallback(() => {
    setPendingDeletionId(null)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        selectBlock(null)
        return
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlockId) {
        event.preventDefault()
        setPendingDeletionId(selectedBlockId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectBlock, selectedBlockId])

  const listContent = useMemo(() => (
    <div
      className="space-y-6"
      onClick={() => {
        selectBlock(null)
      }}
    >
      <AnimatePresence initial={false}>
        {blockIds.map((blockId, index) => (
          <motion.div
            key={blockId}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.18 }}
          >
            <CanvasBlock
              blockId={blockId}
              index={index}
              total={blockIds.length}
              isMobile={isMobile}
              isDraggingGlobal={isDragging}
              onRequestDelete={requestDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  ), [blockIds, isDragging, isMobile, requestDelete, selectBlock])

  if (blockIds.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/35 bg-white/70 px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles size={20} />
        </div>
        <h2 className="font-display text-2xl text-text">Comece criando seu primeiro bloco ✨</h2>
        <p className="mt-2 text-sm text-text-light">Use o botao + para adicionar texto ou imagem e monte sua carta com calma.</p>
      </div>
    )
  }

  return (
    <>
      {isMobile ? (
        listContent
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            {listContent}
          </SortableContext>

          <DragOverlay>
            {activeBlock ? (
              <motion.div
                initial={{ opacity: 0.75, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[min(86vw,44rem)] rounded-2xl border border-primary/35 bg-white/95 p-3 shadow-2xl"
              >
                <BlockRenderer block={activeBlock} mode="preview" />
              </motion.div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal isOpen={Boolean(pendingDeletionId)} onClose={cancelDelete} title="Remover bloco?">
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelDelete}
              className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-medium text-text-light transition-colors hover:bg-primary/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Remover
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
