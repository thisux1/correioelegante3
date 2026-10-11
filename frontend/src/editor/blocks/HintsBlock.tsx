import { memo, useState } from 'react'
import type { BlockComponentProps, HintsBlockProps } from '@/editor/types'

function HintsBlockComponent({ block, mode }: BlockComponentProps) {
  const [revealed, setRevealed] = useState(0)

  if (block.type !== 'hints') {
    return null
  }

  const props: HintsBlockProps = block.props
  const isEdit = mode === 'edit'
  const shown = isEdit ? props.hints.length : Math.min(revealed, props.hints.length)

  return (
    <div className="mx-auto w-full max-w-lg space-y-2 px-2 py-3" data-mode={mode}>
      {props.title && <h3 className="text-center font-cursive text-2xl text-text">{props.title}</h3>}
      <ol className="space-y-2">
        {props.hints.slice(0, shown).map((hint, index) => (
          <li key={hint.id} className="rounded-xl bg-surface-raised p-3 text-sm text-text">
            {index + 1}. {hint.text}
          </li>
        ))}
      </ol>
      {!isEdit && revealed < props.hints.length && (
        <button
          type="button"
          onClick={() => setRevealed((value) => value + 1)}
          className="mx-auto block min-h-11 rounded-xl bg-primary px-5 font-semibold text-white"
        >
          Revelar dica {revealed + 1} de {props.hints.length}
        </button>
      )}
    </div>
  )
}

export const HintsBlock = memo(HintsBlockComponent)
