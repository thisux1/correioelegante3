import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { HeroAnimation } from '@/components/animations/HeroAnimation'
import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { BackgroundField } from '@/components/animations/BackgroundField'
import { Container } from '@/components/layout/Container'

import { InteractiveEnvelopeDemo } from '@/components/sections/InteractiveEnvelopeDemo'
import { CompareExperienceSection } from '@/components/sections/CompareExperienceSection'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { ProductPreviewSection } from '@/components/sections/ProductPreviewSection'
import { OccasionsSection } from '@/components/sections/OccasionsSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { FinalCTASection } from '@/components/sections/FinalCTASection'

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Smooth storytelling scroll mapping with clamp
  const focusOpacity = useTransform(scrollYProgress, [0.00, 0.08, 0.90, 0.98], [1, 0, 0, 1], { clamp: true })
  const textY = useTransform(scrollYProgress, [0.00, 0.08, 0.90, 0.98], [0, -35, 35, 0], { clamp: true })
  const animationOpacity = useTransform(scrollYProgress, [0.01, 0.07, 0.90, 0.98], [0, 1, 1, 0], { clamp: true })
  const heroProgress = useTransform(scrollYProgress, [0.02, 0.90], [0, 1], { clamp: true })

  return (
    <section ref={sectionRef} className="relative" style={{ height: '280vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Fundo suave perolado e luminoso */}
        <motion.div
          style={{ opacity: focusOpacity }}
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-white/90 via-[#fff8fa]/65 to-rose-50/30"
        />

        {/* Camada do Avião de Papel e Envelope em SVG */}
        <motion.div
          style={{ opacity: animationOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <HeroAnimation scrollProgress={heroProgress} />
        </motion.div>

        {/* Conteúdo Textual com Alto Contraste — 100% Tema Claro */}
        <motion.div
          style={{
            opacity: focusOpacity,
            y: textY,
            pointerEvents: useTransform(focusOpacity, (v) => (v === 0 ? 'none' : 'auto')),
          }}
          className="w-full relative z-10"
          data-no-ink="true"
        >
          <Container size="default" className="text-center px-4 sm:px-6">
            {/* Título Principal com Alto Contraste */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#4c0519] leading-[1.18] mb-6 tracking-tight drop-shadow-xs"
            >
              Mande um recado{' '}
              <span className="text-[#e11d48] font-extrabold">
                que faz sorrir
              </span>
            </motion.h1>

            {/* Subtítulo em Vinho Escuro Nítido */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-xl text-[#701a35] font-medium max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
            >
              Escreva uma carta especial com suas fotos, trilha sonora e lacre de cera.
              Entregue em segundos por link ou QR Code.
            </motion.p>

            {/* Botões de Ação — Rosa Forte Vibrante e Branco Limpo */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20"
            >
              <MagneticButton>
                <Link to="/create">
                  <Button
                    size="lg"
                    className="inline-flex items-center justify-center gap-2 shadow-xl shadow-rose-500/30 hover:shadow-rose-500/45 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold px-8 py-4 text-base rounded-2xl transition-all duration-200"
                  >
                    <span>Escrever minha carta</span>
                    <ArrowRight size={18} className="shrink-0" />
                  </Button>
                </Link>
              </MagneticButton>

              <MagneticButton>
                <a href="#interactive-demo">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white hover:bg-rose-50 text-[#4c0519] hover:text-[#e11d48] font-bold px-8 py-4 text-base rounded-2xl border-2 border-pink-300/80 shadow-md shadow-pink-500/10 transition-all duration-200"
                  >
                    Ver demonstração
                  </Button>
                </a>
              </MagneticButton>
            </motion.div>
          </Container>
        </motion.div>
      </div>
    </section>
  )
}

export function Home() {
  const [showAtmosphere, setShowAtmosphere] = useState(false)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const lowEndMode = useMemo(() => {
    const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4
    const lowMemory = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4

    return lowCpu || lowMemory
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowAtmosphere(true), lowEndMode ? 80 : 140)
    return () => window.clearTimeout(timer)
  }, [lowEndMode])

  return (
    <div className="relative overflow-x-clip min-h-screen bg-[#fff5f7]">
      <BackgroundField />
      {showAtmosphere && (
        <SiteAtmosphere lowEndMode={lowEndMode} reducedMotionMode={prefersReducedMotion} />
      )}

      {/* Storytelling Hero com Animação Fluida */}
      <HeroSection />

      {/* 1. Demonstração Interativa de Lacre de Cera */}
      <InteractiveEnvelopeDemo />

      {/* 2. Comparativo: Mensagem Fria vs. Correio Elegante */}
      <CompareExperienceSection />

      {/* 3. O Valor da Lembrança Eterna */}
      <ProblemSection />

      {/* 4. Vitrine dos Formatos Interativos (Vinil, Timeline, Raspadinha) */}
      <ProductPreviewSection />

      {/* 5. Ocasiões Especiais (Pedidos, Aniversários, Distância, Presentes) */}
      <OccasionsSection />

      {/* 6. Passo a Passo Simples */}
      <HowItWorksSection />

      {/* 7. Depoimentos Reais e Estatísticas */}
      <SocialProofSection />

      {/* 8. Perguntas Frequentes */}
      <FAQSection />

      {/* 9. Chamada Final */}
      <FinalCTASection />
    </div>
  )
}
