import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, Film, Image as ImageIcon, Music2, Heart, Type } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Modal } from '@/components/ui/Modal'
import { BlockControls } from '@/editor/components/BlockControls'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { BlockWrapper } from '@/editor/components/BlockWrapper'
import { GridSectionCanvas } from '@/editor/components/GridSectionCanvas'
import { useEditorStore } from '@/editor/store/editorStore'
import type { Block, PageSection } from '@/editor/types'

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
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 text-primary">
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
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface/80">
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
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface/80">
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
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface/80">
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
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 text-primary">
            <Film size={14} />
          </span>
          <p className="min-w-0 flex-1 truncate text-sm text-text-light">
            {canPlay ? src : 'Sem conteudo'}
          </p>
        </div>
      )
    }

    if (block.type === 'timer') {
      const label = block.props.label?.trim() || 'Sem conteudo'
      const targetDate = block.props.targetDate?.trim()
      return (
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 text-primary">
            <CalendarDays size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{label}</p>
            <p className="truncate text-xs text-text-light">{targetDate ? formatTimerPreviewDate(targetDate) : 'Sem conteudo'}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 text-primary">
          <CalendarDays size={14} />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm text-text-light">
          Bloco interativo
        </p>
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

function useAnimatedBlockHeight(isCollapsed: boolean, blockUpdatedAt?: string | number) {
  const expandedRef = useRef<HTMLDivElement | null>(null)
  const collapsedRef = useRef<HTMLDivElement | null>(null)
  const [animatedHeight, setAnimatedHeight] = useState<number | null>(null)

  const syncAnimatedHeight = useCallback(() => {
    const nextHeight = isCollapsed
      ? collapsedRef.current?.offsetHeight ?? 0
      : expandedRef.current?.offsetHeight ?? 0

    if (nextHeight > 0) {
      setAnimatedHeight(nextHeight)
    }
  }, [isCollapsed])

  const setExpandedNode = useCallback((node: HTMLDivElement | null) => {
    expandedRef.current = node
    syncAnimatedHeight()
  }, [syncAnimatedHeight])

  const setCollapsedNode = useCallback((node: HTMLDivElement | null) => {
    collapsedRef.current = node
    syncAnimatedHeight()
  }, [syncAnimatedHeight])

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
  }, [syncAnimatedHeight, blockUpdatedAt])

  return {
    animatedHeight,
    setExpandedNode,
    setCollapsedNode,
  }
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
  const blockUpdatedAt = block?.meta.updatedAt
  const {
    animatedHeight,
    setExpandedNode,
    setCollapsedNode,
  } = useAnimatedBlockHeight(isCollapsed, blockUpdatedAt)

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
        className={`relative ${isCollapsed ? 'overflow-hidden' : 'overflow-visible'}`}
        initial={false}
        animate={animatedHeight ? { height: animatedHeight } : undefined}
        transition={{ type: 'spring', stiffness: 190, damping: 28, mass: 1.02 }}
      >
        <motion.div
          ref={setExpandedNode}
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            y: isCollapsed ? -10 : 0,
            scale: isCollapsed ? 0.995 : 1,
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
          ref={setCollapsedNode}
          initial={false}
          animate={{
            opacity: isCollapsed ? 1 : 0,
            y: isCollapsed ? 0 : 10,
            scale: isCollapsed ? 1 : 0.995,
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

interface SectionGroup {
  section: PageSection
  blocks: Block[]
}

function groupBlocksBySection(sections: PageSection[], blocks: Block[]): SectionGroup[] {
  const effective = sections.length > 0
    ? sections
    : [{ id: 'main', layout: 'stack' as const }]
  const known = new Set(effective.map((section) => section.id))
  const fallbackId = effective[0].id

  return effective.map((section) => ({
    section,
    blocks: blocks.filter((block) => {
      const sectionId = block.sectionId && known.has(block.sectionId)
        ? block.sectionId
        : fallbackId
      return sectionId === section.id
    }),
  }))
}

function isPlacedLayout(layout: PageSection['layout']): boolean {
  return layout === 'grid' || layout === 'freezone'
}

interface SectionHeaderProps {
  section: PageSection
  isGrid: boolean
  onToggleLayout: (sectionId: string, layout: PageSection['layout']) => void
}

function SectionHeader({ section, isGrid, onToggleLayout }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-text-light/80">
        seção · {isGrid ? 'grade' : 'empilhada'}
      </p>
      <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface/70 p-0.5" role="group" aria-label="Layout da seção">
        <button
          type="button"
          aria-pressed={!isGrid}
          onClick={() => onToggleLayout(section.id, 'stack')}
          className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${
            !isGrid ? 'bg-primary/10 text-primary' : 'text-text-light hover:text-text'
          }`}
        >
          empilhada
        </button>
        <button
          type="button"
          aria-pressed={isGrid}
          onClick={() => onToggleLayout(section.id, 'grid')}
          className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${
            isGrid ? 'bg-primary/10 text-primary' : 'text-text-light hover:text-text'
          }`}
        >
          grade
        </button>
      </div>
    </div>
  )
}

export function EditorCanvas() {
  const shouldReduceMotion = useReducedMotion()
  const blocks = useEditorStore(useShallow((state) => state.blocks))
  const sections = useEditorStore(useShallow((state) => state.sections))
  const sectionGroups = useMemo(() => groupBlocksBySection(sections, blocks), [sections, blocks])
  const blockIds = useMemo(() => blocks.map((block) => block.id), [blocks])
  const {
    selectedBlockId,
    isDragging,
    selectBlock,
    setDragging,
    reorderBlocks,
    removeBlock,
    setSectionLayout,
    addSection,
  } = useEditorStore(
    useShallow((state) => ({
      selectedBlockId: state.selectedBlockId,
      isDragging: state.isDragging,
      selectBlock: state.selectBlock,
      setDragging: state.setDragging,
      reorderBlocks: state.reorderBlocks,
      removeBlock: state.removeBlock,
      setSectionLayout: state.setSectionLayout,
      addSection: state.addSection,
    })),
  )

  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null)
  const isMobile = useIsCoarsePointer()

  const activeBlock = useEditorStore(
    useCallback(
      (state) => (activeId ? state.blocks.find((block) => block.id === activeId) ?? null : null),
      [activeId],
    ),
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

  // Reorders stay inside the dragged block's section: the section's block
  // subset is arrayMove'd, then spliced back into the global array at the
  // same membership slots (blocks never cross a section boundary via DnD).
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (isMobile) {
      return
    }

    const activeBlockId = normalizeId(event.active.id)
    const overBlockId = event.over ? normalizeId(event.over.id) : null

    if (overBlockId && activeBlockId !== overBlockId) {
      const { blocks: allBlocks, sections: allSections } = useEditorStore.getState()
      const groups = groupBlocksBySection(allSections, allBlocks)
      const group = groups.find((current) =>
        current.blocks.some((block) => block.id === activeBlockId),
      )
      const sectionBlocks = group?.blocks ?? []

      // The drop target must live in the same section — otherwise ignore.
      if (!sectionBlocks.some((block) => block.id === overBlockId)) {
        setDragging(false)
        setActiveId(null)
        return
      }

      const oldIndex = sectionBlocks.findIndex((block) => block.id === activeBlockId)
      const newIndex = sectionBlocks.findIndex((block) => block.id === overBlockId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSection = arrayMove(sectionBlocks, oldIndex, newIndex)
        const sectionIds = new Set(reorderedSection.map((block) => block.id))
        const queue = [...reorderedSection]
        const nextBlocks = allBlocks.map((block) =>
          sectionIds.has(block.id) ? queue.shift() ?? block : block,
        )
        reorderBlocks(nextBlocks)
      }
    }

    setDragging(false)
    setActiveId(null)
  }, [isMobile, reorderBlocks, setDragging])

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

  const renderSectionBlocks = useCallback((group: SectionGroup) => (
    <div
      className="space-y-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          selectBlock(null)
        }
      }}
    >
      <AnimatePresence initial={false}>
        {group.blocks.map((block, index) => (
          <motion.div
            key={block.id}
            layout={!shouldReduceMotion}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className={`relative ${selectedBlockId === block.id ? 'z-40' : 'z-10'}`}
          >
            <CanvasBlock
              blockId={block.id}
              index={index}
              total={group.blocks.length}
              isMobile={isMobile}
              isDraggingGlobal={isDragging}
              onRequestDelete={requestDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  ), [isDragging, isMobile, requestDelete, selectBlock, selectedBlockId, shouldReduceMotion])

  const renderSection = useCallback((group: SectionGroup) => {
    const isGrid = isPlacedLayout(group.section.layout) && !isMobile

    return (
      <section key={group.section.id} aria-label={`Seção ${isGrid ? 'em grade' : 'empilhada'}`}>
        <SectionHeader
          section={group.section}
          isGrid={isGrid}
          onToggleLayout={setSectionLayout}
        />
        {isGrid ? (
          <GridSectionCanvas
            section={group.section}
            blocks={group.blocks}
            onRequestDelete={requestDelete}
            renderCollapsed={() => (
              <SortableContext
                items={group.blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                {renderSectionBlocks(group)}
              </SortableContext>
            )}
          />
        ) : (
          <SortableContext
            items={group.blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            {renderSectionBlocks(group)}
          </SortableContext>
        )}
      </section>
    )
  }, [
    isMobile,
    renderSectionBlocks,
    requestDelete,
    setSectionLayout,
  ])

  if (blockIds.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface text-text px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Heart size={20} />
        </div>
        <h2 className="font-display text-2xl text-text">Comece criando seu primeiro bloco</h2>
        <p className="mt-2 text-sm text-text-light">Use o botao + para adicionar texto ou imagem e monte sua carta com calma.</p>
      </div>
    )
  }

  const canvasContent = (
    <div className="space-y-10">
      {sectionGroups.map(renderSection)}
    </div>
  )

  return (
    <>
      {isMobile ? (
        canvasContent
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {canvasContent}

          <DragOverlay>
            {activeBlock ? (
              <motion.div
                initial={{ opacity: 0.75, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[min(86vw,44rem)] rounded-2xl border border-border bg-surface text-text p-3 shadow-2xl"
              >
                <BlockRenderer block={activeBlock} mode="preview" />
              </motion.div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={addSection}
          className="min-h-[44px] rounded-xl border border-dashed border-border px-4 py-2 text-sm text-text-light transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
        >
          + adicionar seção
        </button>
      </div>

      <Modal isOpen={Boolean(pendingDeletionId)} onClose={cancelDelete} title="Remover bloco?">
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            O bloco sai da página, mas dá pra desfazer depois (Ctrl+Z).
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
