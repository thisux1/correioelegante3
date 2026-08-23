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
      {Array.from({ length: count }).map((_, index) => {
        const isDraftVariant = index % 2 !== 0

        return (
          <div
            key={index}
            className={`glass relative overflow-hidden flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
              isDraftVariant
                ? 'border border-amber-500/30 bg-surface'
                : 'border border-primary/20 bg-surface'
            }`}
          >
            {/* Linha sutil de dobra do envelope no topo */}
            <div
              className={`pointer-events-none absolute top-0 inset-x-0 h-1 ${
                isDraftVariant
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/40 to-amber-500/10'
                  : 'bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10'
              }`}
              aria-hidden="true"
            />

            {/* Left section: Wax seal / stamp skeleton + title silhouette + metadata */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Icon placeholder */}
              <Skeleton
                variant="rounded"
                className={`h-11 w-11 shrink-0 rounded-2xl ${
                  isDraftVariant
                    ? 'border border-amber-500/30'
                    : 'border border-primary/20'
                }`}
              />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton
                  variant="text"
                  className={`h-5 rounded-lg ${
                    index % 2 === 0 ? 'w-48 sm:w-64' : 'w-40 sm:w-52'
                  }`}
                />

                <div className="flex items-center gap-3">
                  <Skeleton variant="text" className="h-3.5 w-28 rounded-md opacity-70" />
                  <div className="h-1 w-1 rounded-full bg-primary/20" />
                  <Skeleton variant="text" className="h-3.5 w-16 rounded-md opacity-70" />
                </div>
              </div>
            </div>

            {/* Right section: action buttons silhouette */}
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-24 sm:flex-initial rounded-xl" />
              <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-20 sm:flex-initial rounded-xl" />
              <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-16 sm:flex-initial rounded-xl" />
              <Skeleton variant="rounded" className="h-8 w-8 shrink-0 rounded-xl" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

