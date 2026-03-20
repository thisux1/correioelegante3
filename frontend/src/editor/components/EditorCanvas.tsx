import { memo, useCallback, useEffect, useMemo, useState } from 'react'
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
import { Sparkles } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Modal } from '@/components/ui/Modal'
import { BlockControls } from '@/editor/components/BlockControls'
import { BlockRenderer } from '@/editor/components/BlockRenderer'
import { BlockWrapper } from '@/editor/components/BlockWrapper'
import { useEditorStore } from '@/editor/store/editorStore'

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
          handleProps={handleProps}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      )}
    >
      <BlockRenderer block={block} mode="edit" onUpdate={updateBlock} />
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
          <p className="text-sm text-text-light">Essa acao remove o bloco selecionado do canvas.</p>
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
