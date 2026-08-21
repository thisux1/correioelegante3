import { motion } from 'framer-motion'
import { Sparkles, Check, Heart } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { Container } from '@/components/layout/Container'

export interface PricingPageSkeletonProps {
  className?: string
  cardsCount?: number
}

export function PricingPageSkeleton({
  className = '',
  cardsCount = 3,
}: PricingPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando planos..."
      className={`min-h-screen pb-20 pt-28 ${className}`}
    >
      <Container size="default">
        {/* Soft background ambient glow */}
        <div
          className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        {/* Header Silhouette */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center space-y-4"
        >
          {/* Badge silhouette */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 shadow-xs">
            <Sparkles size={14} className="text-primary/40 animate-pulse" />
            <Skeleton variant="text" className="h-3.5 w-28 rounded-md opacity-80" />
          </div>

          {/* Title silhouette */}
          <Skeleton variant="text" className="mx-auto h-10 w-72 sm:w-[480px] rounded-2xl" />

          {/* Subtitle silhouette */}
          <div className="mx-auto max-w-2xl space-y-2 pt-1">
            <Skeleton variant="text" className="mx-auto h-4 w-11/12 rounded-lg opacity-75" />
            <Skeleton variant="text" className="mx-auto h-4 w-3/4 rounded-lg opacity-60" />
          </div>
        </motion.div>

        {/* Pricing Cards Grid Silhouette */}
        <div
          className={`mx-auto mb-20 grid max-w-6xl grid-cols-1 gap-8 ${
            cardsCount === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'
          }`}
        >
          {Array.from({ length: cardsCount }).map((_, index) => {
            const isFeatured = index === 1

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
                className="relative h-full"
              >
                <div
                  className={`glass relative flex h-full flex-col justify-between rounded-3xl p-8 sm:p-9 shadow-xl backdrop-blur-sm transition-all ${
                    isFeatured
                      ? 'border-2 border-primary/40 bg-surface/90 shadow-primary/5'
                      : 'border border-border/80 bg-surface/60'
                  }`}
                >
                  {/* Featured Badge Silhouette on recommended card */}
                  {isFeatured && (
                    <div className="absolute -top-3.5 right-6 flex items-center gap-1.5 rounded-full bg-primary/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary border border-primary/30 shadow-xs">
                      <Heart size={11} className="text-primary fill-primary/40" />
                      <Skeleton variant="text" className="h-3 w-24 rounded-full bg-primary/30" />
                    </div>
                  )}

                  <div>
                    {/* Card Title & Badge */}
                    <div className="flex items-center justify-between">
                      <Skeleton
                        variant="text"
                        className={`h-7 rounded-xl ${
                          index === 0 ? 'w-24' : index === 1 ? 'w-36' : 'w-28'
                        }`}
                      />
                      <Skeleton variant="rounded" className="h-5 w-18 rounded-full opacity-80" />
                    </div>

                    {/* Description */}
                    <div className="mt-3 space-y-1.5">
                      <Skeleton variant="text" className="h-3.5 w-full rounded-md opacity-70" />
                      <Skeleton variant="text" className="h-3.5 w-4/5 rounded-md opacity-60" />
                    </div>

                    {/* Price Area */}
                    <div className="mt-6 flex items-baseline gap-2">
                      <Skeleton variant="text" className="h-4 w-6 rounded-md opacity-60" />
                      <Skeleton
                        variant="text"
                        className={`h-11 rounded-xl ${
                          isFeatured ? 'w-32 bg-primary/20' : 'w-24'
                        }`}
                      />
                      <Skeleton variant="text" className="h-3.5 w-20 rounded-md opacity-60" />
                    </div>

                    {/* Sub-price callout tag */}
                    {isFeatured && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Skeleton variant="rounded" className="h-4 w-48 rounded-md bg-emerald-500/15" />
                      </div>
                    )}

                    {/* Checklist of Benefits */}
                    <div className="mt-8 space-y-3.5 border-t border-border/40 pt-6">
                      {[0, 1, 2, 3, 4].map((featureIdx) => (
                        <div key={featureIdx} className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isFeatured ? 'bg-primary/20 text-primary' : 'bg-emerald-100/80 text-emerald-600'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} className="opacity-60" />
                          </div>
                          <Skeleton
                            variant="text"
                            className={`h-3.5 rounded-md ${
                              featureIdx === 0
                                ? 'w-11/12'
                                : featureIdx === 1
                                ? 'w-4/5'
                                : featureIdx === 2
                                ? 'w-10/12'
                                : featureIdx === 3
                                ? 'w-3/4'
                                : 'w-2/3'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button Silhouette */}
                  <div className="mt-10 pt-2">
                    <Skeleton
                      variant="rounded"
                      className={`h-12 w-full rounded-2xl shadow-xs ${
                        isFeatured ? 'bg-primary/25' : 'bg-primary/10'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Benefits Section Silhouette */}
        <div className="mx-auto mb-16 rounded-3xl border border-border/80 bg-surface/50 p-8 text-center sm:p-12">
          <Skeleton variant="text" className="mx-auto mb-8 h-7 w-64 rounded-xl" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-3 p-4">
                <Skeleton variant="circle" className="h-12 w-12 rounded-2xl" />
                <Skeleton variant="text" className="h-5 w-36 rounded-lg" />
                <Skeleton variant="text" className="h-3 w-48 rounded-md opacity-70" />
                <Skeleton variant="text" className="h-3 w-40 rounded-md opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
