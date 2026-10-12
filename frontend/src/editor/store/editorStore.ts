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
  type PageSection,
  type SectionRect,
} from '@/editor/types'
import { DEFAULT_THEME_ID, resolveThemeId } from '@/editor/themes'

interface PageSnapshot {
  blocks: Block[]
  sections: PageSection[]
  theme: string
}

interface EditorStoreState {
  blocks: Block[]
  sections: PageSection[]
  theme: string
  selectedBlockId: string | null
  collapsedById: Record<string, boolean>
  isDragging: boolean
  mode: EditorMode
  draftPageId: string | null
  draftUpdatedAt: string | null
  /** Histórico em memória (não persistido) — undo/redo de conteúdo. */
  past: PageSnapshot[]
  future: PageSnapshot[]
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
  setSections: (sections: PageSection[]) => void
  addSection: () => void
  setSectionLayout: (sectionId: string, layout: PageSection['layout']) => void
  updateBlockRect: (id: string, rect: SectionRect) => void
  setPage: (page: { blocks: Block[]; sections?: PageSection[]; theme?: string }) => void
  selectBlock: (id: string | null) => void
  toggleBlockCollapsed: (id: string) => void
  setBlockCollapsed: (id: string, collapsed: boolean) => void
  setDragging: (isDragging: boolean) => void
  setMode: (mode: EditorMode) => void
  setDraftContext: (pageId: string | null, updatedAt?: string | null) => void
  resetEditor: () => void
  undo: () => void
  redo: () => void
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
  sections: [],
  theme: DEFAULT_THEME_ID,
  selectedBlockId: null,
  collapsedById: {},
  isDragging: false,
  mode: 'edit',
  draftPageId: null,
  draftUpdatedAt: null,
  past: [],
  future: [],
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

const HISTORY_LIMIT = 50
const HISTORY_COALESCE_MS = 1200

// Controle de coalescência: bursts da mesma ação no mesmo alvo (digitação,
// drag) viram um único passo de undo — a janela se renova a cada mutação.
let lastHistoryKey = ''
let lastHistoryAt = 0

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => {
      /**
       * Aplica uma mutação de conteúdo com histórico: empilha o snapshot
       * pré-mutação em `past` e limpa `future`. No-ops (mutação retorna o
       * mesmo blocks/sections/theme) não geram entrada.
       */
      const commit = (
        historyKey: string,
        mutate: (state: EditorStore) => Partial<EditorStoreState>,
      ) =>
        set((state) => {
          const patch = mutate(state)
          const sameItems = <T,>(next: T[] | undefined, prev: T[]) =>
            next === undefined ||
            next === prev ||
            (next.length === prev.length && next.every((item, index) => item === prev[index]))
          const unchanged =
            sameItems(patch.blocks, state.blocks) &&
            sameItems(patch.sections, state.sections) &&
            (patch.theme === undefined || patch.theme === state.theme)
          if (unchanged) {
            return state
          }

          const now = Date.now()
          const coalesce = historyKey === lastHistoryKey && now - lastHistoryAt < HISTORY_COALESCE_MS
          lastHistoryKey = historyKey
          lastHistoryAt = now
          const snapshot: PageSnapshot = {
            blocks: state.blocks,
            sections: state.sections,
            theme: state.theme,
          }

          return {
            ...patch,
            past: coalesce ? state.past : [...state.past.slice(-(HISTORY_LIMIT - 1)), snapshot],
            future: [],
          }
        })

      return {
        ...initialEditorState,
        addBlock: (block) =>
          commit(`add:${block.id}`, (state) => {
            if (state.blocks.length >= MAX_BLOCKS) {
              return state
            }

          // New blocks append to the last section so they keep a valid
          // placement when the page already carries explicit sections.
          const lastSectionId = state.sections.at(-1)?.id
          const placedBlock = lastSectionId && !block.sectionId
            ? { ...block, sectionId: lastSectionId }
            : block

          return {
            blocks: [...state.blocks, placedBlock],
            draftUpdatedAt: nowIsoString(),
          }
          }),
        updateBlock: (id, updater) =>
          commit(`update:${id}`, (state) => ({
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
          commit(`remove:${id}`, (state) => {
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
          commit(`move:${id}`, (state) => {
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
          commit(`move:${id}`, (state) => {
            const nextBlocks = moveBlockByOffset(state.blocks, id, 1)
            if (nextBlocks === state.blocks) {
              return state
            }

            return {
              blocks: nextBlocks,
              draftUpdatedAt: nowIsoString(),
            }
          }),
        reorderBlocks: (blocks) =>
          commit(`reorder:${Date.now()}`, () => ({ blocks, draftUpdatedAt: nowIsoString() })),
        setBlocks: (blocks) =>
          commit(`setBlocks:${Date.now()}`, (state) => ({
            blocks,
            selectedBlockId: null,
            collapsedById: pruneCollapsedById(state.collapsedById, blocks),
            draftUpdatedAt: nowIsoString(),
          })),
        setTheme: (themeId) =>
          commit('theme', (state) => {
            const normalizedThemeId = resolveThemeId(themeId)
            if (state.theme === normalizedThemeId) {
              return state
            }

            return {
              theme: normalizedThemeId,
              draftUpdatedAt: nowIsoString(),
            }
          }),
        setSections: (sections) =>
          commit(`sections:${Date.now()}`, () => ({
            sections,
            draftUpdatedAt: nowIsoString(),
          })),
        addSection: () =>
          commit(`section:add:${Date.now()}`, (state) => {
          const baseId = `secao-${state.sections.length + 1}`
          let id = baseId
          let counter = state.sections.length + 1
          while (state.sections.some((section) => section.id === id)) {
            counter += 1
            id = `secao-${counter}`
          }

          return {
            sections: [...state.sections, { id, layout: 'stack' }],
            draftUpdatedAt: nowIsoString(),
          }
        }),
        setSectionLayout: (sectionId, layout) =>
          commit(`section:layout:${sectionId}`, (state) => {
            const section = state.sections.find((current) => current.id === sectionId)
            if (!section || section.layout === layout) {
              return state
            }

            const nextSections = state.sections.map((current) =>
              current.id === sectionId ? { ...current, layout } : current,
            )

            // Switching to a placed layout auto-assigns rects to blocks that
            // don't have one yet (full width, sequential rows); rects are kept
            // when switching back to stack so nothing is lost.
            const cols = section.grid?.cols ?? 12
            const boundedW = Math.min(cols, 24)
            let nextRow = 1
            const blocks = state.blocks.map((block) => {
              if (block.sectionId !== sectionId || block.rect) {
                return block
              }
              const rect = { col: 1, row: nextRow, w: boundedW, h: 4 }
              nextRow += 4 + 1
              return { ...block, rect }
            })

            return {
              sections: nextSections,
              blocks,
              draftUpdatedAt: nowIsoString(),
            }
          }),
        updateBlockRect: (id, rect) =>
          commit(`rect:${id}`, (state) => ({
            blocks: state.blocks.map((block) =>
              block.id === id
                ? {
                    ...block,
                    rect,
                    meta: { ...block.meta, updatedAt: Date.now() },
                  }
                : block,
            ),
            draftUpdatedAt: nowIsoString(),
          })),
        setPage: (page) =>
          commit(`setPage:${Date.now()}`, (state) => ({
            blocks: page.blocks,
            sections: page.sections ?? state.sections,
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
      resetEditor: () => {
        lastHistoryKey = ''
        lastHistoryAt = 0
        set({ ...initialEditorState })
      },
      undo: () =>
        set((state) => {
          const previous = state.past.at(-1)
          if (!previous) {
            return state
          }

          lastHistoryKey = ''
          lastHistoryAt = 0
          const snapshot: PageSnapshot = {
            blocks: state.blocks,
            sections: state.sections,
            theme: state.theme,
          }

          return {
            blocks: previous.blocks,
            sections: previous.sections,
            theme: previous.theme,
            selectedBlockId: null,
            collapsedById: pruneCollapsedById(state.collapsedById, previous.blocks),
            past: state.past.slice(0, -1),
            future: [...state.future, snapshot],
            draftUpdatedAt: nowIsoString(),
          }
        }),
      redo: () =>
        set((state) => {
          const next = state.future.at(-1)
          if (!next) {
            return state
          }

          lastHistoryKey = ''
          lastHistoryAt = 0
          const snapshot: PageSnapshot = {
            blocks: state.blocks,
            sections: state.sections,
            theme: state.theme,
          }

          return {
            blocks: next.blocks,
            sections: next.sections,
            theme: next.theme,
            selectedBlockId: null,
            collapsedById: pruneCollapsedById(state.collapsedById, next.blocks),
            past: [...state.past, snapshot],
            future: state.future.slice(0, -1),
            draftUpdatedAt: nowIsoString(),
          }
        }),
      }
    },
    {
      name: 'editor-draft',
      storage: persistStorage,
      partialize: (state) => ({
        blocks: state.blocks,
        sections: state.sections,
        theme: state.theme,
        collapsedById: state.collapsedById,
        draftPageId: state.draftPageId,
        draftUpdatedAt: state.draftUpdatedAt,
      }),
    },
  ),
)
