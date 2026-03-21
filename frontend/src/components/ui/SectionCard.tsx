import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SectionCard({ title, description, children, className = '' }: SectionCardProps) {
  return (
    <Card glass className={`p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-text">{title}</h2>
        {description ? <p className="mt-1 text-sm text-text-light">{description}</p> : null}
      </div>
      {children}
    </Card>
  )
}
