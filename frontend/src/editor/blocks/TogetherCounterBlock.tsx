import { memo, useEffect, useMemo, useState } from 'react'
import type { BlockComponentProps } from '@/editor/types'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'
import { diffTimerParts, pad, parseTargetDate } from '@/editor/utils/elapsedParts'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// "2020-03-14" puro vira meia-noite UTC no Date — em fuso negativo isso cai
// no dia anterior. Tratar date-only como meia-noite LOCAL mantém o dia certo.
function parseStartDate(value: string): Date | null {
  const normalized = value.trim()
  if (DATE_ONLY_PATTERN.test(normalized)) {
    return parseTargetDate(`${normalized}T00:00:00`)
  }
  return parseTargetDate(normalized)
}

function formatStartDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function TogetherCounterBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isTogetherCounter = block.type === 'togetherCounter'
  const startDate = isTogetherCounter ? block.props.startDate : ''
  const label = isTogetherCounter ? block.props.label : ''
  const parsedStart = useMemo(() => parseStartDate(startDate), [startDate])
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

  if (!isTogetherCounter) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-surface/90 p-4 shadow-xs">
        <EditorInputSection title="Data de início" helperText="Quando a história de vocês começou (namoro, casamento, amizade).">
          <input
            type="date"
            value={DATE_ONLY_PATTERN.test(startDate.trim()) ? startDate.trim() : ''}
            onChange={(event) => {
              const nextValue = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'togetherCounter') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    startDate: nextValue,
                  },
                }
              })
            }}
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Definir data de início do contador"
          />
        </EditorInputSection>

        <EditorInputSection title="Legenda" helperText="Texto curto acima do contador.">
          <input
            type="text"
            value={label ?? ''}
            onChange={(event) => {
              const nextLabel = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'togetherCounter') {
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
            placeholder="Ex: Juntos há"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Definir legenda do contador"
          />
        </EditorInputSection>
      </div>
    )
  }

  if (!parsedStart) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-800">
        Defina a data de início para o contador funcionar.
      </div>
    )
  }

  const hasStarted = now.getTime() >= parsedStart.getTime()
  const fromDate = hasStarted ? parsedStart : now
  const toDate = hasStarted ? now : parsedStart
  const parts = diffTimerParts(fromDate, toDate)

  const heading = hasStarted
    ? label?.trim() || 'Juntos há'
    : 'Contagem para o começo'

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-xs">
      <p className="mb-3 text-center text-sm font-medium text-text-light">{heading}</p>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'years', label: parts.years === 1 ? 'Ano' : 'Anos', value: parts.years },
          { key: 'months', label: parts.months === 1 ? 'Mês' : 'Meses', value: parts.months },
          { key: 'days', label: parts.days === 1 ? 'Dia' : 'Dias', value: parts.days },
        ].map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-border bg-surface-raised px-2 py-4 text-center shadow-2xs"
          >
            <p className="font-display text-3xl text-text transition-transform duration-300">{pad(item.value)}</p>
            <p className="text-[11px] uppercase tracking-wide text-text-light">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          { key: 'hours', label: 'Horas', value: parts.hours },
          { key: 'minutes', label: 'Min', value: parts.minutes },
          { key: 'seconds', label: 'Seg', value: parts.seconds },
        ].map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-border/60 bg-surface-raised/60 px-2 py-2 text-center"
          >
            <p className="font-display text-base text-text-light">{pad(item.value)}</p>
            <p className="text-[10px] uppercase tracking-wide text-text-light/70">{item.label}</p>
          </div>
        ))}
      </div>

      {hasStarted ? (
        <p className="mt-3 text-center text-xs text-text-light">
          desde {formatStartDate(parsedStart)}
        </p>
      ) : null}
    </div>
  )
}

function areTogetherCounterBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const TogetherCounterBlock = memo(TogetherCounterBlockComponent, areTogetherCounterBlockPropsEqual)
