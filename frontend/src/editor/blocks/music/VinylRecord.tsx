import { motion } from 'framer-motion'
import { Music2 } from 'lucide-react'

interface VinylRecordProps {
  coverSrc?: string
  title?: string
  isPlaying: boolean
  onClick?: () => void
}

export function VinylRecord({
  coverSrc,
  title,
  isPlaying,
  onClick,
}: VinylRecordProps) {
  const hasCover = Boolean(coverSrc && (coverSrc.startsWith('http://') || coverSrc.startsWith('https://')))

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center py-4 cursor-pointer select-none group"
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? 'Pausar disco' : 'Tocar disco'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <div className="relative flex items-center justify-center w-64 sm:w-72 h-44 sm:h-52">
        {/* 1. DISCO DE VINIL REALISTA EM 3D (Desliza para a direita ao tocar) */}
        <motion.div
          initial={false}
          animate={{
            x: isPlaying ? 54 : 14,
            rotate: isPlaying ? 360 : 0,
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
          className="absolute z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.55)] flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle, #1a1a1a 0%, #0d0d0d 45%, #1f1f1f 70%, #0a0a0a 100%)',
          }}
        >
          {/* Ranhuras Concêntricas do Vinil */}
          <div className="absolute inset-2 rounded-full border border-white/5" />
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="absolute inset-7 rounded-full border border-white/5" />
          <div className="absolute inset-10 rounded-full border border-white/10" />
          <div className="absolute inset-14 rounded-full border border-white/5" />

          {/* Reflexo Especular Brilhante (Sheen) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-40"
            style={{
              background: 'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.18) 45deg, transparent 90deg, rgba(255,255,255,0.18) 225deg, transparent 270deg)',
            }}
          />

          {/* Selo Central com a Imagem do Álbum / Monograma */}
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

            {/* Furo Central do Eixo do Toca-Discos */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-black/90 border border-white/30 shadow-inner" />
          </div>
        </motion.div>

        {/* 2. CAPA DO ÁLBUM / ENVELOPE DO VINIL (Fica à esquerda) */}
        <div className="relative z-20 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.35)] border-2 border-border/80 bg-surface flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
          {hasCover ? (
            <img
              src={coverSrc}
              alt={title || 'Capa do Álbum'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface to-background flex flex-col items-center justify-center p-4 text-center">
              <Music2 size={32} className="text-primary mb-2" />
              <p className="font-display text-xs font-bold text-text truncate max-w-full">
                {title || 'Vinil Romântico'}
              </p>
            </div>
          )}

          {/* Brilho e Textura de Papelão da Capa */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
          <div className="absolute left-0 inset-y-0 w-1.5 bg-black/25 shadow-sm" />
        </div>
      </div>
    </div>
  )
}
