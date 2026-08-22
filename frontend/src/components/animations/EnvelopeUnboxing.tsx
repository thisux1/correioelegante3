import { memo, useState, useCallback } from 'react'
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

/**
 * Síntese de som suave de arpeggio/chime cristalino usando Web Audio API nativa
 * Zero dependências externas e 100% à prova de 404
 */
function playUnboxingChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Frequências dos tons da harpa mágica (C5, E5, G5, B5, C6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5]
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + index * 0.1)

      gain.gain.setValueAtTime(0, now + index * 0.1)
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.1 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + index * 0.1)
      osc.stop(now + index * 0.1 + 1.3)
    })
  } catch {
    // Web audio não suportado ou bloqueado pelo navegador
  }
}

/**
 * Partículas de luz dourada e corações que explodem ao quebrar o lacre de cera
 */
function SealBurstParticles({ color = '#e11d48' }: { color?: string }) {
  const particles = Array.from({ length: 28 }, (_, i) => {
    const angle = (i * (360 / 28) * Math.PI) / 180
    const distance = 80 + (i % 5) * 35
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 8 + (i % 4) * 6,
      scale: 1 + (i % 3) * 0.3,
      isHeart: i % 2 === 0,
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, p.scale, 0],
            opacity: [1, 1, 0],
            rotate: (p.id % 2 === 0 ? 1 : -1) * 180,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
  const [stage, setStage] = useState<'sealed' | 'breaking' | 'opening' | 'revealed'>('sealed')
  const themeObj = getThemeById(theme)
  const vars = themeObj.variables

  const primaryColor = vars.primary || '#e11d48'
  const textColor = vars.text || '#1c1917'
  const surfaceColor = vars.surface || '#ffffff'

  const handleOpenEnvelope = useCallback(() => {
    if (stage !== 'sealed') return

    // Haptic feedback no mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([30, 50, 40])
      } catch {
        // ignora se bloqueado
      }
    }

    // Toca o chime sonoro mágico
    playUnboxingChime()

    // Estágio 1: Quebra do lacre e partículas
    setStage('breaking')

    // Estágio 2: Dobra da aba e saída da carta
    setTimeout(() => {
      setStage('opening')
    }, 450)

    // Estágio 3: Conclusão e transição para o conteúdo
    setTimeout(() => {
      setStage('revealed')
      onOpenComplete?.()
    }, 2100)
  }, [stage, onOpenComplete])

  const handleSkip = useCallback(() => {
    setStage('revealed')
    onOpenComplete?.()
  }, [onOpenComplete])

  // Se já tiver completado a revelação, não renderiza a sobreposição
  if (stage === 'revealed') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        key="envelope-unboxing-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden p-4 select-none backdrop-blur-md"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}22 0%, rgba(15, 10, 15, 0.92) 100%)`,
        }}
      >
        {/* Botão sutil de Pular no topo */}
        <div className="absolute top-6 right-6 z-50">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-black/40 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg transition-colors hover:bg-black/60 hover:text-white cursor-pointer"
          >
            <span>Pular abertura</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Brilho radial ambiente ao fundo */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 h-[420px] w-[420px] rounded-full blur-[110px] opacity-40 animate-pulse"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />

        {/* Cabeçalho de Boas-Vindas */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-6 z-20 space-y-1.5 px-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 text-xs font-medium tracking-wide uppercase">
            <Sparkles size={13} className="text-amber-300" />
            Correio Elegante
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
            {recipientName ? `Uma carta especial para ${recipientName}` : 'Você recebeu uma carta'}
          </h2>
          <p className="text-xs sm:text-sm text-white/75 font-serif italic">
            {title || 'Feita com carinho e guardada em segredo'}
          </p>
        </motion.div>

        {/* Cenário do Envelope 3D */}
        <div
          className="relative w-full max-w-[430px] aspect-[4/3] sm:aspect-[1.45/1] max-h-[310px] flex items-center justify-center z-20"
          style={{ perspective: 1200 }}
        >
          {/* Corpo do Envelope */}
          <motion.div
            animate={
              stage === 'opening'
                ? { y: 60, scale: 0.96, opacity: [1, 1, 0.7] }
                : { y: 0, scale: 1 }
            }
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
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

            {/* Folha de Carta Interna que desliza para cima na abertura */}
            <motion.div
              initial={{ y: 0, scale: 0.92, opacity: 0.85 }}
              animate={
                stage === 'opening'
                  ? {
                      y: -210,
                      scale: [0.92, 1.04, 1.08],
                      opacity: 1,
                      zIndex: 40,
                    }
                  : { y: 0, scale: 0.92, opacity: 0.85 }
              }
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-5 top-5 bottom-3 rounded-xl p-5 shadow-xl border border-primary/20 flex flex-col justify-between"
              style={{
                backgroundColor: surfaceColor,
                color: textColor,
              }}
            >
              {/* Cabeçalho da folha de carta */}
              <div className="space-y-2 text-center pt-2">
                <div className="mx-auto w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Heart size={16} fill="currentColor" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-28 bg-primary/20 rounded-full mx-auto" />
                  <div className="h-1.5 w-40 bg-primary/10 rounded-full mx-auto" />
                </div>
              </div>

              {/* Linhas simuladas de caligrafia */}
              <div className="space-y-2 py-3 px-2">
                <div className="h-2 w-full bg-text/15 rounded-full" />
                <div className="h-2 w-5/6 bg-text/15 rounded-full" />
                <div className="h-2 w-4/6 bg-text/15 rounded-full" />
              </div>

              {/* Rodapé da folha */}
              <div className="text-right pb-1 pr-2">
                <p className="font-cursive text-sm text-primary font-bold">
                  {senderName ? `Com amor, ${senderName}` : 'Com todo o meu amor ❤️'}
                </p>
              </div>
            </motion.div>

            {/* Bolso Frontal do Envelope (Abas laterais e inferior) */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {/* Aba Esquerda e Direita do Bolso */}
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

            {/* Aba Superior Triangular Dobrável (Top Flap com Lacre) */}
            <motion.div
              animate={
                stage === 'opening' || stage === 'breaking'
                  ? {
                      rotateX: -180,
                      zIndex: 10,
                    }
                  : { rotateX: 0, zIndex: 35 }
              }
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
              className="absolute top-0 inset-x-0 h-1/2 cursor-pointer"
              onClick={handleOpenEnvelope}
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

            {/* Selo de Cera 3D Rubi / Dourado (Wax Seal) */}
            <div
              className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer"
              onClick={handleOpenEnvelope}
            >
              {stage === 'breaking' && <SealBurstParticles color="#f43f5e" />}

              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                whileTap={{ scale: 0.92 }}
                animate={
                  stage === 'sealed'
                    ? {
                        scale: [1, 1.06, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(251, 191, 36, 0.4)',
                          '0 0 0 12px rgba(251, 191, 36, 0)',
                          '0 0 0 0 rgba(251, 191, 36, 0)',
                        ],
                      }
                    : { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
                }
                transition={{
                  scale: { duration: stage === 'sealed' ? 2 : 0.4, repeat: stage === 'sealed' ? Infinity : 0 },
                  boxShadow: { duration: 2, repeat: Infinity },
                }}
                className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 text-white shadow-2xl border-2 border-amber-300/80 ring-4 ring-amber-400/30"
              >
                <div className="absolute inset-1 rounded-full border border-dashed border-amber-200/50 opacity-60" />
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 fill-white text-white drop-shadow-md" />

                {/* Brilho pulsante */}
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
                  <Sparkles size={11} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Instrução Flutuante abaixo do envelope */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 z-20 text-center"
        >
          <button
            type="button"
            onClick={handleOpenEnvelope}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/95 text-primary text-sm font-bold shadow-xl shadow-black/30 backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Heart size={16} className="fill-primary text-primary transition-transform group-hover:scale-125" />
            <span>Toque no lacre para abrir</span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export const EnvelopeUnboxing = memo(EnvelopeUnboxingComponent)
