import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { EditorialHero } from '@/components/sections/EditorialHero'
import { Ticker } from '@/components/ui/Ticker'
import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { BackgroundField } from '@/components/animations/BackgroundField'

const ProblemSection = lazy(() => import('@/components/sections/ProblemSection').then(m => ({ default: m.ProblemSection })))
const SocialProofSection = lazy(() => import('@/components/sections/SocialProofSection').then(m => ({ default: m.SocialProofSection })))
const HowItWorksSection = lazy(() => import('@/components/sections/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })))
const ProductPreviewSection = lazy(() => import('@/components/sections/ProductPreviewSection').then(m => ({ default: m.ProductPreviewSection })))
const FAQSection = lazy(() => import('@/components/sections/FAQSection').then(m => ({ default: m.FAQSection })))
const FinalCTASection = lazy(() => import('@/components/sections/FinalCTASection').then(m => ({ default: m.FinalCTASection })))

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

      {/* Editorial Hero (Zero 500vh scrolljacking, 100% performance score) */}
      <EditorialHero />

      {/* Continuous Hardware-Accelerated Marquee Ticker */}
      <Ticker />

      {/* Structured Editorial Sections */}
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
