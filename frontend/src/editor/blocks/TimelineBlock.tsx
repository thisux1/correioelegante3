import { memo, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Heart } from 'lucide-react'
import type { BlockComponentProps, TimelineBlockProps, TimelineItem } from '@/editor/types'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

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

  if (!isTimeline) {
    return null
  }

  const previewTimeline = (
    <div className="relative mx-auto w-full max-w-2xl py-4">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/30 p-8 text-center text-text-light">
          <Sparkles className="mx-auto mb-2 text-primary" size={28} />
          <p className="text-sm">Nenhum momento adicionado na linha do tempo ainda.</p>
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

                  {/* Conteúdo do Card */}
                  <div className="ml-12 w-[calc(100%-3.5rem)] sm:ml-0 sm:w-1/2 sm:px-6">
                    <div
                      className={`rounded-2xl border border-primary/20 bg-white/90 p-5 shadow-lg backdrop-blur-xs transition-shadow duration-300 hover:shadow-xl ${
                        isEven ? 'sm:text-right' : 'sm:text-left'
                      }`}
                    >
                      {/* Badge da Data */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                        {item.date || 'Data especial'}
                      </span>

                      {/* Título */}
                      <h4 className="mt-2 text-lg font-bold text-text sm:text-xl">
                        {item.title || 'Título do Momento'}
                      </h4>

                      {/* Foto do Marco (se houver) */}
                      {item.image ? (
                        <div className="my-3 overflow-hidden rounded-xl border border-primary/15 shadow-xs">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ) : null}

                      {/* Descrição */}
                      {item.description ? (
                        <p className="font-cursive mt-2 whitespace-pre-wrap text-base leading-relaxed text-text-light sm:text-lg">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  if (mode === 'preview') {
    return previewTimeline
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text">Linha do Tempo dos Nossos Momentos</h3>
          <p className="text-xs text-text-light">
            Adicione marcos, datas e fotos para reviver a história de vocês.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary-dark"
        >
          <Plus size={14} /> Novo Marco
        </button>
      </div>

      {previewTimeline}

      <div className="space-y-4 pt-2">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="space-y-3 rounded-xl border border-primary/20 bg-white/95 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Marco {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveItem(index, 'up')}
                  className="rounded-lg p-1 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveItem(index, 'down')}
                  className="rounded-lg p-1 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50"
                  aria-label="Remover marco"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EditorInputSection
                title="Data / Época"
                helperText="Ex: 12 de Junho de 2023, Primeiro Olhar..."
              >
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) => handleUpdateItem(index, 'date', e.target.value)}
                  placeholder="Ex: O início de tudo"
                  className={EDITOR_FIELD_BASE_CLASS}
                  aria-label="Data do marco"
                />
              </EditorInputSection>

              <EditorInputSection
                title="Título do Marco"
                helperText="Ex: Nosso Primeiro Encontro"
              >
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                  placeholder="Ex: Primeiro Beijo"
                  className={EDITOR_FIELD_BASE_CLASS}
                  aria-label="Título do marco"
                />
              </EditorInputSection>
            </div>

            <MediaField
              kind="image"
              label="Foto do Marco (Opcional)"
              value={{ src: item.image || '' }}
              onChange={(val) => handleUpdateItem(index, 'image', val.src)}
              onRemove={() => handleUpdateItem(index, 'image', '')}
              helperText="Insira uma foto marcante deste momento."
            />

            <EditorInputSection
              title="Descrição / Lembrança"
              helperText="Conte o que tornou esse dia tão inesquecível."
            >
              <textarea
                rows={2}
                value={item.description ?? ''}
                onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                placeholder="Ex: Aquele dia em que tudo começou com uma conversa que parecia nunca ter fim..."
                className={EDITOR_FIELD_BASE_CLASS}
                aria-label="Descrição do marco"
              />
            </EditorInputSection>
          </div>
        ))}
      </div>
    </div>
  )
}

function areTimelinePropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const TimelineBlock = memo(TimelineBlockComponent, areTimelinePropsEqual)
