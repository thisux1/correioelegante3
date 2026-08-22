import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Play, Pause, Sparkles, RotateCcw, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Button } from '@/components/ui/Button'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { InteractiveScratchCanvas } from '@/components/ui/InteractiveScratchCanvas'

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
        {/* Cabeçalho sem badges */}
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
            Experimente a sensação de <span className="text-[#e11d48]">abrir uma carta</span>
          </h2>
          <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-xl mx-auto">
            Toque no lacre de cera abaixo para deslacrar e ver como quem você ama vai receber sua homenagem.
          </p>
        </div>

        {/* Envelope Interativo */}
        <div className="max-w-2xl mx-auto">
          <CardTilt3D intensity={isOpen ? 4 : 8}>
            <div className="relative rounded-3xl border-2 border-pink-300/80 bg-white shadow-2xl shadow-rose-500/10 p-6 sm:p-10 transition-all min-h-[460px] flex flex-col justify-center">
              
              <AnimatePresence mode="wait" initial={false}>
                {!isOpen ? (
                  /* Estado Fechado: Envelope com Selo de Cera 3D */
                  <motion.div
                    key="closed-envelope"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="py-10 px-4 sm:px-8 text-center flex flex-col items-center justify-center cursor-pointer select-none"
                    onClick={handleOpenEnvelope}
                  >
                    <div className="relative mb-6">
                      {/* Envelope Fechado com perspectiva 3D */}
                      <div className="w-72 sm:w-88 h-48 sm:h-56 rounded-2xl bg-gradient-to-br from-[#fff1f5] to-[#ffe4ec] border-2 border-pink-300/90 shadow-xl relative overflow-visible flex items-center justify-center">
                        
                        {/* Fundo do envelope */}
                        <div className="absolute inset-0 bg-[#fff5f8] rounded-2xl" />

                        {/* Dobras do Envelope (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 200" fill="none">
                          {/* Dobra Esquerda */}
                          <polygon points="0,0 160,110 0,200" fill="#ffe4ec" stroke="rgba(244,63,94,0.25)" strokeWidth="1.2" />
                          {/* Dobra Direita */}
                          <polygon points="320,0 160,110 320,200" fill="#ffdbe5" stroke="rgba(244,63,94,0.25)" strokeWidth="1.2" />
                          {/* Dobra Inferior */}
                          <polygon points="0,200 320,200 160,110" fill="#ffffff" stroke="rgba(244,63,94,0.3)" strokeWidth="1.4" />
                        </svg>

                        {/* Aba Superior */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ transformOrigin: 'top center', perspective: 800 }}
                        >
                          <svg className="w-full h-full" viewBox="0 0 320 200" fill="none">
                            <polygon points="0,0 320,0 160,110" fill="#fff1f5" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" />
                          </svg>
                        </div>

                        {/* Selo de Cera 3D Clicável com Efeito de Pulsação */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.14 }}
                          whileTap={{ scale: 0.90 }}
                          className="relative z-20 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#be123c] shadow-2xl flex items-center justify-center text-white ring-4 ring-rose-400/35 border-2 border-white/50 cursor-pointer"
                          aria-label="Abrir carta para Beatriz"
                        >
                          <Heart size={26} className="fill-white drop-shadow-sm animate-pulse" />
                        </motion.button>
                      </div>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#4c0519] mb-2">
                      Para: Beatriz
                    </h3>
                    <p className="text-sm sm:text-base font-bold text-[#e11d48] flex items-center justify-center gap-1.5 animate-bounce">
                      <Sparkles size={17} />
                      Toque no selo de cera para abrir a carta
                    </p>
                  </motion.div>
                ) : (
                  /* Estado Aberto: Carta Deslizada para Cima com Todos os Elementos Interativos */
                  <motion.div
                    key="opened-letter"
                    initial={{ opacity: 0, y: 40, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Topo da Carta */}
                    <div className="flex items-center justify-between pb-4 border-b border-pink-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-[#e11d48] text-white flex items-center justify-center shadow-xs">
                          <Heart size={18} className="fill-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#4c0519] text-base">Para o Amor da Minha Vida</h4>
                          <span className="text-xs text-[#701a35]">14 de Fevereiro • Carta Interativa</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-semibold text-[#be123c] hover:text-[#e11d48] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw size={13} /> Fechar carta
                      </button>
                    </div>

                    {/* Texto da Carta */}
                    <div className="bg-[#fff9fa] p-6 rounded-2xl border border-pink-200/80 shadow-xs">
                      <p className="font-serif italic text-base sm:text-lg text-[#4c0519] leading-relaxed mb-4">
                        "Beatriz, desde aquele primeiro café sob a chuva até os nossos planos de construir uma vida inteira juntos, você é o meu lugar favorito no mundo. Obrigado por ser minha melhor amiga e meu grande amor."
                      </p>
                      <p className="font-display font-bold text-right text-[#be123c] text-sm">
                        Com todo o meu amor, Lucas
                      </p>
                    </div>

                    {/* Player de Trilha Sonora em Vinil */}
                    <div className="rounded-2xl border-2 border-pink-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                          className="relative h-14 w-14 shrink-0 rounded-full bg-[#701a35] p-1 shadow-md flex items-center justify-center border-2 border-pink-300"
                        >
                          <div className="h-6 w-6 rounded-full bg-[#e11d48] flex items-center justify-center text-white text-[10px]">
                            ♥
                          </div>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-[#4c0519] truncate">
                            Nossa Música Especial
                          </span>
                          <span className="block text-[11px] text-[#701a35] truncate">
                            Trilha Sonora Sincronizada
                          </span>

                          <div className="flex items-center gap-1 mt-2">
                            {[0.4, 0.9, 0.5, 1, 0.7, 0.3, 0.8, 0.6].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={isPlaying ? { scaleY: [0.3, h, 0.3] } : { scaleY: 0.3 }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                className="h-3.5 w-1 rounded-full bg-[#e11d48] origin-bottom"
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="h-10 w-10 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
                          aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Raspadinha Interativa Real com Canvas e Confetes */}
                    <div>
                      <InteractiveScratchCanvas
                        coverText={'Raspe suavemente com o dedo ou mouse\npara revelar a surpresa...'}
                        secretSubtitle="Surpresa da Carta"
                        secretText="Passagens reservadas para a nossa viagem a Paris!"
                        height={120}
                      />
                    </div>

                    {/* Botão de Criação */}
                    <div className="pt-2 text-center">
                      <Link to="/create">
                        <Button size="lg" className="w-full shadow-xl shadow-rose-500/30 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold py-4 text-base rounded-2xl">
                          <span>Quero criar uma carta como esta</span>
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
