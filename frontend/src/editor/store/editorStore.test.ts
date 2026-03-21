import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_BLOCKS } from '@/editor/types'
import { useEditorStore } from '@/editor/store/editorStore'
import { createBlock } from '@/editor/utils/blockFactory'

function resetStore() {
  useEditorStore.getState().resetEditor()
}

describe('editorStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('addBlock adiciona bloco e respeita MAX_BLOCKS', () => {
    const store = useEditorStore.getState()

    for (let i = 0; i < MAX_BLOCKS + 2; i += 1) {
      store.addBlock(createBlock('text'))
    }

    const state = useEditorStore.getState()
    expect(state.blocks).toHaveLength(MAX_BLOCKS)
    expect(state.draftUpdatedAt).not.toBeNull()
  })

  it('removeBlock remove e limpa selecao', () => {
    const first = createBlock('text')
    const second = createBlock('image')
    useEditorStore.getState().setBlocks([first, second])
    useEditorStore.getState().selectBlock(second.id)

    useEditorStore.getState().removeBlock(second.id)

    const state = useEditorStore.getState()
    expect(state.blocks.map((block) => block.id)).toEqual([first.id])
    expect(state.selectedBlockId).toBeNull()
  })

  it('reorderBlocks troca ordem inteira', () => {
    const first = createBlock('text')
    const second = createBlock('image')
    useEditorStore.getState().setBlocks([first, second])

    useEditorStore.getState().reorderBlocks([second, first])

    expect(useEditorStore.getState().blocks.map((block) => block.id)).toEqual([second.id, first.id])
  })

  it('updateBlock atualiza meta.updatedAt', () => {
    const nowSpy = vi.spyOn(Date, 'now')
    nowSpy.mockReturnValueOnce(1_000).mockReturnValueOnce(2_000)

    const block = createBlock('text')
    useEditorStore.getState().setBlocks([block])

    useEditorStore.getState().updateBlock(block.id, (current) => {
      if (current.type !== 'text') {
        return current
      }

      return {
        ...current,
        props: { ...current.props, text: 'Atualizado' },
      }
    })

    const updated = useEditorStore.getState().blocks[0]
    expect(updated.type).toBe('text')
    if (updated.type === 'text') {
      expect(updated.props.text).toBe('Atualizado')
    }
    expect(updated.meta.updatedAt).toBe(2_000)

    nowSpy.mockRestore()
  })

  it('persist partialize salva apenas campos persistentes', () => {
    vi.useFakeTimers()

    const block = createBlock('text')
    useEditorStore.getState().setBlocks([block])
    useEditorStore.getState().setTheme('ocean-breeze')
    useEditorStore.getState().selectBlock(block.id)
    useEditorStore.getState().setMode('preview')
    useEditorStore.getState().setDragging(true)
    useEditorStore.getState().setDraftContext('507f1f77bcf86cd799439111', '2026-03-20T10:00:00.000Z')

    vi.runAllTimers()

    const persistedRaw = window.localStorage.getItem('editor-draft')
    expect(persistedRaw).not.toBeNull()

    const persisted = JSON.parse(persistedRaw as string) as {
      state: Record<string, unknown>
    }

    expect(persisted.state.blocks).toBeDefined()
    expect(persisted.state.theme).toBe('ocean-breeze')
    expect(persisted.state.draftPageId).toBe('507f1f77bcf86cd799439111')
    expect(persisted.state.draftUpdatedAt).toBe('2026-03-20T10:00:00.000Z')
    expect(persisted.state.selectedBlockId).toBeUndefined()
    expect(persisted.state.isDragging).toBeUndefined()
    expect(persisted.state.mode).toBeUndefined()

    vi.useRealTimers()
  })
})
