import type { ReactNode } from 'react'

interface InlineAlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  children: ReactNode
  className?: string
}

const toneClasses: Record<NonNullable<InlineAlertProps['tone']>, string> = {
  info: 'border-primary/20 bg-primary/5 text-text-light',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
}

export function InlineAlert({ tone = 'info', children, className = '' }: InlineAlertProps) {
  return (
    <p className={`rounded-xl border px-3 py-2 text-sm ${toneClasses[tone]} ${className}`}>
      {children}
    </p>
  )
}
