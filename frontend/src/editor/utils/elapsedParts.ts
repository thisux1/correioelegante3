export interface TimerParts {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const ZERO_TIMER: TimerParts = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

export function parseTargetDate(value: string): Date | null {
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

export function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toDateTimeLocalValue(input: string): string {
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

export function diffTimerParts(from: Date, to: Date): TimerParts {
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
