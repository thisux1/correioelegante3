import { memo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, ArrowUp } from 'lucide-react'
import { getThemeById } from '@/editor/themes'

export interface EnvelopeUnboxingProps {
  recipientName?: string
  senderName?: string
  title?: string
  theme?: string
  onOpenComplete?: () => void
}

type InteractiveStage =
  | 'airplane-flight'   // Avião lateral voando em curva suave
  | 'impact'            // Pouso suave no solo
  | 'unfolded'          // Envelope fechado com lacre
  | 'opening-seal'      // Lacre quebrando e aba abrindo
  | 'ready-to-pull'     // Aba aberta, carta pronta para ser puxada
  | 'paper-unfold'      // A carta sai e se desdobra num papel vertical longo (3D tri-fold)
  | 'botanical-reveal'  // Pétalas e flores orgânicas desabrocham revelando a carta digital
  | 'finished'

/**
 * Síntese de áudio leve e cristalina (1 único oscilador limpo sem sobrecarga)
 */
function playChime(freq = 659.25) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.85)
  } catch {
    // ignora
  }
}

/**
 * Avião de Papel em Perspectiva Lateral Fiel ao Hero
 */
function SideViewAirplane({ color = '#e11d48' }: { color?: string }) {
  return (
    <svg viewBox="0 0 160 72" className="w-44 h-22 sm:w-52 sm:h-26 filter drop-shadow-xl" fill="none">
      {/* Asa distante */}
      <polygon
        points="155,36 20,6 40,42"
        fill={color}
        fillOpacity="0.75"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Asa próxima */}
      <polygon
        points="155,36 6,12 40,42"
        fill="white"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Gradiente */}
      <polygon
        points="155,36 70,24 6,12"
        fill={color}
        fillOpacity="0.2"
      />
      {/* Quilha */}
      <polygon
        points="155,36 40,42 24,52"
        fill={color}
        fillOpacity="0.95"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Linha de vinco */}
      <line x1="40" y1="42" x2="155" y2="36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Pétalas botânicas orgânicas caindo suavemente
 */
function BotanicalPetals({ color }: { color: string }) {
  const petals = [
    { x: -120, y: -80, r: 25, delay: 0.1 },
    { x: 130, y: -60, r: -35, delay: 0.25 },
    { x: -90, y: 110, r: 45, delay: 0.2 },
    { x: 110, y: 130, r: -20, delay: 0.35 },
    { x: 0, y: -140, r: 15, delay: 0.15 },
    { x: -40, y: 170, r: -50, delay: 0.3 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      {petals.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: p.x * 0.4, y: p.y * 0.4 - 30, opacity: 0, scale: 0.5, rotate: p.r - 20 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 0.9, 0],
            scale: [0.5, 1.1, 0.9],
            rotate: [p.r - 20, p.r + 30],
          }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
          className="absolute"
        >
          {/* Pétala de rosa / flor de cerejeira em formato de gota orgânica */}
          <svg viewBox="0 0 30 40" className="w-7 h-9 drop-shadow-md">
            <path
              d="M15,2 C24,10 30,22 25,32 C20,40 10,40 5,32 C0,22 6,10 15,2 Z"
              fill={color}
              fillOpacity="0.85"
            />
            <path
              d="M15,5 C20,12 22,22 18,30"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

function EnvelopeUnboxingComponent({
  recipientName,
  senderName,
  title,
  theme,
  onOpenComplete,
}: EnvelopeUnboxingProps) {
  const [stage, setStage] = useState<InteractiveStage>('airplane-flight')
  const themeObj = getThemeById(theme)
  const vars = themeObj.variables

  const primaryColor = vars.primary || '#e11d48'
  const textColor = vars.text || '#1c1917'
  const surfaceColor = vars.surface || '#ffffff'

  // Valor dinâmico do arrasto da carta
  const dragY = useMotionValue(0)

  // 1. Avião voa em zigue-zague orgânico por 2.6s e pousa
  useEffect(() => {
    const tFlight = setTimeout(() => {
      setStage('impact')
      playChime(440)
    }, 2600)

    const tUnfold = setTimeout(() => {
      setStage('unfolded')
    }, 3050)

    return () => {
      clearTimeout(tFlight)
      clearTimeout(tUnfold)
    }
  }, [])

  // Gesto 1: Tocar no lacre
  const handleOpenSeal = useCallback(() => {
    if (stage !== 'unfolded') return

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(30)
      } catch {
        // ignora
      }
    }

    playChime(587.33)
    setStage('opening-seal')

    setTimeout(() => {
      setStage('ready-to-pull')
    }, 550)
  }, [stage])

  // Gesto 2: Puxar a carta para cima -> A carta se desdobra em formato vertical longo (3D)
  const handlePullLetter = useCallback(() => {
    if (stage !== 'ready-to-pull' && stage !== 'opening-seal') return

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40)
      } catch {
        // ignora
      }
    }

    playChime(659.25)
    setStage('paper-unfold')

    // Após o papel desdobrar, desabrocham as flores e revela a carta digital
    setTimeout(() => {
      setStage('botanical-reveal')
      playChime(880)
    }, 1100)

    setTimeout(() => {
      setStage('finished')
      onOpenComplete?.()
    }, 2000)
  }, [stage, onOpenComplete])

  const handleSkip = useCallback(() => {
    setStage('finished')
    onOpenComplete?.()
  }, [onOpenComplete])

  if (stage === 'finished') {
    return null
  }

  const isEnvelopeVisible =
    stage === 'unfolded' ||
    stage === 'opening-seal' ||
    stage === 'ready-to-pull'

  return (
    <AnimatePresence>
      <motion.div
        key="unboxing-organic-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden select-none pb-8 sm:pb-12"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}22 0%, rgba(12, 8, 14, 0.96) 100%)`,
        }}
      >
        {/* Botão de Pular */}
        <div className="absolute top-6 right-6 z-50">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-black/40 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg transition-colors hover:bg-black/60 hover:text-white cursor-pointer"
          >
            <span>Pular</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Aura de luz ambiente suave */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 h-[450px] w-[450px] rounded-full blur-[120px] opacity-35"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />

        {/* Cabeçalho superior */}
        <motion.div
          animate={
            stage === 'paper-unfold' || stage === 'botanical-reveal'
              ? { opacity: 0, y: -20 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.4 }}
          className="pt-10 sm:pt-14 text-center z-20 space-y-1 px-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 text-xs font-medium tracking-wide uppercase">
            <Sparkles size={13} className="text-amber-300" />
            Correio Elegante
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white drop-shadow-md">
            {recipientName ? `Uma carta para ${recipientName}` : 'Você recebeu uma carta'}
          </h2>
          {title ? (
            <p className="text-xs text-white/80 font-serif italic">{title}</p>
          ) : null}
        </motion.div>

        {/* 1. FASE DO VOO EM ZIGUE-ZAGUE ORGÂNICO */}
        {stage === 'airplane-flight' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none my-auto">
            <motion.div
              initial={{
                x: '-85vw',
                y: '-40vh',
                scale: 0.6,
                opacity: 0,
              }}
              animate={{
                x: ['-85vw', '-40vw', '15vw', '-10vw', '0vw'],
                y: ['-40vh', '-18vh', '-3vh', '9vh', '16vh'],
                scale: [0.6, 0.78, 0.95, 1.05, 1],
                opacity: [0, 1, 1, 1, 1],
              }}
              transition={{
                duration: 2.6,
                ease: 'easeInOut',
                times: [0, 0.3, 0.6, 0.85, 1.0],
              }}
              className="relative flex items-center justify-center"
            >
              <motion.div
                initial={{ rotate: 22 }}
                animate={{
                  rotate: [22, 14, -8, 6, 0],
                  rotateX: [16, 8, -6, 4, 0],
                }}
                transition={{
                  duration: 2.6,
                  ease: 'easeInOut',
                  times: [0, 0.3, 0.6, 0.85, 1.0],
                }}
              >
                <SideViewAirplane color={primaryColor} />
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* 2. POUSO SUAVE */}
        {stage === 'impact' && (
          <div className="relative flex items-center justify-center my-auto translate-y-[16vh]">
            <motion.div
              initial={{ scaleX: 1, scaleY: 1 }}
              animate={{
                scaleX: [1, 1.2, 0.95, 1],
                scaleY: [1, 0.8, 1.05, 1],
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <SideViewAirplane color={primaryColor} />
            </motion.div>
          </div>
        )}

        {/* 3. ENVELOPE COM CARTA PUXÁVEL */}
        {isEnvelopeVisible && (
          <div
            className="relative w-full max-w-[420px] h-[260px] sm:h-[280px] flex items-center justify-center z-20 px-4 mt-auto mb-4"
            style={{ perspective: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full rounded-2xl shadow-2xl border border-white/20 overflow-visible"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 25px 50px -12px ${primaryColor}66, 0 10px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Cavidade Traseira */}
              <div
                className="absolute inset-0 rounded-2xl opacity-80"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)`,
                }}
              />

              {/* A folha dobrada dentro do envelope */}
              <motion.div
                drag={stage === 'ready-to-pull' ? 'y' : false}
                dragConstraints={{ top: -280, bottom: 0 }}
                dragElastic={0.2}
                style={{
                  y: dragY,
                  backgroundColor: surfaceColor,
                  color: textColor,
                }}
                animate={
                  stage === 'ready-to-pull'
                    ? { y: [-15, -45, -35] }
                    : { y: 0 }
                }
                transition={
                  stage === 'ready-to-pull'
                    ? { duration: 0.65, ease: 'easeOut' }
                    : undefined
                }
                onDragEnd={(_e, info) => {
                  if (info.offset.y < -50 || info.velocity.y < -120) {
                    handlePullLetter()
                  }
                }}
                onClick={() => {
                  if (stage === 'ready-to-pull') {
                    handlePullLetter()
                  }
                }}
                className={`absolute inset-x-4 top-4 bottom-3 rounded-2xl p-5 shadow-2xl border border-primary/20 flex flex-col justify-between cursor-grab active:cursor-grabbing z-20 ${
                  stage === 'ready-to-pull' ? 'ring-4 ring-amber-300/70 ring-offset-2' : ''
                }`}
              >
                {/* Dica de puxar */}
                {stage === 'ready-to-pull' && (
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-xs shadow-lg animate-bounce flex items-center gap-1">
                    <ArrowUp size={13} />
                    <span>Puxe a carta para cima</span>
                  </div>
                )}

                <div className="space-y-1.5 text-center pt-1">
                  <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Heart size={18} fill="currentColor" />
                  </div>
                  <h3 className="font-display font-bold text-base text-primary">
                    {recipientName ? `Para ${recipientName}` : 'Uma Carta Especial'}
                  </h3>
                </div>

                <div className="space-y-2 py-3 px-2">
                  <div className="h-2 w-full bg-text/15 rounded-full" />
                  <div className="h-2 w-4/5 bg-text/15 rounded-full" />
                </div>

                <div className="text-right pr-2">
                  <p className="font-cursive text-sm text-primary font-bold">
                    {senderName ? `Com amor, ${senderName}` : 'Com todo amor ❤️'}
                  </p>
                </div>
              </motion.div>

              {/* Bolso Frontal */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon points="0,0 50,55 0,100" fill={primaryColor} />
                  <polygon points="100,0 50,55 100,100" fill={primaryColor} />
                  <polygon points="0,100 50,50 100,100" fill={primaryColor} fillOpacity="0.96" />
                </svg>
              </div>

              {/* Aba Superior Triangular */}
              <motion.div
                animate={
                  stage === 'opening-seal' || stage === 'ready-to-pull'
                    ? { rotateX: -180, zIndex: 10 }
                    : { rotateX: 0, zIndex: 35 }
                }
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                className="absolute top-0 inset-x-0 h-1/2 cursor-pointer"
                onClick={handleOpenSeal}
              >
                <svg
                  className="w-full h-full text-white/15 drop-shadow-md"
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                >
                  <polygon points="0,0 50,50 100,0" fill={primaryColor} />
                  <path d="M0,0 L50,50 L100,0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                </svg>
              </motion.div>

              {/* Selo de Cera 3D */}
              {stage === 'unfolded' && (
                <div
                  className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer"
                  onClick={handleOpenSeal}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(251, 191, 36, 0.5)',
                        '0 0 0 12px rgba(251, 191, 36, 0)',
                        '0 0 0 0 rgba(251, 191, 36, 0)',
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 text-white shadow-2xl border-2 border-amber-300/80 ring-4 ring-amber-400/30"
                  >
                    <Heart className="h-7 w-7 fill-white text-white drop-shadow-md" />
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
                      <Sparkles size={11} />
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* 4. FASE DO PAPEL SE DESDOBRANDO VERTICALMENTE EM FORMATO RETANGULAR LONGO (3D TRI-FOLD) */}
        {(stage === 'paper-unfold' || stage === 'botanical-reveal') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" style={{ perspective: 1400 }}>
            {/* Pétalas caindo suavemente */}
            {stage === 'botanical-reveal' && <BotanicalPetals color={primaryColor} />}

            {/* A Folha de Papel Longa em Formato Retangular Vertical */}
            <motion.div
              initial={{
                y: 80,
                scale: 0.85,
                height: 260,
                opacity: 0.9,
              }}
              animate={
                stage === 'botanical-reveal'
                  ? {
                      y: 0,
                      scale: 1,
                      height: 'min(78vh, 620px)',
                      opacity: [1, 1, 0.95, 0],
                    }
                  : {
                      y: 0,
                      scale: 1,
                      height: 'min(78vh, 620px)',
                      opacity: 1,
                    }
              }
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[430px] rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] border-2 border-amber-200/40 flex flex-col justify-between overflow-hidden"
              style={{
                backgroundColor: surfaceColor,
                color: textColor,
                backgroundImage: `radial-gradient(${primaryColor}08 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            >
              {/* Painel Superior Desdobrando em 3D */}
              <motion.div
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                className="space-y-3 text-center border-b border-primary/15 pb-4"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                  <Heart size={24} fill="currentColor" />
                </div>
                <h3 className="font-display font-bold text-2xl text-primary drop-shadow-sm">
                  {recipientName ? `Querida(o) ${recipientName}` : 'Uma Carta Especial Para Você'}
                </h3>
                <div className="h-1 w-24 bg-primary/20 rounded-full mx-auto" />
              </motion.div>

              {/* Corpo da Carta com Ramos Botânicos e Caligrafia */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="my-auto space-y-4 py-4 px-2"
              >
                {/* Linhas elegantes de caligrafia em textura de papel */}
                <div className="space-y-3">
                  <div className="h-2.5 w-full bg-text/15 rounded-full" />
                  <div className="h-2.5 w-11/12 bg-text/15 rounded-full" />
                  <div className="h-2.5 w-full bg-text/15 rounded-full" />
                  <div className="h-2.5 w-4/5 bg-text/15 rounded-full" />
                  <div className="h-2.5 w-9/12 bg-text/15 rounded-full" />
                </div>

                {/* Destaque sutil com aroma botânico */}
                <div className="flex items-center justify-center gap-2 pt-2 text-primary/60 text-xs font-serif italic">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Escrito com carinho e guardado no coração</span>
                  <Sparkles size={13} className="text-amber-400" />
                </div>
              </motion.div>

              {/* Painel Inferior Desdobrando em 3D */}
              <motion.div
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}
                className="pt-4 border-t border-primary/15 flex items-center justify-between"
              >
                <div className="flex items-center gap-1 text-xs text-text-light font-medium">
                  <span>Correio Elegante</span>
                </div>
                <p className="font-cursive text-lg text-primary font-bold">
                  {senderName ? `Com amor, ${senderName}` : 'Com todo o meu amor ❤️'}
                </p>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* 5. BOTÃO GUIA / CONVITE AO TOQUE */}
        {stage === 'unfolded' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-20 text-center pb-2"
          >
            <button
              type="button"
              onClick={handleOpenSeal}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/95 text-primary text-sm font-bold shadow-xl shadow-black/30 backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Heart size={16} className="fill-primary text-primary transition-transform group-hover:scale-125" />
              <span>Toque no lacre para abrir o envelope</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export const EnvelopeUnboxing = memo(EnvelopeUnboxingComponent)
