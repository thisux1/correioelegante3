import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Images,
  Music2,
  Palette,
  Pencil,
  Plus,
  Timer,
  Video,
  Type,
  CreditCard,
  Mail,
  Sparkles,
  Milestone,
  HelpCircle,
  Camera,
  Sun,
  Moon,
  Heart,
  Share2,
  MailOpen,
} from 'lucide-react'

import { MAX_BLOCKS, type BlockType, type PageStatus } from '@/editor/types'
import { useEditorStore } from '@/editor/store/editorStore'
import { createBlock } from '@/editor/utils/blockFactory'
import { getThemeById, resolveThemeId, themeCatalog } from '@/editor/themes'
import {
  encodePersonaThemeId,
  isPersonaThemeId,
  parsePersonaThemeId,
} from '@/editor/utils/colorHarmonizer'
import { useShallow } from 'zustand/react/shallow'

type AvailableBlockType = BlockType

interface AddBlockOption {
  type: AvailableBlockType
  label: string
  icon: typeof Type
}

const addBlockOptions: AddBlockOption[] = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'image', label: 'Imagem', icon: ImageIcon },
  { type: 'polaroid', label: 'Polaroid', icon: Camera },
  { type: 'envelope', label: 'Envelope', icon: Mail },
  { type: 'scratch', label: 'Raspadinha', icon: Sparkles },
  { type: 'timeline', label: 'Linha do Tempo', icon: Milestone },
  { type: 'quiz', label: 'Pergunta', icon: HelpCircle },
  { type: 'timer', label: 'Timer', icon: Timer },
  { type: 'gallery', label: 'Galeria', icon: Images },
  { type: 'music', label: 'Música', icon: Music2 },
  { type: 'video', label: 'Vídeo', icon: Video },
]

interface ToolbarControlsProps {
  shouldReduceMotion: boolean
  isVerticalDock: boolean
  mode: 'edit' | 'preview'
  blocksCount: number
  isAddMenuOpen: boolean
  isThemeMenuOpen: boolean
  isAtBlockLimit: boolean
  menuPlacement: 'down' | 'up' | 'left' | 'right'
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  hasPageId: boolean
  selectedThemeId: string
  status?: PageStatus
  toggleMode: () => void
  toggleAddMenu: () => void
  toggleThemeMenu: () => void
  addFromOption: (type: AvailableBlockType) => void
  onSelectTheme: (themeId: string) => void
  onSave?: () => void
  showPublishCta: boolean
  onPublishCtaClick: () => void
  onShareClick?: () => void
}


function AddMenu({
  isDisabled,
  placement,
  onSelect,
  shouldReduceMotion,
}: {
  isDisabled: boolean
  placement: 'down' | 'up' | 'left' | 'right'
  onSelect: (type: AvailableBlockType) => void
  shouldReduceMotion: boolean
}) {
  const positionClassName =
    placement === 'left'
      ? 'absolute right-full top-0 z-[170] mr-2 w-44 rounded-xl border border-border bg-surface text-text p-2 shadow-xl backdrop-blur-md'
      : placement === 'right'
      ? 'absolute left-full top-0 z-[170] ml-2 w-44 rounded-xl border border-border bg-surface text-text p-2 shadow-xl backdrop-blur-md'
      : placement === 'up'
      ? 'absolute bottom-full left-0 z-[170] mb-2 w-44 rounded-xl border border-border bg-surface text-text p-2 shadow-xl backdrop-blur-md'
      : 'absolute left-0 top-full z-[170] mt-2 w-44 rounded-xl border border-border bg-surface text-text p-2 shadow-xl backdrop-blur-md'

  const initialMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: 6 }
      : placement === 'right'
      ? { opacity: 0, x: -6 }
      : { opacity: 0, y: placement === 'up' ? 6 : -6 }
    : placement === 'left'
      ? { opacity: 0, x: 14, scale: 0.985 }
      : placement === 'right'
      ? { opacity: 0, x: -14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? 16 : -16, scale: 0.985 }

  const exitMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: -6 }
      : placement === 'right'
      ? { opacity: 0, x: 6 }
      : { opacity: 0, y: placement === 'up' ? -6 : 6 }
    : placement === 'left'
      ? { opacity: 0, x: -14, scale: 0.985 }
      : placement === 'right'
      ? { opacity: 0, x: 14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? -16 : 16, scale: 0.985 }

  const animateMotion = (placement === 'left' || placement === 'right') ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }

  return (
    <motion.div
      className={positionClassName}
      role="menu"
      style={placement === 'left' ? { originX: 1, originY: 0.5 } : placement === 'right' ? { originX: 0, originY: 0.5 } : { originY: placement === 'up' ? 1 : 0 }}
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
  placement: 'down' | 'up' | 'left' | 'right'
  selectedThemeId: string
  onSelect: (themeId: string) => void
  shouldReduceMotion: boolean
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const isPersonaSelected = isPersonaThemeId(selectedThemeId)
  const parsedPersona = parsePersonaThemeId(selectedThemeId)

  const personaPrimary = parsedPersona?.primary || '#e11d48'
  const personaMood = parsedPersona?.mood || 'light'

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
    if (!isPersonaSelected) {
      requestAnimationFrame(() => {
        itemRefs.current[selectedIndex]?.focus()
      })
    }
  }, [isPersonaSelected, selectedIndex])

  const positionClassName =
    placement === 'left'
      ? 'absolute right-full top-0 z-[170] mr-2 w-72 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-surface text-text p-3 shadow-2xl backdrop-blur-md'
      : placement === 'right'
      ? 'absolute left-full top-0 z-[170] ml-2 w-72 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-surface text-text p-3 shadow-2xl backdrop-blur-md'
      : placement === 'up'
      ? 'absolute bottom-full left-0 z-[170] mb-2 w-72 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-surface text-text p-3 shadow-2xl backdrop-blur-md'
      : 'absolute left-0 top-full z-[170] mt-2 w-72 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-surface text-text p-3 shadow-2xl backdrop-blur-md'

  const initialMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: 6 }
      : placement === 'right'
      ? { opacity: 0, x: -6 }
      : { opacity: 0, y: placement === 'up' ? 6 : -6 }
    : placement === 'left'
      ? { opacity: 0, x: 14, scale: 0.985 }
      : placement === 'right'
      ? { opacity: 0, x: -14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? 16 : -16, scale: 0.985 }

  const exitMotion = shouldReduceMotion
    ? placement === 'left'
      ? { opacity: 0, x: -6 }
      : placement === 'right'
      ? { opacity: 0, x: 6 }
      : { opacity: 0, y: placement === 'up' ? -6 : 6 }
    : placement === 'left'
      ? { opacity: 0, x: -14, scale: 0.985 }
      : placement === 'right'
      ? { opacity: 0, x: 14, scale: 0.985 }
      : { opacity: 0, y: placement === 'up' ? -16 : 16, scale: 0.985 }

  const animateMotion = (placement === 'left' || placement === 'right') ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }

  const atmosphereLabels: Record<string, string> = {
    petals: 'Pétalas de rosa',
    stars: 'Estrelas mágicas',
    sparkles: 'Brilho dourado',
    hearts: 'Corações suaves',
    sakura: 'Flores sakura',
    fireflies: 'Vaga-lumes',
    none: 'Clássico',
  }

  const personaQuickColors = [
    { label: 'Rosa Amor', color: '#e11d48' },
    { label: 'Magenta Pink', color: '#db2777' },
    { label: 'Lavanda', color: '#8b5cf6' },
    { label: 'Azul Céu', color: '#2563eb' },
    { label: 'Turquesa', color: '#06b6d4' },
    { label: 'Esmeralda', color: '#059669' },
    { label: 'Ouro Sunset', color: '#d97706' },
    { label: 'Terracota', color: '#ea580c' },
  ]

  const handleApplyPersonaColor = (color: string, mood: 'light' | 'dark' = personaMood) => {
    const newThemeId = encodePersonaThemeId(color, mood)
    onSelect(newThemeId)
  }

  return (
    <motion.div
      className={positionClassName}
      role="menu"
      aria-label="Escolher tema"
      style={placement === 'left' ? { originX: 1, originY: 0.5 } : placement === 'right' ? { originX: 0, originY: 0.5 } : { originY: placement === 'up' ? 1 : 0 }}
      initial={initialMotion}
      animate={animateMotion}
      exit={exitMotion}
      transition={shouldReduceMotion ? { duration: 0.2, ease: [0.19, 1, 0.22, 1] } : { type: 'spring', stiffness: 220, damping: 26, mass: 1 } }
    >
      {/* Seção Destacada: As Cores da Sua Pessoa */}
      <div className={`mb-3 rounded-xl border p-3 transition-colors ${
        isPersonaSelected
          ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm'
          : 'border-primary/20 bg-primary/5 hover:border-primary/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="fill-primary/20 text-primary" />
            <span className="text-xs font-bold text-text">As Cores da Sua Pessoa</span>
          </div>
          {isPersonaSelected ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
              <Check size={12} /> Ativo
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] leading-tight text-text-light">
          Escolha a cor favorita de quem você ama e o clima da carta:
        </p>

        {/* Swatches rápidos e seletor nativo */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {personaQuickColors.map((swatch) => {
              const isCurrent = personaPrimary.toLowerCase() === swatch.color.toLowerCase()
              return (
                <button
                  key={swatch.color}
                  type="button"
                  title={swatch.label}
                  onClick={() => handleApplyPersonaColor(swatch.color, personaMood)}
                  className={`h-6 w-6 rounded-full border shadow-xs transition-transform hover:scale-115 active:scale-95 ${
                    isCurrent ? 'ring-2 ring-primary ring-offset-1 border-white scale-110' : 'border-white/80'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  aria-label={`Cor ${swatch.label}`}
                />
              )
            })}
          </div>

          <label
            title="Escolher qualquer cor personalizada"
            className="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface shadow-xs transition-transform hover:scale-110 active:scale-95"
          >
            <input
              type="color"
              value={personaPrimary}
              onChange={(e) => handleApplyPersonaColor(e.target.value, personaMood)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Seletor de cor personalizada"
            />
            <span
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: personaPrimary }}
            />
          </label>
        </div>

        {/* Mood: Dia / Noite */}
        <div className="mt-2.5 flex items-center gap-1 rounded-lg bg-surface-raised border border-border/60 p-0.5">
          <button
            type="button"
            onClick={() => handleApplyPersonaColor(personaPrimary, 'light')}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              personaMood === 'light'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-light hover:text-text'
            }`}
          >
            <Sun size={12} /> Dia Suave
          </button>
          <button
            type="button"
            onClick={() => handleApplyPersonaColor(personaPrimary, 'dark')}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              personaMood === 'dark'
                ? 'bg-surface text-primary shadow-xs'
                : 'text-text-light hover:text-text'
            }`}
          >
            <Moon size={12} /> Noite Estrelada
          </button>
        </div>
      </div>

      {/* Divisor de catálogo */}
      <div className="my-2.5 flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-primary/15" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-light/60">
          Temas Prontos
        </span>
        <div className="h-px flex-1 bg-primary/15" />
      </div>

      {/* Catálogo de temas clássicos */}
      <div className="space-y-1">
        {themeCatalog.map((theme, index) => {
          const isSelected = !isPersonaSelected && selectedThemeId === theme.id

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
              className={`flex w-full items-center gap-3 rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:bg-primary/5 ${
                isSelected
                  ? 'border-primary/35 bg-primary/10 text-primary font-medium'
                  : 'border-transparent text-text hover:border-primary/20'
              }`}
            >
              <span
                className="h-7 w-7 rounded-md border border-white/70 shadow-xs shrink-0"
                style={{ background: theme.thumbnail }}
                aria-hidden="true"
              />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-xs font-semibold">{theme.name}</span>
                <span className="block text-[10px] text-text-light truncate">
                  {theme.atmosphere ? atmosphereLabels[theme.atmosphere] || 'Fonte e paleta' : 'Fonte e paleta'}
                </span>
              </span>
              {isSelected ? <Check size={14} /> : null}
            </motion.button>
          )
        })}
      </div>
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
  status = 'draft',
  toggleMode,
  toggleAddMenu,
  toggleThemeMenu,
  addFromOption,
  onSelectTheme,
  showPublishCta,
  onPublishCtaClick,
  onShareClick,
}: ToolbarControlsProps) {
  const useCompactButtons = isVerticalDock
  const normalizedSelectedThemeId = resolveThemeId(selectedThemeId)
  const selectedTheme = getThemeById(normalizedSelectedThemeId)

  const isSaving = saveState === 'saving'
  const isPublished = status === 'published'

  const compactBtnBase = 'flex w-full min-h-11 items-center justify-center rounded-lg bg-transparent p-0 text-primary transition-colors hover:bg-surface/60 active:bg-surface/80 disabled:cursor-not-allowed disabled:opacity-40'
  const compactBtnAccent = 'flex w-full min-h-11 items-center justify-center rounded-lg bg-primary p-0 text-white shadow-[0_8px_20px_-10px_rgba(236,72,153,0.5)] transition-colors hover:bg-primary-dark'
  const separator = isVerticalDock ? <div className="h-px w-4/5 self-center bg-primary/10" /> : null

  return (
    <>
      <div className={`relative${isVerticalDock ? ' w-full' : ''}`}>
        <motion.button
          layoutId="toolbar-btn-add"
          layout="position"
          type="button"
          onClick={toggleAddMenu}
          disabled={mode !== 'edit' || isAtBlockLimit}
          className={useCompactButtons
            ? compactBtnBase
            : 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 p-0 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'}
          aria-label="Adicionar bloco"
          aria-expanded={isAddMenuOpen}
          aria-haspopup="menu"
        >
          <Plus size={18} />
        </motion.button>

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
        <motion.button
          layoutId="toolbar-btn-theme"
          layout="position"
          type="button"
          onClick={toggleThemeMenu}
          disabled={mode !== 'edit'}
          className={useCompactButtons
            ? compactBtnBase
            : 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'}
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
        </motion.button>

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
        <motion.button
          layoutId="toolbar-btn-mode"
          layout="position"
          type="button"
          onClick={toggleMode}
          className={compactBtnAccent}
          aria-label={mode === 'edit' ? 'Ir para preview' : 'Ir para edicao'}
          title={mode === 'edit' ? 'Preview' : 'Editar'}
        >
          {mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
        </motion.button>
      ) : (
        <motion.button
          layoutId="toolbar-btn-mode"
          layout="position"
          type="button"
          onClick={toggleMode}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/35 bg-primary px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(236,72,153,0.7)] transition-colors hover:bg-primary-dark cursor-pointer"
        >
          {mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
          {mode === 'edit' ? 'Preview' : 'Editar'}
        </motion.button>
      )}

      {showPublishCta ? (
        <>
          {separator}
          {useCompactButtons ? (
            <motion.button
              layoutId="toolbar-btn-publish"
              layout="position"
              type="button"
              onClick={onPublishCtaClick}
              className={compactBtnAccent}
              aria-label="Publicar"
              title="Publicar"
            >
              <CreditCard size={16} />
            </motion.button>
          ) : (
            <motion.button
              layoutId="toolbar-btn-publish"
              layout="position"
              type="button"
              onClick={onPublishCtaClick}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/35 bg-primary px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(236,72,153,0.7)] transition-colors hover:bg-primary-dark cursor-pointer"
              aria-label="Publicar"
              title="Publicar"
            >
              <CreditCard size={16} />
              <span>Publicar</span>
            </motion.button>
          )}
        </>
      ) : null}

      {isPublished && onShareClick ? (
        <>
          {separator}
          {useCompactButtons ? (
            <motion.button
              layoutId="toolbar-btn-share"
              layout="position"
              type="button"
              onClick={onShareClick}
              className={compactBtnBase}
              title="Compartilhar carta"
              aria-label="Compartilhar carta"
            >
              <Share2 size={16} />
            </motion.button>
          ) : (
            <motion.button
              layoutId="toolbar-btn-share"
              layout="position"
              type="button"
              onClick={onShareClick}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-xs"
              title="Compartilhar carta"
              aria-label="Compartilhar carta"
            >
              <Share2 size={15} />
              <span>Compartilhar</span>
            </motion.button>
          )}
        </>
      ) : null}

      {separator}

      {/* Botão Minhas Cartas */}
      {useCompactButtons ? (
        <Link
          to="/profile"
          className={compactBtnBase}
          title="Minhas Cartas"
          aria-label="Minhas Cartas"
        >
          <MailOpen size={16} />
        </Link>
      ) : (
        <Link
          to="/profile"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text hover:bg-primary/10 hover:border-primary/30 transition-colors shadow-2xs"
          title="Minhas Cartas"
        >
          <MailOpen size={15} className="text-primary" />
          <span>Minhas Cartas</span>
        </Link>
      )}

      {separator}

      <motion.span
        layoutId="toolbar-status-text"
        layout="position"
        className={useCompactButtons
          ? `w-full text-center rounded-lg px-2.5 py-1.5 text-xs font-medium ${saveState === 'error'
            ? 'bg-red-50/80 text-red-600'
            : saveState === 'saved'
              ? 'bg-emerald-50/80 text-emerald-700'
              : isSaving
                ? 'bg-primary/5 text-primary'
                : 'text-text-muted'}`
          : `rounded-xl border px-3 py-2 text-xs font-medium ${saveState === 'error'
            ? 'border-red-200 bg-red-50 text-red-600'
            : saveState === 'saved'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : isSaving
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border bg-surface text-text-light'}`}
        aria-live="polite"
      >
        {useCompactButtons
          ? (saveState === 'error' ? 'Erro' : isSaving ? '...' : saveState === 'saved' ? '✓' : hasPageId ? 'Auto' : '—')
          : (saveState === 'error' ? 'Erro ao salvar' : isSaving ? 'Salvando...' : saveState === 'saved' ? 'Salvo agora' : hasPageId ? 'Auto-save ativo' : 'Nao salvo')}
      </motion.span>

      <motion.span
        layoutId="toolbar-count-text"
        layout="position"
        className={useCompactButtons
          ? 'w-full text-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted'
          : 'rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-light'}
      >
        {blocksCount}/{MAX_BLOCKS}
      </motion.span>
    </>
  )
}

export interface EditorToolbarProps {
  onSave?: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  hasPageId: boolean
  selectedThemeId: string
  showPublishCta: boolean
  onPublishCtaClick: () => void
  status?: PageStatus
  onShareClick?: () => void
}


function useLayoutBehavior() {
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia('(max-width: 1024px)')
    const handleMedia = () => setIsMobile(media.matches)
    handleMedia()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleMedia)
    } else {
      media.addListener(handleMedia)
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', handleMedia)
      } else {
        media.removeListener(handleMedia)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return { isMobile, isScrolled }
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
  status,
  onShareClick,
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
  const { isMobile, isScrolled } = useLayoutBehavior()
  
  const isDesktopScrolled = !isMobile && isScrolled
  const isVerticalDock = isMobile || isDesktopScrolled
  const dockSide = isMobile ? 'right' : 'left'
  
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
          <div className="z-30 h-24 mb-6 relative">
            <motion.div 
               layoutId="toolbar-glass-surface"
               layout="position"
               transition={{ type: 'spring', stiffness: 170, damping: 26, mass: 1.1 }}
               className="glass mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl px-4 py-3 origin-center"
               style={{ borderRadius: '1rem' }}
            >
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
                  status={status}
                  toggleMode={toggleMode}
                  toggleAddMenu={toggleAddMenu}
                  toggleThemeMenu={toggleThemeMenu}
                  addFromOption={addFromOption}
                  onSelectTheme={handleSelectTheme}
                  onSave={onSave}
                  showPublishCta={showPublishCta}
                  onPublishCtaClick={onPublishCtaClick}
                  onShareClick={onShareClick}
                />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className={`fixed ${dockSide === 'right' ? 'right-0' : 'left-0'} top-0 bottom-0 z-[150] flex items-center pointer-events-none`}>
            <AnimatePresence initial={false}>
              <motion.div
                key="vertical-dock"
                id="editor-toolbar-vertical-dock"
                className="pointer-events-auto"
                initial={dockSide === 'left' ? { x: '-100%', opacity: 0 } : { x: '100%', opacity: 0 }}
                animate={isVerticalDockOpen
                  ? { x: '0%', opacity: 1 }
                  : { x: dockSide === 'left' ? '-100%' : '100%', opacity: 1 }}
                exit={dockSide === 'left' ? { x: '-100%', opacity: 0 } : { x: '100%', opacity: 0 }}
                transition={shouldReduceMotion
                  ? { duration: 0.2, ease: [0.19, 1, 0.22, 1] }
                  : { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }}
              >
                <div style={{ position: 'relative' }}>
                  <motion.button
                    type="button"
                    onClick={() => setIsVerticalDockOpen((current) => !current)}
                    className="z-[160] flex w-11 h-11 items-center justify-center transition-colors hover:bg-surface/80 active:bg-surface/90"
                    aria-label={isVerticalDockOpen ? 'Fechar barra de ferramentas' : 'Abrir barra de ferramentas'}
                    aria-expanded={isVerticalDockOpen}
                    aria-controls="editor-toolbar-vertical-dock"
                    title={isVerticalDockOpen ? 'Fechar barra' : 'Abrir barra'}
                    initial={false}
                    style={{
                      zIndex: 160,
                      animation: `${dockSide === 'right' ? 'tab-slide-in-right' : 'tab-slide-in-left'} 0.4s cubic-bezier(0.19, 1, 0.22, 1) 0.4s both`,
                      position: 'absolute',
                      top: '1rem',
                      ...(dockSide === 'right' ? { right: '100%', marginRight: '-1px' } : { left: '100%', marginLeft: '-1px' }),
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      background: 'var(--color-surface-glass)',
                      borderTop: '1px solid var(--color-border)',
                      borderBottom: '1px solid var(--color-border)',
                      ...(dockSide === 'right' 
                         ? {
                            borderLeft: '1px solid var(--color-border)',
                            borderRight: 'none',
                            borderTopLeftRadius: '0.875rem',
                            borderBottomLeftRadius: '0.875rem',
                            boxShadow: '-6px 4px 20px -8px rgba(0, 0, 0, 0.08)'
                           } 
                         : {
                            borderRight: '1px solid var(--color-border)',
                            borderLeft: 'none',
                            borderTopRightRadius: '0.875rem',
                            borderBottomRightRadius: '0.875rem',
                            boxShadow: '6px 4px 20px -8px rgba(0, 0, 0, 0.08)'
                           }),
                    }}
                  >
                    <motion.span
                      animate={{ rotate: isVerticalDockOpen ? (dockSide === 'right' ? 0 : 180) : (dockSide === 'right' ? 180 : 0) }}
                      transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                      className="flex items-center justify-center"
                    >
                      <ChevronRight size={15} className="text-primary/60" />
                    </motion.span>
                  </motion.button>

                  {/* Panel body — no left/right border to connect with the screen edge */}
                  <motion.div
                    layoutId="toolbar-glass-surface"
                    layout="position"
                    transition={{ type: 'spring', stiffness: 170, damping: 26, mass: 1.1 }}
                    style={{
                      position: 'relative',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      background: 'var(--color-surface-glass)',
                      borderTop: '1px solid var(--color-border)',
                      borderBottom: '1px solid var(--color-border)',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderRadius: dockSide === 'right'
                        ? '0.875rem 0 0 0.875rem'
                        : '0 0.875rem 0.875rem 0',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Vertical connecting border — starts below/above the tab to keep junction seamless */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        ...(dockSide === 'right' ? { left: '0px' } : { right: '0px' }),
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'var(--color-border)',
                        pointerEvents: 'none',
                        clipPath: 'polygon(0 0.875rem, 100% 0.875rem, 100% 1rem, 0 1rem, 0 calc(1rem + 2.75rem), 100% calc(1rem + 2.75rem), 100% calc(100% - 0.875rem), 0 calc(100% - 0.875rem))',
                      }}
                    />

                    <div className="flex flex-col items-stretch gap-0.5 p-1.5" style={{ minWidth: '3.5rem' }}>
                      <ToolbarControls
                        shouldReduceMotion={!!shouldReduceMotion}
                        isVerticalDock
                        mode={mode}
                        blocksCount={blocksCount}
                        isAddMenuOpen={isMenuVisible}
                        isThemeMenuOpen={isThemeVisible}
                        isAtBlockLimit={isAtBlockLimit}
                        menuPlacement={dockSide === 'right' ? 'left' : 'down'}
                        saveState={saveState}
                        hasPageId={hasPageId}
                        selectedThemeId={selectedThemeId}
                        status={status}
                        toggleMode={toggleMode}
                        toggleAddMenu={toggleAddMenu}
                        toggleThemeMenu={toggleThemeMenu}
                        addFromOption={addFromOption}
                        onSelectTheme={handleSelectTheme}
                        onSave={onSave}
                        showPublishCta={showPublishCta}
                        onPublishCtaClick={onPublishCtaClick}
                        onShareClick={onShareClick}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  )
}
