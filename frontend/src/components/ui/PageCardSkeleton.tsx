import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Skeleton } from './Skeleton'

export interface PageCardSkeletonProps {
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  showMediaPlaceholder?: boolean
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
}

export function PageCardSkeleton({
  className = '',
  maxWidth = '3xl',
  showMediaPlaceholder = false,
}: PageCardSkeletonProps) {
  const maxWClass = maxWidthMap[maxWidth] || 'max-w-3xl'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando carta..."
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden bg-background/60"
    >
      {/* Decorative soft glowing orbs in background */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/5 blur-3xl"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className={`w-full ${maxWClass} relative z-10 ${className}`}
      >
        <div className="rounded-3xl border-2 border-border/80 bg-gradient-to-br from-surface to-background p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          {/* Romantic Wax Seal / Stamp Silhouette */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
              <Heart className="h-6 w-6 text-primary/30 fill-primary/20 animate-pulse" />
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] animate-shimmer"
                aria-hidden="true"
              />
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              <div className="h-1 w-1 rounded-full bg-primary/20" />
              <div className="h-1 w-1 rounded-full bg-primary/30" />
              <div className="h-1 w-1 rounded-full bg-primary/20" />
            </div>
          </div>

          {/* Recipient Header Silhouettes */}
          <div className="mb-8 space-y-2 text-center">
            <Skeleton variant="text" className="mx-auto h-3 w-16 rounded-md opacity-70" />
            <Skeleton variant="text" className="mx-auto h-7 w-48 sm:w-64 rounded-xl" />
          </div>

          {/* Message Parchment Box with Elegant Lines */}
          <div className="mb-8 rounded-2xl border border-border/80 bg-surface-glass/70 p-6 sm:p-8 backdrop-blur-sm">
            <div className="space-y-3.5">
              <Skeleton variant="text" className="mx-auto h-4 w-11/12 rounded-lg" />
              <Skeleton variant="text" className="mx-auto h-4 w-full rounded-lg" />
              <Skeleton variant="text" className="mx-auto h-4 w-4/5 rounded-lg" />
              <Skeleton variant="text" className="mx-auto h-4 w-10/12 rounded-lg" />
              <Skeleton variant="text" className="mx-auto h-4 w-3/4 rounded-lg" />
            </div>
          </div>

          {/* Optional Media Silhouette */}
          {showMediaPlaceholder && (
            <div className="mb-8">
              <Skeleton variant="card" className="h-56 w-full rounded-2xl" />
            </div>
          )}

          {/* Date & Signature Stamp */}
          <div className="border-t border-black/5 pt-5 text-center">
            <Skeleton variant="text" className="mx-auto mb-2 h-3 w-32 rounded-md opacity-60" />
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-3.5 w-3.5 text-primary/30 fill-primary/20" />
              <Skeleton variant="text" className="h-3.5 w-24 rounded-full opacity-70" />
            </div>
          </div>

          {/* Bottom Action Silhouette */}
          <div className="mt-8 border-t border-border/40 pt-6 text-center">
            <Skeleton variant="text" className="mx-auto mb-3 h-3 w-40 rounded-md opacity-60" />
            <Skeleton variant="rounded" className="mx-auto h-9 w-60 rounded-xl" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
