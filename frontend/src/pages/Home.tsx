import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Heart, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
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

// Import Sections
import { ProblemSection } from '@/components/sections/ProblemSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { ProductPreviewSection } from '@/components/sections/ProductPreviewSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { BackgroundField } from '@/components/animations/BackgroundField'

// ── HERO SECTION ─────────────────────────────────────────────────
// Uses the "tall container + sticky" pattern for scroll-driven video.
// The section is 300vh tall. The inner div is sticky and stays on screen
// while the user scrolls through the tall section. useScroll tracks
// progress from 0→1, which drives the video and text animations.
function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  // Mantém a timeline sempre avançando (sem plateau/zona morta),
  // mas sem chegar ao reset completo para o coração linger durante a saída.
  const heroProgress = useTransform(scrollYProgress, [0, 1], [0, 0.93])

  // Text stays fully visible until ~18% scroll, then fades out by 42%
  const textOpacity = useTransform(scrollYProgress, [0.18, 0.42], [1, 0])
  const textY = useTransform(scrollYProgress, [0.18, 0.42], [0, -60])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '500vh' }}>
      {/* Sticky container — stays on screen while section scrolls */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* SVG animation — scroll-driven airplane → love letter */}
        <HeroAnimation scrollProgress={heroProgress} />

        {/* First-visit cloud intro — plays once per session */}
        <HeroIntro />


        {/* Hero text content — fades out as you scroll */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="max-w-5xl mx-auto text-center relative z-10 px-6"
          data-no-ink="true"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-light/70 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
              <ShieldCheck size={14} className="text-green-500" /> Seguro
            </span>
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-text-light/70 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
              <Zap size={14} className="text-yellow-500" /> Rápido
            </span>
          </motion.div>

          <TextSplit
            text="Diga o que sente com elegância"
            className="justify-center mb-6 gap-x-3 md:gap-x-4"
            charClassName="font-display text-5xl md:text-7xl font-bold text-text leading-tight drop-shadow-sm"
            animateOnMount
          />

          <ScrollReveal delay={0.3} animateOnMount>
            <p className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
              Envie mensagens carinhosas, pague com Pix e surpreenda alguém especial
              com um correio elegante digital que emociona. 💌
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.5} animateOnMount>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton>
                <Link to="/create">
                  <Button size="lg" className="shadow-xl shadow-primary/20 hover:shadow-primary/30">
                    Escreva Sua Mensagem
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80">
                    Saiba Mais
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: textOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-text-light/50">
            Role para descobrir
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-text-light/40 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  )
}

// ── HOME PAGE ────────────────────────────────────────────────────
export function Home() {
  return (
    <div className="relative overflow-x-clip min-h-screen">

      {/* 0. DYNAMIC BACKGROUND */}
      <BackgroundField />

      {/* SITE-WIDE CLOUDS + STARS */}
      <SiteAtmosphere />

      {/* 1. HERO — Scroll-driven video */}
      <HeroSection />

      {/* 2. THE PROBLEM */}
      <ProblemSection />

      {/* 3. SOCIAL PROOF */}
      <SocialProofSection />

      {/* 4. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 5. PRODUCT PREVIEW */}
      <ProductPreviewSection />

      {/* 6. FAQ */}
      <FAQSection />

      {/* 7. CTA SECTION */}
      <ScrollSection id="cta-section">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-tr from-primary to-secondary p-12 md:p-24 text-center rounded-3xl" data-cursor-light="true">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none" />

            <div className="relative z-10 text-white" data-no-ink="true">
              <SectionReveal scrollRange={[0.1, 0.35, 1.0, 1.0]}>
                <Heart className="w-16 h-16 text-white/90 fill-white/20 mx-auto mb-6 animate-pulse" />
                <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                  Pronto para surpreender?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Crie uma memória inesquecível em poucos cliques. O amor merece ser celebrado agora.
                </p>
                <MagneticButton>
                  <Link to="/create">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="text-primary hover:bg-white/90 shadow-2xl text-lg px-10 py-5 h-auto border-none"
                    >
                      Começar Agora
                      <Heart size={20} className="fill-current" />
                    </Button>
                  </Link>
                </MagneticButton>
              </SectionReveal>
            </div>
          </Card>
        </div>
      </ScrollSection>

    </div>
  )
}
