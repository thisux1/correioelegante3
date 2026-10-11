import { memo } from 'react'
import type { BlockComponentProps, YoutubeBlockProps } from '@/editor/types'

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,20})/,
  )
  return match?.[1] ?? null
}

function YoutubeBlockComponent({ block, mode }: BlockComponentProps) {
  if (block.type !== 'youtube') {
    return null
  }

  const props: YoutubeBlockProps = block.props
  const videoId = extractVideoId(props.url)

  return (
    <div className="mx-auto w-full max-w-lg px-2 py-3" data-mode={mode}>
      {props.title && (
        <h3 className="mb-2 text-center font-cursive text-2xl text-text">{props.title}</h3>
      )}
      {videoId ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={props.title ?? 'Video do YouTube'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border text-text-light">
          Cole um link do YouTube
        </div>
      )}
      {props.caption && <p className="mt-2 text-center text-sm text-text-light">{props.caption}</p>}
    </div>
  )
}

export const YoutubeBlock = memo(YoutubeBlockComponent)
