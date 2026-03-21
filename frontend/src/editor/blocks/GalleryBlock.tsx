import { memo, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import type { BlockComponentProps, GalleryItem } from '@/editor/types'
import { MediaField } from '@/editor/components/MediaField'

const MAX_GALLERY_IMAGES = 10

function normalizeItems(items: GalleryItem[]): GalleryItem[] {
  const uniqueItems: GalleryItem[] = []
  const seen = new Set<string>()

  for (const item of items) {
    const normalizedSrc = item.src.trim()
    if (!normalizedSrc || seen.has(normalizedSrc)) {
      continue
    }

    seen.add(normalizedSrc)
    uniqueItems.push({
      src: normalizedSrc,
      assetId: item.assetId,
    })

    if (uniqueItems.length >= MAX_GALLERY_IMAGES) {
      break
    }
  }

  return uniqueItems
}

function GalleryBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isGalleryBlock = block.type === 'gallery'

  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo(() => {
    if (!isGalleryBlock) {
      return []
    }
    const directItems = Array.isArray(block.props.items) ? block.props.items : []
    if (directItems.length > 0) {
      return normalizeItems(directItems)
    }
    return normalizeItems((block.props.images ?? []).map((src) => ({ src })))
  }, [block, isGalleryBlock])

  const transition = isGalleryBlock ? block.props.transition ?? 'fade' : 'fade'

  const updateItems = (nextItems: GalleryItem[]) => {
    const normalizedItems = normalizeItems(nextItems)
    onUpdate?.((currentBlock) => {
      if (currentBlock.type !== 'gallery') {
        return currentBlock
      }

      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          items: normalizedItems,
          images: normalizedItems.map((item) => item.src),
        },
      }
    })
  }

  useEffect(() => {
    if (mode !== 'preview' || items.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, 3500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [items.length, mode])

  if (!isGalleryBlock) {
    return null
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text">Galeria</p>
          <span className="text-xs text-text-light">{items.length}/{MAX_GALLERY_IMAGES}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (items.length >= MAX_GALLERY_IMAGES) {
              return
            }

            updateItems([...items, { src: '' }])
          }}
          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          disabled={items.length >= MAX_GALLERY_IMAGES}
        >
          Adicionar item de galeria
        </button>

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

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/30 bg-white/70 p-4 text-center text-sm text-text-light">
            Adicione itens para montar o slideshow.
          </div>
        ) : (
          <motion.ul layout className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.li
                  key={`${item.src}-${index}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, layout: { type: 'spring', stiffness: 420, damping: 34 } }}
                  className="rounded-xl border border-primary/15 bg-white/80 p-2"
                >
                  <MediaField
                    kind="image"
                    label={`Imagem ${index + 1}`}
                    value={{ src: item.src, assetId: item.assetId }}
                    onChange={(nextValue) => {
                      const updated = [...items]
                      updated[index] = {
                        src: nextValue.src,
                        assetId: nextValue.assetId,
                      }
                      updateItems(updated)
                    }}
                    onRemove={() => {
                      updateItems(items.filter((_, currentIndex) => currentIndex !== index))
                    }}
                    helperText="Upload direto ou URL manual para item da galeria."
                  />

                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) {
                          return
                        }
                        const reordered = [...items]
                        const [moved] = reordered.splice(index, 1)
                        if (!moved) {
                          return
                        }
                        reordered.splice(index - 1, 0, moved)
                        updateItems(reordered)
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
                        if (index === items.length - 1) {
                          return
                        }
                        const reordered = [...items]
                        const [moved] = reordered.splice(index, 1)
                        if (!moved) {
                          return
                        }
                        reordered.splice(index + 1, 0, moved)
                        updateItems(reordered)
                      }}
                      disabled={index === items.length - 1}
                      className="rounded-md border border-primary/20 p-1 text-text-light transition-colors hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Mover imagem para baixo"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateItems(items.filter((_, currentIndex) => currentIndex !== index))}
                      className="rounded-md border border-red-200 p-1 text-red-500 transition-colors hover:bg-red-50"
                      aria-label="Remover imagem"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-white/70 p-8 text-center text-sm text-text-light">
        Galeria vazia. Adicione imagens no modo de edicao.
      </div>
    )
  }

  const resolvedActiveIndex = activeIndex % items.length
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-white/80">
      <div className="relative h-[280px] w-full sm:h-[360px]">
        {items.map((item, index) => {
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
              key={`${item.src}-${index}`}
              src={item.src}
              alt={`Imagem ${index + 1}`}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${transitionClass}`}
            />
          )
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/35 px-2 py-1">
        {items.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (index === resolvedActiveIndex) {
                return
              }

              setActiveIndex(index)
            }}
            className={`h-1.5 w-1.5 rounded-full ${index === resolvedActiveIndex ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Ir para imagem ${index + 1}`}
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
