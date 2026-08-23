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
      className={`space-y-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isDraftVariant = index % 2 !== 0

        return (
          <div
            key={index}
            className={`glass relative overflow-hidden flex flex-col rounded-3xl border-2 ${
              isDraftVariant
                ? 'border-dashed border-amber-400/80 bg-[#fffdfa]'
                : 'border-pink-300/80 bg-white'
            }`}
          >
            {/* Header da Aba do Envelope com Chanfro em V */}
            <div className="relative w-full overflow-visible">
              <div
                className="relative w-full pt-3 px-5 sm:px-7 pb-6 bg-gradient-to-b from-[#fff0f4] via-[#ffe4ec] to-[#fecdd3]/70 flex items-center justify-between"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 16px), 50% 100%, 0% calc(100% - 16px))',
                }}
              >
                <Skeleton variant="text" className="h-3 w-32 rounded-md opacity-60" />
                <Skeleton variant="rounded" className="h-5 w-20 rounded-md opacity-70" />
              </div>
              {/* Seal placeholder na ponta do V */}
              <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 z-20">
                <Skeleton variant="circle" className="w-10 h-10 border-2 border-white ring-2 ring-rose-300/40" />
              </div>
            </div>

            {/* Corpo do Envelope */}
            <div className="p-5 sm:p-7 pt-6 sm:pt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" className="h-3 w-16 rounded-md opacity-50" />
                <Skeleton
                  variant="text"
                  className={`h-6 rounded-lg ${
                    index % 2 === 0 ? 'w-48 sm:w-64' : 'w-40 sm:w-52'
                  }`}
                />
                <div className="flex items-center gap-3 pt-1">
                  <Skeleton variant="text" className="h-3.5 w-28 rounded-md opacity-70" />
                  <div className="h-1 w-1 rounded-full bg-primary/20" />
                  <Skeleton variant="text" className="h-3.5 w-16 rounded-md opacity-70" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-24 sm:flex-initial rounded-xl" />
                <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-20 sm:flex-initial rounded-xl" />
                <Skeleton variant="rounded" className="h-8 w-full flex-1 sm:w-16 sm:flex-initial rounded-xl" />
                <Skeleton variant="rounded" className="h-8 w-8 shrink-0 rounded-xl" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

