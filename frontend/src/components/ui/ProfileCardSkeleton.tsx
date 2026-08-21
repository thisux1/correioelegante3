import { Skeleton } from './Skeleton'

export interface ProfileCardSkeletonProps {
  count?: number
  className?: string
}

export function ProfileCardSkeleton({
  count = 3,
  className = '',
}: ProfileCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando cartas do perfil..."
      className={`space-y-3.5 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="glass flex flex-col gap-4 rounded-2xl border border-border/60 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          {/* Left section: title silhouette, status badge and metadata */}
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton
                variant="text"
                className={`h-5 rounded-lg ${
                  index % 2 === 0 ? 'w-48 sm:w-64' : 'w-40 sm:w-52'
                }`}
              />
              <Skeleton variant="rounded" className="h-5 w-18 rounded-full" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3.5 w-28 rounded-md opacity-70" />
              <div className="h-1 w-1 rounded-full bg-primary/20" />
              <Skeleton variant="text" className="h-3.5 w-16 rounded-md opacity-70" />
            </div>
          </div>

          {/* Right section: action buttons silhouette */}
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
            <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-24 sm:flex-initial rounded-xl" />
            <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-20 sm:flex-initial rounded-xl" />
            <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-16 sm:flex-initial rounded-xl" />
            <Skeleton variant="circle" className="h-8 w-8 shrink-0 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
