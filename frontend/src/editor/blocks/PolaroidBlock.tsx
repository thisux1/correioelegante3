import { memo, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ArrowUp, ArrowDown, Camera, Sparkles } from 'lucide-react'
import type { BlockComponentProps, PolaroidBlockProps, PolaroidPhoto } from '@/editor/types'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

function generatePhotoId(): string {
  return `polaroid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function WashiTape({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-20 bg-amber-100/70 shadow-xs backdrop-blur-xs ${className}`}
      style={{
        clipPath:
          'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 98% 95%, 95% 100%, 5% 100%, 0% 95%)',
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(245,158,11,0.15), rgba(245,158,11,0.15) 6px, transparent 6px, transparent 12px)',
      }}
    />
  )
}

function PolaroidBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isPolaroid = block.type === 'polaroid'
  const props: PolaroidBlockProps = isPolaroid
    ? block.props
    : {
        photos: [],
      }

  const photos = useMemo(() => (Array.isArray(props.photos) ? props.photos : []), [props.photos])

  const updatePhotos = useCallback(
    (newPhotos: PolaroidPhoto[]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'polaroid') {
          return currentBlock
        }
        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            photos: newPhotos,
          },
        }
      })
    },
    [onUpdate],
  )

  const handleAddPhoto = useCallback(() => {
    const defaultRotations = [-2.5, 2, -1.5, 3, -3]
    const nextRotation = defaultRotations[photos.length % defaultRotations.length]

    const newPhoto: PolaroidPhoto = {
      id: generatePhotoId(),
      src: '',
      caption: 'Nosso momento especial ✨',
      rotation: nextRotation,
    }
    updatePhotos([...photos, newPhoto])
  }, [photos, updatePhotos])

  const handleRemovePhoto = useCallback(
    (index: number) => {
      updatePhotos(photos.filter((_, i) => i !== index))
    },
    [photos, updatePhotos],
  )

  const handleMovePhoto = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= photos.length) return
      const nextPhotos = [...photos]
      const temp = nextPhotos[index]
      nextPhotos[index] = nextPhotos[targetIndex]
      nextPhotos[targetIndex] = temp
      updatePhotos(nextPhotos)
    },
    [photos, updatePhotos],
  )

  const handleUpdatePhoto = useCallback(
    <K extends keyof PolaroidPhoto>(index: number, key: K, value: PolaroidPhoto[K]) => {
      const nextPhotos = [...photos]
      nextPhotos[index] = {
        ...nextPhotos[index],
        [key]: value,
      }
      updatePhotos(nextPhotos)
    },
    [photos, updatePhotos],
  )

  if (!isPolaroid) {
    return null
  }

  const previewGallery = (
    <div className="mx-auto w-full max-w-3xl py-4">
      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/30 p-8 text-center text-text-light">
          <Camera className="mx-auto mb-2 text-primary" size={28} />
          <p className="text-sm">Nenhuma foto Polaroid adicionada ainda.</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-8 px-2 py-4 sm:gap-10">
          {photos.map((photo, index) => {
            const rot = photo.rotation ?? (index % 2 === 0 ? -2.5 : 2.5)

            return (
              <motion.div
                key={photo.id || index}
                initial={{ opacity: 0, scale: 0.92, rotate: rot }}
                animate={{ opacity: 1, scale: 1, rotate: rot }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="relative z-10 w-full max-w-[270px] rounded-xl border border-amber-200/50 bg-[#fffdfa] p-3.5 pb-5 shadow-xl transition-shadow duration-300 hover:shadow-2xl"
                style={{
                  boxShadow:
                    '0 12px 28px -6px rgba(0,0,0,0.15), 0 4px 10px -2px rgba(0,0,0,0.08)',
                }}
              >
                {/* Washi Tape Decorativa no Topo */}
                <WashiTape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-2deg]" />

                {/* Área da Foto */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100 shadow-inner">
                  {photo.src ? (
                    <img
                      src={photo.src}
                      alt={photo.caption || 'Foto Polaroid'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-text-light">
                      <Camera size={32} className="text-primary/50" />
                      <span className="text-xs">Foto vazia</span>
                    </div>
                  )}
                </div>

                {/* Legenda Estilo Manuscrito */}
                <div className="mt-3.5 min-h-[32px] px-1 text-center">
                  <p className="font-cursive text-xl leading-snug text-text">
                    {photo.caption || ''}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )

  if (mode === 'preview') {
    return previewGallery
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text">Fotos Polaroid com Washi Tape</h3>
          <p className="text-xs text-text-light">
            Memórias no formato clássico de foto instantânea.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddPhoto}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary-dark"
        >
          <Plus size={14} /> Nova Polaroid
        </button>
      </div>

      {previewGallery}

      <div className="space-y-4 pt-2">
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="space-y-3 rounded-xl border border-primary/20 bg-white/95 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles size={13} /> Polaroid {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMovePhoto(index, 'up')}
                  className="rounded-lg p-1 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                  aria-label="Mover foto para cima"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === photos.length - 1}
                  onClick={() => handleMovePhoto(index, 'down')}
                  className="rounded-lg p-1 text-text-light transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                  aria-label="Mover foto para baixo"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50"
                  aria-label="Remover foto polaroid"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <MediaField
              kind="image"
              label="Foto"
              value={{ src: photo.src }}
              onChange={(val) => handleUpdatePhoto(index, 'src', val.src)}
              onRemove={() => handleUpdatePhoto(index, 'src', '')}
              helperText="Insira uma foto para a moldura Polaroid."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EditorInputSection
                title="Legenda Manuscrita"
                helperText="Texto exibido na base da foto."
              >
                <input
                  type="text"
                  value={photo.caption ?? ''}
                  onChange={(e) => handleUpdatePhoto(index, 'caption', e.target.value)}
                  placeholder="Ex: Aquele dia mágico em Paris 💕"
                  className={EDITOR_FIELD_BASE_CLASS}
                  aria-label="Legenda da foto polaroid"
                />
              </EditorInputSection>

              <EditorInputSection
                title={`Inclinação da Foto (${photo.rotation ?? 0}°)`}
                helperText="Ajuste o ângulo artesanal da Polaroid."
              >
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-text-light">-8°</span>
                  <input
                    type="range"
                    min={-8}
                    max={8}
                    step={0.5}
                    value={photo.rotation ?? 0}
                    onChange={(e) =>
                      handleUpdatePhoto(index, 'rotation', parseFloat(e.target.value))
                    }
                    className="h-2 w-full cursor-pointer accent-primary"
                    aria-label="Inclinação da foto polaroid"
                  />
                  <span className="text-xs text-text-light">+8°</span>
                </div>
              </EditorInputSection>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function arePolaroidPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const PolaroidBlock = memo(PolaroidBlockComponent, arePolaroidPropsEqual)
