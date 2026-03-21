import type { ReactNode } from 'react'

interface SettingRowProps {
  icon?: ReactNode
  label: string
  value?: string
  action?: ReactNode
  className?: string
}

export function SettingRow({ icon, label, value, action, className = '' }: SettingRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border border-white/40 bg-white/40 p-4 ${className}`}>
      <div className="flex min-w-0 items-center gap-3">
        {icon ? <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary-dark">{icon}</div> : null}
        <div className="min-w-0">
          <p className="text-xs text-text-muted">{label}</p>
          {value ? <p className="truncate font-medium text-text">{value}</p> : null}
        </div>
      </div>
      {action}
    </div>
  )
}
