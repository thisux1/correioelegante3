import { Skeleton } from './Skeleton'
import { Container } from '@/components/layout/Container'
import { BlockSkeleton } from '@/editor/components/BlockSkeleton'

export interface EditorSkeletonProps {
  className?: string
  showHeader?: boolean
}

export function EditorSkeleton({
  className = '',
  showHeader = true,
}: EditorSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando editor..."
      className={`w-full space-y-6 ${className}`}
    >
      {showHeader && (
        <div>
          {/* Title & Subtitle */}
          <div className="mb-6 space-y-2">
            <Skeleton variant="text" className="h-9 w-64 md:w-80 rounded-xl" />
            <Skeleton variant="text" className="h-4 w-96 max-w-full rounded-md opacity-70" />
          </div>

          {/* Top bar with save status badge */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Skeleton variant="rounded" className="h-10 w-48 rounded-xl" />
          </div>

          {/* Action buttons & Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/80 p-3 backdrop-blur-sm shadow-xs">
            {/* Left buttons: Add block, Theme picker, Mode switcher */}
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-11 w-11 rounded-xl" />
              <Skeleton variant="rounded" className="h-11 w-32 rounded-xl" />
              <Skeleton variant="rounded" className="h-11 w-28 rounded-xl" />
            </div>

            {/* Right status: Save indicator, Block counter */}
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-9 w-24 rounded-xl opacity-80" />
              <Skeleton variant="rounded" className="h-9 w-16 rounded-xl opacity-80" />
            </div>
          </div>

          {/* Theme badges row */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto py-1">
            <Skeleton variant="text" className="h-3 w-16 rounded-md opacity-60 shrink-0" />
            <div className="flex gap-1.5 shrink-0">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} variant="circle" className="h-6 w-6 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Central Canvas with 3 Shimmer Blocks */}
      <Container size="narrow" className="px-0">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Bloco 1: Envelope */}
          <div className="rounded-3xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur-xs">
            <BlockSkeleton type="envelope" />
          </div>

          {/* Bloco 2: Texto */}
          <div className="rounded-3xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur-xs">
            <BlockSkeleton type="text" category="body" />
          </div>

          {/* Bloco 3: Polaroid */}
          <div className="rounded-3xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur-xs">
            <BlockSkeleton type="polaroid" />
          </div>
        </div>
      </Container>
    </div>
  )
}
