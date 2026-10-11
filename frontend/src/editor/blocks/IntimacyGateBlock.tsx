import { memo, useCallback, useId, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Check, Heart, KeyRound, Lightbulb, Lock, Plus, RotateCcw, Sparkles, X } from 'lucide-react'
import type { BlockComponentProps, IntimacyGateBlockProps } from '@/editor/types'
import { useRecipientState } from '@/editor/hooks/useRecipientState'

const MAX_ANSWERS = 8

const DEFAULT_GATE_PROPS: IntimacyGateBlockProps = {
  question: 'O que só vocês dois sabem?',
  answers: [],
  hint: '',
  successMessage: 'Você lembra. É claro que lembra.',
}

const ENCOURAGEMENTS = [
  'Ainda não é essa. Tenta de novo, com calma.',
  'Quase — essa memória mora em vocês dois.',
  'Não foi dessa vez. O coração sabe.',
  'Respira fundo e lembra: vocês viveram isso juntos.',
]

const BURST_HEARTS = [
  { x: -54, y: -36, size: 13, color: '#e11d48' },
  { x: 50, y: -42, size: 16, color: '#f43f5e' },
  { x: -64, y: 4, size: 12, color: '#fb7185' },
  { x: 64, y: 8, size: 14, color: '#ec4899' },
  { x: -30, y: -58, size: 12, color: '#f43f5e' },
  { x: 30, y: 54, size: 12, color: '#fda4af' },
  { x: -42, y: 46, size: 14, color: '#e11d48' },
  { x: 56, y: -22, size: 12, color: '#fb7185' },
]

/**
 * Normalização tolerante para comparar respostas: ignora maiúsculas,
 * espaços extras e acentos ("São Paulo" casa com "sao paulo").
 */
function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function HeartBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {BURST_HEARTS.map((heart, index) => (
        <motion.span
          key={index}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
          animate={{ x: heart.x, y: heart.y, opacity: [0, 1, 0], scale: [0.3, 1.15, 0.7] }}
          transition={{ duration: 0.6, delay: 0.05 + index * 0.035, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2"
          style={{ marginLeft: -heart.size / 2, marginTop: -heart.size / 2 }}
        >
          <Heart size={heart.size} fill={heart.color} style={{ color: heart.color }} />
        </motion.span>
      ))}
    </div>
  )
}

function IntimacyGateBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isGate = block.type === 'intimacyGate'
  const props: IntimacyGateBlockProps = isGate ? block.props : DEFAULT_GATE_PROPS

  const isEditMode = mode === 'edit'
  const shouldReduceMotion = useReducedMotion()
  const answerInputId = useId()
  const hintInputId = useId()
  const hintRegionId = useId()

  const [answer, setAnswer] = useState('')
  const [unlocked, setUnlocked] = useRecipientState(block.id, 'unlocked', false)
  const [skipped, setSkipped] = useRecipientState(block.id, 'skipped', false)
  const [showHint, setShowHint] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const shakeControls = useAnimationControls()

  const acceptedAnswers = useMemo(
    () => props.answers.map(normalizeAnswer).filter(Boolean),
    [props.answers],
  )

  const updateProp = useCallback(
    <K extends keyof IntimacyGateBlockProps>(key: K, value: IntimacyGateBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'intimacyGate') {
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

  const playShake = useCallback(() => {
    if (shouldReduceMotion) return
    void shakeControls.start({
      x: [0, -9, 9, -6, 6, -2, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    })
  }, [shakeControls, shouldReduceMotion])

  const unlockWith = useCallback((didSkip: boolean) => {
    setSkipped(didSkip)
    setUnlocked(true)
    setFeedback('')
    setLiveMessage(
      didSkip
        ? 'Tudo bem. O presente se abriu mesmo assim.'
        : 'Resposta certa. O presente se abriu para você.',
    )
  }, [setSkipped, setUnlocked])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (unlocked) return

    const attempt = normalizeAnswer(answer)
    if (!attempt) {
      const message = 'Escreva uma resposta para tentar.'
      setFeedback(message)
      setLiveMessage(message)
      playShake()
      return
    }

    // Sem respostas cadastradas, o portão fica inerte: qualquer tentativa abre.
    if (acceptedAnswers.length === 0 || acceptedAnswers.includes(attempt)) {
      unlockWith(false)
      return
    }

    const message = ENCOURAGEMENTS[wrongAttempts % ENCOURAGEMENTS.length]
    setWrongAttempts((count) => count + 1)
    setFeedback(message)
    setLiveMessage(message)
    playShake()
  }

  const handleToggleHint = () => {
    setShowHint((visible) => {
      const next = !visible
      if (next && props.hint) {
        setLiveMessage(`Dica: ${props.hint}`)
      }
      return next
    })
  }

  const handleReset = () => {
    setAnswer('')
    setUnlocked(false)
    setSkipped(false)
    setShowHint(false)
    setWrongAttempts(0)
    setFeedback('')
    setLiveMessage('')
  }

  const setAcceptedAnswer = (index: number, value: string) => {
    updateProp(
      'answers',
      props.answers.map((accepted, i) => (i === index ? value : accepted)),
    )
  }

  const removeAcceptedAnswer = (index: number) => {
    updateProp(
      'answers',
      props.answers.filter((_, i) => i !== index),
    )
  }

  const handleAddAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = newAnswer.trim()
    if (!value || props.answers.length >= MAX_ANSWERS) return
    updateProp('answers', [...props.answers, value])
    setNewAnswer('')
  }

  if (!isGate) {
    return null
  }

  const question = props.question || 'O que só vocês dois sabem?'
  const successMessage = props.successMessage || 'Você lembra. É claro que lembra.'
  const hintText = props.hint?.trim() ?? ''

  return (
    <div className="relative mx-auto w-full max-w-lg px-2 py-3" data-mode={mode}>
      {/* Card do Portão */}
      <div className="relative mx-auto w-full overflow-hidden rounded-3xl border border-border bg-surface-raised p-7 text-center text-text shadow-xl backdrop-blur-xs sm:p-9">
        <AnimatePresence>
          {unlocked ? (
            /* Revelação: mensagem de sucesso (+ variante suave quando pulou) */
            <motion.div
              key="revealed"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 14 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', stiffness: 260, damping: 22 }
              }
              className="flex flex-col items-center justify-center space-y-4 py-3"
            >
              <div className="relative">
                {!shouldReduceMotion && !skipped && <HeartBurst />}
                <motion.div
                  initial={shouldReduceMotion ? false : { scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.15 }
                      : { type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }
                  }
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xl shadow-pink-500/35"
                >
                  <Heart size={40} fill="currentColor" />
                </motion.div>
                {!skipped && (
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-raised bg-emerald-500 text-white shadow-md">
                    <Check size={14} />
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles size={14} /> O portão se abriu
                </span>

                {skipped && (
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-light">
                    Tudo bem — o que importa é você estar aqui.
                  </p>
                )}

                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={props.successMessage ?? ''}
                    onChange={(e) => updateProp('successMessage', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Você lembra. É claro que lembra."
                    className="w-full resize-none rounded-2xl border border-dashed border-transparent bg-transparent p-2 text-center font-cursive text-2xl font-bold leading-relaxed text-text transition-colors placeholder:text-text-light/40 hover:border-primary/30 focus:border-primary focus:bg-surface/40 focus:outline-none sm:text-3xl"
                    aria-label="Mensagem revelada ao abrir o portão"
                  />
                ) : (
                  <h3 className="font-cursive text-2xl font-bold leading-relaxed text-text sm:text-3xl">
                    {successMessage}
                  </h3>
                )}
              </div>
            </motion.div>
          ) : (
            /* Portão fechado: pergunta íntima + tentativa de resposta */
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 py-2"
            >
              <div className="space-y-3">
                <div className="relative mx-auto w-fit">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/30">
                    <Heart size={30} fill="currentColor" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-raised bg-primary-dark text-white shadow-md">
                    <Lock size={13} />
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  Só vocês dois sabem
                </p>

                {isEditMode ? (
                  <input
                    type="text"
                    value={props.question}
                    onChange={(e) => updateProp('question', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="O que só vocês dois sabem?"
                    className="w-full border-b border-dashed border-transparent bg-transparent px-2 py-1 text-center font-cursive text-2xl font-bold tracking-tight text-text transition-colors placeholder:text-text-light/40 hover:border-primary/30 focus:border-primary focus:outline-none sm:text-3xl"
                    aria-label="Pergunta do portão"
                  />
                ) : (
                  <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">
                    {question}
                  </h3>
                )}

                <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-light">
                  Responda para abrir esta parte do presente.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-3"
                noValidate
                aria-label="Responder à pergunta secreta"
              >
                <motion.div animate={shakeControls} className="flex flex-col gap-2.5 sm:flex-row">
                  <label htmlFor={answerInputId} className="sr-only">
                    Sua resposta
                  </label>
                  <input
                    id={answerInputId}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onClick={isEditMode ? (e) => e.stopPropagation() : undefined}
                    placeholder="Escreva sua resposta..."
                    autoComplete="off"
                    className="min-h-12 w-full flex-1 rounded-2xl border border-border bg-white px-4 text-center text-base text-text shadow-inner transition-colors placeholder:text-text-light/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                  <motion.button
                    type="submit"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                    className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-primary to-pink-600 px-7 text-base font-bold text-white shadow-lg shadow-primary/30 transition-shadow hover:shadow-primary/45"
                  >
                    <KeyRound size={17} />
                    Responder
                  </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                  {feedback && (
                    <motion.p
                      key={feedback}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium text-text-light"
                    >
                      {feedback}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>

              <div className="flex flex-col items-center gap-1">
                {hintText && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        if (isEditMode) e.stopPropagation()
                        handleToggleHint()
                      }}
                      aria-expanded={showHint}
                      aria-controls={hintRegionId}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary/25 bg-surface px-4 text-sm font-semibold text-primary shadow-xs transition-colors hover:bg-primary/10"
                    >
                      <Lightbulb size={15} /> Dica
                    </button>
                    <AnimatePresence>
                      {showHint && (
                        <motion.p
                          id={hintRegionId}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl bg-primary/[0.06] px-4 py-2 text-sm leading-relaxed text-text-light"
                        >
                          {hintText}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => unlockWith(true)}
                  className="min-h-11 px-3 text-xs font-medium text-text-light underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary"
                >
                  Seguir sem acertar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anúncios para leitores de tela: erro, acerto, dica e desistência */}
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>
      </div>

      {/* Painel de edição abaixo do card — nunca colide com os BlockControls */}
      {isEditMode && (
        <div className="mt-3 space-y-4 rounded-2xl border border-border bg-surface/70 p-4 text-left shadow-xs backdrop-blur-xs">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-light">
              Respostas aceitas
            </p>

            {props.answers.map((accepted, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={accepted}
                  onChange={(e) => setAcceptedAnswer(index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Resposta aceita ${index + 1}`}
                  className="min-h-11 w-full flex-1 rounded-xl border border-border bg-white px-3 text-sm text-text placeholder:text-text-light/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => removeAcceptedAnswer(index)}
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-500/10"
                  aria-label={`Remover resposta ${index + 1}`}
                  title="Remover resposta"
                >
                  <X size={15} />
                </button>
              </div>
            ))}

            {props.answers.length < MAX_ANSWERS ? (
              <form
                onSubmit={handleAddAnswer}
                className="flex items-center gap-2"
                aria-label="Adicionar resposta aceita"
              >
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Adicionar resposta aceita"
                  aria-label="Nova resposta aceita"
                  className="min-h-11 w-full flex-1 rounded-xl border border-dashed border-primary/30 bg-surface px-3 text-sm text-text placeholder:text-text-light/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={!newAnswer.trim()}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary/10 disabled:hover:text-primary"
                >
                  <Plus size={13} /> Adicionar
                </button>
              </form>
            ) : (
              <p className="text-[11px] text-text-light">
                Máximo de {MAX_ANSWERS} respostas aceitas.
              </p>
            )}

            {props.answers.length === 0 && (
              <p className="text-xs leading-relaxed text-text-light">
                Sem respostas cadastradas, qualquer tentativa abre o portão.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={hintInputId}
              className="block text-[11px] font-bold uppercase tracking-wider text-text-light"
            >
              Dica (opcional)
            </label>
            <input
              id={hintInputId}
              type="text"
              value={props.hint ?? ''}
              onChange={(e) => updateProp('hint', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Uma pista para ajudar quem recebe"
              className="min-h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text placeholder:text-text-light/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-text-light">
              O portão acima já funciona — teste como quem recebe.
            </p>
            {unlocked ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary/20 bg-surface px-4 text-xs font-bold text-primary shadow-xs transition-colors hover:bg-primary/10 active:scale-95"
              >
                <RotateCcw size={13} /> Reiniciar teste
              </button>
            ) : (
              <button
                type="button"
                onClick={() => unlockWith(false)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary/25 bg-surface px-4 text-xs font-bold text-primary shadow-xs transition-all hover:bg-primary hover:text-white active:scale-95"
              >
                <Sparkles size={13} /> Ver revelação
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function areIntimacyGatePropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const IntimacyGateBlock = memo(IntimacyGateBlockComponent, areIntimacyGatePropsEqual)
