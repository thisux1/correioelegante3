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
    <div className={`flex items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-white/40 bg-white/40 p-3.5 sm:p-4 ${className}`}>
      <div className="flex min-w-0 w-full flex-1 items-start sm:items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-dark mt-0.5 sm:mt-0">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-text-muted">{label}</p>
          {value ? (
            <p className="text-xs sm:text-sm font-medium text-text break-words mt-0.5 leading-relaxed">
              {value}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">{action}</div> : null}
    </div>
  )
}
