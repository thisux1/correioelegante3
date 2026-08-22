import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextSplit } from '@/components/animations/TextSplit'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { HeroClouds } from '@/components/animations/HeroClouds'
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
const ProductPreviewSection = lazy(() =>
  import('@/components/sections/ProductPreviewSection').then((m) => ({
    default: m.ProductPreviewSection,
  }))
)
const HowItWorksSection = lazy(() =>
  import('@/components/sections/HowItWorksSection').then((m) => ({ default: m.HowItWorksSection }))
)
const SocialProofSection = lazy(() =>
  import('@/components/sections/SocialProofSection').then((m) => ({ default: m.SocialProofSection }))
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
  const textY = useTransform(scrollYProgress, [0.06, 0.14, 0.86, 0.94], [0, -45, 45, 0])
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
        {/* Fundo suave rosa claro & branco */}
        <motion.div
          style={{ opacity: focusOpacity }}
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-rose-50/40 via-background to-pink-50/30"
        />

        {/* Camada do Avião de Papel e Envelope em SVG */}
        <DeferredHeroAnimation scrollProgress={heroProgress} animationOpacity={animationOpacity} />
        <HeroClouds scrollProgress={scrollYProgress} />

        {/* Conteúdo Textual com Fly-in e Blur-in Suave — Rosa Claro, Rosa Forte e Branco */}
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
            {/* Título com Kinetic Split Letters */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <TextSplit
                text="Mande um recado que faz sorrir"
                className="justify-center mb-6 gap-x-3 md:gap-x-4"
                charClassName="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-rose-950 dark:text-rose-100 leading-tight drop-shadow-sm"
                animateOnMount
              />
            </motion.div>

            {/* Subtítulo com Fly-in Suave */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-rose-900/80 dark:text-rose-200/80 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm font-sans"
            >
              Escreva uma carta especial com suas fotos, trilha sonora e lacre de cera.
              Entregue em segundos por link ou QR Code.
            </motion.p>

            {/* Botões de Ação — Rosa Forte Vibrante e Branco Perolado */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton>
                <Link to="/create">
                  <Button size="lg" className="shadow-xl shadow-primary/30 hover:shadow-primary/45 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 text-base rounded-2xl">
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
                    className="bg-white/85 dark:bg-zinc-900/70 backdrop-blur-md border-pink-200/80 dark:border-pink-900/50 hover:bg-white text-rose-950 dark:text-rose-100 font-semibold px-8 py-4 text-base rounded-2xl shadow-sm hover:shadow-md transition-all"
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

      {/* Storytelling Hero com Animação Original */}
      <HeroSection />

      {/* Seções Principais Refatoradas */}
      <Suspense fallback={<div className="min-h-[600px] w-full" />}>
        <ProblemSection />
        <ProductPreviewSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTASection />
      </Suspense>
    </div>
  )
}
