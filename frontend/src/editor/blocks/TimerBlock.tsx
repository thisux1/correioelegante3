import { memo, useEffect, useMemo, useState } from 'react'
import type { BlockComponentProps } from '@/editor/types'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'
import { diffTimerParts, pad, parseTargetDate, toDateTimeLocalValue } from '@/editor/utils/elapsedParts'

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
      <div className="space-y-3 rounded-2xl border border-border bg-surface/90 p-4 shadow-xs">
        <EditorInputSection title="Data alvo" helperText="Escolha quando a contagem deve terminar (ou comecar).">
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
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Definir data alvo do timer"
          />
        </EditorInputSection>

        <EditorInputSection title="Legenda" helperText="Texto curto para explicar o contador.">
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
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Definir legenda do timer"
          />
        </EditorInputSection>
      </div>
    )
  }

  if (!parsedTarget) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-800">
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
    <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-xs">
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
            className="rounded-xl border border-border bg-surface-raised px-2 py-3 text-center shadow-2xs"
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
