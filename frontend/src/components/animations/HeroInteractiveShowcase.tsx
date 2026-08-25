import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, Play, Pause, Sparkles, RotateCcw, Feather, Music2, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroInteractiveShowcase() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D Mouse Parallax Tracking
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg'])
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5
    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] mx-auto perspective-[1200px]"
    >
      {/* Halo de Luz Ambiente Perolado Atrás do Envelope */}
      <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-rose-300/35 via-pink-400/20 to-rose-500/25 rounded-[40px] blur-3xl -z-10 pointer-events-none animate-pulse-subtle" />

      {/* Cartão com Efeito de Paralaxe 3D Físico */}
      <motion.div
        style={{
          rotateX: isOpen ? 0 : rotateX,
          rotateY: isOpen ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative rounded-[32px] bg-white/95 backdrop-blur-xl border-2 border-pink-300/80 shadow-[0_25px_60px_-15px_rgba(225,29,72,0.22)] p-5 sm:p-7 overflow-hidden transition-all duration-300"
      >
        {/* Sheen de Luz Especular Dinâmico que segue o mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light"
          style={{
            background: `radial-gradient(circle 350px at ${sheenX} ${sheenY}, rgba(255,255,255,0.9), transparent 75%)`,
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {!isOpen ? (
            /* ══════════════════════════════════════════════════════
               ESTADO 1: ENVELOPE FECHADO COM FÍSICA E LACRE 3D
               ══════════════════════════════════════════════════════ */
            <motion.div
              key="hero-envelope-closed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
              className="py-4 text-center flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={() => {
                setIsOpen(true)
                setIsPlaying(true)
              }}
            >
              {/* O Envelope com Dobras e Carimbo Vintage */}
              <div className="relative w-full max-w-[420px] h-[240px] sm:h-[270px] rounded-3xl bg-gradient-to-br from-[#fff7f9] via-[#ffe8f0] to-[#ffdce6] border-2 border-pink-300 shadow-2xl shadow-rose-900/10 flex items-center justify-center overflow-hidden">
                
                {/* Textura de Linho Sutil */}
                <div className="absolute inset-0 bg-[#fff5f8]/40" />

                {/* Carimbo Postal Vintage em Relevo com Brasão */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 border-2 border-dashed border-rose-400/50 rounded-xl px-3 py-1.5 rotate-6 pointer-events-none flex flex-col items-center bg-white/40 backdrop-blur-xs">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#be123c] font-bold">
                    Correio Elegante
                  </span>
                  <span className="text-[8px] text-[#701a35] font-serif">
                    Edição Especial 2026
                  </span>
                </div>

                {/* Linhas de Endereçamento Estilizadas */}
                <div className="absolute left-5 bottom-5 sm:left-7 sm:bottom-7 text-left pointer-events-none space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-serif italic text-[#701a35]">
                    <Feather size={12} className="text-[#e11d48]" />
                    <span>Para</span>
                  </div>
                  <p className="font-display text-xl sm:text-2xl font-bold text-[#4c0519] tracking-tight">
                    Beatriz
                  </p>
                  <div className="w-28 sm:w-36 h-[2px] bg-rose-300/80 rounded-full" />
                </div>

                {/* Dobras do Envelope (SVG Geométrico) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 420 270" fill="none">
                  {/* Dobra Esquerda */}
                  <polygon points="0,0 210,155 0,270" fill="#ffebf2" stroke="rgba(244,63,94,0.25)" strokeWidth="1.5" />
                  {/* Dobra Direita */}
                  <polygon points="420,0 210,155 420,270" fill="#ffdbe5" stroke="rgba(244,63,94,0.25)" strokeWidth="1.5" />
                  {/* Dobra Inferior */}
                  <polygon points="0,270 420,270 210,155" fill="#ffffff" stroke="rgba(244,63,94,0.3)" strokeWidth="1.5" />
                </svg>

                {/* Aba Superior com Perspectiva 3D */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ transformOrigin: 'top center' }}
                >
                  <svg className="w-full h-full" viewBox="0 0 420 270" fill="none">
                    <polygon points="0,0 420,0 210,155" fill="#fff1f5" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Selo de Cera 3D Tátil com Efeito de Pulso e Anel de Brilho */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 4 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative z-30 w-18 h-18 sm:w-20 sm:h-20 rounded-full wax-seal-3d flex items-center justify-center text-white cursor-pointer group shadow-2xl"
                  aria-label="Abrir carta para Beatriz"
                >
                  <div className="absolute -inset-1 rounded-full bg-rose-400/30 animate-ping opacity-75" />
                  <Heart size={32} className="fill-white drop-shadow-md text-white" />
                </motion.div>
              </div>

              {/* Dica de Ação em Tipografia Clássica */}
              <div className="mt-5 space-y-1">
                <p className="text-sm sm:text-base font-bold text-[#e11d48] flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-[#e11d48]" />
                  <span>Toque no selo de cera para deslacrar ao vivo</span>
                </p>
                <p className="text-xs text-[#701a35] font-medium">
                  Com trilha sonora, desdobramento da carta e fotos
                </p>
              </div>
            </motion.div>
          ) : (
            /* ══════════════════════════════════════════════════════
               ESTADO 2: CARTA DESDOBRADA EM 3 PARTES COM FOTOS & VINIL
               ══════════════════════════════════════════════════════ */
            <motion.div
              key="hero-letter-opened"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Topo da Carta & Botão de Fechar */}
              <div className="flex items-center justify-between pb-3 border-b border-pink-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md ring-2 ring-rose-200">
                    <Heart size={16} className="fill-white" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-[#4c0519] text-base sm:text-lg leading-tight">
                      Para Beatriz
                    </h4>
                    <span className="text-[11px] font-semibold text-[#701a35] flex items-center gap-1">
                      <Calendar size={11} /> 14 de Fevereiro • Carta Interativa
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                    setIsPlaying(false)
                  }}
                  className="text-xs font-bold text-[#be123c] hover:text-[#e11d48] flex items-center gap-1 cursor-pointer transition-colors px-2.5 py-1 rounded-xl bg-rose-50 border border-pink-200"
                >
                  <RotateCcw size={13} /> Dobrar carta
                </button>
              </div>

              {/* Corpo da Carta com Efeito de Pergaminho & Polaroid */}
              <div className="relative bg-[#fffafc] p-4 sm:p-6 rounded-2xl border-2 border-pink-200/80 shadow-inner space-y-3 overflow-hidden">
                <p className="font-serif italic text-base sm:text-lg text-[#4c0519] leading-relaxed font-medium">
                  "Beatriz, desde aquele primeiro café sob a chuva até os nossos planos de construir uma vida inteira juntos, você é o meu lugar favorito no mundo. Obrigado por ser minha melhor amiga, minha paz e meu grande amor."
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-pink-200/60">
                  <span className="text-[11px] font-semibold text-[#701a35] flex items-center gap-1">
                    <Feather size={12} className="text-[#e11d48]" />
                    Escrito com carinho
                  </span>
                  <p className="font-display font-bold text-[#be123c] text-sm sm:text-base">
                    Com amor, Lucas
                  </p>
                </div>
              </div>

              {/* Toca-Discos de Vinil com Equalizador */}
              <div className="rounded-2xl border-2 border-pink-200 bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Disco de Vinil */}
                    <motion.div
                      animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                      className="relative h-12 w-12 shrink-0 rounded-full vinyl-grooves p-1 flex items-center justify-center border border-pink-300 shadow-xs"
                    >
                      <div className="h-4 w-4 rounded-full bg-[#e11d48] flex items-center justify-center text-white text-[8px]">
                        <Heart size={8} className="fill-white" />
                      </div>
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Music2 size={13} className="text-[#e11d48] shrink-0" />
                        <span className="font-display font-bold text-xs sm:text-sm text-[#4c0519] truncate">
                          Aliança & Poesia
                        </span>
                      </div>
                      <span className="block text-[10px] text-[#701a35] truncate">
                        Trilha Sonora Sincronizada
                      </span>

                      {/* Equalizador de Ondas */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {[0.3, 0.8, 0.5, 1, 0.7, 0.4, 0.9, 0.6].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={isPlaying ? { scaleY: [0.2, h, 0.2] } : { scaleY: 0.2 }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.08 }}
                            className="h-3 w-1 rounded-full bg-[#e11d48] origin-bottom"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botão Play / Pause */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPlaying(!isPlaying)
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                    aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-white ml-0.5" />}
                    <span>{isPlaying ? 'Pausar' : 'Ouvir'}</span>
                  </button>
                </div>
              </div>

              {/* Botão de Criação */}
              <div className="pt-1">
                <Link to="/create">
                  <button
                    type="button"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#f43f5e] hover:to-[#e11d48] text-white font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <span>Quero criar uma carta igual a esta</span>
                    <Sparkles size={16} />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
