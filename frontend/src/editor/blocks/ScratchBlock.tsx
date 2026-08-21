import { memo, useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RotateCcw, Image as ImageIcon, Type, Heart } from 'lucide-react'
import type { BlockComponentProps, ScratchBlockProps } from '@/editor/types'
import { MediaField } from '@/editor/components/MediaField'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

function HeartConfettiExplosion() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (i * (360 / 24) * Math.PI) / 180,
    distance: 60 + (i % 4) * 35,
    size: 10 + (i % 3) * 6,
    color: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#f59e0b'][i % 5],
  }))

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      {particles.map((p) => {
        const targetX = Math.cos(p.angle) * p.distance
        const targetY = Math.sin(p.angle) * p.distance

        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: targetX,
              y: targetY,
              scale: [0, 1.4, 0],
              opacity: [1, 1, 0],
              rotate: (p.id % 2 === 0 ? 1 : -1) * 180,
            }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute flex items-center justify-center"
          >
            <Heart size={p.size} fill={p.color} style={{ color: p.color }} />
          </motion.div>
        )
      })}
    </div>
  )
}

function ScratchCanvas({
  coverText,
  onReveal,
  isRevealed,
}: {
  coverText: string
  onReveal: () => void
  isRevealed: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [scratchPercent, setScratchPercent] = useState(0)

  const drawCover = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Gradiente metálico prateado/dourado rosé
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3e8e2')
    gradient.addColorStop(0.3, '#fbcfe8')
    gradient.addColorStop(0.6, '#fde047')
    gradient.addColorStop(0.8, '#f472b6')
    gradient.addColorStop(1, '#fed7aa')

    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Textura de brilhos e pontos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    for (let i = 0; i < 60; i++) {
      const px = (Math.sin(i * 99) * 0.5 + 0.5) * width
      const py = (Math.cos(i * 33) * 0.5 + 0.5) * height
      ctx.beginPath()
      ctx.arc(px, py, (i % 3) + 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Texto da Capa
    ctx.fillStyle = '#831843'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
    ctx.shadowBlur = 4

    const lines = (coverText || 'Raspe suavemente aqui para descobrir a mensagem...').split('\n')
    const lineHeight = 22
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight)
    })

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }, [coverText])

  const calculateScratchPercent = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return 0

    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    let transparentPixels = 0
    const totalPixels = data.length / 4

    // Amostragem a cada 16 pixels para performance máxima
    for (let i = 3; i < data.length; i += 64) {
      if (data[i] === 0) {
        transparentPixels += 16
      }
    }

    const percent = Math.min(100, Math.round((transparentPixels / totalPixels) * 100))
    return percent
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width || 400
    canvas.height = rect.height || 220

    drawCover(canvas)
  }, [drawCover])

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 42
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (lastPoint.current) {
        ctx.beginPath()
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, 21, 0, Math.PI * 2)
        ctx.fill()
      }

      lastPoint.current = { x, y }

      const percent = calculateScratchPercent()
      setScratchPercent(percent)

      if (percent >= 50 && !isRevealed) {
        onReveal()
      }
    },
    [calculateScratchPercent, isRevealed, onReveal],
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    scratch(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    scratch(x, y)
  }

  const handlePointerUp = () => {
    isDrawing.current = false
    lastPoint.current = null
  }

  if (isRevealed) {
    return null
  }

  return (
    <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="h-full w-full cursor-pointer touch-none"
        style={{ touchAction: 'none' }}
      />
      {scratchPercent > 0 && scratchPercent < 50 && (
        <div className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
          {scratchPercent}% raspado
        </div>
      )}
    </div>
  )
}

function ScratchBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isScratch = block.type === 'scratch'
  const props: ScratchBlockProps = isScratch
    ? block.props
    : {
        coverText: 'Raspe suavemente para revelar a mensagem',
        secretType: 'text',
        secretText: 'Minha vida se tornou incomparavelmente melhor desde o momento em que você chegou.',
        secretImage: '',
        isRevealed: false,
      }

  const [isRevealedLocal, setIsRevealedLocal] = useState(props.isRevealed ?? false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleReveal = useCallback(() => {
    setIsRevealedLocal(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1400)
  }, [])

  const handleReset = useCallback(() => {
    setIsRevealedLocal(false)
    setShowConfetti(false)
  }, [])

  const updateProp = useCallback(
    <K extends keyof ScratchBlockProps>(key: K, value: ScratchBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'scratch') {
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

  if (!isScratch) {
    return null
  }

  const secretType = props.secretType || 'text'
  const coverText = props.coverText || 'Raspe suavemente aqui para descobrir...'
  const secretText = props.secretText || 'Você ilumina todos os meus dias.'
  const secretImage = props.secretImage || ''

  const interactiveCard = (
    <div className="relative mx-auto min-h-[220px] w-full max-w-md select-none overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6 shadow-xl">
      {/* Explosão de Confetes de Corações */}
      {showConfetti && <HeartConfettiExplosion />}

      {/* Conteúdo Secreto por Baixo */}
      <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
        {secretType === 'text' ? (
          <div className="space-y-3 px-4">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles size={14} /> Segredo Revelado
            </span>
            <p className="font-cursive text-2xl font-bold leading-relaxed text-text sm:text-3xl">
              {secretText}
            </p>
          </div>
        ) : secretImage ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={secretImage}
              alt="Foto Secreta Revelada"
              className="max-h-[260px] w-full rounded-xl border border-primary/20 object-cover shadow-md"
            />
            {props.secretText ? (
              <p className="font-cursive text-lg font-medium text-text">{props.secretText}</p>
            ) : null}
          </div>
        ) : (
          <div className="text-center text-text-light">
            <Sparkles size={28} className="mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Nenhuma foto secreta configurada.</p>
          </div>
        )}
      </div>

      {/* Camada Canvas de Raspadinha Superior */}
      <ScratchCanvas
        key={isRevealedLocal ? 'revealed' : 'hidden'}
        coverText={coverText}
        isRevealed={isRevealedLocal}
        onReveal={handleReveal}
      />
    </div>
  )

  if (mode === 'preview') {
    return (
      <div className="py-2">
        {interactiveCard}
        <p className="mt-2 text-center text-xs font-medium text-text-light">
          {isRevealedLocal ? 'Segredo revelado com sucesso.' : 'Passe o dedo ou mouse para raspar'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
          Raspadinha Interativa
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-2.5 py-1 text-xs font-medium text-primary shadow-xs transition-colors hover:bg-primary/10"
        >
          <RotateCcw size={13} /> Resetar Raspadinha
        </button>
      </div>

      {interactiveCard}

      <div className="space-y-4 rounded-xl border border-primary/15 bg-white/90 p-4">
        <EditorInputSection
          title="Texto da Capa da Raspadinha"
          helperText="Frase estampada sobre a tinta raspável."
        >
          <input
            type="text"
            value={props.coverText}
            onChange={(e) => updateProp('coverText', e.target.value)}
            placeholder="Ex: Raspe suavemente para descobrir a mensagem..."
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Texto da capa da raspadinha"
          />
        </EditorInputSection>

        <EditorInputSection
          title="Tipo de Segredo"
          helperText="Escolha se o segredo é uma mensagem de texto ou uma foto secreta."
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateProp('secretType', 'text')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                props.secretType === 'text'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-primary/20 bg-white text-text hover:bg-primary/5'
              }`}
            >
              <Type size={16} /> Mensagem Secreta
            </button>
            <button
              type="button"
              onClick={() => updateProp('secretType', 'image')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                props.secretType === 'image'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-primary/20 bg-white text-text hover:bg-primary/5'
              }`}
            >
              <ImageIcon size={16} /> Foto Secreta
            </button>
          </div>
        </EditorInputSection>

        {props.secretType === 'text' ? (
          <EditorInputSection
            title="Mensagem Secreta"
            helperText="Texto revelado quando o usuário raspa o cartão."
          >
            <textarea
              rows={3}
              value={props.secretText ?? ''}
              onChange={(e) => updateProp('secretText', e.target.value)}
              placeholder="Ex: Minha vida se tornou incomparavelmente melhor desde o momento em que você chegou."
              className={EDITOR_FIELD_BASE_CLASS}
              aria-label="Mensagem secreta"
            />
          </EditorInputSection>
        ) : (
          <div className="space-y-3">
            <MediaField
              kind="image"
              label="Foto Secreta"
              value={{ src: props.secretImage || '' }}
              onChange={(val) => updateProp('secretImage', val.src)}
              onRemove={() => updateProp('secretImage', '')}
              helperText="Insira uma foto surpresa para ser descoberta ao raspar."
            />
            <EditorInputSection
              title="Legenda da Foto (Opcional)"
              helperText="Pequena frase que acompanha a foto secreta."
            >
              <input
                type="text"
                value={props.secretText ?? ''}
                onChange={(e) => updateProp('secretText', e.target.value)}
                placeholder="Ex: Lembrança daquele nosso dia especial"
                className={EDITOR_FIELD_BASE_CLASS}
                aria-label="Legenda da foto secreta"
              />
            </EditorInputSection>
          </div>
        )}
      </div>
    </div>
  )
}

function areScratchPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const ScratchBlock = memo(ScratchBlockComponent, areScratchPropsEqual)
