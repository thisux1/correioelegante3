import { memo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
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
  | 'airplane-flight'   // Avião lateral voando em zigue-zague orgânico
  | 'impact'            // Impacto com o chão (squash, poeira mágica e som)
  | 'unfolded'          // Avião se desdobrou no envelope fechado com lacre
  | 'opening-seal'      // Lacre quebrando e aba abrindo
  | 'ready-to-pull'     // Aba aberta, carta pronta para ser puxada
  | 'expanding-letter'  // A mesma carta sobe e cresce continuamente com feixes de luz e confetes
  | 'whiteout'          // Clarão branco suave e transição seamless
  | 'finished'

/**
 * Síntese suave de impacto no solo via Web Audio API
 */
function playLandingChime() {
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

    // Som de impacto suave no solo
    const impactOsc = ctx.createOscillator()
    const impactGain = ctx.createGain()
    impactOsc.type = 'sine'
    impactOsc.frequency.setValueAtTime(160, now)
    impactOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15)
    impactGain.gain.setValueAtTime(0.2, now)
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    impactOsc.connect(impactGain)
    impactGain.connect(ctx.destination)
    impactOsc.start(now)
    impactOsc.stop(now + 0.22)

    // Arpeggio de apresentação
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + 0.1 + index * 0.08)

      gain.gain.setValueAtTime(0, now + 0.1 + index * 0.08)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1 + index * 0.08 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + index * 0.08 + 1.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + 0.1 + index * 0.08)
      osc.stop(now + 0.1 + index * 0.08 + 1.2)
    })
  } catch {
    // Ignora se bloqueado
  }
}

/**
 * Grande acorde celestial de revelação da carta (Harp Glissando + Bell Harmonics)
 */
function playGrandRevealChime() {
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
    // Glissando ascendente luxuoso (D4, F#4, A4, C#5, E5, A5, C#6, E6)
    const glissNotes = [293.66, 369.99, 440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51]

    glissNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.05)

      gain.gain.setValueAtTime(0, now + idx * 0.05)
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.05)
      osc.stop(now + idx * 0.05 + 1.9)
    })
  } catch {
    // Ignora se bloqueado
  }
}

/**
 * Avião de Papel em Perspectiva Lateral Fiel ao Hero
 */
function SideViewAirplane({ color = '#e11d48' }: { color?: string }) {
  return (
    <svg viewBox="0 0 160 72" className="w-44 h-22 sm:w-52 sm:h-26 filter drop-shadow-2xl" fill="none">
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

      {/* Gradiente de reflexo na asa */}
      <polygon
        points="155,36 70,24 6,12"
        fill={color}
        fillOpacity="0.2"
      />

      {/* Quilha / Corpo inferior */}
      <polygon
        points="155,36 40,42 24,52"
        fill={color}
        fillOpacity="0.95"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Sombra interna da dobra */}
      <polygon
        points="155,36 40,42 32,47"
        fill="rgba(0,0,0,0.22)"
      />

      {/* Linha de vinco central */}
      <line x1="40" y1="42" x2="155" y2="36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Anel de impacto e poeira mágica ao atingir o solo
 */
function ImpactShockwave({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        style={{ borderColor: color }}
        className="absolute w-36 h-18 rounded-[100%] border-2 border-amber-300 shadow-lg shadow-amber-300/40"
      />

      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * (360 / 14) * Math.PI) / 180
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * 70,
              y: Math.sin(angle) * 35 + 10,
              scale: [0, 1.3, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-md shadow-amber-300"
          />
        )
      })}
    </div>
  )
}

/**
 * Feixes de luz volumétricos divinos (God Rays) giratórios
 */
function VolumetricLightBeams({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
      animate={{
        opacity: [0, 0.9, 0.7, 0],
        scale: [0.3, 1.4, 2.2],
        rotate: 90,
      }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
    >
      <div
        className="w-[850px] h-[850px] rounded-full blur-[1px]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${color}55 25deg, transparent 50deg, #fbbf2466 85deg, transparent 110deg, ${color}55 155deg, transparent 180deg, #fbbf2466 225deg, transparent 250deg, ${color}55 295deg, transparent 330deg, #fbbf2466 350deg, transparent 360deg)`,
          maskImage: 'radial-gradient(circle at center, black 15%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 15%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}

/**
 * Explosão de confetes mágicos, corações 3D e poeira dourada na revelação
 */
function GrandRevealParticles({ color = '#e11d48' }: { color?: string }) {
  const particles = Array.from({ length: 36 }, (_, i) => {
    const angle = (i * (360 / 36) * Math.PI) / 180
    const distance = 90 + (i % 6) * 45
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 40,
      scale: 0.8 + (i % 4) * 0.35,
      rotateZ: (i * 47) % 360,
      isHeart: i % 3 === 0,
      isStar: i % 3 === 1,
      colorVariant: i % 2 === 0 ? color : '#fbbf24',
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      {/* Onda de choque prismática */}
      <motion.div
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: [0.2, 2.5, 4], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-44 h-44 rounded-full border-4 border-amber-300 shadow-[0_0_60px_rgba(251,191,36,0.8)]"
      />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, p.scale, 0],
            opacity: [1, 1, 0],
            rotate: [0, p.rotateZ],
          }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="absolute flex items-center justify-center"
        >
          {p.isHeart ? (
            <Heart size={20 * p.scale} fill={p.colorVariant} style={{ color: p.colorVariant }} className="filter drop-shadow-md" />
          ) : p.isStar ? (
            <Sparkles size={18 * p.scale} className="text-amber-300 filter drop-shadow-lg" />
          ) : (
            <div
              className="rounded-full bg-gradient-to-tr from-amber-300 to-rose-400 shadow-md shadow-amber-300/80"
              style={{ width: 10 * p.scale, height: 10 * p.scale }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Partículas de luz dourada ao quebrar o lacre
 */
function SealBurstParticles({ color = '#e11d48' }: { color?: string }) {
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * (360 / 24) * Math.PI) / 180
    const distance = 70 + (i % 4) * 30
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 7 + (i % 3) * 5,
      isHeart: i % 2 === 0,
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1.3, 0],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute flex items-center justify-center"
        >
          {p.isHeart ? (
            <Heart size={p.size} fill={color} style={{ color }} />
          ) : (
            <div
              className="rounded-full bg-amber-300 shadow-md shadow-amber-300/80"
              style={{ width: p.size / 1.5, height: p.size / 1.5 }}
            />
          )}
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

  // Valor dinâmico do arrasto da carta:
  // A escala só começa a crescer depois que a carta já deslizou -90px para fora do envelope!
  const dragY = useMotionValue(0)
  const letterScale = useTransform(dragY, [0, -90, -220, -360], [1, 1, 1.45, 2.6])

  // 1. Avião voa em zigue-zague orgânico por 2.8s antes do impacto
  useEffect(() => {
    const tFlight = setTimeout(() => {
      setStage('impact')
      playLandingChime()

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(35)
        } catch {
          // ignora
        }
      }
    }, 2850)

    // 2. Após o impacto, desdobra no envelope na parte inferior da tela
    const tUnfold = setTimeout(() => {
      setStage('unfolded')
    }, 3350)

    return () => {
      clearTimeout(tFlight)
      clearTimeout(tUnfold)
    }
  }, [])

  // Gesto 1: Usuário toca no lacre para abrir
  const handleOpenSeal = useCallback(() => {
    if (stage !== 'unfolded') return

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([30, 45, 30])
      } catch {
        // ignora
      }
    }

    setStage('opening-seal')

    // Aba abre e carta fica pronta para ser puxada
    setTimeout(() => {
      setStage('ready-to-pull')
    }, 600)
  }, [stage])

  // Gesto 2: Usuário puxa a carta para cima -> Dispara feixes divinos, chuva de partículas e som celestial
  const handlePullLetter = useCallback(() => {
    if (stage !== 'ready-to-pull' && stage !== 'opening-seal') return

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40])
      } catch {
        // ignora
      }
    }

    // Toca o acorde celestial
    playGrandRevealChime()

    // A mesma carta continua subindo em direção à tela com efeitos cinematográficos
    setStage('expanding-letter')

    // Clarão branco suave
    setTimeout(() => {
      setStage('whiteout')
    }, 850)

    // Finaliza e entrega a página pronta
    setTimeout(() => {
      setStage('finished')
      onOpenComplete?.()
    }, 1400)
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
    stage === 'ready-to-pull' ||
    stage === 'expanding-letter'

  return (
    <AnimatePresence>
      <motion.div
        key="unboxing-cinematic-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden select-none pb-8 sm:pb-12"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}28 0%, rgba(10, 6, 12, 0.96) 100%)`,
        }}
      >
        {/* Feixes Divinos de Luz (God Rays) na Revelação */}
        {stage === 'expanding-letter' && (
          <VolumetricLightBeams color={primaryColor} />
        )}

        {/* Chuva de Confetes & Corações 3D na Revelação */}
        {stage === 'expanding-letter' && (
          <GrandRevealParticles color={primaryColor} />
        )}

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

        {/* Aura de luz ambiente */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 h-[540px] w-[540px] rounded-full blur-[140px] opacity-40"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />

        {/* Cabeçalho informativo no topo */}
        <motion.div
          animate={
            stage === 'expanding-letter'
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
                y: '-42vh',
                scale: 0.55,
                opacity: 0,
              }}
              animate={{
                x: ['-85vw', '-40vw', '15vw', '-10vw', '0vw'],
                y: ['-42vh', '-20vh', '-4vh', '8vh', '15vh'],
                scale: [0.55, 0.75, 0.95, 1.05, 1],
                opacity: [0, 1, 1, 1, 1],
              }}
              transition={{
                duration: 2.85,
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
                  duration: 2.85,
                  ease: 'easeInOut',
                  times: [0, 0.3, 0.6, 0.85, 1.0],
                }}
              >
                <SideViewAirplane color={primaryColor} />
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* 2. FASE DE IMPACTO NO CHÃO */}
        {stage === 'impact' && (
          <div className="relative flex items-center justify-center my-auto translate-y-[15vh]">
            <ImpactShockwave color={primaryColor} />

            <motion.div
              initial={{ scaleX: 1, scaleY: 1, y: 0 }}
              animate={{
                scaleX: [1, 1.28, 0.95, 1],
                scaleY: [1, 0.72, 1.05, 1],
                y: [0, 8, -6, 0],
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <SideViewAirplane color={primaryColor} />
            </motion.div>
          </div>
        )}

        {/* 3. FASE DO ENVELOPE E DA CARTA PERSISTENTE */}
        {isEnvelopeVisible && (
          <div
            className="relative w-full max-w-[430px] h-[270px] sm:h-[290px] flex items-center justify-center z-20 px-4 mt-auto mb-4"
            style={{ perspective: 1200 }}
          >
            {/* Corpo do Envelope */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0.6 }}
              animate={
                stage === 'expanding-letter'
                  ? { scale: 0.85, y: 120, opacity: 0 }
                  : { scale: 1, y: 0, opacity: 1 }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full rounded-2xl shadow-2xl border border-white/20 overflow-visible"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 25px 50px -12px ${primaryColor}66, 0 10px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Cavidade Traseira */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)`,
                }}
              />

              {/* A CARTA PERSISTENTE */}
              <motion.div
                drag={stage === 'ready-to-pull' ? 'y' : false}
                dragConstraints={{ top: -320, bottom: 0 }}
                dragElastic={0.25}
                style={{
                  y: stage === 'expanding-letter' ? undefined : dragY,
                  scale: stage === 'expanding-letter' ? undefined : letterScale,
                  backgroundColor: surfaceColor,
                  color: textColor,
                }}
                animate={
                  stage === 'expanding-letter'
                    ? {
                        y: -360,
                        scale: 3.6,
                        opacity: [1, 1, 0.3],
                        zIndex: 70,
                      }
                    : stage === 'ready-to-pull'
                    ? { y: [-15, -45, -35] }
                    : { y: 0 }
                }
                transition={
                  stage === 'expanding-letter'
                    ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
                    : stage === 'ready-to-pull'
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
                className={`absolute inset-x-4 top-4 bottom-3 rounded-2xl p-6 shadow-2xl border border-primary/25 flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                  stage === 'expanding-letter' ? 'z-50 shadow-[0_30px_90px_rgba(0,0,0,0.6)]' : 'z-20'
                } ${stage === 'ready-to-pull' ? 'ring-4 ring-amber-300/70 ring-offset-2' : ''}`}
              >
                {/* Dica de puxar a carta no topo */}
                {stage === 'ready-to-pull' && (
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-xs shadow-lg animate-bounce flex items-center gap-1">
                    <ArrowUp size={13} />
                    <span>Puxe a carta para cima</span>
                  </div>
                )}

                {/* Conteúdo da carta */}
                <div className="space-y-2 text-center pt-1">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-primary">
                    {recipientName ? `Para ${recipientName}` : 'Uma Carta Especial'}
                  </h3>
                  <div className="h-1.5 w-36 bg-primary/15 rounded-full mx-auto" />
                </div>

                <div className="space-y-2.5 py-4 px-2">
                  <div className="h-2.5 w-full bg-text/15 rounded-full" />
                  <div className="h-2.5 w-5/6 bg-text/15 rounded-full" />
                  <div className="h-2.5 w-4/6 bg-text/15 rounded-full" />
                </div>

                <div className="text-right pb-1 pr-2">
                  <p className="font-cursive text-base text-primary font-bold">
                    {senderName ? `Com amor, ${senderName}` : 'Com todo o meu amor ❤️'}
                  </p>
                </div>
              </motion.div>

              {/* Bolso Frontal do Envelope */}
              <motion.div
                animate={
                  stage === 'expanding-letter'
                    ? { opacity: 0 }
                    : { opacity: 1 }
                }
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl"
              >
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 50,55 0,100"
                    fill={primaryColor}
                    className="filter drop-shadow-sm"
                  />
                  <polygon
                    points="100,0 50,55 100,100"
                    fill={primaryColor}
                    className="filter drop-shadow-sm"
                  />
                  <polygon
                    points="0,100 50,50 100,100"
                    fill={primaryColor}
                    fillOpacity="0.96"
                    className="filter drop-shadow-md"
                  />
                </svg>
              </motion.div>

              {/* Aba Superior Triangular */}
              <motion.div
                animate={
                  stage === 'opening-seal' || stage === 'ready-to-pull' || stage === 'expanding-letter'
                    ? { rotateX: -180, zIndex: 10 }
                    : { rotateX: 0, zIndex: 35 }
                }
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                  <path
                    d="M0,0 L50,50 L100,0"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="0.8"
                  />
                </svg>
              </motion.div>

              {/* Selo de Cera 3D */}
              {stage === 'unfolded' && (
                <div
                  className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer"
                  onClick={handleOpenSeal}
                >
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: [1, 1.07, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(251, 191, 36, 0.5)',
                        '0 0 0 14px rgba(251, 191, 36, 0)',
                        '0 0 0 0 rgba(251, 191, 36, 0)',
                      ],
                    }}
                    transition={{
                      scale: { duration: 1.8, repeat: Infinity },
                      boxShadow: { duration: 1.8, repeat: Infinity },
                    }}
                    className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 text-white shadow-2xl border-2 border-amber-300/80 ring-4 ring-amber-400/30"
                  >
                    <div className="absolute inset-1 rounded-full border border-dashed border-amber-200/50 opacity-60" />
                    <Heart className="h-7 w-7 sm:h-8 sm:w-8 fill-white text-white drop-shadow-md" />
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
                      <Sparkles size={11} />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Efeito de quebra de lacre */}
              {stage === 'opening-seal' && (
                <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  <SealBurstParticles color="#f43f5e" />
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* 4. BOTÃO GUIA / CONVITE AO TOQUE */}
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

        {/* 5. CLARÃO BRANCO DE TRANSIÇÃO FINAL SEAMLESS */}
        {stage === 'whiteout' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.95] }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="fixed inset-0 z-[80] bg-white pointer-events-none"
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export const EnvelopeUnboxing = memo(EnvelopeUnboxingComponent)
