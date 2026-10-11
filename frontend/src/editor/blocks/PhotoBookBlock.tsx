import { memo } from 'react'
import type { BlockComponentProps, PhotoBookBlockProps } from '@/editor/types'

function PhotoBookBlockComponent({ block, mode }: BlockComponentProps) {
  if (block.type !== 'photoBook') {
    return null
  }

  const props: PhotoBookBlockProps = block.props

  return (
    <div className="mx-auto w-full max-w-lg px-2 py-3" data-mode={mode}>
      {(props.coverTitle || props.coverSubtitle) && (
        <div className="mb-3 text-center">
          {props.coverTitle && (
            <h3 className="font-cursive text-2xl text-text">{props.coverTitle}</h3>
          )}
          {props.coverSubtitle && <p className="text-sm text-text-light">{props.coverSubtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {props.pages.map((page) => (
          <figure key={page.id} className="rounded-xl bg-white p-2 shadow-md">
            {page.src ? (
              <img src={page.src} alt={page.caption ?? ''} className="aspect-square w-full rounded-lg object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-surface text-xs text-text-light">
                Foto
              </div>
            )}
            {page.caption && (
              <figcaption className="mt-1 text-center text-xs text-text-light">
                {page.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

export const PhotoBookBlock = memo(PhotoBookBlockComponent)
