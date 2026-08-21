import { memo, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react'
import type { BlockComponentProps, QuizBlockProps } from '@/editor/types'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

const PLAYFUL_REASONS = [
  'Tem certeza? Pense com calma.',
  'Ops, este botão parece indisponível.',
  'Esta opção não está no roteiro.',
  'Tentativa recusada com carinho.',
  'O botão desviou do caminho.',
  'A resposta certa está logo ao lado.',
]

const HEARTS_STATIC = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 31 + 7) % 95}%`,
  delay: ((i * 17) % 60) / 100,
  duration: 1.6 + ((i * 23) % 120) / 100,
  size: 14 + ((i * 19) % 20),
  color: ['#e11d48', '#ec4899', '#f43f5e', '#fb7185', '#d946ef'][i % 5],
}))

function HeartShower() {
  const hearts = HEARTS_STATIC

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: '-10vh', opacity: 0, scale: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.3, 1],
            x: [0, (h.id % 2 === 0 ? 1 : -1) * 30, 0],
            rotate: [0, (h.id % 2 === 0 ? 1 : -1) * 120],
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
        successMessage: 'Prometo honrar cada um dos nossos dias com respeito, carinho e cumplicidade.',
        isPlayfulNo: true,
      }

  const [hasAnsweredYes, setHasAnsweredYes] = useState(false)
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [playfulMessageIndex, setPlayfulMessageIndex] = useState(0)
  const [showPlayfulTooltip, setShowPlayfulTooltip] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

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

    // Gerar deslocamento aleatório dentro dos limites do container
    const randomX = (Math.random() - 0.5) * 180
    const randomY = (Math.random() - 0.5) * 120

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

  const question = props.question || 'Aceita ser o amor da minha vida?'
  const yesText = props.yesButtonText || 'Sim, com todo o coração'
  const noText = props.noButtonText || 'Não'
  const successMessage =
    props.successMessage ||
    'Prometo honrar cada um dos nossos dias com respeito, carinho e cumplicidade.'

  const interactiveCard = (
    <div
      ref={containerRef}
      className="relative mx-auto min-h-[260px] w-full max-w-lg select-none overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-[#fff5f5] via-white to-[#fff1f2] p-8 text-center shadow-xl backdrop-blur-xs"
    >
      <AnimatePresence mode="wait">
        {hasAnsweredYes ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="flex flex-col items-center justify-center space-y-4 py-4"
          >
            <HeartShower />

            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/40"
              >
                <Heart size={42} fill="currentColor" />
              </motion.div>
              <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-emerald-500 p-1 text-white shadow-md">
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles size={14} /> Resposta Inesquecível!
              </span>
              <h3 className="font-cursive text-2xl font-bold leading-relaxed text-text sm:text-3xl">
                {successMessage}
              </h3>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 py-2"
          >
            {/* Ícone e Pergunta Principal */}
            <div className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Heart size={28} fill="currentColor" />
              </div>
              <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {question}
              </h3>
            </div>

            {/* Botões de Ação */}
            <div className="relative flex flex-wrap items-center justify-center gap-4 pt-2">
              {/* Botão SIM */}
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

              {/* Botão NÃO com Efeito Fujão */}
              <div className="relative">
                <motion.button
                  type="button"
                  onMouseEnter={moveNoButton}
                  onTouchStart={moveNoButton}
                  onClick={moveNoButton}
                  animate={{ x: noPosition.x, y: noPosition.y }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-primary/20 bg-white/80 px-6 py-3 text-sm font-semibold text-text-light shadow-xs backdrop-blur-xs transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  {noText}
                </motion.button>

                {showPlayfulTooltip && isPlayful && (
                  <motion.div
                    key={playfulMessageIndex}
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ left: noPosition.x, top: noPosition.y - 32 }}
                    className="pointer-events-none absolute z-30 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs"
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
  )

  if (mode === 'preview') {
    return (
      <div className="py-2">
        {interactiveCard}
        {hasAnsweredYes && (
          <p className="mt-3 text-center text-xs font-semibold text-primary">
            Uma decisão cheia de afeto para a vida inteira.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
          Pergunta Romântica / Pedido
        </p>
        {hasAnsweredYes && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-2.5 py-1 text-xs font-medium text-primary shadow-xs transition-colors hover:bg-primary/10"
          >
            <RotateCcw size={13} /> Testar Pergunta Novamente
          </button>
        )}
      </div>

      {interactiveCard}

      <div className="space-y-4 rounded-xl border border-primary/15 bg-white/90 p-4">
        <EditorInputSection
          title="Pergunta"
          helperText="O pedido ou pergunta romântica em destaque."
        >
          <input
            type="text"
            value={props.question}
            onChange={(e) => updateProp('question', e.target.value)}
            placeholder="Ex: Quer namorar comigo?"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Pergunta principal"
          />
        </EditorInputSection>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditorInputSection
            title="Texto do Botão 'SIM'"
            helperText="O botão que confirma a resposta."
          >
            <input
              type="text"
              value={props.yesButtonText}
              onChange={(e) => updateProp('yesButtonText', e.target.value)}
              placeholder="Ex: Sim, com todo o coração"
              className={EDITOR_FIELD_BASE_CLASS}
              aria-label="Texto do botão sim"
            />
          </EditorInputSection>

          <EditorInputSection
            title="Texto do Botão 'NÃO'"
            helperText="O botão que tenta fugir da resposta."
          >
            <input
              type="text"
              value={props.noButtonText}
              onChange={(e) => updateProp('noButtonText', e.target.value)}
              placeholder="Ex: Não"
              className={EDITOR_FIELD_BASE_CLASS}
              aria-label="Texto do botão não"
            />
          </EditorInputSection>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-white p-3.5 shadow-xs">
          <div>
            <h4 className="text-sm font-semibold text-text">Botão 'Não' Fujão (Playful Mode)</h4>
            <p className="text-xs text-text-light">
              Faz o botão 'Não' desviar do cursor/toque de forma divertida e carinhosa.
            </p>
          </div>
          <input
            type="checkbox"
            checked={props.isPlayfulNo ?? true}
            onChange={(e) => updateProp('isPlayfulNo', e.target.checked)}
            className="h-5 w-5 accent-primary"
            aria-label="Ativar botão não fujão"
          />
        </div>

        <EditorInputSection
          title="Mensagem de Sucesso"
          helperText="Exibida com chuva de corações quando o SIM for clicado."
        >
          <textarea
            rows={3}
            value={props.successMessage}
            onChange={(e) => updateProp('successMessage', e.target.value)}
            placeholder="Ex: Prometo honrar cada um dos nossos dias com respeito, carinho e cumplicidade."
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Mensagem de sucesso"
          />
        </EditorInputSection>
      </div>
    </div>
  )
}

function areQuizPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const QuizBlock = memo(QuizBlockComponent, areQuizPropsEqual)
