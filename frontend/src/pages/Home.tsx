import { useEffect, useMemo, useRef, useState } from 'react'
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
import { HeroAnimation } from '@/components/animations/HeroAnimation'
import { HeroIntro } from '@/components/animations/HeroIntro'
import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { ProductPreviewSection } from '@/components/sections/ProductPreviewSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { BackgroundField } from '@/components/animations/BackgroundField'
import { Container } from '@/components/layout/Container'

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const heroProgress = useTransform(scrollYProgress, [0, 1], [0, 0.93])
  const textOpacity = useTransform(scrollYProgress, [0.18, 0.42], [1, 0])
  const textY = useTransform(scrollYProgress, [0.18, 0.42], [0, -60])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <HeroAnimation scrollProgress={heroProgress} />
        <HeroIntro />

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
      {showAtmosphere && <BackgroundField />}
      {showAtmosphere && <SiteAtmosphere lowEndMode={lowEndMode} reducedMotionMode={prefersReducedMotion} />}
      <HeroSection />
      <ProblemSection />
      <SocialProofSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <FAQSection />

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
