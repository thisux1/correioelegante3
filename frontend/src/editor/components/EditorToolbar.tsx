import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Images,
  LoaderCircle,
  Music2,
  Palette,
  Pencil,
  Plus,
  Save,
  Timer,
  Video,
  Type,
  CreditCard,
} from 'lucide-react'
import { MAX_BLOCKS, type BlockType } from '@/editor/types'
import { useEditorStore } from '@/editor/store/editorStore'
import { createBlock } from '@/editor/utils/blockFactory'
import { getThemeById, resolveThemeId, themeCatalog } from '@/editor/themes'
import { useShallow } from 'zustand/react/shallow'

type AvailableBlockType = Extract<BlockType, 'text' | 'image' | 'timer' | 'gallery' | 'music' | 'video'>

interface AddBlockOption {
  type: AvailableBlockType
  label: string
  icon: typeof Type
}

const addBlockOptions: AddBlockOption[] = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'image', label: 'Imagem', icon: ImageIcon },
  { type: 'timer', label: 'Timer', icon: Timer },
  { type: 'gallery', label: 'Galeria', icon: Images },
  { type: 'music', label: 'Musica', icon: Music2 },
  { type: 'video', label: 'Video', icon: Video },
]

interface ToolbarControlsProps {
  shouldReduceMotion: boolean
  isVerticalDock: boolean
  mode: 'edit' | 'preview'
  blocksCount: number
  isAddMenuOpen: boolean
  isThemeMenuOpen: boolean
  isAtBlockLimit: boolean
  menuPlacement: 'down' | 'up' | 'left'
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  hasPageId: boolean
  selectedThemeId: string
  toggleMode: () => void
  toggleAddMenu: () => void
  toggleThemeMenu: () => void
  addFromOption: (type: AvailableBlockType) => void
  onSelectTheme: (themeId: string) => void
  onSave: () => void
  showPublishCta: boolean
  onPublishCtaClick: () => void
}

function AddMenu({
  isDisabled,
  placement,
  onSelect,
  shouldReduceMotion,
}: {
  isDisabled: boolean
  placement: 'down' | 'up' | 'left'
  onSelect: (type: AvailableBlockType) => void
  shouldReduceMotion: boolean
}) {
  const positionClassName =
    placement === 'left'
      ? 'absolute right-full top-0 z-30 mr-2 w-44 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl'
      : placement === 'up'
      ? 'absolute bottom-full left-0 z-30 mb-2 w-44 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl'
      : 'absolute left-0 top-full z-30 mt-2 w-44 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl'

  const initialMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: 6 }
      : { opacity: 0, y: placement === 'up' ? 6 : -6 }
    : placement === 'left'
      ? { opacity: 0, x: 14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? 16 : -16, scale: 0.985 }

  const exitMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: -6 }
      : { opacity: 0, y: placement === 'up' ? -6 : 6 }
    : placement === 'left'
      ? { opacity: 0, x: -14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? -16 : 16, scale: 0.985 }

  const animateMotion = placement === 'left' ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }

  return (
    <motion.div
      className={positionClassName}
      role="menu"
      style={placement === 'left' ? { originX: 1, originY: 0.5 } : { originY: placement === 'up' ? 1 : 0 }}
      initial={initialMotion}
      animate={animateMotion}
      exit={exitMotion}
      transition={shouldReduceMotion ? { duration: 0.2, ease: [0.19, 1, 0.22, 1] } : { type: 'spring', stiffness: 220, damping: 26, mass: 1 } }
    >
      {addBlockOptions.map((option, optionIndex) => {
        const Icon = option.icon

        return (
          <motion.button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            disabled={isDisabled}
            role="menuitem"
            initial={shouldReduceMotion ? { opacity: 0, y: 4 } : { opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={shouldReduceMotion ? undefined : { x: 2 }}
            transition={shouldReduceMotion ? { duration: 0.12, delay: 0.012 * optionIndex, ease: [0.19, 1, 0.22, 1] } : { type: 'spring', stiffness: 290, damping: 24, mass: 0.9, delay: 0.035 * optionIndex }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon size={15} className="text-primary" />
            {option.label}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

function ThemeMenu({
  placement,
  selectedThemeId,
  onSelect,
  shouldReduceMotion,
}: {
  placement: 'down' | 'up' | 'left'
  selectedThemeId: string
  onSelect: (themeId: string) => void
  shouldReduceMotion: boolean
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedIndex = Math.max(
    0,
    themeCatalog.findIndex((theme) => theme.id === selectedThemeId),
  )

  const focusItemByIndex = (index: number) => {
    const total = themeCatalog.length
    if (total === 0) {
      return
    }

    const wrapped = ((index % total) + total) % total
    itemRefs.current[wrapped]?.focus()
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      itemRefs.current[selectedIndex]?.focus()
    })
  }, [selectedIndex])

  const positionClassName =
    placement === 'left'
      ? 'absolute right-full top-0 z-30 mr-2 w-56 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl'
      : placement === 'up'
      ? 'absolute bottom-full left-0 z-30 mb-2 w-56 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl'
      : 'absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-primary/20 bg-white/95 p-2 shadow-xl'

  const initialMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: 6 }
      : { opacity: 0, y: placement === 'up' ? 6 : -6 }
    : placement === 'left'
      ? { opacity: 0, x: 14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? 16 : -16, scale: 0.985 }

  const exitMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: -6 }
      : { opacity: 0, y: placement === 'up' ? -6 : 6 }
    : placement === 'left'
      ? { opacity: 0, x: -14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? -16 : 16, scale: 0.985 }

  const animateMotion = placement === 'left' ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }

  return (
    <motion.div
      className={positionClassName}
      role="menu"
      aria-label="Escolher tema"
      style={placement === 'left' ? { originX: 1, originY: 0.5 } : { originY: placement === 'up' ? 1 : 0 }}
      initial={initialMotion}
      animate={animateMotion}
      exit={exitMotion}
      transition={shouldReduceMotion ? { duration: 0.2, ease: [0.19, 1, 0.22, 1] } : { type: 'spring', stiffness: 220, damping: 26, mass: 1 } }
    >
      {themeCatalog.map((theme, index) => {
        const isSelected = selectedThemeId === theme.id

        return (
          <motion.button
            key={theme.id}
            type="button"
            onClick={() => onSelect(theme.id)}
            ref={(element) => {
              itemRefs.current[index] = element
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                focusItemByIndex(index + 1)
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                focusItemByIndex(index - 1)
              } else if (event.key === 'Home') {
                event.preventDefault()
                focusItemByIndex(0)
              } else if (event.key === 'End') {
                event.preventDefault()
                focusItemByIndex(themeCatalog.length - 1)
              }
            }}
            role="menuitemradio"
            aria-checked={isSelected}
            aria-label={`Tema ${theme.name}`}
            tabIndex={isSelected ? 0 : -1}
            initial={shouldReduceMotion ? { opacity: 0, y: 4 } : { opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={shouldReduceMotion ? undefined : { x: 2 }}
            transition={shouldReduceMotion ? { duration: 0.12, delay: 0.012 * index, ease: [0.19, 1, 0.22, 1] } : { type: 'spring', stiffness: 290, damping: 24, mass: 0.9, delay: 0.03 * index }}
            className={`flex w-full items-center gap-3 rounded-lg border px-2 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:bg-primary/5 ${
              isSelected
                ? 'border-primary/35 bg-primary/10 text-primary'
                : 'border-transparent text-text hover:border-primary/20'
            }`}
          >
            <span
              className="h-8 w-8 rounded-md border border-white/70 shadow-sm"
              style={{ background: theme.thumbnail }}
              aria-hidden="true"
            />
            <span className="flex-1">
              <span className="block truncate font-medium">{theme.name}</span>
              <span className="block text-xs text-text-light">Fonte e paleta</span>
            </span>
            {isSelected ? <Check size={14} /> : null}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

function ToolbarControls({
  shouldReduceMotion,
  isVerticalDock,
  mode,
  blocksCount,
  isAddMenuOpen,
  isThemeMenuOpen,
  isAtBlockLimit,
  menuPlacement,
  saveState,
  hasPageId,
  selectedThemeId,
  toggleMode,
  toggleAddMenu,
  toggleThemeMenu,
  addFromOption,
  onSelectTheme,
  onSave,
  showPublishCta,
  onPublishCtaClick,
}: ToolbarControlsProps) {
  const useCompactButtons = isVerticalDock
  const normalizedSelectedThemeId = resolveThemeId(selectedThemeId)
  const selectedTheme = getThemeById(normalizedSelectedThemeId)

  const isSaving = saveState === 'saving'
  const saveLabel = isSaving ? 'Salvando...' : saveState === 'saved' ? 'Salvo' : saveState === 'error' ? 'Erro ao salvar' : 'Salvar'

  const compactBtnBase = 'flex w-full min-h-11 items-center justify-center rounded-lg bg-transparent p-0 text-primary transition-colors hover:bg-white/60 active:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40'
  const compactBtnAccent = 'flex w-full min-h-11 items-center justify-center rounded-lg bg-primary p-0 text-white shadow-[0_8px_20px_-10px_rgba(236,72,153,0.5)] transition-colors hover:bg-primary-dark'
  const separator = isVerticalDock ? <div className="h-px w-4/5 self-center bg-primary/10" /> : null

  return (
    <>
      <div className={`relative${isVerticalDock ? ' w-full' : ''}`}>
        <button
          type="button"
          onClick={toggleAddMenu}
          disabled={mode !== 'edit' || isAtBlockLimit}
          className={useCompactButtons
            ? compactBtnBase
            : 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 p-0 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40'}
          aria-label="Adicionar bloco"
          aria-expanded={isAddMenuOpen}
          aria-haspopup="menu"
        >
          <Plus size={18} />
        </button>

        <AnimatePresence initial={false}>
          {isAddMenuOpen ? (
            <AddMenu
              isDisabled={isAtBlockLimit}
              placement={menuPlacement}
              onSelect={addFromOption}
              shouldReduceMotion={shouldReduceMotion}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <div className={`relative${isVerticalDock ? ' w-full' : ''}`}>
        <button
          type="button"
          onClick={toggleThemeMenu}
          disabled={mode !== 'edit'}
          className={useCompactButtons
            ? compactBtnBase
            : 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/25 bg-white/80 px-3 text-sm font-medium text-text transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40'}
          aria-label="Selecionar tema"
          aria-expanded={isThemeMenuOpen}
          aria-haspopup="menu"
          title={selectedTheme.name}
        >
          <Palette size={16} className="text-primary" />
          {!useCompactButtons ? (
            <span
              className="h-4 w-4 rounded-full border border-white/70"
              style={{ background: selectedTheme.thumbnail }}
              aria-hidden="true"
            />
          ) : null}
        </button>

        <AnimatePresence initial={false}>
          {isThemeMenuOpen ? (
            <ThemeMenu
              placement={menuPlacement}
              selectedThemeId={normalizedSelectedThemeId}
              onSelect={onSelectTheme}
              shouldReduceMotion={shouldReduceMotion}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {separator}

      {useCompactButtons ? (
        <button
          type="button"
          onClick={toggleMode}
          className={compactBtnAccent}
          aria-label={mode === 'edit' ? 'Ir para preview' : 'Ir para edicao'}
          title={mode === 'edit' ? 'Preview' : 'Editar'}
        >
          {mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleMode}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/35 bg-primary px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(236,72,153,0.7)] transition-colors hover:bg-primary-dark"
        >
          {mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
          {mode === 'edit' ? 'Preview' : 'Editar'}
        </button>
      )}

      <motion.button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        whileTap={shouldReduceMotion ? undefined : { scale: isSaving ? 1 : 0.97 }}
        animate={shouldReduceMotion
          ? { borderColor: saveState === 'saved' ? 'rgba(16,185,129,0.45)' : saveState === 'error' ? 'rgba(239,68,68,0.45)' : 'rgba(236,72,153,0.3)' }
          : saveState === 'saved'
            ? { scale: [1, 1.03, 1], borderColor: 'rgba(16,185,129,0.45)' }
            : saveState === 'error'
              ? { x: [0, -2, 2, 0], borderColor: 'rgba(239,68,68,0.45)' }
              : { scale: 1, x: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.26, ease: [0.19, 1, 0.22, 1] }}
        className={useCompactButtons
          ? `${compactBtnBase} disabled:opacity-60`
          : 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-white/90 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60'}
        aria-label={isSaving ? 'Salvando pagina' : 'Salvar pagina'}
        title={saveLabel}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isSaving ? (
            <motion.span key="saving-icon" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <LoaderCircle size={16} className="animate-spin" />
            </motion.span>
          ) : saveState === 'saved' ? (
            <motion.span key="saved-icon" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Check size={16} />
            </motion.span>
          ) : (
            <motion.span key="default-icon" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Save size={16} />
            </motion.span>
          )}
        </AnimatePresence>
        {!useCompactButtons ? saveLabel : null}
      </motion.button>

      {showPublishCta ? (
        <>
          {separator}
          <button
            type="button"
            onClick={onPublishCtaClick}
            className={useCompactButtons
              ? 'flex w-full min-h-11 items-center justify-center rounded-lg bg-amber-50/80 p-0 text-amber-700 transition-colors hover:bg-amber-100 active:bg-amber-200'
              : 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100'}
            aria-label="Pagar e publicar"
            title="Pagar e publicar"
          >
            <CreditCard size={16} />
            {!useCompactButtons ? 'Pagar e publicar' : null}
          </button>
        </>
      ) : null}

      {separator}

      <span
        className={`${useCompactButtons ? 'w-full text-center' : ''} rounded-lg px-2.5 py-1.5 text-xs font-medium ${saveState === 'error'
          ? 'bg-red-50/80 text-red-600'
          : saveState === 'saved'
            ? 'bg-emerald-50/80 text-emerald-700'
            : isSaving
              ? 'bg-primary/5 text-primary'
              : 'text-text-muted'}`}
        aria-live="polite"
      >
        {saveState === 'error' ? 'Erro' : isSaving ? '...' : saveState === 'saved' ? '✓' : hasPageId ? 'Auto' : '—'}
      </span>

      <span className={`${useCompactButtons ? 'w-full text-center' : ''} rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted`}>
        {blocksCount}/{MAX_BLOCKS}
      </span>
    </>
  )
}

interface EditorToolbarProps {
  onSave: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  hasPageId: boolean
  selectedThemeId: string
  showPublishCta: boolean
  onPublishCtaClick: () => void
}

function useIsVerticalDockToolbar() {
  const [isVerticalDock, setIsVerticalDock] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia('(max-width: 1024px)')
    const sync = () => setIsVerticalDock(media.matches)
    sync()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }

    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  return isVerticalDock
}

function useToolbarMenus(toolbarRef: RefObject<HTMLDivElement | null>) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAddMenuOpen && !isThemeMenuOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (!toolbarRef.current?.contains(target)) {
        setIsAddMenuOpen(false)
        setIsThemeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isAddMenuOpen, isThemeMenuOpen, toolbarRef])

  const closeAllMenus = useCallback(() => {
    setIsAddMenuOpen(false)
    setIsThemeMenuOpen(false)
  }, [])

  const toggleAddMenu = useCallback(() => {
    setIsThemeMenuOpen(false)
    setIsAddMenuOpen((current) => !current)
  }, [])

  const toggleThemeMenu = useCallback(() => {
    setIsAddMenuOpen(false)
    setIsThemeMenuOpen((current) => !current)
  }, [])

  return {
    isAddMenuOpen,
    isThemeMenuOpen,
    setIsAddMenuOpen,
    setIsThemeMenuOpen,
    closeAllMenus,
    toggleAddMenu,
    toggleThemeMenu,
  }
}

export function EditorToolbar({
  onSave,
  saveState,
  hasPageId,
  selectedThemeId,
  showPublishCta,
  onPublishCtaClick,
}: EditorToolbarProps) {
  const shouldReduceMotion = useReducedMotion()
  const { blocksCount, mode, addBlock, setTheme, selectBlock, setMode } = useEditorStore(
    useShallow((state) => ({
      blocksCount: state.blocks.length,
      mode: state.mode,
      addBlock: state.addBlock,
      setTheme: state.setTheme,
      selectBlock: state.selectBlock,
      setMode: state.setMode,
    })),
  )

  const toolbarRef = useRef<HTMLDivElement>(null)
  const isVerticalDock = useIsVerticalDockToolbar()
  const [isVerticalDockOpen, setIsVerticalDockOpen] = useState(true)
  const {
    isAddMenuOpen,
    isThemeMenuOpen,
    setIsThemeMenuOpen,
    closeAllMenus,
    toggleAddMenu,
    toggleThemeMenu,
  } = useToolbarMenus(toolbarRef)

  const isAtBlockLimit = blocksCount >= MAX_BLOCKS

  useEffect(() => {
    if (!isVerticalDock || isVerticalDockOpen) {
      return
    }

    closeAllMenus()
  }, [closeAllMenus, isVerticalDock, isVerticalDockOpen])

  const focusBlockEditor = useCallback((blockId: string, type: AvailableBlockType) => {
    if (typeof document === 'undefined') {
      return
    }

    const selector =
      type === 'text'
        ? `[data-block-id="${blockId}"] [contenteditable="true"]`
        : type === 'gallery'
          ? `[data-block-id="${blockId}"] input[type="url"]`
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
    closeAllMenus()
  }, [addBlock, closeAllMenus, focusBlockEditor, selectBlock])

  const handleSelectTheme = useCallback((themeId: string) => {
    setTheme(themeId)
    setIsThemeMenuOpen(false)
  }, [setIsThemeMenuOpen, setTheme])

  const toggleMode = useCallback(() => {
    closeAllMenus()
    setMode(mode === 'edit' ? 'preview' : 'edit')
  }, [closeAllMenus, mode, setMode])

  const isMenuVisible = isAddMenuOpen
  const isThemeVisible = isThemeMenuOpen

  return (
    <>
      <div ref={toolbarRef}>
        {!isVerticalDock ? (
          <div className="sticky top-24 z-30">
            <div className="glass mx-auto mb-6 flex w-full max-w-4xl items-center justify-between rounded-2xl px-4 py-3">
              <p className="text-sm text-text-light">Monte sua carta com blocos</p>
              <div className="flex items-center gap-2">
                <ToolbarControls
                  shouldReduceMotion={!!shouldReduceMotion}
                  isVerticalDock={false}
                  mode={mode}
                  blocksCount={blocksCount}
                  isAddMenuOpen={isMenuVisible}
                  isThemeMenuOpen={isThemeVisible}
                  isAtBlockLimit={isAtBlockLimit}
                  menuPlacement="down"
                  saveState={saveState}
                  hasPageId={hasPageId}
                  selectedThemeId={selectedThemeId}
                  toggleMode={toggleMode}
                  toggleAddMenu={toggleAddMenu}
                  toggleThemeMenu={toggleThemeMenu}
                  addFromOption={addFromOption}
                  onSelectTheme={handleSelectTheme}
                  onSave={onSave}
                  showPublishCta={showPublishCta}
                  onPublishCtaClick={onPublishCtaClick}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed right-0 top-16 bottom-0 z-40 flex items-start pointer-events-none" style={{ paddingTop: '1.5rem' }}>
            <motion.div
              id="editor-toolbar-vertical-dock"
              className="pointer-events-auto"
              initial={false}
              animate={isVerticalDockOpen
                ? { x: '0%' }
                : { x: '100%' }}
              transition={shouldReduceMotion
                ? { duration: 0.2, ease: [0.19, 1, 0.22, 1] }
                : { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }}
            >
              <div style={{ position: 'relative' }}>
                {/* Square tab — same glass material, seamless junction */}
                <button
                  type="button"
                  onClick={() => setIsVerticalDockOpen((current) => !current)}
                  className="flex items-center justify-center transition-colors hover:bg-white/80 active:bg-white/90"
                  aria-label={isVerticalDockOpen ? 'Fechar barra de ferramentas' : 'Abrir barra de ferramentas'}
                  aria-expanded={isVerticalDockOpen}
                  aria-controls="editor-toolbar-vertical-dock"
                  title={isVerticalDockOpen ? 'Fechar barra' : 'Abrir barra'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '100%',
                    width: '2.75rem',
                    height: '2.75rem',
                    marginRight: '-1px',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    background: 'var(--color-surface-glass)',
                    borderTop: '1px solid var(--color-border)',
                    borderLeft: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    borderRight: 'none',
                    borderTopLeftRadius: '0.875rem',
                    borderBottomLeftRadius: '0.875rem',
                    boxShadow: '-6px 4px 20px -8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <motion.span
                    animate={{ rotate: isVerticalDockOpen ? 0 : 180 }}
                    transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                    className="flex items-center justify-center"
                  >
                    <ChevronRight size={15} className="text-primary/60" />
                  </motion.span>
                </button>

                {/* Panel body — no left border, drawn manually below junction */}
                <div
                  style={{
                    position: 'relative',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    background: 'var(--color-surface-glass)',
                    borderTop: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomLeftRadius: '0.875rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {/* Left border — starts below the tab to keep junction seamless */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: 'calc(2.75rem - 1px)',
                      bottom: '0.5rem',
                      width: '1px',
                      background: 'var(--color-border)',
                      borderBottomLeftRadius: '0.875rem',
                      pointerEvents: 'none',
                    }}
                  />

                  <div className="flex flex-col items-stretch gap-0.5 p-1.5" style={{ minWidth: '3rem' }}>
                    <ToolbarControls
                      shouldReduceMotion={!!shouldReduceMotion}
                      isVerticalDock
                      mode={mode}
                      blocksCount={blocksCount}
                      isAddMenuOpen={isMenuVisible}
                      isThemeMenuOpen={isThemeVisible}
                      isAtBlockLimit={isAtBlockLimit}
                      menuPlacement="left"
                      saveState={saveState}
                      hasPageId={hasPageId}
                      selectedThemeId={selectedThemeId}
                      toggleMode={toggleMode}
                      toggleAddMenu={toggleAddMenu}
                      toggleThemeMenu={toggleThemeMenu}
                      addFromOption={addFromOption}
                      onSelectTheme={handleSelectTheme}
                      onSave={onSave}
                      showPublishCta={showPublishCta}
                      onPublishCtaClick={onPublishCtaClick}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}
