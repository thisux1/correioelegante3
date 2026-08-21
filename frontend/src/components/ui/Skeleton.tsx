import type React from 'react'

export type SkeletonVariant = 'text' | 'circle' | 'rounded' | 'card'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  className?: string
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-md',
  circle: 'rounded-full aspect-square',
  rounded: 'rounded-2xl',
  card: 'rounded-3xl border border-border/50 p-6',
}

export function Skeleton({
  variant = 'rounded',
  className = '',
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando..."
      className={`bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 bg-[length:200%_100%] animate-shimmer ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}
