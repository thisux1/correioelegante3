import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Youtube } from 'lucide-react'
import type { BlockComponentProps, YoutubeBlockProps } from '@/editor/types'
import {
  EDITOR_FIELD_BASE_CLASS,
  EditorInputSection,
} from '@/editor/components/EditorInputSection'
import {
  buildYoutubeEmbedUrl,
  buildYoutubeThumbnailUrl,
  extractYoutubeVideoId,
} from './youtube'

const ALLOW_IFRAME =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'

function YoutubeBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isYoutube = block.type === 'youtube'
  const props: YoutubeBlockProps = isYoutube ? block.props : { url: '' }
  const isEditMode = mode === 'edit'

  const updateProp = useCallback(
    <K extends keyof YoutubeBlockProps>(key: K, value: YoutubeBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'youtube') {
          return currentBlock
        }
        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            [key]: value,
          },
        }
      })
    },
    [onUpdate],
  )

  if (!isYoutube) {
    return null
  }

  const url = props.url ?? ''
  const title = props.title ?? ''
  const caption = props.caption ?? ''
  const videoId = extractYoutubeVideoId(url)
  const hasUrlInput = url.trim().length > 0

  if (isEditMode) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-border bg-surface/90 p-4 shadow-xs">
        <EditorInputSection
          title="Link do YouTube"
          helperText="Cole o link do vídeo ou da música que você quer dedicar. Pode ser watch, youtu.be, shorts ou só o ID."
          state={hasUrlInput ? (videoId ? 'success' : 'error') : 'idle'}
          stateText={
            hasUrlInput
              ? videoId
                ? 'Link válido — vídeo identificado.'
                : 'Não reconhecemos esse link do YouTube.'
              : null
          }
        >
          <input
            type="url"
            value={url}
            onChange={(event) => updateProp('url', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            placeholder="https://www.youtube.com/watch?v=..."
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Link do vídeo do YouTube"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
          />

          {videoId ? (
            <div className="mt-1 flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-2">
              <img
                src={buildYoutubeThumbnailUrl(videoId)}
                alt="Miniatura do vídeo do YouTube"
                loading="lazy"
                className="h-14 w-24 shrink-0 rounded-lg object-cover"
              />
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <CircleCheck size={13} aria-hidden="true" />
                Este é o vídeo que vai aparecer na página.
              </p>
            </div>
          ) : hasUrlInput ? (
            <p className="inline-flex items-start gap-1.5 text-xs text-text-light">
              <CircleAlert size={13} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
              Confira se o link é do YouTube. Exemplo: youtube.com/watch?v=XXXXXXX ou youtu.be/XXXXXXX.
            </p>
          ) : null}
        </EditorInputSection>

        <EditorInputSection
          title="Título da dedicatória"
          helperText="Opcional. Aparece acima do vídeo, como um cartãozinho."
        >
          <input
            type="text"
            value={title}
            onChange={(event) => updateProp('title', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            placeholder="A nossa música"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Título da dedicatória"
          />
        </EditorInputSection>

        <EditorInputSection
          title="Legenda"
          helperText="Opcional. Aparece embaixo do vídeo."
        >
          <input
            type="text"
            value={caption}
            onChange={(event) => updateProp('caption', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            placeholder="Aperte o play e pense em nós dois."
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Legenda do vídeo"
          />
        </EditorInputSection>
      </div>
    )
  }

  if (!videoId) {
    return (
      <div className="mx-auto w-full max-w-2xl px-2 py-3" data-mode={mode}>
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-surface-raised/70 p-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary/60">
            <Youtube size={24} aria-hidden="true" />
          </span>
          <p className="text-sm text-text-light">Vídeo do YouTube ainda não configurado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-2 py-3" data-mode={mode}>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        className="overflow-hidden rounded-3xl border border-border bg-surface-raised text-center shadow-xl backdrop-blur-xs"
        aria-label={title || 'Vídeo do YouTube'}
      >
        <div className="space-y-3 px-6 pb-4 pt-6 sm:pt-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Youtube size={24} aria-hidden="true" />
          </span>
          {title.trim() ? (
            <h3 className="font-cursive text-3xl font-bold leading-snug tracking-tight text-text sm:text-4xl">
              {title}
            </h3>
          ) : null}
        </div>

        <div className="px-4 sm:px-6">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-primary/5 shadow-md">
            <iframe
              src={buildYoutubeEmbedUrl(videoId)}
              title={title || 'Vídeo do YouTube'}
              loading="lazy"
              allow={ALLOW_IFRAME}
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>

        {caption.trim() ? (
          <p className="px-6 pb-6 pt-4 font-cursive text-xl leading-relaxed text-text-light sm:pb-7">
            {caption}
          </p>
        ) : (
          <div className="pb-5" aria-hidden="true" />
        )}
      </motion.section>
    </div>
  )
}

function areYoutubePropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const YoutubeBlock = memo(YoutubeBlockComponent, areYoutubePropsEqual)
