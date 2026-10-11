import { memo, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import type { BlockComponentProps, PhotoBookBlockProps, PhotoBookPage } from '@/editor/types'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS } from '@/editor/components/EditorInputSection'

const MAX_PHOTO_BOOK_PAGES = 24
const TURN_DURATION_S = 0.72
const BOOK_PERSPECTIVE_PX = 2200

/**
 * Textura de capa "tecido/couro" em vinho profundo — gradientes em camadas
 * simulam a trama do tecido sem nenhuma imagem externa.
 */
const COVER_TEXTURE: CSSProperties = {
  backgroundImage: [
    'radial-gradient(ellipse at 28% 16%, rgba(255, 228, 236, 0.16), transparent 55%)',
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 2px, transparent 2px, transparent 6px)',
    'repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 5px)',
    'linear-gradient(150deg, #8f2047 0%, #651031 48%, #4c0519 100%)',
  ].join(', '),
}

/** Bordas de folhas empilhadas — linhas finas horizontais cor de papel. */
const PAGE_EDGE_TEXTURE: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, #fbf3ea 0px, #fbf3ea 1.5px, #d9c9b8 1.5px, #d9c9b8 3px)',
}

/** Textura sutil de papel — pontos quase invisíveis para quebrar a cor chapada. */
const PAPER_DOT_TEXTURE: CSSProperties = {
  backgroundImage: 'radial-gradient(rgba(112, 26, 53, 0.07) 0.8px, transparent 0.8px)',
  backgroundSize: '13px 13px',
}

interface TurnState {
  direction: 'next' | 'prev'
  front?: PhotoBookPage
  back?: PhotoBookPage
}

function createPageId() {
  return `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ---------------------------------------------------------------------------
// Página de papel (face estática ou face de folha animada)
// ---------------------------------------------------------------------------

interface PageFaceProps {
  page?: PhotoBookPage
  /** Lado do livro onde a página está assentada — controla sombra da calha e canto arredondado. */
  side: 'left' | 'right'
  /** 'first' = guarda inicial (lado esquerdo na primeira abertura), 'last' = guarda final. */
  endpaper?: 'first' | 'last'
  endpaperText?: string
  pageNumber?: number | null
}

function PageFace({ page, side, pageNumber = null, endpaper, endpaperText }: PageFaceProps) {
  const gutterStyle: CSSProperties =
    side === 'left'
      ? {
          right: 0,
          backgroundImage:
            'linear-gradient(to left, rgba(76,5,25,0.18), rgba(76,5,25,0.05) 55%, transparent)',
        }
      : {
          left: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(76,5,25,0.18), rgba(76,5,25,0.05) 55%, transparent)',
        }

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden bg-[#fffdfa] ${
        side === 'left' ? 'rounded-l-[3px]' : 'rounded-r-[3px]'
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={PAPER_DOT_TEXTURE} />

      {endpaper ? (
        <div className="relative flex h-full flex-col items-center justify-center gap-2.5 bg-[#fff5f7]/60 p-6 text-center">
          <div className="pointer-events-none absolute inset-4 rounded-md border border-[#f43f5e]/15" aria-hidden="true" />
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffe4ec] shadow-inner">
            <Heart size={18} className="text-[#f43f5e]" fill="currentColor" aria-hidden="true" />
          </div>
          {endpaperText ? (
            <p className="font-cursive text-2xl leading-tight text-[#9f3a58]/80">{endpaperText}</p>
          ) : null}
          {endpaper === 'last' ? (
            <p className="font-serif text-xs italic text-[#9f3a58]/60">por enquanto…</p>
          ) : null}
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col p-[7%] pb-[5%]">
          <div className="min-h-0 flex-1 rounded-[3px] bg-white p-[4%] shadow-[0_2px_10px_rgba(76,5,25,0.12)]">
            {page?.src ? (
              <img
                src={page.src}
                alt={page.caption || `Foto ${pageNumber ?? ''} do livro de memórias`}
                loading="lazy"
                className="h-full w-full rounded-[2px] object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-[2px] bg-[#ffe4ec] text-[#be123c]/60">
                <ImagePlus size={22} aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Foto</span>
              </div>
            )}
          </div>
          <p className="mt-[5%] min-h-[1.5em] text-center font-cursive text-xl leading-tight text-[#701a35] line-clamp-2">
            {page?.caption ?? ''}
          </p>
        </div>
      )}

      {/* Sombra da calha (lado da lombada) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-9" style={gutterStyle} />

      {typeof pageNumber === 'number' ? (
        <span
          aria-hidden="true"
          className={`absolute bottom-2 font-serif text-[10px] italic text-[#9f3a58]/55 ${
            side === 'left' ? 'left-3' : 'right-3'
          }`}
        >
          {pageNumber}
        </span>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Capa fechada do livro
// ---------------------------------------------------------------------------

interface BookCoverProps {
  title?: string
  subtitle?: string
  isEditMode: boolean
  reduceMotion: boolean
  onOpen: () => void
  onTitleChange?: (value: string) => void
  onSubtitleChange?: (value: string) => void
}

function BookCover({ title, subtitle, isEditMode, reduceMotion, onOpen, onTitleChange, onSubtitleChange }: BookCoverProps) {
  const resolvedTitle = title?.trim() || 'Livro de memórias'

  const inner = (
    <>
      {/* Lombada */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/45 via-white/[0.06] to-transparent" />
      <div aria-hidden="true" className="absolute inset-y-0 left-4 w-px bg-white/10" />

      {/* Bordas das folhas no lado direito */}
      <div aria-hidden="true" className="absolute inset-y-1.5 right-[3px] w-[5px] rounded-r-[2px]" style={PAGE_EDGE_TEXTURE} />

      {/* Moldura em relevo dupla */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-lg border border-[#e8c9a0]/30" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[22px] rounded-md border border-[#e8c9a0]/15" />

      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-10 text-center">
        <div className="wax-seal-3d flex h-12 w-12 items-center justify-center rounded-full">
          <Heart size={20} className="text-[#ffe4ec]" fill="currentColor" aria-hidden="true" />
        </div>

        {isEditMode ? (
          <input
            type="text"
            value={title ?? ''}
            onChange={(event) => onTitleChange?.(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            placeholder="Livro de memórias"
            aria-label="Título da capa"
            className="w-full border-b border-dashed border-transparent bg-transparent py-0.5 text-center font-cursive text-3xl font-bold text-[#ffe4ec] transition-colors placeholder:text-[#ffe4ec]/30 hover:border-[#e8c9a0]/40 focus:border-[#e8c9a0] focus:outline-none"
          />
        ) : (
          <h3 className="font-cursive text-3xl font-bold leading-tight text-[#ffe4ec] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            {resolvedTitle}
          </h3>
        )}

        <div aria-hidden="true" className="h-px w-16 bg-gradient-to-r from-transparent via-[#e8c9a0]/50 to-transparent" />

        {isEditMode ? (
          <input
            type="text"
            value={subtitle ?? ''}
            onChange={(event) => onSubtitleChange?.(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            placeholder="Folheie com carinho"
            aria-label="Subtítulo da capa"
            className="w-full border-b border-dashed border-transparent bg-transparent py-0.5 text-center font-serif text-sm italic text-[#fda4af] transition-colors placeholder:text-[#fda4af]/30 hover:border-[#e8c9a0]/40 focus:border-[#e8c9a0] focus:outline-none"
          />
        ) : subtitle ? (
          <p className="font-serif text-sm italic leading-snug text-[#fda4af]">{subtitle}</p>
        ) : null}

        {!isEditMode && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fda4af]/80">
            <BookOpen size={13} aria-hidden="true" />
            Toque para abrir
          </p>
        )}
      </div>
    </>
  )

  const coverClasses =
    'relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-r-2xl rounded-l-md shadow-[0_24px_50px_-18px_rgba(76,5,25,0.45)]'

  if (isEditMode) {
    return (
      <div className={coverClasses} style={COVER_TEXTURE} data-book-cover="closed">
        {inner}
      </div>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={reduceMotion ? undefined : { scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      aria-label="Abrir livro de fotos"
      className={`${coverClasses} block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2`}
      style={COVER_TEXTURE}
      data-book-cover="closed"
    >
      {inner}
    </motion.button>
  )
}

// ---------------------------------------------------------------------------
// Livro aberto — spread de duas páginas + folha animada
// ---------------------------------------------------------------------------

interface OpenBookViewProps {
  pages: PhotoBookPage[]
  spread: number
  turn: TurnState | null
  coverTitle?: string
  showKeyboardHint: boolean
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onLeafSettled: () => void
}

function OpenBookView({
  pages,
  spread,
  turn,
  coverTitle,
  showKeyboardHint,
  onPrev,
  onNext,
  onClose,
  onLeafSettled,
}: OpenBookViewProps) {
  const total = pages.length
  const maxSpread = Math.max(0, Math.floor(total / 2))
  const clampedSpread = Math.min(Math.max(spread, 0), maxSpread)

  const leftIndex = 2 * clampedSpread - 1
  const rightIndex = 2 * clampedSpread
  const leftPage = leftIndex >= 0 ? pages[leftIndex] : undefined
  const rightPage = rightIndex < total ? pages[rightIndex] : undefined
  const leftIsFlyleaf = leftIndex < 0
  const rightIsEndpaper = rightIndex >= total

  const canGoPrev = clampedSpread > 0 && !turn
  const canGoNext = clampedSpread < maxSpread && !turn

  const indicator = leftIsFlyleaf
    ? `Página 1 de ${total}`
    : rightIsEndpaper
      ? `Página ${leftIndex + 1} de ${total}`
      : `Páginas ${leftIndex + 1} e ${rightIndex + 1} de ${total}`

  return (
    <div className="mx-auto w-full max-w-2xl select-none">
      <div style={{ perspective: `${BOOK_PERSPECTIVE_PX}px` }}>
        <div
          role="region"
          aria-label="Livro de fotos aberto"
          className="relative rounded-2xl p-1.5 shadow-[0_24px_50px_-16px_rgba(76,5,25,0.35)] sm:p-2"
          style={COVER_TEXTURE}
        >
          {/* Pilhas de folhas restantes nas bordas externas */}
          {leftIndex >= 0 && (
            <div
              aria-hidden="true"
              className="absolute inset-y-[4%] -left-[3px] w-[5px] rounded-l-[2px] shadow-sm"
              style={PAGE_EDGE_TEXTURE}
            />
          )}
          {rightIndex < total && (
            <div
              aria-hidden="true"
              className="absolute inset-y-[4%] -right-[3px] w-[5px] rounded-r-[2px] shadow-sm"
              style={PAGE_EDGE_TEXTURE}
            />
          )}

          <div className="relative aspect-[8/5] w-full overflow-hidden rounded-lg">
            {/* Página estática esquerda — clique volta uma folha */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
              onClick={onPrev}
              title="Página anterior"
            >
              <PageFace
                side="left"
                page={leftPage}
                endpaper={leftIsFlyleaf ? 'first' : undefined}
                endpaperText={coverTitle?.trim() || undefined}
                pageNumber={leftIsFlyleaf ? null : leftIndex + 1}
              />
            </div>

            {/* Página estática direita — clique vira uma folha */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
              onClick={onNext}
              title="Próxima página"
            >
              <PageFace
                side="right"
                page={rightPage}
                endpaper={rightIsEndpaper ? 'last' : undefined}
                endpaperText="Fim"
                pageNumber={rightIsEndpaper ? null : rightIndex + 1}
              />
            </div>

            {/* Sombra da lombada central */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-9 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#4c0519]/20 to-transparent"
            />

            {/* Sombra projetada da folha em movimento */}
            {turn && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 50%, rgba(76,5,25,0.22), transparent 72%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.55, 0] }}
                transition={{ duration: TURN_DURATION_S, ease: 'easeInOut' }}
              />
            )}

            {/* Folha animada — gira em torno da lombada central */}
            {turn && (
              <motion.div
                key={`turn-${clampedSpread}-${turn.direction}`}
                data-photo-book-leaf="true"
                className="absolute inset-y-0 left-1/2 z-20 w-1/2"
                style={{
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'none',
                }}
                initial={{ rotateY: turn.direction === 'next' ? 0 : -180 }}
                animate={{ rotateY: turn.direction === 'next' ? -180 : 0 }}
                transition={{ duration: TURN_DURATION_S, ease: [0.32, 0.08, 0.28, 1] }}
                onAnimationComplete={onLeafSettled}
              >
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <PageFace side="right" page={turn.front} />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <PageFace side="left" page={turn.back} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            aria-label="Página anterior"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-text-light shadow-sm transition-colors hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <span aria-live="polite" className="min-w-[8.5rem] text-center text-sm font-medium text-text-light">
            {indicator}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Próxima página"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-text-light shadow-sm transition-colors hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar livro"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X size={14} aria-hidden="true" />
          Fechar livro
        </button>

        {showKeyboardHint && (
          <p className="text-[11px] text-text-muted/80">
            Use as setas para folhear · Esc para fechar
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bloco principal
// ---------------------------------------------------------------------------

function PhotoBookBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const shouldReduceMotion = useReducedMotion()
  const isPhotoBook = block.type === 'photoBook'
  const props: PhotoBookBlockProps = isPhotoBook ? block.props : { pages: [] }

  const isEditMode = mode === 'edit'
  const pages = useMemo(
    () => (Array.isArray(props.pages) ? props.pages : []),
    [props.pages],
  )

  const [isOpen, setIsOpen] = useState(false)
  const [spread, setSpread] = useState(0)
  const [turn, setTurn] = useState<TurnState | null>(null)

  const total = pages.length
  const maxSpread = Math.max(0, Math.floor(total / 2))
  // Se páginas forem removidas com o livro aberto, a visualização usa o spread
  // já limitado — sem efeito extra nem re-render em cascata.
  const displaySpread = Math.min(Math.max(spread, 0), maxSpread)

  const updateProp = useCallback(
    <K extends keyof PhotoBookBlockProps>(key: K, value: PhotoBookBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'photoBook') {
          return currentBlock
        }
        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            [key]: value,
          },
        }
      })
    },
    [onUpdate],
  )

  const updatePages = useCallback(
    (nextPages: PhotoBookPage[]) => {
      updateProp('pages', nextPages)
    },
    [updateProp],
  )

  const updatePage = useCallback(
    (index: number, patch: Partial<PhotoBookPage>) => {
      updatePages(pages.map((page, i) => (i === index ? { ...page, ...patch } : page)))
    },
    [pages, updatePages],
  )

  const addPage = useCallback(() => {
    if (pages.length >= MAX_PHOTO_BOOK_PAGES) {
      return
    }
    updatePages([...pages, { id: createPageId(), src: '', caption: '' }])
  }, [pages, updatePages])

  const removePage = useCallback(
    (index: number) => {
      updatePages(pages.filter((_, i) => i !== index))
    },
    [pages, updatePages],
  )

  const movePage = useCallback(
    (index: number, offset: -1 | 1) => {
      const target = index + offset
      if (target < 0 || target >= pages.length) {
        return
      }
      const reordered = [...pages]
      const [moved] = reordered.splice(index, 1)
      if (!moved) {
        return
      }
      reordered.splice(target, 0, moved)
      updatePages(reordered)
    },
    [pages, updatePages],
  )

  const goNext = useCallback(() => {
    if (turn || displaySpread >= maxSpread) {
      return
    }
    const current = displaySpread
    setSpread(current + 1)
    if (!shouldReduceMotion) {
      setTurn({
        direction: 'next',
        front: pages[2 * current],
        back: pages[2 * current + 1],
      })
    }
  }, [turn, displaySpread, maxSpread, shouldReduceMotion, pages])

  const goPrev = useCallback(() => {
    if (turn || displaySpread <= 0) {
      return
    }
    const current = displaySpread
    setSpread(current - 1)
    if (!shouldReduceMotion) {
      setTurn({
        direction: 'prev',
        front: pages[2 * (current - 1)],
        back: pages[2 * (current - 1) + 1],
      })
    }
  }, [turn, displaySpread, shouldReduceMotion, pages])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTurn(null)
  }, [])

  // Teclado: setas folheiam, Esc fecha — somente no modo preview para não
  // roubar teclas dos campos de edição.
  useEffect(() => {
    if (mode !== 'preview' || !isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, isOpen, goNext, goPrev, handleClose])

  // Rede de segurança: se onAnimationComplete não disparar, libera a folha.
  useEffect(() => {
    if (!turn) {
      return
    }
    const timeoutId = window.setTimeout(() => setTurn(null), (TURN_DURATION_S + 0.25) * 1000)
    return () => window.clearTimeout(timeoutId)
  }, [turn])

  if (!isPhotoBook) {
    return null
  }

  const coverTitle = props.coverTitle
  const coverSubtitle = props.coverSubtitle

  const bookOrCover = (
    <div style={{ perspective: `${BOOK_PERSPECTIVE_PX}px` }}>
      <AnimatePresence mode="wait" initial={false}>
        {isOpen && total > 0 ? (
          <motion.div
            key="open-book"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: [0.19, 1, 0.22, 1] }}
          >
            <OpenBookView
              pages={pages}
              spread={displaySpread}
              turn={turn}
              coverTitle={coverTitle}
              showKeyboardHint={!isEditMode}
              onPrev={goPrev}
              onNext={goNext}
              onClose={handleClose}
              onLeafSettled={() => setTurn(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="closed-cover"
            initial={false}
            exit={shouldReduceMotion ? { opacity: 0 } : { rotateY: -152, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.45, 0.08, 0.3, 1] }}
            style={{ transformOrigin: 'left center' }}
          >
            <BookCover
              title={coverTitle}
              subtitle={coverSubtitle}
              isEditMode={isEditMode}
              reduceMotion={shouldReduceMotion ?? false}
              onOpen={() => setIsOpen(true)}
              onTitleChange={(value) => updateProp('coverTitle', value)}
              onSubtitleChange={(value) => updateProp('coverSubtitle', value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Estado vazio do preview — sem páginas não há o que folhear.
  if (!isEditMode && total === 0) {
    return (
      <div className="mx-auto w-full max-w-md px-2 py-3" data-mode={mode}>
        <div className="rounded-2xl border border-dashed border-border bg-surface/70 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen size={22} aria-hidden="true" />
          </div>
          <h3 className="font-cursive text-2xl font-bold text-text">
            {coverTitle?.trim() || 'Livro de memórias'}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-text-light">
            Este álbum ainda não tem fotos. Adicione páginas no modo de edição para começar a
            folhear.
          </p>
        </div>
      </div>
    )
  }

  if (!isEditMode) {
    return (
      <div className="mx-auto w-full max-w-2xl px-2 py-3" data-mode={mode}>
        {bookOrCover}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-2 py-3" data-mode={mode}>
      {bookOrCover}

      {!isOpen && total > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Visualizar virada de páginas"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-surface px-5 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <BookOpen size={15} aria-hidden="true" />
            Visualizar virada de páginas
          </button>
        </div>
      )}

      {/* Painel de edição das páginas */}
      <section className="space-y-3 rounded-2xl border border-border bg-surface/90 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text">Páginas do livro</p>
          <span className="text-xs font-medium text-text-light">
            {total}/{MAX_PHOTO_BOOK_PAGES} páginas
          </span>
        </div>

        {total === 0 ? (
          <div className="space-y-2 rounded-xl border border-dashed border-border bg-surface-raised/60 p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImagePlus size={18} aria-hidden="true" />
            </div>
            <p className="text-sm text-text-light">
              Nenhuma página ainda. Adicione a primeira foto do livro.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pages.map((page, index) => (
              <li
                key={page.id}
                className="space-y-2 rounded-xl border border-border/80 bg-surface-raised/70 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-text-light">
                    Página {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePage(index, -1)}
                      disabled={index === 0}
                      aria-label={`Mover página ${index + 1} para cima`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-35"
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePage(index, 1)}
                      disabled={index === pages.length - 1}
                      aria-label={`Mover página ${index + 1} para baixo`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-35"
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePage(index)}
                      aria-label={`Remover página ${index + 1}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <MediaField
                  kind="image"
                  label={`Foto da página ${index + 1}`}
                  value={{ src: page.src, assetId: page.assetId }}
                  onChange={(nextValue) =>
                    updatePage(index, { src: nextValue.src, assetId: nextValue.assetId })
                  }
                  helperText="Upload direto ou URL manual para a foto desta página."
                />

                <input
                  type="text"
                  value={page.caption ?? ''}
                  onChange={(event) => updatePage(index, { caption: event.target.value })}
                  placeholder="Escreva uma legenda para esta foto"
                  aria-label={`Legenda da página ${index + 1}`}
                  className={EDITOR_FIELD_BASE_CLASS}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addPage}
            disabled={total >= MAX_PHOTO_BOOK_PAGES}
            aria-label="Adicionar página"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={15} aria-hidden="true" />
            Adicionar página
          </button>
          {total >= MAX_PHOTO_BOOK_PAGES && (
            <p className="text-xs text-text-light">Limite de 24 páginas por livro.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function arePhotoBookPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const PhotoBookBlock = memo(PhotoBookBlockComponent, arePhotoBookPropsEqual)
