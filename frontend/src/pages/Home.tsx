import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Music2, Heart, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { BackgroundField } from '@/components/animations/BackgroundField'
import { Container } from '@/components/layout/Container'
import { ThreeHeroExperience } from '@/components/animations/ThreeHeroExperience'

import { InteractiveEnvelopeDemo } from '@/components/sections/InteractiveEnvelopeDemo'
import { CompareExperienceSection } from '@/components/sections/CompareExperienceSection'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { ProductPreviewSection } from '@/components/sections/ProductPreviewSection'
import { OccasionsSection } from '@/components/sections/OccasionsSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { FinalCTASection } from '@/components/sections/FinalCTASection'

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-28 pb-16 sm:pb-24 overflow-hidden">
      {/* Luzes de Fundo Ambientais Lançadas no Hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-rose-200/40 via-pink-300/25 to-rose-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-12 right-10 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="default" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* COLUNA ESQUERDA: Tipografia Editorial & Chamada Forte */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Tag Poética (sem badge / sem pílula) */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base font-bold text-[#be123c]">
              <Sparkles size={18} className="text-[#e11d48]" />
              <span className="font-serif italic">Cartas com alma, música e papel artesanal</span>
            </div>

            {/* H1 Principal com Grande Escala */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#4c0519] leading-[1.12] tracking-tight">
              Mande uma declaração{' '}
              <span className="text-[#e11d48] italic font-serif block sm:inline">
                que toca a alma
              </span>
            </h1>

            {/* Subtítulo em Vinho de Alto Contraste */}
            <p className="text-base sm:text-xl text-[#701a35] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Escreva uma carta inesquecível com suas fotos, trilha sonora favorita e lacre de cera 3D. Entregue em segundos por link seguro ou QR Code.
            </p>

            {/* Recursos de Destaque com Ícones SVG */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-[#4c0519]">
              <div className="flex items-center gap-1.5 bg-white/80 border border-pink-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
                <Music2 size={16} className="text-[#e11d48]" />
                <span>Trilha Sonora ao Vivo</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 border border-pink-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
                <Heart size={16} className="text-[#e11d48] fill-[#e11d48]" />
                <span>Lacre de Cera 3D</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 border border-pink-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
                <QrCode size={16} className="text-[#e11d48]" />
                <span>QR Code para Presentes</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <MagneticButton>
                <Link to="/create" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 shadow-2xl shadow-rose-500/35 hover:shadow-rose-500/50 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold px-8 py-4 text-base rounded-2xl transition-all"
                  >
                    <span>Escrever minha carta</span>
                    <ArrowRight size={18} className="shrink-0" />
                  </Button>
                </Link>
              </MagneticButton>

              <MagneticButton>
                <a href="#interactive-demo" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-white hover:bg-rose-50 text-[#4c0519] hover:text-[#e11d48] font-bold px-7 py-4 text-base rounded-2xl border-2 border-pink-300/90 shadow-md shadow-pink-500/10 transition-all"
                  >
                    Ver demonstração
                  </Button>
                </a>
              </MagneticButton>
            </div>

            {/* Prova Social em Tipografia Nobre */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm text-[#701a35] font-semibold">
              <div className="flex items-center text-[#e11d48]">
                <CheckCircle2 size={16} className="mr-1" />
                <span>Mais de 14.800 homenagens entregues</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={16} className="text-[#e11d48]" />
                <span>Entrega 100% segura</span>
              </div>
            </div>
          </motion.div>

          {/* COLUNA DIREITA: O ELEMENTO INESQUECÍVEL — ARTIFACT 3D WEBGL COM THREE.JS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-5 relative"
          >
            <ThreeHeroExperience />
          </motion.div>

        </div>
      </Container>
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

      {/* Hero Showcase de Alto Padrão Awwwards */}
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

      {/* 7. Perguntas Frequentes */}
      <FAQSection />

      {/* 8. Chamada Final */}
      <FinalCTASection />
    </div>
  )
}
