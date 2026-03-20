import { memo, useEffect, useMemo, useState } from 'react'
import type { BlockComponentProps } from '@/editor/types'

interface TimerParts {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZERO_TIMER: TimerParts = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

function parseTargetDate(value: string): Date | null {
  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateTimeLocalValue(input: string): string {
  const parsed = parseTargetDate(input)
  if (!parsed) {
    return ''
  }

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function addYears(base: Date, value: number): Date {
  const next = new Date(base)
  next.setFullYear(next.getFullYear() + value)
  return next
}

function addMonths(base: Date, value: number): Date {
  const next = new Date(base)
  next.setMonth(next.getMonth() + value)
  return next
}

function diffTimerParts(from: Date, to: Date): TimerParts {
  if (to.getTime() <= from.getTime()) {
    return ZERO_TIMER
  }

  let cursor = new Date(from)
  let years = to.getFullYear() - cursor.getFullYear()
  if (addYears(cursor, years).getTime() > to.getTime()) {
    years -= 1
  }
  cursor = addYears(cursor, years)

  let months = (to.getFullYear() - cursor.getFullYear()) * 12 + to.getMonth() - cursor.getMonth()
  if (addMonths(cursor, months).getTime() > to.getTime()) {
    months -= 1
  }
  cursor = addMonths(cursor, months)

  let remainingMs = to.getTime() - cursor.getTime()
  const days = Math.floor(remainingMs / 86_400_000)
  remainingMs -= days * 86_400_000
  const hours = Math.floor(remainingMs / 3_600_000)
  remainingMs -= hours * 3_600_000
  const minutes = Math.floor(remainingMs / 60_000)
  remainingMs -= minutes * 60_000
  const seconds = Math.floor(remainingMs / 1000)

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  }
}

function TimerBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isTimerBlock = block.type === 'timer'
  const targetDate = isTimerBlock ? block.props.targetDate : ''
  const label = isTimerBlock ? block.props.label : ''
  const parsedTarget = useMemo(() => parseTargetDate(targetDate), [targetDate])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (mode !== 'preview') {
      return
    }

    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [mode])

  if (!isTimerBlock) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/25 bg-white/80 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">Data alvo</label>
          <input
            type="datetime-local"
            value={toDateTimeLocalValue(targetDate)}
            onChange={(event) => {
              const nextValue = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'timer') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    targetDate: nextValue,
                  },
                }
              })
            }}
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">Legenda</label>
          <input
            type="text"
            value={label ?? ''}
            onChange={(event) => {
              const nextLabel = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'timer') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    label: nextLabel,
                  },
                }
              })
            }}
            placeholder="Ex: Nosso aniversario"
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
        </div>
      </div>
    )
  }

  if (!parsedTarget) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
        Defina uma data valida para iniciar o contador.
      </div>
    )
  }

  const hasElapsed = now.getTime() >= parsedTarget.getTime()
  const fromDate = hasElapsed ? parsedTarget : now
  const toDate = hasElapsed ? now : parsedTarget
  const parts = diffTimerParts(fromDate, toDate)

  const statusText = hasElapsed ? 'Tempo decorrido' : 'Contagem regressiva'

  return (
    <div className="rounded-2xl border border-primary/20 bg-white/85 p-5">
      <p className="mb-3 text-center text-sm font-medium text-text-light">{label?.trim() || statusText}</p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          { key: 'years', label: 'Anos', value: parts.years },
          { key: 'months', label: 'Meses', value: parts.months },
          { key: 'days', label: 'Dias', value: parts.days },
          { key: 'hours', label: 'Horas', value: parts.hours },
          { key: 'minutes', label: 'Min', value: parts.minutes },
          { key: 'seconds', label: 'Seg', value: parts.seconds },
        ].map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-primary/15 bg-gradient-to-b from-white to-primary/5 px-2 py-3 text-center"
          >
            <p className="font-display text-2xl text-text transition-transform duration-300">{pad(item.value)}</p>
            <p className="text-[11px] uppercase tracking-wide text-text-light">{item.label}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

function areTimerBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const TimerBlock = memo(TimerBlockComponent, areTimerBlockPropsEqual)
