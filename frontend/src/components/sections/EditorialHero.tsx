import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Heart,
  Sparkles,
  Music,
  Play,
  Stamp,
  ShieldCheck,
  Zap,
  Gift,
} from 'lucide-react'
import { TiltCard } from '@/components/ui/TiltCard'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { Container } from '@/components/layout/Container'
import './EditorialHero.css'

export function EditorialHero() {
  const [stampSpeed, setStampSpeed] = useState(1)
  const [sealClicked, setSealClicked] = useState(false)
  const [scratchRevealed, setScratchRevealed] = useState(false)

  const firstPart = 'Mande um recado'
  const secondPart = 'que faz sorrir'
  const firstChars = Array.from(firstPart)
  const secondChars = Array.from(secondPart)

  // Interactive letter kinetic bounce helper
  const handleCharBounce = useCallback(
    (e: React.MouseEvent<HTMLSpanElement> | React.TouchEvent<HTMLSpanElement>) => {
      const el = e.currentTarget
      el.style.transform = 'translateY(-14px) scale(1.18) rotate(-3deg)'
      el.style.color = '#db3b36'
      setTimeout(() => {
        el.style.transform = ''
        el.style.color = ''
      }, 400)
    },
    []
  )

  const toggleStampSpeed = () => {
    setStampSpeed((prev) => (prev === 1 ? 3.5 : 1))
  }

  const handleSealClick = () => {
    setSealClicked(true)
    setTimeout(() => setSealClicked(false), 600)
  }

  return (
    <section id="hero" className="editorial-hero" aria-label="Hero Editorial Correio Elegante">
      {/* Dynamic Warm Ambient Glow Background */}
      <div className="editorial-hero-bg" aria-hidden="true">
        <div className="editorial-glow-ruby" />
        <div className="editorial-glow-amber" />
        <div className="absolute inset-0 bg-[radial-gradient(#171615_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035]" />
      </div>

      <Container size="default" className="relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ────────────────────────────────────────────────────────
              Left Column: Editorial Copy & Magnetic CTAs
             ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Editorial Capsule Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-white/80 backdrop-blur-md shadow-xs mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#db3b36] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#db3b36]" />
              </span>
              <span className="font-mono text-[11px] md:text-xs font-semibold tracking-wider text-[#171615] uppercase">
                EDIÇÃO EXCLUSIVA • CORREIO ELEGANTE DIGITAL
              </span>
            </motion.div>

            {/* Kinetic Split Letters Display Title */}
            <h1 className="editorial-heading mb-6" aria-label="Mande um recado que faz sorrir.">
              <span className="inline-flex items-baseline flex-wrap gap-x-3.5">
                <span className="inline-flex items-baseline">
                  {firstChars.map((char, index) => (
                    <span
                      key={`first-${index}`}
                      className="editorial-char editorial-char-first"
                      style={{ '--char-idx': index } as React.CSSProperties}
                      onMouseEnter={handleCharBounce}
                      onTouchStart={handleCharBounce}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
                <span className="inline-flex items-baseline">
                  {secondChars.map((char, index) => (
                    <span
                      key={`second-${index}`}
                      className="editorial-char editorial-char-last"
                      style={{ '--char-idx': firstChars.length + index } as React.CSSProperties}
                      onMouseEnter={handleCharBounce}
                      onTouchStart={handleCharBounce}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                  <span className="editorial-dot">.</span>
                </span>
              </span>
            </h1>

            {/* Refined One-Liner Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg lg:text-xl text-[#554e48] leading-relaxed max-w-xl mb-8 font-normal"
            >
              Crie cartas digitais memoráveis com <strong className="text-[#171615] font-semibold">trilha sonora sincronizada</strong>, <strong className="text-[#171615] font-semibold">lacre de cera 3D</strong> e <strong className="text-[#171615] font-semibold">raspadinha interativa</strong>. Entregue em instantes via QR Code ou link personalizado.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10"
            >
              <MagneticButton>
                <Link to="/create" className="editorial-btn-primary w-full sm:w-auto">
                  <span>Escrever minha carta</span>
                  <span className="btn-arrow-badge" aria-hidden="true">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </MagneticButton>

              <MagneticButton>
                <a href="#problem-section" className="editorial-btn-secondary w-full sm:w-auto">
                  <Play className="w-4 h-4 fill-current opacity-80" />
                  <span>Ver demonstração</span>
                </a>
              </MagneticButton>
            </motion.div>

            {/* Micro Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 border-t border-black/8 text-xs font-mono text-[#766e65]"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#db3b36]" />
                <span>Entrega Instantânea</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pix Seguro & Sem Cadastro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>+10.000 cartas enviadas</span>
              </div>
            </motion.div>
          </div>

          {/* ────────────────────────────────────────────────────────
              Right Column: 3D Tilt Card Editorial Composition
             ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <TiltCard maxTilt={8} perspective={1100} className="w-full max-w-[460px]">
              <div className="envelope-card relative">
                {/* Airmail Border Frame */}
                <div className="airmail-border" aria-hidden="true" />

                {/* Inner Envelope Content */}
                <div className="relative z-10 p-2 sm:p-3">
                  {/* Top Bar: Airmail Badge & Vintage Stamps */}
                  <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md bg-[#171615] text-[#fbf8f2] text-[10px] font-mono font-bold tracking-widest uppercase">
                        PAR AVION
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        Nº 2026-CE
                      </div>
                    </div>

                    {/* Rotating Circular Postal Postmark Stamp */}
                    <div
                      className="rotating-stamp"
                      onClick={toggleStampSpeed}
                      title="Clique para acelerar o carimbo postal"
                      aria-label="Carimbo postal interativo"
                    >
                      <svg
                        className="rotating-stamp-svg"
                        viewBox="0 0 100 100"
                        style={{ animationDuration: `${24 / stampSpeed}s` }}
                      >
                        <defs>
                          <path
                            id="postmark-circle"
                            d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                          />
                        </defs>
                        <text className="rotating-stamp-text">
                          <textPath href="#postmark-circle" startOffset="0%">
                            CORREIO ELEGANTE · AMOR & AFETO · 2026 ·
                          </textPath>
                        </text>
                      </svg>
                      <div className="rotating-stamp-center">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Protruding Letter Card Preview */}
                  <div className="bg-[#fcfbf9] rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-md transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    {/* Letter Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-cursive text-xl text-[#171615] font-semibold">
                        Meu amor eterno,
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-mono text-[#db3b36] font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        CARTA DIGITAL
                      </span>
                    </div>

                    {/* Letter Excerpt */}
                    <p className="text-xs sm:text-sm text-[#554e48] leading-relaxed mb-4 italic font-serif">
                      &ldquo;Cada instante com você se transforma em uma lembrança eterna. Preparei essa carta para tocar nossa música e reviver nossos momentos favoritos...&rdquo;
                    </p>

                    {/* Integrated Hi-Fi Soundtrack Bar */}
                    <div className="rounded-xl bg-[#171615] text-[#fbf8f2] p-2.5 flex items-center justify-between gap-3 shadow-inner mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#db3b36] flex items-center justify-center shrink-0">
                          <Music className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium truncate text-white">Nossa Trilha Sonora</p>
                          <p className="text-[9px] text-stone-400 font-mono">01:42 / 03:30 • Sincronizado</p>
                        </div>
                      </div>

                      {/* Animated Audio Equalizer Bars */}
                      <div className="flex items-end gap-1 h-4 pr-1">
                        <span className="equalizer-bar" />
                        <span className="equalizer-bar" />
                        <span className="equalizer-bar" />
                        <span className="equalizer-bar" />
                        <span className="equalizer-bar" />
                      </div>
                    </div>

                    {/* Interactive Scratch Card Preview */}
                    <button
                      type="button"
                      onClick={() => setScratchRevealed(!scratchRevealed)}
                      className={`w-full py-2 px-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                        scratchRevealed
                          ? 'bg-rose-50 border-rose-300 text-[#db3b36]'
                          : 'bg-stone-100/90 border-dashed border-stone-300 text-stone-600 hover:bg-stone-200/70'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
                        <Gift className="w-3.5 h-3.5 text-[#db3b36]" />
                        <span>
                          {scratchRevealed
                            ? '🎉 "Nosso próximo destino é Paris! Te amo!"'
                            : '✨ Toque para raspar o segredo'}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Bottom Envelope Flap with 3D Embossed Wax Seal */}
                  <div className="mt-4 pt-3 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-stone-500">
                      <span>Destino: </span>
                      <strong className="text-[#171615]">O Amor da Sua Vida</strong>
                    </div>

                    {/* 3D Wax Seal */}
                    <div
                      className={`wax-seal-badge ${sealClicked ? 'scale-125 rotate-12' : ''}`}
                      onClick={handleSealClick}
                      title="Lacre de cera 3D exclusivo"
                      aria-label="Lacre de cera 3D"
                    >
                      <Stamp className="w-5 h-5 text-amber-100 drop-shadow-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </Container>
    </section>
  )
}
