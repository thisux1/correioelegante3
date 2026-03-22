import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware'
import {
  MAX_BLOCKS,
  PERSIST_DEBOUNCE_MS,
  type Block,
  type EditorMode,
} from '@/editor/types'
import { DEFAULT_THEME_ID, resolveThemeId } from '@/editor/themes'

interface EditorStoreState {
  blocks: Block[]
  theme: string
  selectedBlockId: string | null
  collapsedById: Record<string, boolean>
  isDragging: boolean
  mode: EditorMode
  draftPageId: string | null
  draftUpdatedAt: string | null
}

interface EditorStoreActions {
  addBlock: (block: Block) => void
  updateBlock: (id: string, updater: (block: Block) => Block) => void
  removeBlock: (id: string) => void
  moveBlockUp: (id: string) => void
  moveBlockDown: (id: string) => void
  reorderBlocks: (blocks: Block[]) => void
  setBlocks: (blocks: Block[]) => void
  setTheme: (themeId: string) => void
  setPage: (page: { blocks: Block[]; theme?: string }) => void
  selectBlock: (id: string | null) => void
  toggleBlockCollapsed: (id: string) => void
  setBlockCollapsed: (id: string, collapsed: boolean) => void
  setDragging: (isDragging: boolean) => void
  setMode: (mode: EditorMode) => void
  setDraftContext: (pageId: string | null, updatedAt?: string | null) => void
  resetEditor: () => void
}

export type EditorStore = EditorStoreState & EditorStoreActions

function moveBlockByOffset(blocks: Block[], id: string, offset: -1 | 1) {
  const index = blocks.findIndex((block) => block.id === id)

  if (index === -1) {
    return blocks
  }

  const targetIndex = index + offset
  if (targetIndex < 0 || targetIndex >= blocks.length) {
    return blocks
  }

  const reordered = [...blocks]
  const [movedBlock] = reordered.splice(index, 1)

  if (!movedBlock) {
    return blocks
  }

  reordered.splice(targetIndex, 0, movedBlock)
  return reordered
}

const initialEditorState: EditorStoreState = {
  blocks: [],
  theme: DEFAULT_THEME_ID,
  selectedBlockId: null,
  collapsedById: {},
  isDragging: false,
  mode: 'edit',
  draftPageId: null,
  draftUpdatedAt: null,
}

function pruneCollapsedById(collapsedById: Record<string, boolean>, blocks: Block[]) {
  if (Object.keys(collapsedById).length === 0) {
    return collapsedById
  }

  const validIds = new Set(blocks.map((block) => block.id))
  const next: Record<string, boolean> = {}

  for (const [id, isCollapsed] of Object.entries(collapsedById)) {
    if (isCollapsed && validIds.has(id)) {
      next[id] = true
    }
  }

  return next
}

function nowIsoString() {
  return new Date().toISOString()
}

const noopStateStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function createDebouncedStateStorage(debounceMs: number): StateStorage {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingName: string | null = null
  let pendingValue: string | null = null

  const flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (pendingName === null || pendingValue === null) {
      return
    }

    window.localStorage.setItem(pendingName, pendingValue)
    pendingName = null
    pendingValue = null
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flush()
        }
      })
    }
  }

  return {
    getItem: (name) => window.localStorage.getItem(name),
    setItem: (name, value) => {
      pendingName = name
      pendingValue = value

      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        flush()
        timeoutId = null
      }, debounceMs)
    },
    removeItem: (name) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      if (pendingName === name) {
        pendingName = null
        pendingValue = null
      }

      window.localStorage.removeItem(name)
    },
  }
}

const persistStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return noopStateStorage
  }

  return createDebouncedStateStorage(PERSIST_DEBOUNCE_MS)
})

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      ...initialEditorState,
      addBlock: (block) =>
        set((state) => {
          if (state.blocks.length >= MAX_BLOCKS) {
            return state
          }

          return {
            blocks: [...state.blocks, block],
            draftUpdatedAt: nowIsoString(),
          }
        }),
      updateBlock: (id, updater) =>
        set((state) => ({
          blocks: state.blocks.map((block) => {
            if (block.id !== id) {
              return block
            }

            const updatedBlock = updater(block)

            return {
              ...updatedBlock,
              meta: {
                ...block.meta,
                ...updatedBlock.meta,
                updatedAt: Date.now(),
              },
            }
          }),
          draftUpdatedAt: nowIsoString(),
        })),
      removeBlock: (id) =>
        set((state) => {
          const nextCollapsedById = { ...state.collapsedById }
          delete nextCollapsedById[id]

          return {
            blocks: state.blocks.filter((block) => block.id !== id),
            selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
            collapsedById: nextCollapsedById,
            draftUpdatedAt: nowIsoString(),
          }
        }),
      moveBlockUp: (id) =>
        set((state) => {
          const nextBlocks = moveBlockByOffset(state.blocks, id, -1)
          if (nextBlocks === state.blocks) {
            return state
          }

          return {
            blocks: nextBlocks,
            draftUpdatedAt: nowIsoString(),
          }
        }),
      moveBlockDown: (id) =>
        set((state) => {
          const nextBlocks = moveBlockByOffset(state.blocks, id, 1)
          if (nextBlocks === state.blocks) {
            return state
          }

          return {
            blocks: nextBlocks,
            draftUpdatedAt: nowIsoString(),
          }
        }),
      reorderBlocks: (blocks) => set({ blocks, draftUpdatedAt: nowIsoString() }),
      setBlocks: (blocks) =>
        set((state) => ({
          blocks,
          selectedBlockId: null,
          collapsedById: pruneCollapsedById(state.collapsedById, blocks),
          draftUpdatedAt: nowIsoString(),
        })),
      setTheme: (themeId) =>
        set((state) => {
          const normalizedThemeId = resolveThemeId(themeId)
          if (state.theme === normalizedThemeId) {
            return state
          }

          return {
            theme: normalizedThemeId,
            draftUpdatedAt: nowIsoString(),
          }
        }),
      setPage: (page) =>
        set((state) => ({
          blocks: page.blocks,
          theme: resolveThemeId(page.theme),
          selectedBlockId: null,
          collapsedById: pruneCollapsedById(state.collapsedById, page.blocks),
          draftUpdatedAt: nowIsoString(),
        })),
      selectBlock: (selectedBlockId) => set({ selectedBlockId }),
      toggleBlockCollapsed: (id) =>
        set((state) => {
          if (!state.blocks.some((block) => block.id === id)) {
            return state
          }

          const isCollapsed = Boolean(state.collapsedById[id])
          if (isCollapsed) {
            const nextCollapsedById = { ...state.collapsedById }
            delete nextCollapsedById[id]
            return { collapsedById: nextCollapsedById }
          }

          return {
            collapsedById: {
              ...state.collapsedById,
              [id]: true,
            },
          }
        }),
      setBlockCollapsed: (id, collapsed) =>
        set((state) => {
          if (!state.blocks.some((block) => block.id === id)) {
            return state
          }

          if (!collapsed) {
            if (!state.collapsedById[id]) {
              return state
            }

            const nextCollapsedById = { ...state.collapsedById }
            delete nextCollapsedById[id]
            return { collapsedById: nextCollapsedById }
          }

          if (state.collapsedById[id]) {
            return state
          }

          return {
            collapsedById: {
              ...state.collapsedById,
              [id]: true,
            },
          }
        }),
      setDragging: (isDragging) => set({ isDragging }),
      setMode: (mode) => set({ mode }),
      setDraftContext: (draftPageId, updatedAt) =>
        set({
          draftPageId,
          draftUpdatedAt: updatedAt ?? nowIsoString(),
        }),
      resetEditor: () => set({ ...initialEditorState }),
    }),
    {
      name: 'editor-draft',
      storage: persistStorage,
      partialize: (state) => ({
        blocks: state.blocks,
        theme: state.theme,
        collapsedById: state.collapsedById,
        draftPageId: state.draftPageId,
        draftUpdatedAt: state.draftUpdatedAt,
      }),
    },
  ),
)
