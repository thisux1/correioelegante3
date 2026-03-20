import { memo, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, X } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'

const MAX_GALLERY_IMAGES = 10

function GalleryBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isGalleryBlock = block.type === 'gallery'
  const [draftUrl, setDraftUrl] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const images = useMemo(
    () => (isGalleryBlock ? block.props.images.slice(0, MAX_GALLERY_IMAGES) : []),
    [block.props, isGalleryBlock],
  )
  const transition = isGalleryBlock ? block.props.transition ?? 'fade' : 'fade'

  useEffect(() => {
    if (mode !== 'preview' || images.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, 3500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [images.length, mode])

  if (!isGalleryBlock) {
    return null
  }

  const updateImages = (nextImages: string[]) => {
    onUpdate?.((currentBlock) => {
      if (currentBlock.type !== 'gallery') {
        return currentBlock
      }

      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          images: nextImages.slice(0, MAX_GALLERY_IMAGES),
        },
      }
    })
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text">Galeria</p>
          <span className="text-xs text-text-light">{images.length}/{MAX_GALLERY_IMAGES}</span>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => {
              const normalized = draftUrl.trim()
              if (!normalized || images.length >= MAX_GALLERY_IMAGES) {
                return
              }

              updateImages([...images, normalized])
              setDraftUrl('')
            }}
            disabled={images.length >= MAX_GALLERY_IMAGES}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={14} />
            Adicionar
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-light">Transicao</label>
          <select
            value={transition}
            onChange={(event) => {
              const nextTransition = event.target.value === 'slide' ? 'slide' : 'fade'
              onUpdate?.((currentBlock) => {
                if (currentBlock.type !== 'gallery') {
                  return currentBlock
                }

                return {
                  ...currentBlock,
                  props: {
                    ...currentBlock.props,
                    transition: nextTransition,
                  },
                }
              })
            }}
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
          </select>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/30 bg-white/70 p-4 text-center text-sm text-text-light">
            Adicione URLs para montar o slideshow.
          </div>
        ) : (
          <ul className="space-y-2">
            {images.map((image, index) => (
              <li key={`${image}-${index}`} className="rounded-xl border border-primary/15 bg-white/80 p-2">
                <div className="flex items-center gap-2">
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    loading="lazy"
                    className="h-14 w-14 rounded-md border border-primary/15 object-cover"
                  />
                  <p className="min-w-0 flex-1 truncate text-xs text-text-light">{image}</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) {
                          return
                        }

                        const reordered = [...images]
                        const [moved] = reordered.splice(index, 1)
                        if (!moved) {
                          return
                        }
                        reordered.splice(index - 1, 0, moved)
                        updateImages(reordered)
                      }}
                      disabled={index === 0}
                      className="rounded-md border border-primary/20 p-1 text-text-light transition-colors hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Mover imagem para cima"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index === images.length - 1) {
                          return
                        }

                        const reordered = [...images]
                        const [moved] = reordered.splice(index, 1)
                        if (!moved) {
                          return
                        }
                        reordered.splice(index + 1, 0, moved)
                        updateImages(reordered)
                      }}
                      disabled={index === images.length - 1}
                      className="rounded-md border border-primary/20 p-1 text-text-light transition-colors hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Mover imagem para baixo"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateImages(images.filter((_, currentIndex) => currentIndex !== index))
                      }}
                      className="rounded-md border border-red-200 p-1 text-red-500 transition-colors hover:bg-red-50"
                      aria-label="Remover imagem"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-8 text-center text-sm text-text-light">
        Galeria vazia. Adicione imagens no modo de edicao.
      </div>
    )
  }

  const resolvedActiveIndex = activeIndex % images.length

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-white/80">
      <div className="relative h-[280px] w-full sm:h-[360px]">
        {images.map((image, index) => {
          const isActive = index === resolvedActiveIndex
          const transitionClass = transition === 'slide'
            ? isActive
              ? 'translate-x-0 opacity-100'
              : index < resolvedActiveIndex
                ? '-translate-x-full opacity-0'
                : 'translate-x-full opacity-0'
            : isActive
              ? 'opacity-100'
              : 'opacity-0'

          return (
            <img
              key={`${image}-${index}`}
              src={image}
              alt={`Imagem ${index + 1}`}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${transitionClass}`}
            />
          )
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/35 px-2 py-1">
        {images.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full ${index === resolvedActiveIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}

function areGalleryBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const GalleryBlock = memo(GalleryBlockComponent, areGalleryBlockPropsEqual)
