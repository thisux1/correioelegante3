import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, X, Check } from 'lucide-react'


import type { BlockComponentProps, EnvelopeBlockProps } from '@/editor/types'

const WAX_COLORS = [
  { name: 'Rubi Romântico', value: '#e11d48' },
  { name: 'Ouro Vintage', value: '#d97706' },
  { name: 'Vinho Bordô', value: '#881337' },
  { name: 'Lavanda Encantada', value: '#9333ea' },
  { name: 'Azul Meia-Noite', value: '#1e3a8a' },
  { name: 'Verde Esmeralda', value: '#047857' },
  { name: 'Rosa Quartzo', value: '#ec4899' },
  { name: 'Carvão Imperial', value: '#1f2937' },
]

function WaxSeal({
  initial,
  color,
  isBroken,
  isEditMode,
  onClick,
}: {
  initial?: string
  color?: string
  isBroken?: boolean
  isEditMode?: boolean
  onClick?: () => void
}) {
  const sealColor = color || '#e11d48'
  const sealText = (initial || 'C').slice(0, 2).toUpperCase()

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="group relative z-20 flex h-14 w-14 items-center justify-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        backgroundColor: sealColor,
        boxShadow: `0 6px 20px -2px ${sealColor}80, inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -2px 6px rgba(0,0,0,0.4)`,
      }}
      aria-label={
        isEditMode
          ? 'Personalizar selo de cera'
          : isBroken
            ? 'Fechar envelope'
            : 'Abrir envelope lacrado'
      }
      title={isEditMode ? 'Clique para personalizar cor e inicial do selo' : undefined}
    >
      <div className="absolute inset-1 rounded-full border border-white/40 border-dashed" />
      <span className="select-none font-serif text-xl font-bold tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
        {sealText}
      </span>
      {!isBroken && !isEditMode && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
          className="pointer-events-none absolute -inset-1 rounded-full border border-white/40"
        />
      )}
    </motion.button>
  )
}

function BurstParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i * (360 / 14) * Math.PI) / 180,
    distance: 45 + (i % 3) * 22,
    size: 5 + (i % 4) * 3,
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
            animate={{ x: targetX, y: targetY, scale: [0, 1.4, 0], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.id % 2 === 0 ? color : '#fbbf24',
              boxShadow: '0 0 8px rgba(251,191,36,0.6)',
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
        messageSnippet: 'Guardo aqui palavras que nasceram da certeza de que você é parte fundamental da minha história.',
        isOpen: false,
      }

  const [isOpenLocal, setIsOpenLocal] = useState(props.isOpen ?? false)
  const [showBurst, setShowBurst] = useState(false)
  const [showSealPopover, setShowSealPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const isEditMode = mode === 'edit'

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

  // Fechar popover ao clicar fora ou ao pressionar Escape
  useEffect(() => {
    if (!showSealPopover) return

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        setShowSealPopover(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSealPopover(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('touchstart', handlePointerDownOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('touchstart', handlePointerDownOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSealPopover])

  if (!isEnvelope) {
    return null
  }

  const recipientName = props.recipientName || 'Para alguém especial'
  const senderName = props.senderName || ''
  const sealInitial = props.sealInitial || 'C'
  const sealColor = props.sealColor || '#e11d48'
  const messageSnippet = props.messageSnippet || ''

  return (
    <div className="relative mx-auto w-full max-w-lg select-none px-2 py-4">


      <div className="relative mx-auto flex flex-col items-center">
        {/* Folha Interna da Carta (Emerge ao Abrir) */}
        <AnimatePresence>
          {isOpenLocal && (
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.94 }}
              animate={{ y: -16, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="relative z-10 -mb-12 w-[94%] rounded-2xl border border-amber-200/90 bg-gradient-to-b from-[#fffefc] via-[#fffdf9] to-[#fbf4ea] p-6 shadow-2xl sm:p-7"
              style={{
                backgroundImage: 'radial-gradient(#d1d5db 0.8px, transparent 0.8px)',
                backgroundSize: '18px 18px',
              }}
            >
              <div className="absolute right-4 top-4 flex items-center gap-1 text-primary/40">
                <Sparkles size={16} />
              </div>

              {/* Destinatário no Cabeçalho da Carta */}
              <div className="mb-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={props.recipientName}
                    onChange={(e) => updateProp('recipientName', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Para quem ilumina meus dias"
                    className="w-full bg-transparent font-cursive text-base font-semibold uppercase tracking-widest text-primary/90 placeholder:text-primary/30 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-0.5"
                    aria-label="Nome do destinatário"
                  />
                ) : (
                  <p className="font-cursive text-sm font-semibold uppercase tracking-widest text-primary/80">
                    {recipientName}
                  </p>
                )}
              </div>

              <div className="my-2.5 h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

              {/* Corpo da Carta (Mensagem Secreta Revelada) */}
              <div className="my-2">
                {isEditMode ? (
                  <textarea
                    rows={4}
                    value={props.messageSnippet ?? ''}
                    onChange={(e) => updateProp('messageSnippet', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Escreva aqui a mensagem especial revelada ao abrir a carta..."
                    className="w-full resize-none rounded-xl bg-transparent font-cursive text-lg leading-relaxed text-text placeholder:text-text-light/40 border border-dashed border-transparent hover:border-amber-400/40 focus:border-primary/40 focus:bg-white/40 focus:outline-none p-1.5 transition-colors"
                    aria-label="Mensagem interna da carta"
                  />
                ) : (
                  <p className="font-cursive whitespace-pre-wrap text-lg leading-relaxed text-text">
                    {messageSnippet || 'Uma mensagem sincera guardada com todo carinho...'}
                  </p>
                )}
              </div>

              {/* Assinatura / Remetente no Rodapé da Carta */}
              <div className="mt-3 text-right">
                {isEditMode ? (
                  <input
                    type="text"
                    value={props.senderName ?? ''}
                    onChange={(e) => updateProp('senderName', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Com todo o meu afeto, Seu Nome"
                    className="w-full max-w-[240px] bg-transparent text-right font-cursive text-sm italic text-text-light placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-0.5"
                    aria-label="Nome do remetente"
                  />
                ) : senderName ? (
                  <p className="font-cursive text-sm italic text-text-light">{senderName}</p>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corpo do Envelope */}
        <div
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (
              target.tagName === 'INPUT' ||
              target.tagName === 'TEXTAREA' ||
              target.closest('[data-popover="seal"]')
            ) {
              return
            }
            handleToggleOpen()
          }}
          className="relative z-20 w-full cursor-pointer overflow-visible rounded-3xl border border-amber-300/50 bg-gradient-to-b from-[#fbf4ea] via-[#f5e7d6] to-[#edd7bf] p-6 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-8"
        >
          {/* Textura sutil e dobras decorativas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(217,119,6,0.18) 25%, transparent 25%), linear-gradient(225deg, rgba(217,119,6,0.18) 25%, transparent 25%)',
              backgroundSize: '100% 100%',
            }}
          />

          {/* Conteúdo Central do Envelope */}
          <div className="relative z-10 flex flex-col items-center justify-between gap-5 py-3 text-center">
            {/* Destinatário na Capa do Envelope */}
            <div className="w-full space-y-1">
              <div className="mt-1">
                {isEditMode ? (
                  <input
                    type="text"
                    value={props.recipientName}
                    onChange={(e) => updateProp('recipientName', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Para quem ilumina meus dias"
                    className="w-full bg-transparent text-center font-cursive text-2xl sm:text-3xl font-bold tracking-tight text-text placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-0.5"
                    aria-label="Nome do destinatário no envelope"
                  />
                ) : (
                  <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">
                    {recipientName}
                  </h3>
                )}
              </div>
            </div>

            {/* Selo de Cera Central com Popover Contextual */}
            <div ref={popoverRef} className="relative my-2">
              {showBurst && <BurstParticles color={sealColor} />}

              <WaxSeal
                initial={sealInitial}
                color={sealColor}
                isBroken={isOpenLocal}
                isEditMode={isEditMode}
                onClick={() => {
                  if (isEditMode) {
                    setShowSealPopover((prev) => !prev)
                    if (!isOpenLocal) {
                      setIsOpenLocal(true)
                    }
                  } else {
                    handleToggleOpen()
                  }
                }}
              />

              {/* Popover Contextual Discreto para o Selo de Cera (Edit Mode) */}
              <AnimatePresence>
                {isEditMode && showSealPopover && (
                  <motion.div
                    data-popover="seal"
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.16 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -bottom-2 translate-y-full left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl border border-amber-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md"
                  >
                    {/* Cabeçalho do Popover */}
                    <div className="flex items-center justify-between border-b border-amber-100 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-xs font-bold text-text">Selo de Cera</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSealPopover(false)}
                        className="rounded-lg p-1 text-text-light hover:bg-stone-100 hover:text-text"
                        aria-label="Fechar opções do selo"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Monograma / Inicial */}
                    <div className="mb-3 space-y-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-text-light">
                        Inicial / Monograma (1-2 letras)
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        value={props.sealInitial ?? ''}
                        onChange={(e) => updateProp('sealInitial', e.target.value.toUpperCase())}
                        placeholder="Ex: C"
                        className="w-full rounded-xl border border-primary/20 bg-white px-3 py-1.5 text-center font-serif text-base font-bold text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/40"
                        aria-label="Inicial do lacre"
                      />
                    </div>

                    {/* Cores de Cera */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-text-light">
                        Cor da Cera
                      </label>
                      <div className="grid grid-cols-4 gap-2 pt-0.5">
                        {WAX_COLORS.map((wax) => {
                          const isSelected = (props.sealColor || '#e11d48') === wax.value
                          return (
                            <button
                              key={wax.value}
                              type="button"
                              onClick={() => updateProp('sealColor', wax.value)}
                              title={wax.name}
                              style={{ backgroundColor: wax.value }}
                              className={`relative flex h-8 w-full items-center justify-center rounded-xl shadow-xs transition-transform hover:scale-105 active:scale-95 ${
                                isSelected
                                  ? 'ring-2 ring-primary ring-offset-2 scale-105'
                                  : 'border border-black/10'
                              }`}
                              aria-label={`Cor da cera: ${wax.name}`}
                            >
                              {isSelected && <Check size={14} className="text-white drop-shadow-sm" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remetente & Dica de Interação */}
            <div className="w-full space-y-1 text-xs text-text-light">
              <p className="flex items-center justify-center gap-1 font-medium">
                <Heart size={12} className="text-primary" fill="currentColor" />
                {isEditMode ? (
                  <span className="text-[11px] text-text-muted">
                    {isOpenLocal
                      ? 'Toque na carta para fechar'
                      : 'Toque na carta para abrir e editar a mensagem'}
                  </span>
                ) : isOpenLocal ? (
                  'Toque no envelope para fechar'
                ) : (
                  'Toque no lacre para abrir'
                )}
              </p>

              <div className="pt-0.5">
                {isEditMode ? (
                  <input
                    type="text"
                    value={props.senderName ?? ''}
                    onChange={(e) => updateProp('senderName', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Com todo meu afeto, Seu Nome"
                    className="w-full max-w-[240px] mx-auto bg-transparent text-center font-cursive text-sm italic text-text-light placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-0.5"
                    aria-label="Nome do remetente no envelope"
                  />
                ) : senderName ? (
                  <p className="font-cursive text-sm italic">{senderName}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function areEnvelopePropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const EnvelopeBlock = memo(EnvelopeBlockComponent, areEnvelopePropsEqual)
