import { useCallback, useEffect, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw, Heart } from 'lucide-react'

function HeartConfetti() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (i * (360 / 24) * Math.PI) / 180,
    distance: 60 + (i % 4) * 35,
    size: 10 + (i % 3) * 6,
    color: ['#ffffff', '#fb7185', '#fda4af', '#fecdd3', '#fde047'][i % 5],
  }))

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden">
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

interface InteractiveScratchCanvasProps {
  coverText?: string
  secretText: string
  secretSubtitle?: string
  minScratchThreshold?: number
  height?: number
  onRevealed?: () => void
}

export const InteractiveScratchCanvas = memo(function InteractiveScratchCanvas({
  coverText = 'Raspe com o mouse ou o dedo para revelar...',
  secretText,
  secretSubtitle = 'Surpresa Revelada',
  minScratchThreshold = 40,
  height = 145,
  onRevealed,
}: InteractiveScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [scratchPercent, setScratchPercent] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const animFrameRef = useRef<number | null>(null)

  const drawCover = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // 1. Película metálica rica em Ouro Champagne & Prata Rosé
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1.0

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#fef08a')    // Ouro suave
    gradient.addColorStop(0.2, '#fde047')  // Ouro vibrante
    gradient.addColorStop(0.45, '#fecdd3') // Rosé
    gradient.addColorStop(0.7, '#fed7aa')  // Champagne
    gradient.addColorStop(0.9, '#fbcfe8')  // Rosa claro
    gradient.addColorStop(1, '#fde047')    // Ouro

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // 2. Reflexos especulares metálicos
    const specGrad = ctx.createLinearGradient(0, 0, width, 0)
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
    specGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)')
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    specGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.35)')
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = specGrad
    ctx.fillRect(0, 0, width, height)

    // 3. Textura de micro-brilhos cintilantes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    for (let i = 0; i < 90; i++) {
      const px = (Math.sin(i * 137.5) * 0.5 + 0.5) * width
      const py = (Math.cos(i * 73.1) * 0.5 + 0.5) * height
      ctx.beginPath()
      ctx.arc(px, py, (i % 3) + 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // 4. Borda tracejada elegante
    ctx.strokeStyle = '#be123c'
    ctx.lineWidth = 1.8
    ctx.setLineDash([6, 6])
    ctx.strokeRect(10, 10, width - 20, height - 20)
    ctx.setLineDash([])

    // 5. Ícone central de varinha/brilho
    ctx.fillStyle = '#881337'
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)'
    ctx.shadowBlur = 4

    const lines = coverText.split('\n')
    const lineHeight = 20
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight)
    })

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

    const sampleStep = 16 // amostragem precisa
    let transparentCount = 0
    let totalSampled = 0

    for (let i = 3; i < data.length; i += sampleStep * 4) {
      totalSampled++
      if (data[i] < 128) {
        transparentCount++
      }
    }

    return totalSampled > 0 ? Math.min(100, Math.round((transparentCount / totalSampled) * 100)) : 0
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width || 400
    canvas.height = rect.height || height

    drawCover(canvas)

    const handleResize = () => {
      if (!isRevealed && canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect()
        canvasRef.current.width = r.width || 400
        canvasRef.current.height = r.height || height
        drawCover(canvasRef.current)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawCover, height, isRevealed])

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas || isRevealed) return
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      // 100% de remoção opaca limpa (sem translucidez)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = '#000000'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 48
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      if (lastPoint.current) {
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        ctx.arc(x, y, 24, 0, Math.PI * 2)
        ctx.fill()
      }

      lastPoint.current = { x, y }

      // Throttle de cálculo do percentual para fluidez a 60fps
      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(() => {
          animFrameRef.current = null
          const percent = calculateScratchPercent()
          setScratchPercent(percent)

          if (percent >= minScratchThreshold && !isRevealed) {
            setIsRevealed(true)
            setShowConfetti(true)
            onRevealed?.()
          }
        })
      }
    },
    [calculateScratchPercent, isRevealed, minScratchThreshold, onRevealed]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed) return
    isDrawing.current = true
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // safe fallback
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    scratch(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || isRevealed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    scratch(x, y)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = false
    lastPoint.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // safe fallback
    }
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScratchPercent(0)
    setIsRevealed(false)
    setShowConfetti(false)
    const canvas = canvasRef.current
    if (canvas) {
      drawCover(canvas)
    }
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border-2 border-rose-300 shadow-md select-none"
      style={{ minHeight: height, touchAction: 'none' }}
    >
      {showConfetti && <HeartConfetti />}

      {/* Fundo de Alto Contraste (Vinho Escuro & Rubi Profundo com Texto Branco Puro) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#be123c] text-white shadow-inner">
        <span className="text-xs font-extrabold text-[#fde047] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 drop-shadow-xs">
          <Sparkles size={14} className="text-[#fde047]" /> {secretSubtitle}
        </span>
        <p className="font-display font-bold text-base sm:text-lg text-white leading-snug drop-shadow-xs">
          {secretText}
        </p>

        {isRevealed && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={handleReset}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#fecdd3] hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-xs"
          >
            <RotateCcw size={13} /> Raspar novamente
          </motion.button>
        )}
      </div>

      {/* Camada de Raspadinha Interativa (Película Metálica Ouro Champagne) */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
            className="absolute inset-0 z-10 touch-none cursor-crosshair"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full block"
            />
            {scratchPercent > 0 && scratchPercent < minScratchThreshold && (
              <div className="absolute bottom-2.5 right-3 pointer-events-none text-xs font-bold text-[#4c0519] bg-white/95 px-2.5 py-1 rounded-full shadow-md border border-rose-200">
                {scratchPercent}% raspado
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
