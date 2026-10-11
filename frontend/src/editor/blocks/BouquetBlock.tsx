import { memo } from 'react'
import type { BlockComponentProps, BouquetBlockProps } from '@/editor/types'

function BouquetBlockComponent({ block, mode }: BlockComponentProps) {
  if (block.type !== 'bouquet') {
    return null
  }

  const props: BouquetBlockProps = block.props

  return (
    <div className="mx-auto w-full max-w-lg px-2 py-3 text-center" data-mode={mode}>
      <p className="text-sm text-text-light">
        Buque de {props.flowers.length} flores (seed {props.seed})
      </p>
      {props.message && <p className="mt-2 font-cursive text-xl text-text">{props.message}</p>}
    </div>
  )
}

export const BouquetBlock = memo(BouquetBlockComponent)
