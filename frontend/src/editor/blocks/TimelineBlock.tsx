import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Heart,
  Camera,
  Upload,
  RotateCw,
} from 'lucide-react'
import type { BlockComponentProps, TimelineBlockProps, TimelineItem } from '@/editor/types'
import { assetService } from '@/services/assetService'

function generateItemId(): string {
  return `timeline-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function TimelineBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isTimeline = block.type === 'timeline'
  const props: TimelineBlockProps = isTimeline
    ? block.props
    : {
        items: [],
      }

  const items = useMemo(() => (Array.isArray(props.items) ? props.items : []), [props.items])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const isEditMode = mode === 'edit'

  const updateItems = useCallback(
    (newItems: TimelineItem[]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'timeline') {
          return currentBlock
        }
        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            items: newItems,
          },
        }
      })
    },
    [onUpdate],
  )

  const handleAddItem = useCallback(() => {
    const newItem: TimelineItem = {
      id: generateItemId(),
      date: 'Momento Especial',
      title: 'Um Novo Capítulo',
      description: 'Mais uma lembrança inesquecível guardada para sempre...',
      image: '',
    }
    updateItems([...items, newItem])
  }, [items, updateItems])

  const handleRemoveItem = useCallback(
    (index: number) => {
      updateItems(items.filter((_, i) => i !== index))
    },
    [items, updateItems],
  )

  const handleMoveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= items.length) return
      const nextItems = [...items]
      const temp = nextItems[index]
      nextItems[index] = nextItems[targetIndex]
      nextItems[targetIndex] = temp
      updateItems(nextItems)
    },
    [items, updateItems],
  )

  const handleUpdateItem = useCallback(
    <K extends keyof TimelineItem>(index: number, key: K, value: TimelineItem[K]) => {
      const nextItems = [...items]
      nextItems[index] = {
        ...nextItems[index],
        [key]: value,
      }
      updateItems(nextItems)
    },
    [items, updateItems],
  )

  const handleTriggerUpload = useCallback((index: number) => {
    setActiveUploadIndex(index)
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || activeUploadIndex === null) return

      const targetIndex = activeUploadIndex
      const localUrl = URL.createObjectURL(file)
      handleUpdateItem(targetIndex, 'image', localUrl)
      setUploadingIndex(targetIndex)

      try {
        const asset = await assetService.uploadFileFlow({ file, kind: 'image' })
        if (asset.publicUrl) {
          handleUpdateItem(targetIndex, 'image', asset.publicUrl)
        }
      } catch {
        // Retains local preview if upload fails
      } finally {
        setUploadingIndex(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [activeUploadIndex, handleUpdateItem],
  )

  if (!isTimeline) {
    return null
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl py-4 select-none">
      {/* Hidden File Input for Direct Inline Photo Upload */}
      {isEditMode && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileInputChange}
        />
      )}

      {items.length === 0 ? (
        <div
          onClick={isEditMode ? handleAddItem : undefined}
          className={`flex min-h-[180px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isEditMode
              ? 'cursor-pointer border-border hover:border-primary/50 bg-surface-raised/60 hover:bg-primary/5'
              : 'border-border bg-surface/40'
          }`}
        >
          <Sparkles className="text-primary" size={28} />
          <p className="text-sm font-bold text-text">Nenhum momento adicionado na linha do tempo ainda.</p>
          <p className="text-xs text-text-light">
            {isEditMode
              ? 'Clique aqui para adicionar seu primeiro marco inesquecível.'
              : 'Esta linha do tempo está vazia no momento.'}
          </p>
          {isEditMode && (
            <button
              type="button"
              onClick={handleAddItem}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary-dark"
            >
              <Plus size={14} /> Adicionar Primeiro Momento
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical brilhante conectando os pontos */}
          <div className="absolute bottom-6 left-6 top-6 w-0.5 bg-gradient-to-b from-primary via-pink-400 to-amber-300 sm:left-1/2 sm:-ml-[1px]" />

          <div className="space-y-8">
            {items.map((item, index) => {
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative flex flex-col items-start gap-4 sm:flex-row ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Ponto / Nó Iluminado com Coração */}
                  <div className="absolute left-6 top-3 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md ring-4 ring-primary/20 sm:left-1/2">
                    <Heart size={12} fill="currentColor" />
                  </div>

                  {/* Conteúdo do Card com Edição Direta WYSIWYG */}
                  <div className="ml-12 w-[calc(100%-3.5rem)] sm:ml-0 sm:w-1/2 sm:px-6">
                    <div
                      className={`group relative rounded-2xl border bg-surface/95 text-text p-5 shadow-lg backdrop-blur-xs transition-all duration-300 ${
                        isEditMode
                          ? 'border-border hover:border-primary/50 hover:shadow-xl'
                          : 'border-border/80 hover:shadow-xl'
                      } ${isEven ? 'sm:text-right' : 'sm:text-left'}`}
                    >
                      {/* Top Header do Card: Data + Barra de Ações Compacta */}
                      <div
                        className={`flex items-center gap-2 justify-between ${
                          isEven ? 'sm:flex-row-reverse' : ''
                        } mb-2`}
                      >
                        {/* Badge / Edição da Data */}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => handleUpdateItem(index, 'date', e.target.value)}
                            placeholder="Data do marco"
                            aria-label="Data do marco"
                            className="inline-block max-w-[190px] rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary placeholder:text-primary/40 border border-dashed border-transparent hover:border-primary/40 focus:border-primary focus:bg-primary/15 focus:outline-none transition-colors"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                            {item.date || 'Data especial'}
                          </span>
                        )}

                        {/* Barra Compacta de Ações (Modo Edição com Progressive Disclosure) */}
                        {isEditMode && (
                          <div
                            className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity bg-surface-raised/90 rounded-xl border border-border p-0.5 shadow-2xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveItem(index, 'up')}
                              className="rounded-lg p-1 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-light"
                              aria-label="Mover para cima"
                              title="Mover para cima"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={index === items.length - 1}
                              onClick={() => handleMoveItem(index, 'down')}
                              className="rounded-lg p-1 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-light"
                              aria-label="Mover para baixo"
                              title="Mover para baixo"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-500/10 cursor-pointer"
                              aria-label="Remover marco"
                              title="Remover marco"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Título do Marco */}
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                          placeholder="Título do Momento"
                          aria-label="Título do marco"
                          className={`mt-1 w-full bg-transparent text-lg font-bold text-text sm:text-xl placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary focus:outline-none transition-colors py-0.5 ${
                            isEven ? 'sm:text-right' : 'sm:text-left'
                          }`}
                        />
                      ) : (
                        <h4 className="mt-1 text-lg font-bold text-text sm:text-xl">
                          {item.title || 'Título do Momento'}
                        </h4>
                      )}

                      {/* Foto do Marco */}
                      {item.image ? (
                        <div className="relative my-3 overflow-hidden rounded-xl border border-primary/15 shadow-xs group/img">
                          <img
                            src={item.image}
                            alt={item.title || 'Foto do marco'}
                            className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {isEditMode && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-2xs">
                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(index)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-surface/95 px-3 py-1.5 text-xs font-bold text-text shadow-md hover:bg-surface-raised hover:text-primary transition-colors cursor-pointer"
                              >
                                <Upload size={13} className="text-primary" />
                                <span>Trocar Foto</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(index, 'image', '')}
                                className="inline-flex items-center gap-1 rounded-xl bg-red-500/90 px-2.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                                title="Remover Foto"
                                aria-label="Remover foto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : isEditMode ? (
                        <div className="my-3">
                          <button
                            type="button"
                            onClick={() => handleTriggerUpload(index)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] py-2.5 px-3 text-xs font-semibold text-primary transition-all hover:border-primary/60 hover:bg-primary/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                          >
                            {uploadingIndex === index ? (
                              <>
                                <RotateCw size={14} className="animate-spin text-primary" />
                                <span>Enviando foto...</span>
                              </>
                            ) : (
                              <>
                                <Camera size={15} />
                                <span>Adicionar Foto ao Momento</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : null}

                      {/* Descrição com Tipografia Legível (font-sans text-sm sm:text-base) */}
                      {isEditMode ? (
                        <textarea
                          rows={3}
                          value={item.description ?? ''}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="Conte o que tornou esse dia tão inesquecível..."
                          aria-label="Descrição do marco"
                          className={`mt-2 w-full resize-none rounded-xl bg-transparent font-sans text-sm sm:text-base leading-relaxed text-text placeholder:text-text-light/40 border border-dashed border-transparent hover:border-primary/30 focus:border-primary/50 focus:bg-surface/50 focus:outline-none p-1.5 transition-colors ${
                            isEven ? 'sm:text-right' : 'sm:text-left'
                          }`}
                        />
                      ) : item.description ? (
                        <p className="mt-2 font-sans text-sm sm:text-base leading-relaxed text-text/85 whitespace-pre-wrap">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Botão Discreto e Elegante + Adicionar Momento no Final da Linha do Tempo (Modo Edição) */}
          {isEditMode && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-surface/90 px-6 py-3 text-sm font-bold text-primary shadow-xs backdrop-blur-xs transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus size={16} />
                <span>Adicionar Momento</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function areTimelinePropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const TimelineBlock = memo(TimelineBlockComponent, areTimelinePropsEqual)
