import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { TextSplit } from '@/components/animations/TextSplit'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { ScrollSection } from '@/components/layout/ScrollSection'
import type { MotionValue } from 'framer-motion'

const LazyHeroAnimation = lazy(() => import('@/components/animations/HeroAnimation').then(m => ({ default: m.HeroAnimation })))

function DeferredHeroAnimation({ scrollProgress, animationOpacity }: { scrollProgress: MotionValue<number>; animationOpacity: MotionValue<number> }) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    let timeoutId: any
    if (typeof requestIdleCallback !== 'undefined') {
      timeoutId = requestIdleCallback(() => setShouldRender(true), { timeout: 1500 })
    } else {
      timeoutId = setTimeout(() => setShouldRender(true), 300)
    }

    return () => {
      if (typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(timeoutId)
      } else {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (!shouldRender) return null

  return (
    <Suspense fallback={null}>
      <motion.div
        style={{ opacity: animationOpacity }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <LazyHeroAnimation scrollProgress={scrollProgress} />
      </motion.div>
    </Suspense>
  )
}

import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { BackgroundField } from '@/components/animations/BackgroundField'
import { Container } from '@/components/layout/Container'

const ProblemSection = lazy(() => import('@/components/sections/ProblemSection').then(m => ({ default: m.ProblemSection })))
const SocialProofSection = lazy(() => import('@/components/sections/SocialProofSection').then(m => ({ default: m.SocialProofSection })))
const HowItWorksSection = lazy(() => import('@/components/sections/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })))
const ProductPreviewSection = lazy(() => import('@/components/sections/ProductPreviewSection').then(m => ({ default: m.ProductPreviewSection })))
const FAQSection = lazy(() => import('@/components/sections/FAQSection').then(m => ({ default: m.FAQSection })))

// --- Feature Flags (Otimização LCP) ---
const ENABLE_FAST_HERO = true
const ENABLE_LAZY_SECTIONS = true


function HeroSectionOriginal() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const heroProgress = useTransform(scrollYProgress, [0.18, 1], [0, 0.93])
  const animationOpacity = useTransform(scrollYProgress, [0.16, 0.22], [0, 1])
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.18], [1, 0])
  const textY = useTransform(scrollYProgress, [0.05, 0.18], [0, -60])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <Suspense fallback={null}>
          <motion.div style={{ opacity: animationOpacity }} className="absolute inset-0 z-0 pointer-events-none">
            <LazyHeroAnimation scrollProgress={heroProgress} />
          </motion.div>
        </Suspense>

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="w-full relative z-10"
          data-no-ink="true"
        >
          <Container size="default" className="text-center">
          <TextSplit
            text="Mande um recado que faz sorrir"
            className="justify-center mb-6 gap-x-3 md:gap-x-4"
            charClassName="font-display text-5xl md:text-7xl font-bold text-text leading-tight drop-shadow-sm"
            animateOnMount
          />

          <ScrollReveal delay={0.3} animateOnMount>
            <p className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
              Escreva uma carta especial, pague via Pix e entregue por QR Code.
              Simples assim.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.5} animateOnMount>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton>
                <Link to="/create">
                  <Button size="lg" className="shadow-xl shadow-primary/20 hover:shadow-primary/30">
                    Escrever minha carta
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80">
                    Como funciona?
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
          </Container>
        </motion.div>
      </div>
    </section>
  )
}

function HeroSectionOptimized() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // ── Orquestração de Foco (Livro de História) ──
  // [0.00, 0.08]: Texto sólido para leitura. Fundo opaco.
  // [0.08, 0.14]: Crossfade texto sai, animação entra.
  // [0.14, 0.86]: Coreografia do Envelope ganha vida no fundo mágico.
  // [0.86, 0.94]: Crossfade animação sai, texto e fundo sólido voltam.
  // [0.94, 1.00]: Fixação para o fim da tela antes da próxima sessão.
  const focusOpacity = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [1, 0, 0, 1])
  const textY = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [0, -60, 60, 0])
  const animationOpacity = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [0, 1, 1, 0])
  
  // A progressão da animação física SVG (avião, papel) ocorre apenas no espaço onde a opacidade é 100%.
  const heroProgress = useTransform(scrollYProgress, [0.14, 0.86], [0, 1])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Camada do Fundo Claro Opaco (cobre SiteAtmosphere antes de revelar a história) */}
        <motion.div
           style={{ opacity: focusOpacity }}
           className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-background via-background to-primary/5"
        />

        {/* Camada da Animação do Envelope e Avião */}
        <DeferredHeroAnimation scrollProgress={heroProgress} animationOpacity={animationOpacity} />

        {/* Camada do Texto Principal e Botões */}
        <motion.div
          style={{ opacity: focusOpacity, y: textY, pointerEvents: useTransform(focusOpacity, v => v === 0 ? "none" : "auto") }}
          className="w-full relative z-10"
          data-no-ink="true"
        >
          <Container size="default" className="text-center">
            <TextSplit
              text="Mande um recado que faz sorrir"
              className="justify-center mb-6 gap-x-3 md:gap-x-4"
              charClassName="font-display text-5xl md:text-7xl font-bold text-text leading-tight drop-shadow-sm"
              animateOnMount
            />

            <ScrollReveal delay={0.3} animateOnMount>
              <p className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
                Escreva uma carta especial, pague via Pix e entregue por QR Code.
                Simples assim.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.5} animateOnMount>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton>
                <Link to="/create">
                  <Button size="lg" className="shadow-xl shadow-primary/20 hover:shadow-primary/30">
                    Escrever minha carta
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80">
                    Como funciona?
                  </Button>
                </Link>
              </MagneticButton>
            </div>
            </ScrollReveal>
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
    <div className="relative overflow-x-clip min-h-screen">
      <BackgroundField />
      {showAtmosphere && <SiteAtmosphere lowEndMode={lowEndMode} reducedMotionMode={prefersReducedMotion} />}
      
      {ENABLE_FAST_HERO ? <HeroSectionOptimized /> : <HeroSectionOriginal />}
      
      {ENABLE_LAZY_SECTIONS ? (
        <Suspense fallback={<div className="min-h-[600px] w-full" />}>
          <ProblemSection />
          <SocialProofSection />
          <HowItWorksSection />
          <ProductPreviewSection />
          <FAQSection />
        </Suspense>
      ) : (
        <>
          <ProblemSection />
          <SocialProofSection />
          <HowItWorksSection />
          <ProductPreviewSection />
          <FAQSection />
        </>
      )}

      <ScrollSection id="cta-section">
        <Container size="narrow">
          <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-tr from-primary to-secondary p-12 md:p-24 text-center rounded-3xl" data-cursor-light="true">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none" />

            <div className="relative z-10 text-white" data-no-ink="true">
              <SectionReveal scrollRange={[0.1, 0.35, 1.0, 1.0]}>
                <Heart className="w-16 h-16 text-white/90 fill-white/20 mx-auto mb-6 animate-pulse" />
                <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                  Bora mandar aquele recado?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Leva menos de 5 minutos, prometo!
                </p>
                <MagneticButton>
                  <Link to="/create">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="text-primary hover:bg-white/90 shadow-2xl text-lg px-10 py-5 h-auto border-none"
                    >
                      Criar minha carta
                      <Heart size={20} className="fill-current" />
                    </Button>
                  </Link>
                </MagneticButton>
              </SectionReveal>
            </div>
          </Card>
        </Container>
      </ScrollSection>
    </div>
  )
}
