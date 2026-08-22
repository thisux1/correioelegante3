import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextSplit } from '@/components/animations/TextSplit'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { HeroClouds } from '@/components/animations/HeroClouds'
import { Ticker } from '@/components/ui/Ticker'
import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { BackgroundField } from '@/components/animations/BackgroundField'
import { Container } from '@/components/layout/Container'

const LazyHeroAnimation = lazy(() =>
  import('@/components/animations/HeroAnimation').then((m) => ({ default: m.HeroAnimation }))
)

function DeferredHeroAnimation({
  scrollProgress,
  animationOpacity,
}: {
  scrollProgress: MotionValue<number>
  animationOpacity: MotionValue<number>
}) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    let timeoutId: number | ReturnType<typeof setTimeout>
    if (typeof requestIdleCallback !== 'undefined') {
      timeoutId = requestIdleCallback(() => setShouldRender(true), { timeout: 1200 })
    } else {
      timeoutId = setTimeout(() => setShouldRender(true), 200)
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

const ProblemSection = lazy(() =>
  import('@/components/sections/ProblemSection').then((m) => ({ default: m.ProblemSection }))
)
const SocialProofSection = lazy(() =>
  import('@/components/sections/SocialProofSection').then((m) => ({ default: m.SocialProofSection }))
)
const HowItWorksSection = lazy(() =>
  import('@/components/sections/HowItWorksSection').then((m) => ({ default: m.HowItWorksSection }))
)
const ProductPreviewSection = lazy(() =>
  import('@/components/sections/ProductPreviewSection').then((m) => ({
    default: m.ProductPreviewSection,
  }))
)
const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then((m) => ({ default: m.FAQSection }))
)
const FinalCTASection = lazy(() =>
  import('@/components/sections/FinalCTASection').then((m) => ({ default: m.FinalCTASection }))
)

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Smooth storytelling scroll mapping
  const focusOpacity = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [1, 0, 0, 1])
  const textY = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [0, -50, 50, 0])
  const textBlur = useTransform(
    scrollYProgress,
    [0.06, 0.14, 0.86, 0.94],
    ['blur(0px)', 'blur(8px)', 'blur(8px)', 'blur(0px)']
  )
  const animationOpacity = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [0, 1, 1, 0])
  const heroProgress = useTransform(scrollYProgress, [0.14, 0.86], [0, 1])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Fundo suave com atmosfera */}
        <motion.div
          style={{ opacity: focusOpacity }}
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-background via-background to-primary/5"
        />

        {/* Camada do Avião de Papel e Envelope em SVG */}
        <DeferredHeroAnimation scrollProgress={heroProgress} animationOpacity={animationOpacity} />
        <HeroClouds scrollProgress={scrollYProgress} />

        {/* Conteúdo Textual com Fly-in e Blur-in Suave */}
        <motion.div
          style={{
            opacity: focusOpacity,
            y: textY,
            filter: textBlur,
            pointerEvents: useTransform(focusOpacity, (v) => (v === 0 ? 'none' : 'auto')),
          }}
          className="w-full relative z-10"
          data-no-ink="true"
        >
          <Container size="default" className="text-center">
            {/* Badge comemorativa delicada */}
            <motion.div
              initial={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200/70 dark:border-pink-900/40 bg-white/70 dark:bg-zinc-900/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-xs"
            >
              <Sparkles size={13} className="fill-primary" />
              <span>O Correio Elegante Digital mais especial do Brasil</span>
            </motion.div>

            {/* Título com Kinetic Split Letters */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TextSplit
                text="Mande um recado que faz sorrir"
                className="justify-center mb-6 gap-x-3 md:gap-x-4"
                charClassName="font-display text-5xl md:text-7xl font-bold text-text leading-tight drop-shadow-sm"
                animateOnMount
              />
            </motion.div>

            {/* Subtítulo com Fly-in */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm font-sans"
            >
              Escreva uma carta interativa com fotos, trilha sonora e lacre de cera 3D.
              Entregue em segundos por link ou QR Code.
            </motion.p>

            {/* Ações com Botões Magnéticos e Glow Suave */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton>
                <Link to="/create">
                  <Button size="lg" className="shadow-xl shadow-primary/25 hover:shadow-primary/35">
                    Escrever minha carta
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border-pink-200/60 dark:border-pink-900/40 hover:bg-white/90"
                  >
                    Como funciona?
                  </Button>
                </Link>
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
    <div className="relative overflow-x-clip min-h-screen">
      <BackgroundField />
      {showAtmosphere && (
        <SiteAtmosphere lowEndMode={lowEndMode} reducedMotionMode={prefersReducedMotion} />
      )}

      {/* Storytelling Hero com Animações Fluidas */}
      <HeroSection />

      {/* Faixa Marquee Ticker de Recursos */}
      <Ticker />

      {/* Seções com Lazy Loading */}
      <Suspense fallback={<div className="min-h-[600px] w-full" />}>
        <ProblemSection />
        <SocialProofSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <FAQSection />
        <FinalCTASection />
      </Suspense>
    </div>
  )
}
