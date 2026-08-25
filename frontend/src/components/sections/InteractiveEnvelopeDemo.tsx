import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Play, Pause, Sparkles, RotateCcw, ArrowRight, Music2, Feather, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Button } from '@/components/ui/Button'
import { CardTilt3D } from '@/components/animations/CardTilt3D'

export function InteractiveEnvelopeDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleOpenEnvelope = () => {
    setIsOpen(true)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setIsOpen(false)
    setIsPlaying(false)
  }

  return (
    <ScrollSection id="interactive-demo" className="section-spacing">
      <Container size="default">
        {/* Cabeçalho Editorial — Sem Badges ou Pílulas */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#4c0519] mb-5 tracking-tight leading-[1.15]">
            A sensação inesquecível de <span className="text-[#e11d48] italic font-serif">abrir uma carta</span>
          </h2>
          <p className="text-base sm:text-xl text-[#701a35] font-medium leading-relaxed">
            Toque no selo de cera artesanal para romper o lacre e vivenciar como quem você ama receberá sua homenagem.
          </p>
        </div>

        {/* Envelope Interativo de Alta Fidelidade */}
        <div className="max-w-3xl mx-auto">
          <CardTilt3D intensity={isOpen ? 3 : 6}>
            <div className="relative rounded-3xl border-2 border-pink-300/80 bg-white shadow-2xl shadow-rose-500/15 p-6 sm:p-10 transition-all min-h-[500px] flex flex-col justify-center overflow-hidden">
              
              <AnimatePresence mode="wait" initial={false}>
                {!isOpen ? (
                  /* ── ESTADO FECHADO: Envelope Artesanal com Selo de Cera 3D ── */
                  <motion.div
                    key="closed-envelope"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
                    className="py-8 px-2 sm:px-6 text-center flex flex-col items-center justify-center cursor-pointer select-none"
                    onClick={handleOpenEnvelope}
                  >
                    <div className="relative mb-8">
                      {/* Envelope com Profundidade Física e Carimbo Postal */}
                      <div className="w-[300px] sm:w-[420px] h-[200px] sm:h-[260px] rounded-3xl bg-gradient-to-br from-[#fff7f9] via-[#ffe9f0] to-[#ffdce6] border-2 border-pink-300/90 shadow-2xl shadow-rose-900/10 relative overflow-hidden flex items-center justify-center">
                        
                        {/* Marca d'água e textura interna */}
                        <div className="absolute inset-0 bg-[#fff5f8]/50" />

                        {/* Carimbo Postal Vintage em Linho */}
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 border-2 border-dashed border-rose-400/40 rounded-xl px-3 py-1.5 rotate-6 pointer-events-none flex flex-col items-center">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#be123c] font-bold">
                            Correio Elegante
                          </span>
                          <span className="text-[8px] text-[#701a35] font-serif">
                            Edição Especial 2026
                          </span>
                        </div>

                        {/* Linhas de Endereçamento Clássicas */}
                        <div className="absolute left-6 bottom-6 sm:left-8 sm:bottom-8 text-left pointer-events-none space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-serif italic text-[#701a35]">
                            <Feather size={12} className="text-[#e11d48]" />
                            <span>Para:</span>
                          </div>
                          <p className="font-display text-lg sm:text-2xl font-bold text-[#4c0519] tracking-tight">
                            Beatriz
                          </p>
                          <div className="w-24 sm:w-36 h-[1.5px] bg-rose-300/60" />
                        </div>

                        {/* Dobras do Envelope (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 420 260" fill="none">
                          {/* Dobra Esquerda */}
                          <polygon points="0,0 210,145 0,260" fill="#ffebf2" stroke="rgba(244,63,94,0.25)" strokeWidth="1.5" />
                          {/* Dobra Direita */}
                          <polygon points="420,0 210,145 420,260" fill="#ffdbe5" stroke="rgba(244,63,94,0.25)" strokeWidth="1.5" />
                          {/* Dobra Inferior com Brilho */}
                          <polygon points="0,260 420,260 210,145" fill="#ffffff" stroke="rgba(244,63,94,0.3)" strokeWidth="1.5" />
                        </svg>

                        {/* Aba Superior com Perspectiva 3D */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ transformOrigin: 'top center' }}
                        >
                          <svg className="w-full h-full" viewBox="0 0 420 260" fill="none">
                            <polygon points="0,0 420,0 210,145" fill="#fff1f5" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" />
                          </svg>
                        </div>

                        {/* Selo de Cera 3D Tátil com Efeito de Pulso e Reflexo */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.12, rotate: 3 }}
                          whileTap={{ scale: 0.92 }}
                          className="relative z-30 w-18 h-18 sm:w-20 sm:h-20 rounded-full wax-seal-3d flex items-center justify-center text-white cursor-pointer group"
                          aria-label="Abrir carta para Beatriz"
                        >
                          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Heart size={30} className="fill-white drop-shadow-md text-white animate-pulse" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm sm:text-base font-bold text-[#e11d48] flex items-center justify-center gap-2">
                        <Sparkles size={18} className="text-[#e11d48]" />
                        <span>Toque no selo de cera para deslacrar</span>
                      </p>
                      <p className="text-xs text-[#701a35] font-medium">
                        Experiência interativa completa com trilha sonora e animação
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ── ESTADO ABERTO: Carta Desdobrada em Papel Nobre ── */
                  <motion.div
                    key="opened-letter"
                    initial={{ opacity: 0, y: 35, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Topo da Carta & Botão de Fechar */}
                    <div className="flex items-center justify-between pb-4 border-b border-pink-200/80">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#be123c] text-white flex items-center justify-center shadow-md ring-4 ring-rose-200">
                          <Heart size={20} className="fill-white" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-[#4c0519] text-lg sm:text-xl">
                            Para o Amor da Minha Vida
                          </h4>
                          <span className="text-xs font-semibold text-[#701a35] flex items-center gap-1.5">
                            <Calendar size={12} /> 14 de Fevereiro • Carta Interativa
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs sm:text-sm font-bold text-[#be123c] hover:text-[#e11d48] flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-pink-200/60"
                      >
                        <RotateCcw size={14} /> Fechar carta
                      </button>
                    </div>

                    {/* Corpo da Carta — Textura de Papel Algodão & Tipografia Clássica */}
                    <div className="relative bg-[#fffafc] p-6 sm:p-8 rounded-3xl border-2 border-pink-200/80 shadow-md space-y-5 overflow-hidden">
                      {/* Efeito de marca d'água no fundo do papel */}
                      <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                        <Heart size={140} className="text-[#e11d48] fill-[#e11d48]" />
                      </div>

                      <p className="font-serif text-lg sm:text-2xl text-[#4c0519] leading-relaxed font-medium italic relative z-10">
                        "Beatriz, desde aquele primeiro café sob a chuva até os nossos planos de construir uma vida inteira juntos, você é o meu lugar favorito no mundo. Obrigado por ser minha melhor amiga, minha paz e meu grande amor."
                      </p>

                      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-pink-200/60 gap-2 relative z-10">
                        <span className="text-xs font-semibold text-[#701a35] flex items-center gap-1.5">
                          <Feather size={14} className="text-[#e11d48]" />
                          Escrito com todo o carinho
                        </span>
                        <p className="font-display font-bold text-[#be123c] text-lg sm:text-xl">
                          Com todo o meu amor, Lucas
                        </p>
                      </div>
                    </div>

                    {/* Toca-Discos Interativo com Braço Mecânico e Equalizador */}
                    <div className="rounded-3xl border-2 border-pink-200 bg-white p-5 sm:p-6 shadow-md">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {/* Disco de Vinil com Rotação Realista */}
                          <div className="relative">
                            <motion.div
                              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                              transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
                              className="relative h-16 w-16 shrink-0 rounded-full vinyl-grooves p-1.5 flex items-center justify-center border-2 border-pink-300"
                            >
                              <div className="h-6 w-6 rounded-full bg-[#e11d48] flex items-center justify-center text-white shadow-xs">
                                <Heart size={10} className="fill-white" />
                              </div>
                            </motion.div>

                            {/* Braço da Agulha do Toca-Discos */}
                            <motion.div
                              animate={isPlaying ? { rotate: 18 } : { rotate: 0 }}
                              transition={{ duration: 0.6, ease: 'easeInOut' }}
                              className="absolute -top-1 -right-1 w-5 h-8 origin-top-right pointer-events-none hidden sm:block"
                            >
                              <div className="w-1 h-7 bg-slate-400 rounded-full mx-auto shadow-xs" />
                              <div className="w-2 h-2 bg-rose-500 rounded-full mx-auto" />
                            </motion.div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Music2 size={16} className="text-[#e11d48] shrink-0" />
                              <span className="font-display font-bold text-sm sm:text-base text-[#4c0519] truncate">
                                Aliança & Poesia
                              </span>
                            </div>
                            <span className="block text-xs font-semibold text-[#701a35] truncate mt-0.5">
                              Trilha Sonora Sincronizada do Casal
                            </span>

                            {/* Equalizador de Ondas Sonoras */}
                            <div className="flex items-center gap-1.5 mt-2.5">
                              {[0.35, 0.85, 0.5, 1, 0.7, 0.4, 0.9, 0.65, 0.45, 0.8].map((h, i) => (
                                <motion.div
                                  key={i}
                                  animate={isPlaying ? { scaleY: [0.25, h, 0.25] } : { scaleY: 0.25 }}
                                  transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.08 }}
                                  className="h-4 w-1.5 rounded-full bg-[#e11d48] origin-bottom"
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Botão Play / Pause */}
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all cursor-pointer shrink-0"
                          aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                        >
                          {isPlaying ? (
                            <>
                              <Pause size={18} />
                              <span>Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play size={18} className="fill-white" />
                              <span>Ouvir trilha</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Botão de Criação da Própria Carta */}
                    <div className="pt-3 text-center">
                      <Link to="/create">
                        <Button size="lg" className="w-full shadow-xl shadow-rose-500/30 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold py-4 text-base rounded-2xl transition-all">
                          <span>Criar uma carta inesquecível como esta</span>
                          <ArrowRight size={18} />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </CardTilt3D>
        </div>
      </Container>
    </ScrollSection>
  )
}
