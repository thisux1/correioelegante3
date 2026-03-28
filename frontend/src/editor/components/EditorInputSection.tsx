import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react'

type SectionState = 'idle' | 'loading' | 'error' | 'success'

interface EditorInputSectionProps {
  title: string
  helperText?: string
  state?: SectionState
  stateText?: string | null
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export const EDITOR_FIELD_BASE_CLASS = 'w-full min-h-11 rounded-xl border border-primary/25 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30'
export const EDITOR_FIELD_LABEL_CLASS = 'text-xs font-semibold uppercase tracking-[0.04em] text-text-light'

function resolveStateClasses(state: SectionState): string {
  if (state === 'loading') {
    return 'rounded-2xl border border-primary/30 bg-primary/5 p-3 sm:p-4'
  }
  if (state === 'error') {
    return 'rounded-2xl border border-red-200 bg-red-50/80 p-3 sm:p-4'
  }
  if (state === 'success') {
    return 'rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-4'
  }
  return ''
}

export function EditorInputSection({
  title,
  helperText,
  state = 'idle',
  stateText,
  actions,
  children,
  className,
}: EditorInputSectionProps) {
  const stateIcon = state === 'loading'
    ? <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
    : state === 'error'
      ? <AlertTriangle size={12} aria-hidden="true" />
      : state === 'success'
        ? <CheckCircle2 size={12} aria-hidden="true" />
        : null

  return (
    <section className={`space-y-3 ${resolveStateClasses(state)} ${className ?? ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-text">{title}</h4>
          {helperText ? <p className="text-xs text-text-light">{helperText}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {children}

      <AnimatePresence initial={false}>
        {stateText ? (
          <motion.p
            key={stateText}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.19, 1, 0.22, 1] }}
            className={`inline-flex items-center gap-1.5 text-xs ${state === 'error' ? 'text-red-600' : state === 'success' ? 'text-emerald-700' : 'text-text-light'}`}
            role={state === 'error' ? 'alert' : 'status'}
          >
            {stateIcon}
            {stateText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
