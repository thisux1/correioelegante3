import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Music, Sparkles, Image as ImageIcon, MapPin } from 'lucide-react'

interface DeckCard {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: typeof Heart
  color: string
  previewText: string
  rotation: number
  zIndex: number
  offsetY: number
}

const sampleCards: DeckCard[] = [
  {
    id: '1',
    title: 'Nossa Viagem Inesquecível',
    subtitle: '12 de Outubro • Gramado, RS',
    tag: 'Linha do Tempo',
    icon: MapPin,
    color: 'from-rose-400 to-pink-500',
    previewText: 'Aquele café no centro histórico, a caminhada sob a garoa e o abraço mais quente do mundo...',
    rotation: -7,
    zIndex: 10,
    offsetY: 8,
  },
  {
    id: '2',
    title: 'Carta com Trilha Sonora',
    subtitle: 'Nossa Música Favorita • 03:42',
    tag: 'Música & Vinil',
    icon: Music,
    color: 'from-pink-500 to-rose-600',
    previewText: 'Toda vez que toca essa canção, meu coração volta pro exato instante em que te vi sorrir pela primeira vez.',
    rotation: 0,
    zIndex: 20,
    offsetY: -4,
  },
  {
    id: '3',
    title: 'Memória Fotográfica',
    subtitle: 'Aquele Pôr do Sol',
    tag: 'Polaroid & Segredos',
    icon: ImageIcon,
    color: 'from-amber-400 to-rose-400',
    previewText: 'Guardo esse olhar como a lembrança mais bonita da minha vida. Raspe abaixo para ver nossa promessa...',
    rotation: 8,
    zIndex: 15,
    offsetY: 12,
  },
]

export function CardDeck() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState<string>('2')

  return (
    <div className="relative w-full max-w-md mx-auto h-[380px] sm:h-[420px] flex items-center justify-center select-none">
      {/* Glow romântico de fundo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-400/20 via-rose-300/15 to-primary/20 blur-3xl pointer-events-none rounded-full" />

      {sampleCards.map((card, idx) => {
        const isHovered = hoveredId === card.id
        const isActive = activeCardId === card.id
        const Icon = card.icon

        // Spread effect on hover
        const targetRotation = isHovered
          ? card.rotation * 1.5
          : hoveredId !== null
          ? card.rotation * 0.7
          : card.rotation

        const targetY = isHovered ? -20 : isActive ? card.offsetY - 10 : card.offsetY
        const targetScale = isHovered ? 1.05 : isActive ? 1.02 : 0.98

        return (
          <motion.div
            key={card.id}
            onClick={() => setActiveCardId(card.id)}
            onMouseEnter={() => setHoveredId(card.id)}
            onMouseLeave={() => setHoveredId(null)}
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={{
              opacity: 1,
              y: targetY,
              rotate: targetRotation,
              scale: targetScale,
              filter: hoveredId && !isHovered ? 'blur(1.5px) opacity(0.85)' : 'blur(0px) opacity(1)',
              zIndex: isHovered ? 40 : isActive ? 30 : card.zIndex,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 24,
              delay: idx * 0.1,
            }}
            className="absolute w-[290px] sm:w-[320px] cursor-pointer rounded-3xl p-6 shadow-xl backdrop-blur-xl border border-pink-200/80 bg-gradient-to-b from-white/95 via-rose-50/90 to-white/95 transition-shadow duration-300 hover:shadow-2xl hover:shadow-pink-500/20"
            style={{
              transformOrigin: '50% 100%',
            }}
          >
            {/* Header da carta */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Icon size={13} />
                {card.tag}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart size={14} className="fill-primary" />
              </div>
            </div>

            {/* Título e data */}
            <h3 className="font-display text-lg font-bold text-text mb-1 leading-snug line-clamp-1">
              {card.title}
            </h3>
            <p className="text-[11px] font-semibold text-text-light/80 mb-3">
              {card.subtitle}
            </p>

            {/* Trecho da mensagem */}
            <div className="rounded-2xl bg-white/80 p-3.5 border border-pink-100/80 mb-4">
              <p className="text-xs text-text-light italic leading-relaxed line-clamp-3">
                "{card.previewText}"
              </p>
            </div>

            {/* Rodapé interativo com selo de cera miniatura */}
            <div className="flex items-center justify-between pt-2 border-t border-pink-100/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-light/70 flex items-center gap-1">
                <Sparkles size={11} className="text-primary" /> Toque para explorar
              </span>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm flex items-center justify-center text-white text-[10px] font-serif font-bold">
                ♥
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
