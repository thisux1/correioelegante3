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
  | 'airplane'        // Avião voando em direção ao centro com o bico apontado para a trajetória
  | 'unfolded'        // Avião se desdobrou no envelope fechado com lacre (esperando toque)
  | 'opening-seal'    // Lacre quebrando e aba abrindo
  | 'ready-to-pull'   // Aba aberta, carta pronta para ser puxada para cima
  | 'expanding'       // Carta subindo, crescendo em direção à tela
  | 'whiteout'        // Clarão branco revelando a página
  | 'finished'

/**
 * Síntese suave de áudio mágico usando Web Audio API nativa
 */
function playMagicalChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + index * 0.1)

      gain.gain.setValueAtTime(0, now + index * 0.1)
      gain.gain.linearRampToValueAtTime(0.14, now + index * 0.1 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + index * 0.1)
      osc.stop(now + index * 0.1 + 1.3)
    })
  } catch {
    // Ignora se bloqueado
  }
}

/**
 * Partículas de luz dourada e corações ao quebrar o lacre
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
  const [stage, setStage] = useState<InteractiveStage>('airplane')
  const themeObj = getThemeById(theme)
  const vars = themeObj.variables

  const primaryColor = vars.primary || '#e11d48'
  const textColor = vars.text || '#1c1917'
  const surfaceColor = vars.surface || '#ffffff'

  // Valor dinâmico do arrasto da carta para cima
  const dragY = useMotionValue(0)
  const letterScale = useTransform(dragY, [0, -150, -300], [1, 1.4, 2.5])

  // 1. O aviãozinho voa e pousa no centro, desdobrando-se no envelope
  useEffect(() => {
    const tFlight = setTimeout(() => {
      setStage('unfolded')
      playMagicalChime()
    }, 1700)

    return () => clearTimeout(tFlight)
  }, [])

  // 2. Gesto: Usuário toca no lacre para abrir o envelope
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

    // Após abrir a aba, fica pronto para o usuário puxar a carta para cima
    setTimeout(() => {
      setStage('ready-to-pull')
    }, 650)
  }, [stage])

  // 3. Gesto: Usuário puxa a carta para cima ou clica para expandir
  const handlePullLetter = useCallback(() => {
    if (stage !== 'ready-to-pull' && stage !== 'opening-seal') return

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40)
      } catch {
        // ignora
      }
    }

    setStage('expanding')

    // Transição para o clarão branco e conclusão
    setTimeout(() => {
      setStage('whiteout')
    }, 900)

    setTimeout(() => {
      setStage('finished')
      onOpenComplete?.()
    }, 1450)
  }, [stage, onOpenComplete])

  const handleSkip = useCallback(() => {
    setStage('finished')
    onOpenComplete?.()
  }, [onOpenComplete])

  if (stage === 'finished') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        key="interactive-unboxing-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}25 0%, rgba(10, 6, 12, 0.95) 100%)`,
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

        {/* Aura de luz ambiente */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 h-[500px] w-[500px] rounded-full blur-[130px] opacity-35"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />

        {/* Cabeçalho informativo */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 text-center z-20 space-y-1 px-4"
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

        {/* 1. FASE DO AVIÃOZINHO COM O BICO APONTADO NA DIREÇÃO DO VOO */}
        {stage === 'airplane' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{
                x: '-80vw',
                y: '-45vh',
                scale: 0.55,
                opacity: 0,
              }}
              animate={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 1.6,
                ease: [0.12, 0.9, 0.28, 1], // Trajetória contínua com desaceleração física suave
              }}
              className="relative flex items-center justify-center"
            >
              {/* O bico do avião aponta na direção exata do voo (+30 graus) e se nivela ao pousar */}
              <motion.div
                initial={{ rotate: 32 }}
                animate={{ rotate: [32, 24, 8, 0] }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="relative"
              >
                {/* SVG do Avião com nariz apontando para a frente/direita */}
                <svg
                  viewBox="0 0 160 120"
                  className="w-40 h-32 sm:w-48 sm:h-36 filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
                >
                  {/* Asa superior */}
                  <polygon
                    points="145,55 20,20 60,65"
                    fill={primaryColor}
                    fillOpacity="0.95"
                  />
                  {/* Asa inferior */}
                  <polygon
                    points="145,55 20,100 60,65"
                    fill={primaryColor}
                    fillOpacity="0.82"
                  />
                  {/* Corpo central / Dobra */}
                  <polygon
                    points="145,55 20,60 60,65"
                    fill="rgba(0,0,0,0.25)"
                  />
                  <polygon
                    points="145,55 35,60 60,65"
                    fill="rgba(255,255,255,0.25)"
                  />
                  {/* Coração na asa */}
                  <circle cx="65" cy="45" r="4.5" fill="white" fillOpacity="0.8" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* 2. FASE DO ENVELOPE COM OVERFLOW VISIBLE (SEM CORTE DE CARTA) */}
        {stage !== 'airplane' && (
          <div
            className="relative w-full max-w-[430px] h-[280px] sm:h-[300px] flex items-center justify-center z-20 px-4"
            style={{ perspective: 1200 }}
          >
            {/* Corpo do Envelope (Com overflow-visible para a carta subir livremente) */}
            <motion.div
              initial={{ scale: 0.6, rotate: -5, opacity: 0.5 }}
              animate={
                stage === 'expanding'
                  ? { y: 150, scale: 0.9, opacity: [1, 0.7, 0] }
                  : { scale: 1, rotate: 0, opacity: 1, y: 0 }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full rounded-2xl shadow-2xl border border-white/20 overflow-visible"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 25px 50px -12px ${primaryColor}66, 0 10px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Cavidade Traseira do Envelope */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)`,
                }}
              />

              {/* A CARTA FÍSICA QUE DESLIZA PARA CIMA E CRESCE EM DIREÇÃO À TELA */}
              <motion.div
                drag={stage === 'ready-to-pull' ? 'y' : false}
                dragConstraints={{ top: -320, bottom: 0 }}
                dragElastic={0.2}
                style={{
                  y: dragY,
                  scale: stage === 'expanding' ? undefined : letterScale,
                  backgroundColor: surfaceColor,
                  color: textColor,
                }}
                animate={
                  stage === 'ready-to-pull'
                    ? { y: [-20, -55, -45] }
                    : stage === 'expanding'
                    ? {
                        y: -350,
                        scale: [1.2, 2.5, 4.5],
                        opacity: [1, 1, 0.2],
                        zIndex: 60,
                      }
                    : { y: 0 }
                }
                transition={
                  stage === 'ready-to-pull'
                    ? { duration: 0.7, ease: 'easeOut' }
                    : stage === 'expanding'
                    ? { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
                    : undefined
                }
                onDragEnd={(_e, info) => {
                  if (info.offset.y < -60 || info.velocity.y < -150) {
                    handlePullLetter()
                  }
                }}
                onClick={() => {
                  if (stage === 'ready-to-pull') {
                    handlePullLetter()
                  }
                }}
                className={`absolute inset-x-4 top-4 bottom-3 rounded-2xl p-6 shadow-2xl border border-primary/25 flex flex-col justify-between cursor-grab active:cursor-grabbing z-20 ${
                  stage === 'ready-to-pull' ? 'ring-4 ring-amber-300/60 ring-offset-2' : ''
                }`}
              >
                {/* Dica de puxar a carta no topo */}
                {stage === 'ready-to-pull' && (
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-xs shadow-lg animate-bounce flex items-center gap-1">
                    <ArrowUp size={13} />
                    <span>Puxe a carta para cima</span>
                  </div>
                )}

                {/* Cabeçalho da folha de carta */}
                <div className="space-y-2 text-center pt-1">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-primary">
                    {recipientName ? `Para ${recipientName}` : 'Uma Carta Especial'}
                  </h3>
                  <div className="h-1.5 w-36 bg-primary/15 rounded-full mx-auto" />
                </div>

                {/* Linhas simuladas de caligrafia */}
                <div className="space-y-2.5 py-4 px-2">
                  <div className="h-2.5 w-full bg-text/15 rounded-full" />
                  <div className="h-2.5 w-5/6 bg-text/15 rounded-full" />
                  <div className="h-2.5 w-4/6 bg-text/15 rounded-full" />
                </div>

                {/* Rodapé da folha */}
                <div className="text-right pb-1 pr-2">
                  <p className="font-cursive text-base text-primary font-bold">
                    {senderName ? `Com amor, ${senderName}` : 'Com todo o meu amor ❤️'}
                  </p>
                </div>
              </motion.div>

              {/* Bolso Frontal do Envelope (Cobre a parte inferior da carta) */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
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
              </div>

              {/* Aba Superior Triangular (Dobra para cima ao tocar no lacre) */}
              <motion.div
                animate={
                  stage === 'opening-seal' || stage === 'ready-to-pull' || stage === 'expanding'
                    ? { rotateX: -180, zIndex: 10 }
                    : { rotateX: 0, zIndex: 35 }
                }
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Selo de Cera 3D (Interativo: Toque para quebrar) */}
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

        {/* 3. BOTÃO GUIA / CONVITE AO TOQUE NO ENVELOPE */}
        {stage === 'unfolded' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 z-20 text-center"
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

        {/* 4. CLARÃO BRANCO DE TRANSIÇÃO FINAL */}
        {stage === 'whiteout' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.9] }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="fixed inset-0 z-[70] bg-white pointer-events-none"
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export const EnvelopeUnboxing = memo(EnvelopeUnboxingComponent)
