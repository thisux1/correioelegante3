import { memo, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, RotateCcw, Check, Sparkles } from 'lucide-react'
import type { BlockComponentProps, QuizBlockProps } from '@/editor/types'

const PLAYFUL_REASONS = [
  'Tem certeza? Pense com calma 😉',
  'Ops, acho que você quis clicar no Sim!',
  'Essa opção não vale! ❤️',
  'Tente de novo com carinho ✨',
  'O coração disse outra coisa... 🥰',
  'A resposta certa está logo ao lado!',
]

const HEARTS_STATIC = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 31 + 7) % 95}%`,
  delay: ((i * 17) % 60) / 100,
  duration: 1.8 + ((i * 23) % 120) / 100,
  size: 14 + ((i * 19) % 18),
  color: ['#e11d48', '#ec4899', '#f43f5e', '#fb7185', '#d946ef'][i % 5],
}))

function HeartShower() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {HEARTS_STATIC.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: '-10vh', opacity: 0, scale: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.25, 1],
            x: [0, (h.id % 2 === 0 ? 1 : -1) * 25, 0],
            rotate: [0, (h.id % 2 === 0 ? 1 : -1) * 90],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="absolute"
          style={{ left: h.left }}
        >
          <Heart size={h.size} fill={h.color} style={{ color: h.color }} />
        </motion.div>
      ))}
    </div>
  )
}

function QuizBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isQuiz = block.type === 'quiz'
  const props: QuizBlockProps = isQuiz
    ? block.props
    : {
        question: 'Quer namorar comigo?',
        yesButtonText: 'Sim, com todo o coração',
        noButtonText: 'Não',
        successMessage: 'Eu sabia! Te amo muito. ❤️',
        isPlayfulNo: true,
      }

  const [hasAnsweredYes, setHasAnsweredYes] = useState(false)
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [playfulMessageIndex, setPlayfulMessageIndex] = useState(0)
  const [showPlayfulTooltip, setShowPlayfulTooltip] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const isEditMode = mode === 'edit'
  const isPlayful = props.isPlayfulNo ?? true

  const handleYes = useCallback(() => {
    setHasAnsweredYes(true)
  }, [])

  const handleReset = useCallback(() => {
    setHasAnsweredYes(false)
    setNoPosition({ x: 0, y: 0 })
    setShowPlayfulTooltip(false)
  }, [])

  const moveNoButton = useCallback(() => {
    if (!isPlayful) return

    // Deslocamento suave do botão 'Não'
    const randomX = (Math.random() - 0.5) * 160
    const randomY = (Math.random() - 0.5) * 90

    setNoPosition({ x: randomX, y: randomY })
    setPlayfulMessageIndex((prev) => (prev + 1) % PLAYFUL_REASONS.length)
    setShowPlayfulTooltip(true)
  }, [isPlayful])

  const updateProp = useCallback(
    <K extends keyof QuizBlockProps>(key: K, value: QuizBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'quiz') {
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

  if (!isQuiz) {
    return null
  }

  const question = props.question || 'Quer namorar comigo?'
  const yesText = props.yesButtonText || 'Sim, com todo o coração'
  const noText = props.noButtonText || 'Não'
  const successMessage = props.successMessage || 'Eu sabia! Te amo muito. ❤️'

  return (
    <div className="relative mx-auto w-full max-w-lg select-none px-2 py-4">
      {/* Controles discretos no topo do modo de edição */}
      {isEditMode && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-text-light hover:text-text">
            <input
              type="checkbox"
              checked={isPlayful}
              onChange={(e) => updateProp('isPlayfulNo', e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
              aria-label="Ativar botão não fujão"
            />
            <span>Botão 'Não' fujão ✨</span>
          </label>

          <div className="flex items-center gap-2">
            {hasAnsweredYes ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-white/90 px-3 py-1.5 font-bold text-primary shadow-xs backdrop-blur-xs transition-colors hover:bg-primary/10"
              >
                <RotateCcw size={13} /> Editar Pergunta
              </button>
            ) : (
              <button
                type="button"
                onClick={handleYes}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-white/90 px-3 py-1.5 font-bold text-primary shadow-xs backdrop-blur-xs transition-colors hover:bg-primary hover:text-white"
              >
                <Heart size={13} fill="currentColor" /> Ver Reação do 'SIM'
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Interativo Principal */}
      <div
        ref={containerRef}
        className="relative mx-auto min-h-[260px] w-full overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-b from-[#fff7f7] via-white to-[#fff0f2] p-7 text-center shadow-xl backdrop-blur-xs sm:p-9"
      >
        <AnimatePresence>
          {hasAnsweredYes ? (
            /* Tela de Sucesso / Reação ao SIM */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="flex flex-col items-center justify-center space-y-4 py-3"
            >
              <HeartShower />

              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xl shadow-pink-500/35"
                >
                  <Heart size={42} fill="currentColor" />
                </motion.div>
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Check size={14} />
                </div>
              </div>

              <div className="w-full space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles size={14} /> Te amo!
                </span>

                <div className="w-full">
                  {isEditMode ? (
                    <textarea
                      rows={3}
                      value={props.successMessage}
                      onChange={(e) => updateProp('successMessage', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Eu sabia! Te amo muito. ❤️"
                      className="w-full resize-none rounded-2xl bg-transparent text-center font-cursive text-2xl sm:text-3xl font-bold leading-relaxed text-text placeholder:text-text-light/40 border border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:bg-white/40 focus:outline-none p-2 transition-colors"
                      aria-label="Mensagem de sucesso"
                    />
                  ) : (
                    <h3 className="font-cursive text-2xl font-bold leading-relaxed text-text sm:text-3xl">
                      {successMessage}
                    </h3>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Tela da Pergunta Principal */
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-7 py-2"
            >
              {/* Ícone e Pergunta */}
              <div className="space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <Heart size={28} fill="currentColor" />
                </div>

                <div className="w-full">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={props.question}
                      onChange={(e) => updateProp('question', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Quer namorar comigo?"
                      className="w-full bg-transparent text-center font-cursive text-2xl sm:text-3xl font-bold tracking-tight text-text placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-1 px-2"
                      aria-label="Pergunta principal"
                    />
                  ) : (
                    <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">
                      {question}
                    </h3>
                  )}
                </div>
              </div>

              {/* Botões de Decisão */}
              <div className="relative flex flex-wrap items-center justify-center gap-4 pt-1">
                {/* Botão SIM */}
                {isEditMode ? (
                  <div
                    onClick={handleYes}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-primary to-pink-600 px-6 py-2.5 shadow-lg shadow-primary/35 transition-all hover:scale-105 active:scale-95"
                    title="Clique para testar o SIM ou edite o texto"
                  >
                    <Heart size={18} fill="currentColor" className="text-white shrink-0" />
                    <input
                      type="text"
                      value={props.yesButtonText}
                      onChange={(e) => updateProp('yesButtonText', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Sim, com todo o coração"
                      className="bg-transparent font-bold text-white text-base text-center placeholder:text-white/60 focus:outline-none min-w-[120px]"
                      aria-label="Texto do botão sim"
                    />
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleYes}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-primary to-pink-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/35 transition-shadow hover:shadow-primary/50"
                  >
                    <Heart size={18} fill="currentColor" />
                    {yesText}
                  </motion.button>
                )}

                {/* Botão NÃO */}
                <div className="relative">
                  {isEditMode ? (
                    <div className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-primary/20 bg-white/85 px-5 py-2.5 shadow-xs backdrop-blur-xs hover:border-primary/40 transition-colors">
                      <input
                        type="text"
                        value={props.noButtonText}
                        onChange={(e) => updateProp('noButtonText', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Não"
                        className="bg-transparent font-semibold text-text-light text-sm text-center placeholder:text-text-light/40 focus:outline-none w-14"
                        aria-label="Texto do botão não"
                      />
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      onMouseEnter={moveNoButton}
                      onTouchStart={moveNoButton}
                      onClick={moveNoButton}
                      animate={{ x: noPosition.x, y: noPosition.y }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-primary/20 bg-white/85 px-6 py-3 text-sm font-semibold text-text-light shadow-xs backdrop-blur-xs transition-colors hover:bg-rose-50 hover:text-red-600"
                    >
                      {noText}
                    </motion.button>
                  )}

                  {showPlayfulTooltip && isPlayful && (
                    <motion.div
                      key={playfulMessageIndex}
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ left: noPosition.x, top: noPosition.y - 32 }}
                      className="pointer-events-none absolute z-30 whitespace-nowrap rounded-full bg-black/85 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs"
                    >
                      {PLAYFUL_REASONS[playfulMessageIndex]}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function areQuizPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const QuizBlock = memo(QuizBlockComponent, areQuizPropsEqual)
