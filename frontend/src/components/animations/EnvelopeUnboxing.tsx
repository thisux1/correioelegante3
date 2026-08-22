import { memo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ArrowRight } from 'lucide-react'
import { getThemeById } from '@/editor/themes'

export interface EnvelopeUnboxingProps {
  recipientName?: string
  senderName?: string
  title?: string
  theme?: string
  onOpenComplete?: () => void
}

type CinematicStage = 'airplane' | 'unfold' | 'open' | 'expand' | 'whiteout' | 'finished'

/**
 * Síntese suave de áudio mágico usando Web Audio API
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
      osc.frequency.setValueAtTime(freq, now + index * 0.12)

      gain.gain.setValueAtTime(0, now + index * 0.12)
      gain.gain.linearRampToValueAtTime(0.16, now + index * 0.12 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 1.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + index * 0.12)
      osc.stop(now + index * 0.12 + 1.5)
    })
  } catch {
    // Ignora se bloqueado
  }
}

/**
 * Rastro de corações e poeira cintilante do aviãozinho
 */
function AirplaneTrail({ color }: { color: string }) {
  const dots = [
    { x: -90, y: 40, delay: 0.1, size: 6 },
    { x: -140, y: 70, delay: 0.25, size: 8 },
    { x: -190, y: 90, delay: 0.4, size: 5 },
    { x: -240, y: 100, delay: 0.55, size: 7 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0.4] }}
          transition={{ duration: 1.2, delay: d.delay, repeat: Infinity }}
          style={{
            left: `calc(50% + ${d.x}px)`,
            top: `calc(50% + ${d.y}px)`,
            backgroundColor: color,
          }}
          className="absolute rounded-full shadow-sm shadow-white/40"
        />
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
  const [stage, setStage] = useState<CinematicStage>('airplane')
  const themeObj = getThemeById(theme)
  const vars = themeObj.variables

  const primaryColor = vars.primary || '#e11d48'
  const textColor = vars.text || '#1c1917'
  const surfaceColor = vars.surface || '#ffffff'

  // Sequência cinematográfica automatizada
  useEffect(() => {
    // 1. Avião voa e pousa no centro -> Inicia o desdobramento
    const t1 = setTimeout(() => {
      setStage('unfold')
      playMagicalChime()
    }, 1800)

    // 2. O avião se desdobra em envelope com lacre -> O lacre e a aba se abrem
    const t2 = setTimeout(() => {
      setStage('open')
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([25, 40, 25])
        } catch {
          // ignora
        }
      }
    }, 3100)

    // 3. A carta emerge do envelope e começa a expandir em tela cheia
    const t3 = setTimeout(() => {
      setStage('expand')
    }, 4200)

    // 4. Fade out branco que revela o conteúdo da carta
    const t4 = setTimeout(() => {
      setStage('whiteout')
    }, 5000)

    // 5. Finaliza
    const t5 = setTimeout(() => {
      setStage('finished')
      onOpenComplete?.()
    }, 5600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [onOpenComplete])

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
        key="cinematic-unboxing-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}25 0%, rgba(12, 8, 14, 0.95) 100%)`,
        }}
      >
        {/* Botão de Pular no topo direito */}
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

        {/* Mensagem sutil no topo durante o voo */}
        <motion.div
          animate={
            stage === 'airplane'
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: -20 }
          }
          transition={{ duration: 0.5 }}
          className="absolute top-16 text-center z-20 space-y-1 px-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 text-xs font-medium tracking-wide uppercase">
            <Sparkles size={13} className="text-amber-300" />
            Correio Elegante
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white drop-shadow-md">
            {recipientName ? `Uma mensagem especial para ${recipientName}...` : 'Uma mensagem especial está chegando...'}
          </h2>
          {title ? (
            <p className="text-xs text-white/80 font-serif italic">{title}</p>
          ) : null}
        </motion.div>

        {/* 1. FASE DO AVIÃOZINHO DE PAPEL */}
        {stage === 'airplane' && (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <AirplaneTrail color={primaryColor} />

            <motion.div
              initial={{
                x: '-75vw',
                y: '-40vh',
                rotate: 25,
                scale: 0.45,
                opacity: 0,
              }}
              animate={{
                x: ['-75vw', '-20vw', '25vw', '0vw'],
                y: ['-40vh', '-10vh', '15vh', '0vh'],
                rotate: [35, 15, -10, 0],
                scale: [0.45, 0.85, 1.15, 1],
                opacity: [0, 1, 1, 1],
              }}
              transition={{
                duration: 1.75,
                ease: [0.25, 1, 0.5, 1],
                times: [0, 0.4, 0.75, 1],
              }}
              className="relative flex items-center justify-center"
            >
              {/* Avião de Papel 3D */}
              <svg
                viewBox="0 0 120 120"
                className="w-32 h-32 sm:w-40 sm:h-40 filter drop-shadow-2xl"
              >
                {/* Sombra da dobra central */}
                <polygon points="60,15 18,95 60,78" fill={primaryColor} fillOpacity="0.88" />
                <polygon points="60,15 102,95 60,78" fill={primaryColor} fillOpacity="1" />
                {/* Linhas de vinco origami */}
                <polygon points="60,15 54,82 60,78" fill="rgba(0,0,0,0.2)" />
                <polygon points="60,15 66,82 60,78" fill="rgba(255,255,255,0.25)" />
                {/* Coração sutil na asa */}
                <circle cx="75" cy="72" r="4" fill="white" fillOpacity="0.7" />
              </svg>
            </motion.div>
          </div>
        )}

        {/* 2. FASE DO ENVELOPE SE DESEMBRULHANDO E ABRINDO */}
        {(stage === 'unfold' || stage === 'open' || stage === 'expand') && (
          <div
            className="relative w-full max-w-[440px] aspect-[4/3] sm:aspect-[1.45/1] max-h-[300px] flex items-center justify-center z-20 px-4"
            style={{ perspective: 1200 }}
          >
            {/* O Envelope que se desembrulha do avião */}
            <motion.div
              initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
              animate={
                stage === 'expand'
                  ? { scale: 1.15, y: 120, opacity: [1, 0.8, 0] }
                  : { scale: 1, rotate: 0, opacity: 1, y: 0 }
              }
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 25px 50px -12px ${primaryColor}66, 0 10px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Cavidade interna escura do envelope */}
              <div
                className="absolute inset-0 rounded-2xl opacity-90"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)`,
                }}
              />

              {/* A CARTA INTERNA QUE SAI DO ENVELOPE E TOMA CONTA DA TELA */}
              <motion.div
                initial={{ y: 0, scale: 0.9, opacity: 0.85 }}
                animate={
                  stage === 'open'
                    ? { y: -190, scale: 1.05, opacity: 1, zIndex: 40 }
                    : stage === 'expand'
                    ? {
                        y: -300,
                        scale: [1.05, 2.2, 4],
                        opacity: [1, 1, 0.4],
                        zIndex: 50,
                      }
                    : { y: 0, scale: 0.9, opacity: 0.85 }
                }
                transition={{
                  duration: stage === 'expand' ? 1.1 : 1.0,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute inset-x-5 top-5 bottom-3 rounded-xl p-5 shadow-2xl border border-primary/20 flex flex-col justify-between"
                style={{
                  backgroundColor: surfaceColor,
                  color: textColor,
                }}
              >
                {/* Cabeçalho da folha de carta */}
                <div className="space-y-2 text-center pt-2">
                  <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Heart size={18} fill="currentColor" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-primary">
                    {recipientName ? `Para ${recipientName}` : 'Uma Carta Para Você'}
                  </h3>
                  <div className="h-1.5 w-36 bg-primary/15 rounded-full mx-auto" />
                </div>

                {/* Linhas simuladas de caligrafia */}
                <div className="space-y-2 py-3 px-2">
                  <div className="h-2 w-full bg-text/15 rounded-full" />
                  <div className="h-2 w-5/6 bg-text/15 rounded-full" />
                  <div className="h-2 w-4/6 bg-text/15 rounded-full" />
                </div>

                {/* Rodapé da folha */}
                <div className="text-right pb-1 pr-2">
                  <p className="font-cursive text-sm sm:text-base text-primary font-bold">
                    {senderName ? `Com amor, ${senderName}` : 'Com todo o meu amor ❤️'}
                  </p>
                </div>
              </motion.div>

              {/* Bolso Frontal do Envelope (Abas laterais e inferior) */}
              <div className="absolute inset-0 pointer-events-none z-30">
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
                    fillOpacity="0.95"
                    className="filter drop-shadow-md"
                  />
                </svg>
              </div>

              {/* Aba Superior Triangular Dobrável */}
              <motion.div
                animate={
                  stage === 'open' || stage === 'expand'
                    ? { rotateX: -180, zIndex: 10 }
                    : { rotateX: 0, zIndex: 35 }
                }
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                className="absolute top-0 inset-x-0 h-1/2"
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
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  stage === 'open' || stage === 'expand'
                    ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.5 }}
                className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-40"
              >
                <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 text-white shadow-2xl border-2 border-amber-300/80 ring-4 ring-amber-400/30">
                  <div className="absolute inset-1 rounded-full border border-dashed border-amber-200/50 opacity-60" />
                  <Heart className="h-7 w-7 sm:h-8 sm:w-8 fill-white text-white drop-shadow-md" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* 3. FADE OUT BRANCO CINEMATOGRÁFICO QUE REVELA O CONTEÚDO */}
        {stage === 'whiteout' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.9] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] bg-white pointer-events-none"
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export const EnvelopeUnboxing = memo(EnvelopeUnboxingComponent)
