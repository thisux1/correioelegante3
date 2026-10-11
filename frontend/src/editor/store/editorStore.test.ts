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

describe('sections & placement', () => {
  beforeEach(() => {
    resetStore()
  })

  it('addBlock herda sectionId da ultima secao quando existem secoes', () => {
    useEditorStore.getState().setSections([{ id: 'a', layout: 'stack' }])
    const block = createBlock('text')
    useEditorStore.getState().addBlock(block)

    expect(useEditorStore.getState().blocks[0].sectionId).toBe('a')
  })

  it('addSection cria id unico com layout stack', () => {
    useEditorStore.getState().setSections([{ id: 'secao-1', layout: 'grid' }])
    useEditorStore.getState().addSection()

    const sections = useEditorStore.getState().sections
    expect(sections).toHaveLength(2)
    expect(sections[1].layout).toBe('stack')
    expect(sections[1].id).not.toBe('secao-1')
  })

  it('setSectionLayout para grid auto-atribui rect aos blocos da secao', () => {
    const b1 = { ...createBlock('text'), sectionId: 's' }
    const b2 = { ...createBlock('image'), sectionId: 's' }
    const b3 = { ...createBlock('timer'), sectionId: 'outra' }
    useEditorStore.getState().setBlocks([b1, b2, b3])
    useEditorStore.getState().setSections([{ id: 's', layout: 'stack' }])

    useEditorStore.getState().setSectionLayout('s', 'grid')

    const state = useEditorStore.getState()
    expect(state.sections[0].layout).toBe('grid')
    expect(state.blocks[0].rect).toBeDefined()
    expect(state.blocks[1].rect).toBeDefined()
    expect(state.blocks[2].rect).toBeUndefined()
    expect(state.blocks[1].rect!.row).toBeGreaterThan(state.blocks[0].rect!.row)
  })

  it('setSectionLayout preserva rects existentes', () => {
    const rect = { col: 3, row: 2, w: 4, h: 5 }
    const b1 = { ...createBlock('text'), sectionId: 's', rect }
    useEditorStore.getState().setBlocks([b1])
    useEditorStore.getState().setSections([{ id: 's', layout: 'stack' }])

    useEditorStore.getState().setSectionLayout('s', 'grid')
    expect(useEditorStore.getState().blocks[0].rect).toEqual(rect)
  })

  it('updateBlockRect atualiza placement e updatedAt', () => {
    const b1 = { ...createBlock('text'), sectionId: 's' }
    useEditorStore.getState().setBlocks([b1])

    const rect = { col: 5, row: 9, w: 6, h: 3 }
    useEditorStore.getState().updateBlockRect(b1.id, rect)

    const updated = useEditorStore.getState().blocks[0]
    expect(updated.rect).toEqual(rect)
    expect(updated.meta.updatedAt).toBeGreaterThanOrEqual(b1.meta.updatedAt)
  })
})
