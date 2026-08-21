import { motion } from 'framer-motion'
import { Skeleton } from './Skeleton'
import { Container } from '@/components/layout/Container'

export interface LegalPageSkeletonProps {
  className?: string
  sectionsCount?: number
}

export function LegalPageSkeleton({
  className = '',
  sectionsCount = 4,
}: LegalPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando conteúdo institucional..."
      className={`min-h-screen pt-28 pb-16 ${className}`}
    >
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="glass rounded-3xl border border-border/80 bg-white/70 p-6 sm:p-10 shadow-xl space-y-8 backdrop-blur-sm">
            {/* Header: Title & Last Updated Date */}
            <div className="space-y-3 border-b border-border/40 pb-6">
              <Skeleton variant="text" className="h-9 w-64 sm:w-80 rounded-xl" />
              <Skeleton variant="text" className="h-3.5 w-44 rounded-md opacity-60" />
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {Array.from({ length: sectionsCount }).map((_, index) => (
                <div key={index} className="space-y-3">
                  {/* Section Title */}
                  <Skeleton
                    variant="text"
                    className={`h-5 rounded-lg ${
                      index % 2 === 0 ? 'w-48 sm:w-56' : 'w-40 sm:w-48'
                    }`}
                  />

                  {/* Paragraph lines */}
                  <div className="space-y-2 pt-1">
                    <Skeleton variant="text" className="h-3.5 w-full rounded-md opacity-80" />
                    <Skeleton variant="text" className="h-3.5 w-[96%] rounded-md opacity-80" />
                    <Skeleton
                      variant="text"
                      className={`h-3.5 rounded-md opacity-75 ${
                        index % 3 === 0 ? 'w-4/5' : index % 3 === 1 ? 'w-3/4' : 'w-5/6'
                      }`}
                    />
                  </div>

                  {/* Optional bullet points for some sections */}
                  {index % 2 === 1 && (
                    <div className="pl-4 pt-1 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                        <Skeleton variant="text" className="h-3.5 w-11/12 rounded-md opacity-70" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                        <Skeleton variant="text" className="h-3.5 w-4/5 rounded-md opacity-70" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
