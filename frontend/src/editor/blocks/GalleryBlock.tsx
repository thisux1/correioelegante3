import { memo, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, LoaderCircle, Upload, X } from 'lucide-react'
import type { BlockComponentProps, GalleryItem } from '@/editor/types'
import { MediaField, type MediaUploadState } from '@/editor/components/MediaField'
import { assetService } from '@/services/assetService'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'
import {
  MAX_GALLERY_IMAGES,
  normalizeGalleryItems,
  syncGalleryMedia,
  uploadGalleryFilesInBatch,
} from './galleryItems'

type BatchUploadState = 'idle' | 'sending' | 'processing' | 'done' | 'done_with_errors'

function GalleryBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isGalleryBlock = block.type === 'gallery'
  const [activeIndex, setActiveIndex] = useState(0)
  const [batchState, setBatchState] = useState<BatchUploadState>('idle')
  const [batchFailures, setBatchFailures] = useState<string[]>([])
  const [batchLimitMessage, setBatchLimitMessage] = useState<string | null>(null)
  const [itemStatusMap, setItemStatusMap] = useState<Record<number, { state: MediaUploadState; error?: string | null }>>({})
  const [draftItems, setDraftItems] = useState<GalleryItem[]>([])
  const quickUploadInputRef = useRef<HTMLInputElement | null>(null)
  const [isQuickDropActive, setIsQuickDropActive] = useState(false)
  const [, setQuickDropDepth] = useState(0)

  const items = useMemo(() => {
    if (!isGalleryBlock) {
      return []
    }

    const directItems = Array.isArray(block.props.items) ? block.props.items : []
    if (directItems.length > 0) {
      return normalizeGalleryItems(directItems)
    }

    return normalizeGalleryItems((block.props.images ?? []).map((src) => ({ src })))
  }, [block, isGalleryBlock])

  const transition = isGalleryBlock ? block.props.transition ?? 'fade' : 'fade'
  const totalSlotsUsed = items.length + draftItems.length
  const visibleItems = [...items, ...draftItems]

  const updateItems = (nextItems: GalleryItem[]) => {
    const synced = syncGalleryMedia(nextItems)
    onUpdate?.((currentBlock) => {
      if (currentBlock.type !== 'gallery') {
        return currentBlock
      }

      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          items: synced.items,
          images: synced.images,
        },
      }
    })
  }

  const runQuickUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      return
    }

    setBatchLimitMessage(null)
    setBatchFailures([])
    setBatchState('sending')

    const availableSlots = Math.max(0, MAX_GALLERY_IMAGES - totalSlotsUsed)

    let result: Awaited<ReturnType<typeof uploadGalleryFilesInBatch>>
    try {
      result = await uploadGalleryFilesInBatch({
        files: selectedFiles,
        availableSlots,
        uploader: (file) => assetService.uploadFileFlow({ file, kind: 'image' }),
      })
    } catch {
      setBatchFailures(['Falha ao iniciar upload rapido. Tente novamente.'])
      setBatchState('done_with_errors')
      return
    }

    if (result.ignoredByLimit.length > 0) {
      setBatchLimitMessage(`Limite de 10 itens atingido. ${result.ignoredByLimit.length} arquivo(s) nao foram enviados.`)
    }

    if (result.addedItems.length > 0) {
      updateItems([...items, ...result.addedItems])
    }

    if (result.failures.length > 0) {
      setBatchFailures(result.failures.map((entry) => entry.reason))
      setBatchState('done_with_errors')
      return
    }

    setBatchState('done')
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
    const itemStatusEntries = Object.values(itemStatusMap)
    const hasItemUploadError = itemStatusEntries.some((entry) => entry.state === 'error')
    const hasAnyItemUploadInFlight = itemStatusEntries.some((entry) => entry.state === 'sending' || entry.state === 'processing')
    const resolvedBatchState = hasAnyItemUploadInFlight
      ? 'processing'
      : hasItemUploadError
        ? 'done_with_errors'
        : batchState

    const batchMessage = resolvedBatchState === 'sending'
      ? 'Enviando upload rapido...'
      : resolvedBatchState === 'processing'
        ? 'Processando arquivos enviados...'
        : resolvedBatchState === 'done_with_errors'
          ? 'Upload concluido com erros. Revise os detalhes abaixo.'
          : resolvedBatchState === 'done'
            ? 'Upload rapido concluido com sucesso.'
            : null

    return (
      <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-text">Galeria</p>
          <span className="text-xs font-medium text-text-light">{totalSlotsUsed}/{MAX_GALLERY_IMAGES} itens</span>
        </div>

        <input
          ref={quickUploadInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(event.target.files ?? [])
            event.target.value = ''
            await runQuickUpload(selectedFiles)
          }}
        />

        <EditorInputSection
          title="Upload de imagem"
          helperText="Primeiro envie/arraste imagens. Depois, se precisar, ajuste URLs item a item."
          actions={<button
            type="button"
            onClick={() => {
              if (totalSlotsUsed >= MAX_GALLERY_IMAGES) {
                setBatchLimitMessage('Limite maximo de 10 itens atingido. Remova um item para adicionar outro.')
                return
              }

              setDraftItems((current) => [...current, { src: '' }])
            }}
            className="inline-flex min-h-11 items-center rounded-xl border border-primary/30 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            disabled={totalSlotsUsed >= MAX_GALLERY_IMAGES}
            aria-label="Adicionar item na galeria"
          >
            Adicionar item
          </button>}
        >
          <div
            className={`rounded-xl border border-dashed p-3 transition-colors ${isQuickDropActive ? 'border-primary/55 bg-primary/10' : 'border-primary/25 bg-white/80'}`}
            onDragEnter={(event: DragEvent<HTMLDivElement>) => {
              event.preventDefault()
              event.stopPropagation()
              setQuickDropDepth((current) => current + 1)
              setIsQuickDropActive(true)
            }}
            onDragOver={(event: DragEvent<HTMLDivElement>) => {
              event.preventDefault()
              event.stopPropagation()
              event.dataTransfer.dropEffect = 'copy'
            }}
            onDragLeave={(event: DragEvent<HTMLDivElement>) => {
              event.preventDefault()
              event.stopPropagation()
              setQuickDropDepth((current) => {
                const nextDepth = Math.max(0, current - 1)
                setIsQuickDropActive(nextDepth > 0)
                return nextDepth
              })
            }}
            onDrop={async (event: DragEvent<HTMLDivElement>) => {
              event.preventDefault()
              event.stopPropagation()
              setQuickDropDepth(0)
              setIsQuickDropActive(false)
              const droppedFiles = Array.from(event.dataTransfer.files ?? [])
              await runQuickUpload(droppedFiles)
            }}
            aria-label="Area de upload rapido da galeria"
          >
            <button
              type="button"
              onClick={() => quickUploadInputRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              disabled={totalSlotsUsed >= MAX_GALLERY_IMAGES}
              aria-label="Enviar imagens para galeria"
            >
              <Upload size={14} />
              Enviar imagens
            </button>
            <p className="mt-2 text-xs text-text-light">Arraste imagens aqui ou toque no botao para selecionar.</p>
          </div>
        </EditorInputSection>

        <EditorInputSection title="Transicao" helperText="Escolha como trocar entre imagens no preview.">
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
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Transicao da galeria"
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
          </select>
        </EditorInputSection>

        {(batchMessage || batchLimitMessage || batchFailures.length > 0) ? (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-white/75 p-3 text-xs text-text-light" aria-live="polite">
            {batchMessage ? (
              <p className="inline-flex items-center gap-1">
                {resolvedBatchState === 'done_with_errors'
                  ? <AlertTriangle size={12} className="text-amber-600" />
                  : resolvedBatchState === 'done'
                    ? <CheckCircle2 size={12} className="text-emerald-600" />
                    : <LoaderCircle size={12} className="animate-spin" />}
                {batchMessage}
              </p>
            ) : null}
            {batchLimitMessage ? <p>{batchLimitMessage}</p> : null}
            {batchFailures.length > 0 ? (
              <ul className="space-y-1">
                {batchFailures.slice(0, 5).map((message) => <li key={message}>- {message}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}

        {visibleItems.length === 0 ? (
          <div className="space-y-2 rounded-xl border border-dashed border-primary/30 bg-white/70 p-4 text-center">
            <p className="text-sm text-text-light">Sua galeria esta vazia. Envie imagens ou adicione um item com URL.</p>
            <button
              type="button"
              onClick={() => quickUploadInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Upload size={13} />
              Upload rapido
            </button>
          </div>
        ) : (
          <motion.ul layout className="space-y-2">
            <AnimatePresence initial={false}>
              {visibleItems.map((item, index) => (
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
                      if (index < items.length) {
                        const updated = [...items]
                        updated[index] = {
                          src: nextValue.src,
                          assetId: nextValue.assetId,
                        }
                        updateItems(updated)
                        return
                      }

                      const draftIndex = index - items.length
                      const nextDraft = [...draftItems]
                      nextDraft[draftIndex] = {
                        src: nextValue.src,
                        assetId: nextValue.assetId,
                      }

                      const normalizedSrc = nextValue.src.trim()
                      if (normalizedSrc) {
                        updateItems([...items, { src: normalizedSrc, assetId: nextValue.assetId }])
                        setDraftItems(nextDraft.filter((_, currentIndex) => currentIndex !== draftIndex))
                        return
                      }

                      setDraftItems(nextDraft)
                    }}
                    onStatusChange={(status) => {
                      setItemStatusMap((previous) => ({
                        ...previous,
                        [index]: status,
                      }))
                    }}
                    onRemove={() => {
                      if (index < items.length) {
                        updateItems(items.filter((_, currentIndex) => currentIndex !== index))
                        return
                      }

                      const draftIndex = index - items.length
                      setDraftItems(draftItems.filter((_, currentIndex) => currentIndex !== draftIndex))
                    }}
                    helperText="Upload direto ou URL manual para item da galeria."
                  />

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (index >= items.length) {
                          return
                        }

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
                      disabled={index === 0 || index >= items.length}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-primary/20 px-3 py-2 text-xs font-medium text-text-light transition-colors hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Mover item para cima"
                    >
                      <ArrowUp size={14} />
                      Mover
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index >= items.length) {
                          return
                        }

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
                      disabled={index === items.length - 1 || index >= items.length}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-primary/20 px-3 py-2 text-xs font-medium text-text-light transition-colors hover:bg-primary/10 disabled:opacity-40"
                      aria-label="Mover item para baixo"
                    >
                      <ArrowDown size={14} />
                      Mover
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index < items.length) {
                          updateItems(items.filter((_, currentIndex) => currentIndex !== index))
                          return
                        }

                        const draftIndex = index - items.length
                        setDraftItems(draftItems.filter((_, currentIndex) => currentIndex !== draftIndex))
                      }}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      aria-label="Remover item"
                    >
                      <X size={14} />
                      Remover item
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
