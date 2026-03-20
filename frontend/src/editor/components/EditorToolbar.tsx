import { useCallback, useEffect, useRef, useState } from 'react'
import { Eye, LoaderCircle, Pencil, Plus, Save, Type, Image as ImageIcon } from 'lucide-react'
import { MAX_BLOCKS, type BlockType } from '@/editor/types'
import { useEditorStore } from '@/editor/store/editorStore'
import { createBlock } from '@/editor/utils/blockFactory'

type AvailableBlockType = Extract<BlockType, 'text' | 'image'>

interface AddBlockOption {
  type: AvailableBlockType
  label: string
  icon: typeof Type
}

const addBlockOptions: AddBlockOption[] = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'image', label: 'Imagem', icon: ImageIcon },
]

interface ToolbarControlsProps {
  mode: 'edit' | 'preview'
  blocksCount: number
  isAddMenuOpen: boolean
  isAtBlockLimit: boolean
  menuPlacement: 'down' | 'up'
  isSaving: boolean
  hasPageId: boolean
  toggleMode: () => void
  toggleAddMenu: () => void
  addFromOption: (type: AvailableBlockType) => void
  onSave: () => void
}

function AddMenu({
  isOpen,
  isDisabled,
  placement,
  onSelect,
}: {
  isOpen: boolean
  isDisabled: boolean
  placement: 'down' | 'up'
  onSelect: (type: AvailableBlockType) => void
}) {
  if (!isOpen) {
    return null
  }

  const positionClassName =
    placement === 'up'
      ? 'absolute bottom-full left-0 z-30 mb-2 w-44 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl backdrop-blur-sm'
      : 'absolute left-0 top-full z-30 mt-2 w-44 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl backdrop-blur-sm'

  return (
    <div className={positionClassName}>
      {addBlockOptions.map((option) => {
        const Icon = option.icon

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            disabled={isDisabled}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon size={15} className="text-primary" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function ToolbarControls({
  mode,
  blocksCount,
  isAddMenuOpen,
  isAtBlockLimit,
  menuPlacement,
  isSaving,
  hasPageId,
  toggleMode,
  toggleAddMenu,
  addFromOption,
  onSave,
}: ToolbarControlsProps) {
  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={toggleAddMenu}
          disabled={mode !== 'edit' || isAtBlockLimit}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Adicionar bloco"
          aria-expanded={isAddMenuOpen}
          aria-haspopup="menu"
        >
          <Plus size={18} />
        </button>

        <AddMenu
          isOpen={isAddMenuOpen}
          isDisabled={isAtBlockLimit}
          placement={menuPlacement}
          onSelect={addFromOption}
        />
      </div>

      <button
        type="button"
        onClick={toggleMode}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-primary/25 bg-white/80 px-4 text-sm font-medium text-text transition-colors hover:bg-primary/10"
      >
        {mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
        {mode === 'edit' ? 'Preview' : 'Editar'}
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-primary/35 bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
        {isSaving ? 'Salvando...' : hasPageId ? 'Salvar' : 'Salvar pagina'}
      </button>

      <span className="rounded-xl border border-primary/15 bg-white/70 px-3 py-2 text-xs font-medium text-text-light">
        {blocksCount}/{MAX_BLOCKS}
      </span>
    </>
  )
}

interface EditorToolbarProps {
  onSave: () => void
  isSaving: boolean
  hasPageId: boolean
}

export function EditorToolbar({ onSave, isSaving, hasPageId }: EditorToolbarProps) {
  const blocksCount = useEditorStore((state) => state.blocks.length)
  const mode = useEditorStore((state) => state.mode)
  const addBlock = useEditorStore((state) => state.addBlock)
  const selectBlock = useEditorStore((state) => state.selectBlock)
  const setMode = useEditorStore((state) => state.setMode)

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const isAtBlockLimit = blocksCount >= MAX_BLOCKS

  useEffect(() => {
    if (!isAddMenuOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (!toolbarRef.current?.contains(target)) {
        setIsAddMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isAddMenuOpen])

  const focusBlockEditor = useCallback((blockId: string, type: AvailableBlockType) => {
    if (typeof document === 'undefined') {
      return
    }

    const selector =
      type === 'text'
        ? `[data-block-id="${blockId}"] [contenteditable="true"]`
        : `[data-block-id="${blockId}"] input`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const focusTarget = document.querySelector(selector)
        if (!(focusTarget instanceof HTMLElement)) {
          return
        }

        focusTarget.focus()

        if (
          type === 'text' &&
          focusTarget instanceof HTMLDivElement &&
          typeof window.getSelection === 'function'
        ) {
          const selection = window.getSelection()
          if (!selection) {
            return
          }

          const range = document.createRange()
          range.selectNodeContents(focusTarget)
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      })
    })
  }, [])

  const addFromOption = useCallback((type: AvailableBlockType) => {
    const newBlock = createBlock(type)

    addBlock(newBlock)
    selectBlock(newBlock.id)
    focusBlockEditor(newBlock.id, type)
    setIsAddMenuOpen(false)
  }, [addBlock, focusBlockEditor, selectBlock])

  const toggleMode = useCallback(() => {
    setIsAddMenuOpen(false)
    setMode(mode === 'edit' ? 'preview' : 'edit')
  }, [mode, setMode])

  const toggleAddMenu = useCallback(() => {
    setIsAddMenuOpen((current) => !current)
  }, [])

  const isMenuVisible = mode === 'edit' && isAddMenuOpen

  return (
    <>
      <div ref={toolbarRef}>
        <div className="sticky top-24 z-30 hidden md:block">
          <div className="glass mx-auto mb-6 flex w-full max-w-4xl items-center justify-between rounded-2xl px-4 py-3">
            <p className="text-sm text-text-light">Monte sua carta com blocos</p>
            <div className="flex items-center gap-2">
              <ToolbarControls
                mode={mode}
                blocksCount={blocksCount}
                isAddMenuOpen={isMenuVisible}
                isAtBlockLimit={isAtBlockLimit}
                menuPlacement="down"
                isSaving={isSaving}
                hasPageId={hasPageId}
                toggleMode={toggleMode}
                toggleAddMenu={toggleAddMenu}
                addFromOption={addFromOption}
                onSave={onSave}
              />
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
          <div className="glass mx-auto flex w-full max-w-md items-center justify-between rounded-2xl px-3 py-3">
            <ToolbarControls
              mode={mode}
              blocksCount={blocksCount}
              isAddMenuOpen={isMenuVisible}
              isAtBlockLimit={isAtBlockLimit}
              menuPlacement="up"
              isSaving={isSaving}
              hasPageId={hasPageId}
              toggleMode={toggleMode}
              toggleAddMenu={toggleAddMenu}
              addFromOption={addFromOption}
              onSave={onSave}
            />
          </div>
        </div>
      </div>
    </>
  )
}
