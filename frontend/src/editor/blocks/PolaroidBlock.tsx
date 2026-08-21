import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  RotateCw,
  Trash2,
  Copy,
  Plus,
  Upload,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react'
import type { BlockComponentProps, PolaroidBlockProps, PolaroidPhoto } from '@/editor/types'
import { assetService } from '@/services/assetService'

function generatePhotoId(): string {
  return `polaroid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function WashiTape({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-20 bg-amber-100/80 shadow-xs backdrop-blur-xs z-20 ${className}`}
      style={{
        clipPath:
          'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 98% 95%, 95% 100%, 5% 100%, 0% 95%)',
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(245,158,11,0.2), rgba(245,158,11,0.2) 6px, transparent 6px, transparent 12px)',
      }}
    />
  )
}

interface PolaroidCardProps {
  photo: PolaroidPhoto
  index: number
  isSelected: boolean
  isEditMode: boolean
  onSelect: () => void
  onDeselect: () => void
  onUpdateCaption: (caption: string) => void
  onUpdateRotation: (rotation: number) => void
  onUpdateWidth: (width: number) => void
  onUpdateSrc: (src: string) => void
  onRemove: () => void
  onDuplicate: () => void
}

function PolaroidCard({
  photo,
  index,
  isSelected,
  isEditMode,
  onSelect,
  onDeselect,
  onUpdateCaption,
  onUpdateRotation,
  onUpdateWidth,
  onUpdateSrc,
  onRemove,
  onDuplicate,
}: PolaroidCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isRotating, setIsRotating] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlPopover, setShowUrlPopover] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState(photo.src || '')

  const currentRotation = photo.rotation ?? (index % 2 === 0 ? -2.5 : 2.5)
  const currentWidth = photo.width ?? 260

  // Click outside detection for progressive disclosure
  useEffect(() => {
    if (!isSelected || !isEditMode) return

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (cardRef.current && !cardRef.current.contains(target)) {
        onDeselect()
        setShowUrlPopover(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDeselect()
        setShowUrlPopover(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('touchstart', handlePointerDownOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('touchstart', handlePointerDownOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEditMode, isSelected, onDeselect])

  const lastPointerDownTimeRef = useRef<number>(0)

  // Direct Interactive Rotation Dragging (Lightroom / Camera Raw style)
  const handleRotationPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Double click / double tap detection to reset to 0°
    const now = Date.now()
    if (now - lastPointerDownTimeRef.current < 320) {
      onUpdateRotation(0)
      lastPointerDownTimeRef.current = 0
      return
    }
    lastPointerDownTimeRef.current = now

    if (!cardRef.current) return
    const target = e.currentTarget
    try {
      target.setPointerCapture(e.pointerId)
    } catch {
      // safe fallback if pointer capture is not supported
    }

    const cardEl = cardRef.current
    const rect = cardEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    setIsRotating(true)

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault()
      const dx = moveEvent.clientX - centerX
      const dy = moveEvent.clientY - centerY

      // Calculate angle from center (0° is straight up)
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90
      while (deg > 180) deg -= 360
      while (deg < -180) deg += 360

      // Magnetic snap to 0° within 1.5 degrees
      if (Math.abs(deg) < 1.5) {
        deg = 0
      }

      // Clamp between -45° and 45° for realistic collage feel
      const clamped = Math.max(-45, Math.min(45, deg))
      const rounded = Math.round(clamped * 2) / 2
      onUpdateRotation(rounded)
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId)
      } catch {
        // safe fallback
      }
      setIsRotating(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  // Direct Fluid Corner Resize Dragging
  const handleResizePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!cardRef.current) return
    const target = e.currentTarget
    try {
      target.setPointerCapture(e.pointerId)
    } catch {
      // safe fallback if pointer capture is not supported
    }

    const cardEl = cardRef.current
    const rect = cardEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const initialDistance = Math.hypot(e.clientX - centerX, e.clientY - centerY)
    const initialWidth = currentWidth

    setIsResizing(true)

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault()
      const currentDistance = Math.hypot(
        moveEvent.clientX - centerX,
        moveEvent.clientY - centerY,
      )

      if (initialDistance === 0) return
      const scale = currentDistance / initialDistance
      const calculatedWidth = Math.round(initialWidth * scale)
      const clampedWidth = Math.max(180, Math.min(400, calculatedWidth))

      onUpdateWidth(clampedWidth)
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId)
      } catch {
        // safe fallback
      }
      setIsResizing(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  // File Upload Handler
  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const localUrl = URL.createObjectURL(file)
    onUpdateSrc(localUrl)

    try {
      const asset = await assetService.uploadFileFlow({ file, kind: 'image' })
      if (asset.publicUrl) {
        onUpdateSrc(asset.publicUrl)
      }
    } catch {
      // Retains local preview if upload fails or is offline
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      onUpdateSrc(urlInputValue.trim())
    }
    setShowUrlPopover(false)
  }

  const cycleAnglePreset = () => {
    const presets = [0, -3.5, 3.5, -6, 6, -1.5, 1.5]
    const nextIdx = (presets.indexOf(currentRotation) + 1) % presets.length
    onUpdateRotation(presets[nextIdx >= 0 ? nextIdx : 0])
  }

  return (
    <div
      ref={cardRef}
      role={isEditMode ? 'button' : undefined}
      tabIndex={isEditMode ? 0 : undefined}
      onClick={(e) => {
        if (!isEditMode) return
        e.stopPropagation()
        onSelect()
      }}
      onKeyDown={(e) => {
        if (!isEditMode) return
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect()
        }
      }}
      className={`group relative flex flex-col select-none rounded-xl border bg-[#fffdfa] p-3.5 pb-5 transition-shadow duration-200 ${
        isSelected && isEditMode
          ? 'z-40 border-primary/50 shadow-2xl ring-2 ring-primary/70 ring-offset-2 ring-offset-background'
          : 'z-10 border-amber-200/50 shadow-lg hover:shadow-xl'
      }`}
      style={{
        width: `${currentWidth}px`,
        transform: `rotate(${currentRotation}deg)`,
        boxShadow:
          isSelected && isEditMode
            ? '0 20px 40px -10px rgba(0,0,0,0.22), 0 8px 16px -4px rgba(0,0,0,0.12)'
            : '0 12px 28px -6px rgba(0,0,0,0.15), 0 4px 10px -2px rgba(0,0,0,0.08)',
      }}
    >
      {/* Hidden File Input for Direct Upload */}
      {isEditMode && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileInputChange}
        />
      )}

      {/* Washi Tape Decorativa */}
      <WashiTape className="-top-3 left-1/2 -translate-x-1/2 rotate-[-2deg]" />

      {/* Floating Contextual Toolbar (Progressive Disclosure) */}
      <AnimatePresence>
        {isSelected && isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-2xl border border-primary/25 bg-white/95 p-1 shadow-2xl backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
              title="Trocar Foto da Polaroid"
            >
              <Upload size={13} className="text-primary" />
              <span>Trocar Foto</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlPopover((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold transition-colors hover:bg-primary/10 active:scale-95 ${
                showUrlPopover ? 'bg-primary/10 text-primary' : 'text-text hover:text-primary'
              }`}
              title="Inserir URL da Imagem"
            >
              <LinkIcon size={13} />
            </button>

            <button
              type="button"
              onClick={cycleAnglePreset}
              className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
              title="Ajustar Ângulo"
            >
              <RotateCw size={13} className="text-primary" />
              <span className="font-mono text-[11px]">{currentRotation}°</span>
            </button>

            <div className="h-4 w-px bg-primary/20" />

            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex items-center rounded-xl p-1.5 text-text-light transition-colors hover:bg-primary/10 hover:text-primary active:scale-95"
              title="Duplicar Polaroid"
              aria-label="Duplicar Polaroid"
            >
              <Copy size={14} />
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center rounded-xl p-1.5 text-red-500 transition-colors hover:bg-red-50 active:scale-95"
              title="Remover Polaroid"
              aria-label="Remover Polaroid"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* URL Popover */}
      <AnimatePresence>
        {isSelected && isEditMode && showUrlPopover && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-26 left-1/2 -translate-x-1/2 z-50 flex w-64 items-center gap-1.5 rounded-xl border border-primary/25 bg-white p-2 shadow-2xl"
          >
            <input
              type="url"
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-lg border border-primary/20 px-2 py-1 text-xs text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyUrl()
                }
              }}
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary-dark"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Anchor Point & Radial Stem (Adobe Lightroom / Camera Raw Mask Style) */}
      {isSelected && isEditMode && (
        <>
          {/* Central Anchor Crosshair / Pivot Point at (50%, 50%) */}
          <div
            aria-hidden="true"
            data-testid="central-anchor-point"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
          >
            {/* Subtle Crosshair Reticle */}
            <div
              className={`relative flex items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur-2xs transition-all duration-150 ${
                isRotating
                  ? 'h-6 w-6 border-primary ring-4 ring-primary/25 scale-110 shadow-md'
                  : 'h-5 w-5 border-primary/60'
              }`}
            >
              {/* Horizontal & Vertical Crosshair Ticks */}
              <div className="absolute h-px w-2.5 bg-primary/70" />
              <div className="absolute h-2.5 w-px bg-primary/70" />
              {/* Central Pivot Dot */}
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>

            {/* Protractor / Angle Compass Ring during active rotation */}
            {isRotating && (
              <div className="pointer-events-none absolute h-28 w-28 rounded-full border border-dashed border-primary/40 animate-in fade-in zoom-in-90 duration-150" />
            )}
          </div>

          {/* Radial Connecting Stem from Central Pivot to Top Rotation Handle */}
          <div
            aria-hidden="true"
            data-testid="radial-stem"
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-30 transition-all ${
              isRotating
                ? 'w-[2px] bg-primary shadow-xs'
                : 'w-0.5 border-l border-dashed border-primary/70'
            }`}
            style={{
              top: '-2.75rem',
              height: 'calc(50% + 2.75rem)',
            }}
          />

          {/* Circular Clean Rotation Handle (Lightroom / Camera Raw style) */}
          <button
            type="button"
            onPointerDown={handleRotationPointerDown}
            onDoubleClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onUpdateRotation(0)
            }}
            style={{ touchAction: 'none' }}
            className={`absolute -top-11 left-1/2 -translate-x-1/2 z-40 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-white shadow-lg transition-transform hover:scale-125 active:scale-105 ${
              isRotating
                ? 'cursor-grabbing ring-4 ring-primary/25 scale-115 bg-primary text-white'
                : 'cursor-grab text-primary'
            }`}
            title="Arrastar para girar a foto"
            aria-label="Girar Polaroid"
          >
            <RotateCw size={13} className={isRotating ? 'text-white' : 'text-primary'} />
          </button>

          {/* Rotation Angle Tooltip Badge with Real-time Angle */}
          {isRotating && (
            <div className="pointer-events-none absolute -top-19 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-neutral-900/90 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-xl ring-1 ring-white/20 backdrop-blur-xs whitespace-nowrap animate-in fade-in duration-100">
              {currentRotation > 0 ? `+${currentRotation}°` : `${currentRotation}°`}
            </div>
          )}
        </>
      )}

      {/* Corner Resize Handles with touchAction: none */}
      {isSelected && isEditMode && (
        <>
          <div
            onPointerDown={handleResizePointerDown}
            style={{ touchAction: 'none' }}
            className="absolute -top-1.5 -left-1.5 z-40 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-primary bg-white shadow-sm transition-transform hover:scale-130 active:scale-110"
            title="Redimensionar"
          />
          <div
            onPointerDown={handleResizePointerDown}
            style={{ touchAction: 'none' }}
            className="absolute -top-1.5 -right-1.5 z-40 h-3.5 w-3.5 cursor-nesw-resize rounded-full border-2 border-primary bg-white shadow-sm transition-transform hover:scale-130 active:scale-110"
            title="Redimensionar"
          />
          <div
            onPointerDown={handleResizePointerDown}
            style={{ touchAction: 'none' }}
            className="absolute -bottom-1.5 -left-1.5 z-40 h-3.5 w-3.5 cursor-nesw-resize rounded-full border-2 border-primary bg-white shadow-sm transition-transform hover:scale-130 active:scale-110"
            title="Redimensionar"
          />
          <div
            onPointerDown={handleResizePointerDown}
            style={{ touchAction: 'none' }}
            className="absolute -bottom-1.5 -right-1.5 z-40 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-primary bg-white shadow-sm transition-transform hover:scale-130 active:scale-110"
            title="Redimensionar"
          />

          {/* Size Tooltip Badge while resizing */}
          {isResizing && (
            <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-neutral-900/90 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-xl ring-1 ring-white/20 backdrop-blur-xs whitespace-nowrap animate-in fade-in duration-100">
              {currentWidth}px
            </div>
          )}
        </>
      )}

      {/* Área Quadrada da Foto */}
      <div
        onClick={() => {
          if (isEditMode && !photo.src) {
            fileInputRef.current?.click()
          }
        }}
        className={`relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100 shadow-inner ${
          isEditMode && !photo.src ? 'cursor-pointer hover:bg-stone-200/80 transition-colors' : ''
        }`}
      >
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.caption || 'Foto Polaroid'}
            className="h-full w-full object-cover pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-text-light">
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5">
                <RotateCw size={24} className="animate-spin text-primary" />
                <span className="text-xs font-medium text-primary">Enviando foto...</span>
              </div>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-semibold text-text">Clique para adicionar foto</span>
                <span className="text-[10px] text-text-light">Upload direto ou link</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legenda Estilo Manuscrito (Click-to-Type WYSIWYG) - Previne quebra e estourar moldura */}
      <div className="mt-3 min-h-[36px] px-1 text-center overflow-hidden">
        {isEditMode ? (
          <input
            type="text"
            value={photo.caption ?? ''}
            maxLength={40}
            onChange={(e) => onUpdateCaption(e.target.value)}
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            placeholder="Escreva uma legenda..."
            className="w-full bg-transparent text-center font-cursive text-xl sm:text-2xl leading-relaxed text-text placeholder:font-sans placeholder:text-xs placeholder:text-text-light/40 border-b border-dashed border-transparent hover:border-primary/30 focus:border-primary/60 focus:outline-none transition-colors py-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
            aria-label="Legenda da foto polaroid"
          />
        ) : (
          <p
            className="font-cursive text-xl sm:text-2xl leading-relaxed text-text overflow-hidden text-ellipsis whitespace-nowrap px-1"
            title={photo.caption || undefined}
          >
            {photo.caption || ''}
          </p>
        )}
      </div>
    </div>
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
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

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
      caption: 'Nossa viagem',
      rotation: nextRotation,
      width: 260,
    }
    const nextPhotos = [...photos, newPhoto]
    updatePhotos(nextPhotos)
    setSelectedPhotoId(newPhoto.id)
  }, [photos, updatePhotos])

  const handleRemovePhoto = useCallback(
    (id: string) => {
      updatePhotos(photos.filter((p) => p.id !== id))
      if (selectedPhotoId === id) {
        setSelectedPhotoId(null)
      }
    },
    [photos, selectedPhotoId, updatePhotos],
  )

  const handleDuplicatePhoto = useCallback(
    (id: string) => {
      const source = photos.find((p) => p.id === id)
      if (!source) return

      const duplicated: PolaroidPhoto = {
        ...source,
        id: generatePhotoId(),
        rotation: (source.rotation ?? 0) + (Math.random() > 0.5 ? 2.5 : -2.5),
      }
      updatePhotos([...photos, duplicated])
      setSelectedPhotoId(duplicated.id)
    },
    [photos, updatePhotos],
  )

  const handleUpdatePhotoField = useCallback(
    <K extends keyof PolaroidPhoto>(id: string, key: K, value: PolaroidPhoto[K]) => {
      const nextPhotos = photos.map((p) => (p.id === id ? { ...p, [key]: value } : p))
      updatePhotos(nextPhotos)
    },
    [photos, updatePhotos],
  )

  if (!isPolaroid) {
    return null
  }

  const isEditMode = mode === 'edit'

  return (
    <div className="w-full">
      {/* Top Header bar in Edit Mode */}
      {isEditMode && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-white/85 p-3.5 shadow-sm backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                Fotos Polaroid com Washi Tape
                <Sparkles size={13} className="text-primary" />
              </h3>
              <p className="text-xs text-text-light">
                Clique na foto para girar, redimensionar ou digitar a legenda direto no papel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddPhoto}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={14} /> Nova Polaroid
          </button>
        </div>
      )}

      {/* Collage Area */}
      {photos.length === 0 ? (
        <div
          onClick={isEditMode ? handleAddPhoto : undefined}
          className={`flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isEditMode
              ? 'cursor-pointer border-primary/30 bg-white/60 hover:border-primary/50 hover:bg-primary/5'
              : 'border-primary/20 bg-white/40'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Camera size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-text">Nenhuma foto Polaroid adicionada</p>
            <p className="text-xs text-text-light">
              {isEditMode
                ? 'Clique aqui para adicionar sua primeira lembrança instantânea.'
                : 'Esta seção de memórias está vazia no momento.'}
            </p>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={handleAddPhoto}
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark"
            >
              <Plus size={14} /> Adicionar Polaroid
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-8 px-2 py-6 sm:gap-10 overflow-visible">
          {photos.map((photo, index) => (
            <PolaroidCard
              key={photo.id || index}
              photo={photo}
              index={index}
              isSelected={selectedPhotoId === photo.id}
              isEditMode={isEditMode}
              onSelect={() => setSelectedPhotoId(photo.id)}
              onDeselect={() => {
                if (selectedPhotoId === photo.id) {
                  setSelectedPhotoId(null)
                }
              }}
              onUpdateCaption={(caption) => handleUpdatePhotoField(photo.id, 'caption', caption)}
              onUpdateRotation={(rotation) => handleUpdatePhotoField(photo.id, 'rotation', rotation)}
              onUpdateWidth={(width) => handleUpdatePhotoField(photo.id, 'width', width)}
              onUpdateSrc={(src) => handleUpdatePhotoField(photo.id, 'src', src)}
              onRemove={() => handleRemovePhoto(photo.id)}
              onDuplicate={() => handleDuplicatePhoto(photo.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function arePolaroidPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const PolaroidBlock = memo(PolaroidBlockComponent, arePolaroidPropsEqual)
