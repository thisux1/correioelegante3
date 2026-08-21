import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Sparkles, Heart } from 'lucide-react'
import type { BlockComponentProps, EnvelopeBlockProps } from '@/editor/types'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

const WAX_COLORS = [
  { name: 'Rubi Romântico', value: '#e11d48' },
  { name: 'Ouro Vintage', value: '#d97706' },
  { name: 'Vinho Bordô', value: '#881337' },
  { name: 'Lavanda Encantada', value: '#9333ea' },
  { name: 'Azul Meia-Noite', value: '#1e3a8a' },
  { name: 'Verde Esmeralda', value: '#047857' },
]

function WaxSeal({
  initial,
  color,
  isBroken,
  onClick,
}: {
  initial?: string
  color?: string
  isBroken?: boolean
  onClick?: () => void
}) {
  const sealColor = color || '#e11d48'
  const sealText = (initial || 'C').slice(0, 2)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="relative z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white"
      style={{
        backgroundColor: sealColor,
        boxShadow: `0 6px 16px -2px ${sealColor}66, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.35)`,
      }}
      aria-label={isBroken ? 'Fechar envelope' : 'Abrir envelope lacrado'}
    >
      <div className="absolute inset-1 rounded-full border border-white/30 border-dashed" />
      <span className="select-none text-xl font-bold tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {sealText}
      </span>
      {isBroken ? null : (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
          className="pointer-events-none absolute -inset-1 rounded-full border border-white/40"
        />
      )}
    </motion.button>
  )
}

function BurstParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30 * Math.PI) / 180,
    distance: 40 + (i % 3) * 20,
    size: 6 + (i % 4) * 3,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      {particles.map((p) => {
        const targetX = Math.cos(p.angle) * p.distance
        const targetY = Math.sin(p.angle) * p.distance

        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: targetX, y: targetY, scale: [0, 1.3, 0], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.id % 2 === 0 ? color : '#fbbf24',
            }}
          />
        )
      })}
    </div>
  )
}

function EnvelopeBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isEnvelope = block.type === 'envelope'
  const props: EnvelopeBlockProps = isEnvelope
    ? block.props
    : {
        recipientName: 'Para quem ilumina meus dias',
        senderName: 'Com todo o meu afeto',
        sealInitial: 'C',
        sealColor: '#e11d48',
        messageSnippet: 'Guardo aqui palavras que nasceram da certeza de que você é parte fundamental da minha história...',
        isOpen: false,
      }

  const [isOpenLocal, setIsOpenLocal] = useState(props.isOpen ?? false)
  const [showBurst, setShowBurst] = useState(false)

  const handleToggleOpen = useCallback(() => {
    const nextState = !isOpenLocal
    setIsOpenLocal(nextState)
    if (nextState) {
      setShowBurst(true)
      setTimeout(() => setShowBurst(false), 900)
    }
  }, [isOpenLocal])

  const updateProp = useCallback(
    <K extends keyof EnvelopeBlockProps>(key: K, value: EnvelopeBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'envelope') {
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

  if (!isEnvelope) {
    return null
  }

  const recipientName = props.recipientName || 'Para alguém especial'
  const senderName = props.senderName || ''
  const sealInitial = props.sealInitial || 'C'
  const sealColor = props.sealColor || '#e11d48'
  const messageSnippet = props.messageSnippet || 'Escreva aqui uma mensagem sincera...'

  const interactiveView = (
    <div className="mx-auto w-full max-w-lg select-none px-2 py-4">
      <div className="relative mx-auto flex flex-col items-center">
        {/* Cartão emergente da carta */}
        <AnimatePresence>
          {isOpenLocal && (
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.92 }}
              animate={{ y: -20, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="relative z-10 -mb-16 w-[92%] rounded-2xl border border-amber-200/80 bg-gradient-to-b from-[#fffbf5] to-[#fef6ee] p-6 shadow-xl"
              style={{
                backgroundImage: 'radial-gradient(#e5e7eb 0.75px, transparent 0.75px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="absolute right-4 top-4 flex items-center gap-1 text-primary/40">
                <Sparkles size={16} />
              </div>
              <p className="font-cursive text-sm font-semibold uppercase tracking-widest text-primary/80">
                {recipientName}
              </p>
              <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <p className="font-cursive whitespace-pre-wrap text-lg leading-relaxed text-text">
                {messageSnippet}
              </p>
              {senderName ? (
                <div className="mt-4 text-right">
                  <p className="font-cursive text-sm italic text-text-light">{senderName}</p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corpo do Envelope */}
        <div
          onClick={handleToggleOpen}
          className="relative z-20 w-full cursor-pointer overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-b from-[#fbf2e9] via-[#f7e6d5] to-[#eed6c0] p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:p-8"
        >
          {/* Triângulos de dobra decorativa */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(217,119,6,0.15) 25%, transparent 25%), linear-gradient(225deg, rgba(217,119,6,0.15) 25%, transparent 25%)',
              backgroundSize: '100% 100%',
            }}
          />

          {/* Destinatário & Remetente na capa do envelope */}
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 py-4 text-center">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm backdrop-blur-xs">
                <Mail size={12} /> Carta Selada
              </span>
              <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {recipientName}
              </h3>
            </div>

            {/* Lacre de Cera Central com Animação de Partículas */}
            <div className="relative my-2">
              {showBurst && <BurstParticles color={sealColor} />}
              <WaxSeal
                initial={sealInitial}
                color={sealColor}
                isBroken={isOpenLocal}
                onClick={handleToggleOpen}
              />
            </div>

            <div className="space-y-1 text-xs text-text-light">
              <p className="flex items-center justify-center gap-1 font-medium">
                <Heart size={12} className="text-primary" fill="currentColor" />
                {isOpenLocal ? 'Toque no envelope para fechar' : 'Toque no lacre para abrir'}
              </p>
              {senderName ? <p className="font-cursive text-sm italic">{senderName}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (mode === 'preview') {
    return interactiveView
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/80 p-4">
      {interactiveView}

      <div className="space-y-4 rounded-xl border border-primary/15 bg-white/90 p-4">
        <EditorInputSection
          title="Destinatário"
          helperText="Nome ou apelido carinhoso de quem recebe a carta."
        >
          <input
            type="text"
            value={props.recipientName}
            onChange={(e) => updateProp('recipientName', e.target.value)}
            placeholder="Ex: Para Helena"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Nome do destinatário"
          />
        </EditorInputSection>

        <EditorInputSection
          title="Remetente"
          helperText="Sua assinatura ou dedicatória no envelope."
        >
          <input
            type="text"
            value={props.senderName ?? ''}
            onChange={(e) => updateProp('senderName', e.target.value)}
            placeholder="Ex: Com todo meu afeto, Thiago"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Nome do remetente"
          />
        </EditorInputSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EditorInputSection
            title="Selo / Inicial do Lacre"
            helperText="Até 2 caracteres (letra ou monograma)."
          >
            <input
              type="text"
              maxLength={2}
              value={props.sealInitial ?? ''}
              onChange={(e) => updateProp('sealInitial', e.target.value)}
              placeholder="Ex: C ou Monograma"
              className={EDITOR_FIELD_BASE_CLASS}
              aria-label="Inicial do lacre"
            />
          </EditorInputSection>

          <EditorInputSection
            title="Cor da Cera"
            helperText="Escolha o tom do lacre personalizado."
          >
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {WAX_COLORS.map((wax) => (
                <button
                  key={wax.value}
                  type="button"
                  onClick={() => updateProp('sealColor', wax.value)}
                  title={wax.name}
                  style={{ backgroundColor: wax.value }}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    props.sealColor === wax.value
                      ? 'border-text scale-110 shadow-md ring-2 ring-primary/40'
                      : 'border-white'
                  }`}
                  aria-label={`Cor da cera: ${wax.name}`}
                />
              ))}
            </div>
          </EditorInputSection>
        </div>

        <EditorInputSection
          title="Mensagem da Carta"
          helperText="O texto revelado quando o destinatário quebra o lacre de cera."
        >
          <textarea
            rows={4}
            value={props.messageSnippet ?? ''}
            onChange={(e) => updateProp('messageSnippet', e.target.value)}
            placeholder="Escreva a mensagem especial que ficará guardada dentro do envelope..."
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Mensagem interna da carta"
          />
        </EditorInputSection>
      </div>
    </div>
  )
}

function areEnvelopePropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const EnvelopeBlock = memo(EnvelopeBlockComponent, areEnvelopePropsEqual)
