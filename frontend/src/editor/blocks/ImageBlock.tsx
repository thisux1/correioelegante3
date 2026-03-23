import { memo, useState } from 'react'
import { ImageOff, ImagePlus } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

function ImageBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isImageBlock = block.type === 'image'
  const source = isImageBlock ? block.props.src.trim() : ''
  const altValue = isImageBlock && typeof block.props.alt === 'string' ? block.props.alt : ''
  const previewAlt = altValue.trim() || 'Imagem do bloco'
  const assetId = isImageBlock ? block.props.assetId : undefined
  const hasSource = source.length > 0
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const hasError = hasSource && failedSource === source

  if (!isImageBlock) {
    return null
  }

  const previewImage =
    hasSource && !hasError ? (
      <img
        src={source}
        alt={previewAlt}
        onLoad={() => {
          setFailedSource((current) => (current === source ? null : current))
        }}
        onError={() => setFailedSource(source)}
        className="h-[320px] w-full rounded-xl border border-primary/15 bg-white object-cover"
      />
    ) : (
      <div className={`flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border p-6 ${hasError ? 'border-red-200 bg-red-50 text-red-500' : 'border-dashed border-primary/30 bg-white/75 text-text-light'}`}>
        {hasError ? <ImageOff size={32} /> : <ImagePlus size={32} />}
        <p className="text-sm font-medium">
          {hasError ? 'Nao foi possivel carregar a imagem' : 'Adicione uma imagem'}
        </p>
      </div>
    )

  if (mode === 'preview') {
    return previewImage
  }

  return (
    <div className="space-y-3">
      {previewImage}
      <MediaField
        kind="image"
        label="Imagem principal"
        value={{ src: source, assetId }}
        onChange={(nextValue) => {
          onUpdate?.((currentBlock) => {
            if (currentBlock.type !== 'image') {
              return currentBlock
            }

            return {
              ...currentBlock,
              props: {
                ...currentBlock.props,
                src: nextValue.src,
                assetId: nextValue.assetId,
              },
            }
          })
        }}
        onRemove={() => {
          onUpdate?.((currentBlock) => {
            if (currentBlock.type !== 'image') {
              return currentBlock
            }

            return {
              ...currentBlock,
              props: {
                ...currentBlock.props,
                src: '',
                assetId: undefined,
              },
            }
          })
        }}
        helperText="Use upload direto ou URL manual para persistir a imagem."
      />

        <EditorInputSection title="Descricao da imagem" helperText="Opcional. Descreva a imagem em uma frase curta.">
          <input
            type="text"
            value={altValue}
            onChange={(event) => {
              const nextAlt = event.target.value
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'image') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    alt: nextAlt,
                  },
                }
              })
            }}
            placeholder="Ex: Casal sorrindo na festa"
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Texto alternativo da imagem"
          />
        </EditorInputSection>
    </div>
  )
}

function areImageBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const ImageBlock = memo(ImageBlockComponent, areImageBlockPropsEqual)
