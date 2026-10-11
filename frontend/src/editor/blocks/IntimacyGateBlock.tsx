import { memo, useState } from 'react'
import type { BlockComponentProps, IntimacyGateBlockProps } from '@/editor/types'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

function IntimacyGateBlockComponent({ block, mode }: BlockComponentProps) {
  const [answer, setAnswer] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  if (block.type !== 'intimacyGate') {
    return null
  }

  const props: IntimacyGateBlockProps = block.props
  const isEdit = mode === 'edit'
  const open = isEdit || unlocked

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 px-2 py-3 text-center" data-mode={mode}>
      <h3 className="font-cursive text-2xl text-text">{props.question}</h3>
      {open ? (
        <p className="text-text">{props.successMessage ?? 'Voce lembra.'}</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const attempt = normalize(answer)
            if (props.answers.some((accepted) => normalize(accepted) === attempt)) {
              setUnlocked(true)
            }
          }}
          className="space-y-2"
        >
          <input
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-center"
            aria-label="Sua resposta"
          />
          <button type="submit" className="min-h-11 rounded-xl bg-primary px-6 font-semibold text-white">
            Responder
          </button>
        </form>
      )}
      {!open && props.hint && (
        <p className="text-xs text-text-light">Dica: {props.hint}</p>
      )}
    </div>
  )
}

export const IntimacyGateBlock = memo(IntimacyGateBlockComponent)
