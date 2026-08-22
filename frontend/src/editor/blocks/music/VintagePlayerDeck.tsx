import { motion, useReducedMotion } from 'framer-motion'
import { Music2 } from 'lucide-react'

interface VintagePlayerDeckProps {
  coverSrc?: string
  title?: string
  artist?: string
  isPlaying: boolean
  onClick?: () => void
}

export function VintagePlayerDeck({
  coverSrc,
  title,
  artist,
  isPlaying,
  onClick,
}: VintagePlayerDeckProps) {
  const shouldReduceMotion = useReducedMotion()
  const hasCover = Boolean(coverSrc && (coverSrc.startsWith('http://') || coverSrc.startsWith('https://')))

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-2 select-none group cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {/* 1. DISCO DE VINIL COM CAPA E BORDA ESQUERDA FÍSICA (SPINE) */}
      <div className="relative flex items-center justify-center w-64 sm:w-72 h-44 sm:h-52">
        {/* Disco de Vinil 3D Deslizando */}
        <motion.div
          initial={false}
          animate={{
            x: isPlaying ? (shouldReduceMotion ? 20 : 56) : 14,
            rotate: isPlaying && !shouldReduceMotion ? 360 : 0,
            transition: isPlaying
              ? {
                  x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  rotate: { duration: 3.5, repeat: Infinity, ease: 'linear' },
                }
              : {
                  x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  rotate: { duration: 0.8, ease: 'easeOut' },
                },
          }}
          className="absolute z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full shadow-[0_14px_36px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle, #1c1c1c 0%, #0a0a0a 45%, #181818 70%, #050505 100%)',
          }}
        >
          {/* Ranhuras Concêntricas do Vinil */}
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="absolute inset-7 rounded-full border border-white/5" />
          <div className="absolute inset-10 rounded-full border border-white/10" />
          <div className="absolute inset-14 rounded-full border border-white/5" />

          {/* Reflexo Especular de Luz */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-35"
            style={{
              background: 'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.2) 45deg, transparent 90deg, rgba(255,255,255,0.2) 225deg, transparent 270deg)',
            }}
          />

          {/* Selo Central com Foto / Monograma */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-300/40 bg-primary/30 flex items-center justify-center shadow-inner">
            {hasCover ? (
              <img
                src={coverSrc}
                alt={title || 'Capa do disco'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Music2 size={18} className="text-white drop-shadow-sm" />
            )}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-black/90 border border-white/30 shadow-inner" />
          </div>
        </motion.div>

        {/* Capa do Álbum com BORDA ESQUERDA DESTACADA (Spine / Lombada Física) */}
        <div className="relative z-20 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.4)] border-2 border-border/80 border-l-[6px] border-l-primary/70 bg-surface flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
          {hasCover ? (
            <img
              src={coverSrc}
              alt={title || 'Capa do Álbum'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface to-background flex flex-col items-center justify-center p-3 text-center">
              <Music2 size={30} className="text-primary mb-1.5" />
              <p className="font-display text-xs font-bold text-text truncate max-w-full">
                {title || 'Coleção de Momentos'}
              </p>
            </div>
          )}

          {/* Efeito de Textura de Papelão e Dobra da Lombada */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />
          {/* Linha de vinco da lombada esquerda */}
          <div className="absolute left-0 inset-y-0 w-2 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 2. MECANISMO DE TOCA-FITAS VINTAGE (Cassette Tape Deck com Engrenagens Giratórias) */}
      <div className="mt-3 w-full max-w-xs rounded-2xl border border-border/90 bg-gradient-to-b from-surface-raised to-surface p-2.5 shadow-inner">
        {/* Janela de Vidro do Toca-Fitas */}
        <div className="relative rounded-xl border border-border bg-slate-950/80 p-2 overflow-hidden shadow-inner flex items-center justify-between gap-2">
          {/* Efeito de Reflexo no Vidro */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />

          {/* Rolo Esquerdo com Engrenagem Giratória */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-zinc-900 shadow-sm">
            <motion.div
              animate={{ rotate: isPlaying && !shouldReduceMotion ? 360 : 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 flex items-center justify-center text-amber-200/60"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-75">
                <circle cx="12" cy="12" r="3" fill="#000" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>

          {/* Etiqueta Central da Fita Cassete */}
          <div className="min-w-0 flex-1 px-1.5 py-0.5 rounded bg-amber-100/90 dark:bg-zinc-800 border border-amber-300/40 text-center shadow-xs">
            <p className="font-mono text-[10px] font-bold text-amber-950 dark:text-amber-200 truncate uppercase tracking-wider">
              {title || 'Lado A'}
            </p>
            <p className="font-mono text-[8px] text-amber-900/70 dark:text-amber-300/70 truncate">
              {artist || 'Correio Elegante Hi-Fi'}
            </p>
          </div>

          {/* Rolo Direito com Engrenagem Giratória */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-zinc-900 shadow-sm">
            <motion.div
              animate={{ rotate: isPlaying && !shouldReduceMotion ? 360 : 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 flex items-center justify-center text-amber-200/60"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-75">
                <circle cx="12" cy="12" r="3" fill="#000" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Medidor VU Analógico e Indicador de Fita */}
        <div className="mt-2 flex items-center justify-between px-1 text-[9px] font-mono text-text-light">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-400'}`} />
            <span className="uppercase tracking-widest">{isPlaying ? 'Tocando' : 'Pausado'}</span>
          </div>

          {/* VU Meter com Barras Dinâmicas */}
          <div className="flex items-center gap-0.5 h-2" aria-hidden="true">
            <span className={`w-1 rounded-xs transition-all ${isPlaying ? 'bg-emerald-500 h-2' : 'bg-emerald-500/30 h-1'}`} />
            <span className={`w-1 rounded-xs transition-all ${isPlaying ? 'bg-emerald-500 h-2.5' : 'bg-emerald-500/30 h-1'}`} />
            <span className={`w-1 rounded-xs transition-all ${isPlaying ? 'bg-amber-500 h-2' : 'bg-amber-500/30 h-1'}`} />
            <span className={`w-1 rounded-xs transition-all ${isPlaying ? 'bg-red-500 h-1.5' : 'bg-red-500/30 h-1'}`} />
          </div>

          <span className="font-mono text-[9px] opacity-75">STEREO</span>
        </div>
      </div>
    </div>
  )
}
