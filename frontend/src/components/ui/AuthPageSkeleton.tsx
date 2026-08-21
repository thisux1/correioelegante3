import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { Container } from '@/components/layout/Container'

export interface AuthPageSkeletonProps {
  className?: string
  isResetPassword?: boolean
}

export function AuthPageSkeleton({
  className = '',
  isResetPassword = false,
}: AuthPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando autenticação..."
      className={`relative min-h-screen flex items-center justify-center pt-28 pb-16 px-4 overflow-hidden ${className}`}
    >
      {/* Subtle atmospheric glow in background */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-rose-200/30 via-pink-100/20 to-amber-100/20 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />

      <Container size="narrow" className="w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
          className="w-full max-w-md"
        >
          <div className="w-full rounded-3xl border border-white/60 bg-white/85 p-6 sm:p-8 shadow-xl shadow-rose-950/5 backdrop-blur-xl">
            {/* Header: Romantic Icon, Title & Subtitle */}
            <div className="text-center mb-6">
              {/* Logo with heart badge */}
              <div className="relative mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                <Heart className="h-5 w-5 fill-primary/20 text-primary animate-pulse" />
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] animate-shimmer"
                  aria-hidden="true"
                />
              </div>

              {/* Title silhouette */}
              <Skeleton
                variant="text"
                className="mx-auto mb-2 h-7 w-48 rounded-xl sm:w-56"
              />

              {/* Subtitle silhouette */}
              <Skeleton
                variant="text"
                className="mx-auto h-3.5 w-64 rounded-md opacity-70"
              />
            </div>

            {/* Mode switch tabs silhouette (Only for Auth, hidden if isResetPassword) */}
            {!isResetPassword && (
              <div className="mb-6 flex rounded-2xl border border-gray-200/40 bg-gray-100/80 p-1">
                <Skeleton variant="rounded" className="h-9 flex-1 rounded-xl bg-white shadow-xs" />
                <Skeleton variant="rounded" className="h-9 flex-1 rounded-xl opacity-40" />
              </div>
            )}

            {/* Form Fields Silhouette */}
            <div className="space-y-4">
              {/* Field 1: Email / Password */}
              <div className="space-y-1.5">
                <Skeleton variant="text" className="h-3.5 w-20 rounded-md opacity-80" />
                <Skeleton variant="rounded" className="h-11 w-full rounded-xl border border-border/50" />
              </div>

              {/* Field 2: Password / Confirm Password */}
              <div className="space-y-1.5">
                <Skeleton variant="text" className="h-3.5 w-16 rounded-md opacity-80" />
                <Skeleton variant="rounded" className="h-11 w-full rounded-xl border border-border/50" />
                {!isResetPassword && (
                  <div className="flex justify-end pt-0.5">
                    <Skeleton variant="text" className="h-3 w-28 rounded-md opacity-60" />
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <Skeleton
                  variant="rounded"
                  className="h-12 w-full rounded-2xl bg-primary/20 shadow-md"
                />
              </div>

              {/* Footer switch link */}
              <div className="pt-3 text-center">
                <Skeleton variant="text" className="mx-auto h-3.5 w-48 rounded-md opacity-70" />
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
