import { motion } from 'framer-motion'
import { Sparkles, Check } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { Container } from '@/components/layout/Container'

export interface SuccessPageSkeletonProps {
  className?: string
}

export function SuccessPageSkeleton({
  className = '',
}: SuccessPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando confirmação..."
      className={`min-h-screen pt-28 pb-16 px-4 ${className}`}
    >
      <Container size="narrow">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="glass relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-white/90 p-8 text-center sm:p-12 shadow-2xl backdrop-blur-md">
            {/* Background Glow Orb */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Central Celebration Icon Silhouette */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-rose-300/30 text-primary shadow-xl shadow-primary/10">
                <Sparkles size={36} className="text-primary/60 animate-pulse" />
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] animate-shimmer"
                  aria-hidden="true"
                />
              </div>

              {/* Status Badge Silhouette */}
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1">
                <Skeleton variant="text" className="h-3 w-32 rounded-full opacity-80" />
              </div>

              {/* Title Silhouette */}
              <Skeleton
                variant="text"
                className="mx-auto mb-3 h-8 sm:h-9 w-64 sm:w-80 rounded-xl"
              />

              {/* Subtitle / Confirmation Text */}
              <div className="mx-auto max-w-md space-y-2 mb-6">
                <Skeleton variant="text" className="mx-auto h-4 w-full rounded-md opacity-75" />
                <Skeleton variant="text" className="mx-auto h-4 w-4/5 rounded-md opacity-60" />
              </div>

              {/* Order / Receipt Summary Box Silhouette */}
              <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left max-w-md mx-auto space-y-3 shadow-inner">
                <div className="flex items-center gap-2">
                  <Skeleton variant="text" className="h-4 w-36 rounded-md opacity-90" />
                </div>
                <div className="space-y-2.5 pt-1">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                        <Check size={10} strokeWidth={3} className="opacity-70" />
                      </div>
                      <Skeleton
                        variant="text"
                        className={`h-3.5 rounded-md opacity-70 ${
                          idx === 0 ? 'w-5/6' : idx === 1 ? 'w-4/5' : 'w-3/4'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Silhouette */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Skeleton
                  variant="rounded"
                  className="h-12 w-full sm:w-56 rounded-2xl bg-primary/25 shadow-md shadow-primary/10"
                />
                <Skeleton
                  variant="rounded"
                  className="h-12 w-full sm:w-44 rounded-2xl bg-primary/10"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
