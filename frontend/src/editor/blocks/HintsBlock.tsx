import { memo, useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Heart,
  Lock,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type { BlockComponentProps, HintItem, HintsBlockProps } from '@/editor/types'

const MAX_HINTS = 12
const DEFAULT_TITLE = 'Dicas sobre quem escreveu'

function generateHintId(): string {
  return `hint-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

interface SealedFaceContentProps {
  index: number
  isNext: boolean
  shouldReduceMotion: boolean
}

/**
 * Conteúdo visual da face lacrada de uma dica: selo de cera numerado com
 * interrogação (próxima a revelar) ou cadeado (aguardando a anterior).
 */
function SealedFaceContent({ index, isNext, shouldReduceMotion }: SealedFaceContentProps) {
  return (
    <>
      {/* Selo de cera */}
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        {isNext && !shouldReduceMotion && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.32, 1], opacity: [0.55, 0.95, 0.55] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-0 rounded-full border border-primary/50"
          />
        )}
        <span
          className={`relative flex h-11 w-11 items-center justify-center rounded-full ${
            isNext
              ? 'bg-gradient-to-br from-primary to-wine-medium shadow-md shadow-primary/30'
              : 'border border-border bg-surface-raised shadow-xs'
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-1 rounded-full border border-dashed ${
              isNext ? 'border-white/45' : 'border-border/70'
            }`}
          />
          {isNext ? (
            <span aria-hidden="true" className="font-serif text-lg font-bold text-white">
              ?
            </span>
          ) : (
            <Lock size={15} className="text-text-light/60" aria-hidden="true" />
          )}
        </span>
      </span>

      {/* Rótulo da dica */}
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-bold ${isNext ? 'text-text' : 'text-text-light/80'}`}
        >
          Dica {index + 1}
        </span>
        <span className={`block text-xs ${isNext ? 'text-text-light' : 'text-text-light/60'}`}>
          {isNext ? 'Toque para revelar esta pista' : 'Revele a dica anterior'}
        </span>
      </span>

      {isNext ? (
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-primary/70 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      ) : (
        <span aria-hidden="true" className="font-serif text-xs italic text-text-light/50">
          lacrada
        </span>
      )}
    </>
  )
}

interface PreviewHintCardProps {
  hint: HintItem
  index: number
  state: 'revealed' | 'next' | 'locked'
  shouldReduceMotion: boolean
  onReveal: () => void
}

/**
 * Cartão de dica com flip "unseal": a face lacrada gira para fora enquanto a
 * face revelada gira para dentro, em springs curtos (~0.3s).
 */
function PreviewHintCard({ hint, index, state, shouldReduceMotion, onReveal }: PreviewHintCardProps) {
  const isRevealed = state === 'revealed'
  const isNext = state === 'next'

  const flipTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 32 }

  const faceMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: 90, opacity: 0, pointerEvents: 'none' as const },
      }

  return (
    <div className="relative" style={{ perspective: 900 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {isRevealed ? (
          <motion.div
            key="revealed"
            initial={faceMotion.initial}
            animate={faceMotion.animate}
            exit={faceMotion.exit}
            transition={flipTransition}
          >
            <div className="flex items-start gap-3.5 rounded-2xl border border-primary/25 bg-surface px-4 py-3.5 shadow-sm">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary"
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-primary/70">
                  Dica {index + 1} revelada
                </span>
                <span className="mt-0.5 block font-sans text-sm leading-relaxed text-text sm:text-base">
                  {hint.text}
                </span>
              </span>
              <Heart
                size={14}
                fill="currentColor"
                aria-hidden="true"
                className="mt-1.5 shrink-0 text-primary/45"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sealed"
            initial={faceMotion.initial}
            animate={faceMotion.animate}
            exit={faceMotion.exit}
            transition={flipTransition}
          >
            {isNext ? (
              <motion.button
                type="button"
                onClick={onReveal}
                aria-label={`Revelar dica ${index + 1}`}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="group flex min-h-[68px] w-full items-center gap-3.5 rounded-2xl border border-primary/30 bg-gradient-to-r from-background via-surface-raised to-surface px-4 py-3.5 text-left shadow-md shadow-primary/10 transition-colors hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <SealedFaceContent index={index} isNext shouldReduceMotion={shouldReduceMotion} />
              </motion.button>
            ) : (
              <div className="flex min-h-[68px] w-full items-center gap-3.5 rounded-2xl border border-border/70 bg-surface/70 px-4 py-3.5 opacity-75">
                <SealedFaceContent index={index} isNext={false} shouldReduceMotion={shouldReduceMotion} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HintsBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const shouldReduceMotion = useReducedMotion() === true
  const isHints = block.type === 'hints'
  const props: HintsBlockProps = isHints ? block.props : { hints: [] }
  const isEditMode = mode === 'edit'

  // Dicas crus (modo edição): preserva inclusive textos ainda vazios.
  const allHints = useMemo(
    () => (Array.isArray(props.hints) ? props.hints.slice(0, MAX_HINTS) : []),
    [props.hints],
  )

  // Dicas publicadas: rascunhos vazios nunca vazam para a pessoa que recebe.
  const previewHints = useMemo(
    () => allHints.filter((hint) => typeof hint.text === 'string' && hint.text.trim().length > 0),
    [allHints],
  )

  const hints = isEditMode ? allHints : previewHints

  const [revealedCount, setRevealedCount] = useState(0)
  const revealed = Math.min(revealedCount, hints.length)
  const total = hints.length
  const allRevealed = total > 0 && revealed === total
  const atCap = allHints.length >= MAX_HINTS

  // Revelar é idempotente por índice: cliques duplos no selo que está
  // saindo de cena não conseguem pular a ordem das dicas.
  const handleRevealHint = useCallback((index: number) => {
    setRevealedCount((count) => (index + 1 > count ? index + 1 : count))
  }, [])

  const updateProp = useCallback(
    <K extends keyof HintsBlockProps>(key: K, value: HintsBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'hints') {
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

  const updateHints = useCallback(
    (nextHints: HintItem[]) => {
      updateProp('hints', nextHints.slice(0, MAX_HINTS))
    },
    [updateProp],
  )

  const handleAddHint = useCallback(() => {
    if (allHints.length >= MAX_HINTS) {
      return
    }
    updateHints([...allHints, { id: generateHintId(), text: '' }])
  }, [allHints, updateHints])

  const handleRemoveHint = useCallback(
    (index: number) => {
      updateHints(allHints.filter((_, i) => i !== index))
    },
    [allHints, updateHints],
  )

  const handleMoveHint = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= allHints.length) {
        return
      }
      const next = [...allHints]
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      updateHints(next)
    },
    [allHints, updateHints],
  )

  const handleChangeHintText = useCallback(
    (index: number, text: string) => {
      updateHints(allHints.map((hint, i) => (i === index ? { ...hint, text } : hint)))
    },
    [allHints, updateHints],
  )

  if (!isHints) {
    return null
  }

  const title = props.title?.trim() ? props.title : DEFAULT_TITLE

  return (
    <div
      className="relative mx-auto w-full max-w-lg select-none space-y-4 px-2 py-4"
      data-mode={mode}
    >
      {/* Cabeçalho */}
      <div className="space-y-1.5 text-center">
        {isEditMode ? (
          <input
            type="text"
            value={props.title ?? ''}
            onChange={(e) => updateProp('title', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={DEFAULT_TITLE}
            aria-label="Título das dicas"
            className="w-full bg-transparent text-center font-cursive text-2xl sm:text-3xl font-bold tracking-tight text-text placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-1 px-2"
          />
        ) : (
          <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {title}
          </h3>
        )}

        {isEditMode ? (
          <p className="text-xs text-text-light">
            Na página publicada, cada dica aparece lacrada e é revelada uma de cada vez, na
            ordem abaixo.
          </p>
        ) : (
          total > 0 && (
            <>
              <p className="text-sm text-text-light">
                Revele uma dica de cada vez e descubra quem escreveu esta página.
              </p>
              <p className="text-xs font-semibold text-text-light">
                {revealed} de {total} {total === 1 ? 'dica revelada' : 'dicas reveladas'}
              </p>
              {/* Marcadores de progresso */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5" aria-hidden="true">
                {hints.map((hint, i) => (
                  <span
                    key={hint.id || i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < revealed
                        ? 'w-4 bg-primary'
                        : i === revealed
                          ? 'w-2.5 bg-primary/45'
                          : 'w-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>

      {/* Anúncio acessível do último selo aberto */}
      {!isEditMode && (
        <div aria-live="polite" role="status" className="sr-only">
          {revealed > 0 && revealed <= total ? `Dica ${revealed} revelada` : ''}
        </div>
      )}

      {/* Lista de dicas */}
      {hints.length === 0 ? (
        <div
          className={`flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center ${
            isEditMode ? 'border-border bg-surface-raised/60' : 'border-border bg-surface/40'
          }`}
        >
          <Sparkles size={22} className="text-primary" aria-hidden="true" />
          <p className="text-sm font-bold text-text">Nenhuma dica por aqui ainda.</p>
          <p className="text-xs text-text-light">
            {isEditMode
              ? 'Use o botão abaixo para escrever a primeira pista.'
              : 'As pistas sobre quem escreveu vão aparecer neste espaço.'}
          </p>
        </div>
      ) : isEditMode ? (
        <ol className="space-y-3">
          {hints.map((hint, index) => (
            <li
              key={hint.id || index}
              className="overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-xs transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-3 p-3.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary"
                >
                  {index + 1}
                </span>
                <textarea
                  rows={2}
                  value={hint.text}
                  onChange={(e) => handleChangeHintText(index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Escreva uma pista sutil sobre você..."
                  aria-label={`Texto da dica ${index + 1}`}
                  className="flex-1 resize-none rounded-xl border border-dashed border-transparent bg-transparent p-1.5 font-sans text-sm leading-relaxed text-text transition-colors placeholder:text-text-light/40 hover:border-primary/30 focus:border-primary/50 focus:bg-surface/60 focus:outline-none sm:text-base"
                />
              </div>
              <div className="flex items-center justify-between border-t border-border/50 bg-surface/60 px-2.5 py-0.5">
                <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-text-light/70">
                  Dica {index + 1} de {hints.length}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveHint(index, 'up')}
                    aria-label={`Mover dica ${index + 1} para cima`}
                    title="Mover para cima"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-light"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={index === hints.length - 1}
                    onClick={() => handleMoveHint(index, 'down')}
                    aria-label={`Mover dica ${index + 1} para baixo`}
                    title="Mover para baixo"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-light"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveHint(index)}
                    aria-label={`Remover dica ${index + 1}`}
                    title="Remover dica"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="space-y-3">
          {hints.map((hint, index) => {
            const state: 'revealed' | 'next' | 'locked' =
              index < revealed ? 'revealed' : index === revealed ? 'next' : 'locked'
            return (
              <motion.li key={hint.id || index} layout={!shouldReduceMotion} className="list-none">
                <PreviewHintCard
                  hint={hint}
                  index={index}
                  state={state}
                  shouldReduceMotion={shouldReduceMotion}
                  onReveal={() => handleRevealHint(index)}
                />
              </motion.li>
            )
          })}
        </ol>
      )}

      {/* Adicionar dica (modo edição) */}
      {isEditMode && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={handleAddHint}
            disabled={atCap}
            aria-label="Adicionar dica"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-surface/90 px-4 py-2.5 text-sm font-bold text-primary shadow-xs transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:border-border disabled:text-text-light/50 disabled:hover:bg-surface/90 disabled:hover:shadow-xs"
          >
            <Plus size={16} />
            <span>Adicionar dica</span>
          </button>
          <p className="text-center text-[11px] text-text-light/80">
            {atCap
              ? `Limite de ${MAX_HINTS} dicas atingido.`
              : `${allHints.length} de ${MAX_HINTS} dicas`}
          </p>
        </div>
      )}

      {/* Fechamento do arco: todas as pistas abertas */}
      {!isEditMode && allRevealed && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          className="space-y-1.5 pt-1 text-center"
        >
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary">
            <Heart size={14} fill="currentColor" aria-hidden="true" />
            Todas as pistas foram reveladas.
          </p>
          <p className="text-xs leading-relaxed text-text-light">
            A resposta para esse mistério está guardada no restante desta página.
          </p>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`mx-auto text-primary/60 ${shouldReduceMotion ? '' : 'animate-bounce'}`}
          />
        </motion.div>
      )}
    </div>
  )
}

function areHintsPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const HintsBlock = memo(HintsBlockComponent, areHintsPropsEqual)
