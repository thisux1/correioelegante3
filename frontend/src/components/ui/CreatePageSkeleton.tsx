import { Container } from '@/components/layout/Container'
import { Skeleton } from './Skeleton'

export interface CreatePageSkeletonProps {
  count?: number
  templatesCount?: number
  className?: string
}

export function CreatePageSkeleton({
  count,
  templatesCount,
  className = '',
}: CreatePageSkeletonProps) {
  const cardsCount = count ?? templatesCount ?? 6

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando modelos..."
      className={`min-h-screen pt-28 pb-16 ${className}`}
    >
      <Container size="default">
        {/* Header Silhouette */}
        <div className="mb-12 text-center space-y-4">
          <Skeleton variant="text" className="mx-auto h-10 md:h-12 w-3/4 max-w-xl rounded-2xl" />
          <Skeleton variant="text" className="mx-auto h-5 w-full max-w-lg rounded-lg opacity-80" />
          <Skeleton variant="text" className="mx-auto h-4 w-4/5 max-w-md rounded-md opacity-60" />
        </div>

        {/* Responsive Grid with 6 Template Cards in Shimmer */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cardsCount }).map((_, index) => (
            <div
              key={index}
              className="glass group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15 bg-white/70 shadow-xs backdrop-blur-xs"
              data-testid="create-template-skeleton-card"
            >
              {/* Banner with Category Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-primary/5">
                <Skeleton variant="rounded" className="h-full w-full rounded-none" />
                <Skeleton variant="rounded" className="absolute left-3 top-3 h-6 w-20 rounded-full border border-white/60" />
              </div>

              {/* Card Body: Title, Description & Action Button */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton
                      variant="text"
                      className={`h-7 rounded-xl ${
                        index % 3 === 0 ? 'w-40' : index % 3 === 1 ? 'w-32' : 'w-48'
                      }`}
                    />
                    <Skeleton variant="circle" className="h-5 w-5 rounded-full opacity-70" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Skeleton variant="text" className="h-3.5 w-full rounded-md opacity-80" />
                    <Skeleton
                      variant="text"
                      className={`h-3.5 rounded-md opacity-80 ${
                        index % 2 === 0 ? 'w-4/5' : 'w-3/5'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <Skeleton variant="rounded" className="h-5 w-28 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
