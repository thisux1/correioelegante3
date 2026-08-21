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
                ? 'border border-dashed border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-surface'
                : 'border border-primary/20 bg-gradient-to-br from-surface to-background/80'
            }`}
          >
            {/* Silhouette da dobra do envelope ou folha interna */}
            {isDraftVariant ? (
              <div
                className="pointer-events-none absolute top-0 right-12 sm:right-16 -translate-y-1.5 w-24 sm:w-32 h-3.5 bg-amber-200/40 rounded-t-sm border-t border-x border-amber-300/40 opacity-70"
                aria-hidden="true"
              />
            ) : (
              <div
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-12 bg-primary/5 rounded-b-[100%] border-b border-primary/15 opacity-60"
                aria-hidden="true"
              />
            )}

            {/* Left section: Wax seal / stamp skeleton + title silhouette + postal stamp + metadata */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              {/* Wax seal / stamp placeholder */}
              <Skeleton
                variant="circle"
                className={`h-9 w-9 shrink-0 ${
                  isDraftVariant
                    ? 'border border-dashed border-amber-400/40'
                    : 'ring-2 ring-primary/20'
                }`}
              />

              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Skeleton
                    variant="text"
                    className={`h-5 rounded-lg ${
                      index % 2 === 0 ? 'w-48 sm:w-64' : 'w-40 sm:w-52'
                    }`}
                  />
                  <Skeleton
                    variant="rounded"
                    className={`h-5 rounded-md ${
                      isDraftVariant ? 'w-36' : 'w-32'
                    }`}
                  />
                </div>

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
              <Skeleton variant="circle" className="h-8 w-8 shrink-0 rounded-xl" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
