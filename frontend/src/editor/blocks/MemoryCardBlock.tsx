import { memo, useCallback } from 'react'
import { CalendarDays, MapPin } from 'lucide-react'
import type { BlockComponentProps, MemoryCardBlockProps } from '@/editor/types'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'
import { MediaField } from '@/editor/components/MediaField'

// Coração pixel-art desenhado em células — placeholder quando a memória não
// tem foto. Mantém a identidade visual do produto sem depender de asset.
const PIXEL_HEART = [
  '01100110',
  '11111111',
  '11111111',
  '11111111',
  '01111110',
  '00111100',
  '00011000',
]

function PixelHeart() {
  return (
    <svg
      viewBox={`0 0 ${PIXEL_HEART[0].length} ${PIXEL_HEART.length}`}
      className="h-10 w-11 text-primary/70"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {PIXEL_HEART.flatMap((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null,
        ),
      )}
    </svg>
  )
}

function MemoryCardBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isMemoryCard = block.type === 'memoryCard'
  const props: MemoryCardBlockProps = isMemoryCard
    ? block.props
    : { title: '', date: '', place: '', imageSrc: '', assetId: undefined, caption: '', text: '' }

  const updateProp = useCallback(
    <K extends keyof MemoryCardBlockProps>(key: K, value: MemoryCardBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'memoryCard') {
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

  if (!isMemoryCard) {
    return null
  }

  const stampParts = [props.date?.trim(), props.place?.trim()].filter(Boolean)

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-surface/90 p-4 shadow-xs">
        <EditorInputSection title="Título" helperText="Nome da memória (opcional).">
          <input
            type="text"
            value={props.title ?? ''}
            onChange={(event) => updateProp('title', event.target.value)}
            placeholder="Ex: Nosso primeiro piquenique"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Título da memória"
          />
        </EditorInputSection>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditorInputSection title="Data" helperText="Selo no topo do cartão.">
            <input
              type="text"
              value={props.date ?? ''}
              onChange={(event) => updateProp('date', event.target.value)}
              placeholder="Ex: 14 de março de 2020"
              className={EDITOR_FIELD_BASE_CLASS}
              aria-label="Data da memória"
            />
          </EditorInputSection>

          <EditorInputSection title="Lugar" helperText="Selo no topo do cartão.">
            <input
              type="text"
              value={props.place ?? ''}
              onChange={(event) => updateProp('place', event.target.value)}
              placeholder="Ex: Parque da cidade"
              className={EDITOR_FIELD_BASE_CLASS}
              aria-label="Lugar da memória"
            />
          </EditorInputSection>
        </div>

        <EditorInputSection title="Foto" helperText="Opcional — sem foto, o cartão sai com uma ilustração.">
          <MediaField
            kind="image"
            label="Foto da memória"
            value={{ src: props.imageSrc ?? '', assetId: props.assetId }}
            onChange={(nextValue) => {
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'memoryCard') {
                  return currentBlock
                }
                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    imageSrc: nextValue.src,
                    assetId: nextValue.assetId,
                  },
                }
              })
            }}
            onRemove={() => {
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'memoryCard') {
                  return currentBlock
                }
                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    imageSrc: '',
                    assetId: undefined,
                  },
                }
              })
            }}
          />
        </EditorInputSection>

        <EditorInputSection title="Legenda" helperText="Frase curta em letra de mão, embaixo da foto.">
          <input
            type="text"
            value={props.caption ?? ''}
            onChange={(event) => updateProp('caption', event.target.value)}
            placeholder="Ex: o dia que tudo começou"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Legenda da memória"
          />
        </EditorInputSection>

        <EditorInputSection title="História" helperText="Conte a memória em poucas linhas.">
          <textarea
            value={props.text ?? ''}
            onChange={(event) => updateProp('text', event.target.value)}
            placeholder="Aquele sábado a gente quase perdeu o ônibus..."
            rows={4}
            maxLength={5000}
            className={`${EDITOR_FIELD_BASE_CLASS} resize-y`}
            aria-label="História da memória"
          />
        </EditorInputSection>
      </div>
    )
  }

  const hasContent = Boolean(
    props.title?.trim() || props.text?.trim() || props.imageSrc?.trim() || stampParts.length > 0,
  )
  if (!hasContent) {
    return null
  }

  return (
    <article className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-xs">
      {stampParts.length > 0 ? (
        <header className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-dashed border-border bg-surface-raised/70 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-light">
          {props.date?.trim() ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} aria-hidden />
              {props.date}
            </span>
          ) : null}
          {props.place?.trim() ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} aria-hidden />
              {props.place}
            </span>
          ) : null}
        </header>
      ) : null}

      <div className="p-5">
        {props.imageSrc?.trim() ? (
          <img
            src={props.imageSrc}
            alt={props.caption?.trim() || props.title?.trim() || 'Memória'}
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5">
            <PixelHeart />
          </div>
        )}

        {props.title?.trim() ? (
          <h3 className="mt-4 text-center font-display text-xl font-semibold text-text">{props.title}</h3>
        ) : null}

        {props.caption?.trim() ? (
          <p className="mt-1.5 text-center font-cursive text-lg text-primary">{props.caption}</p>
        ) : null}

        {props.text?.trim() ? (
          <p className="mt-3 whitespace-pre-wrap text-center text-sm leading-relaxed text-text-light">
            {props.text}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function areMemoryCardBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const MemoryCardBlock = memo(MemoryCardBlockComponent, areMemoryCardBlockPropsEqual)
