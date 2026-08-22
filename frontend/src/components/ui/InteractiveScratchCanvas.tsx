import { useCallback, useEffect, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw, Heart } from 'lucide-react'

function HeartConfetti() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i * (360 / 20) * Math.PI) / 180,
    distance: 55 + (i % 4) * 30,
    size: 10 + (i % 3) * 6,
    color: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#f59e0b'][i % 5],
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
              scale: [0, 1.35, 0],
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
  coverText = 'Raspe suavemente aqui para descobrir a surpresa...',
  secretText,
  secretSubtitle = 'Surpresa Revelada',
  minScratchThreshold = 40,
  height = 140,
  onRevealed,
}: InteractiveScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [scratchPercent, setScratchPercent] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const drawCover = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Gradiente metálico prateado/dourado rosé de alta definição
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#fde2e4')
    gradient.addColorStop(0.25, '#fad2e1')
    gradient.addColorStop(0.5, '#fecdd3')
    gradient.addColorStop(0.75, '#fce7f3')
    gradient.addColorStop(1, '#fed7aa')

    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Partículas de brilho / poeira cintilante na folha
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    for (let i = 0; i < 70; i++) {
      const px = (Math.sin(i * 127) * 0.5 + 0.5) * width
      const py = (Math.cos(i * 47) * 0.5 + 0.5) * height
      ctx.beginPath()
      ctx.arc(px, py, (i % 3) + 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Moldura tracejada decorativa no canvas
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.25)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 6])
    ctx.strokeRect(8, 8, width - 16, height - 16)
    ctx.setLineDash([])

    // Texto da Capa
    ctx.fillStyle = '#4c0519'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowBlur = 5

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
    let transparentPixels = 0
    const totalPixels = data.length / 4

    // Amostragem de pixels para alta performance
    for (let i = 3; i < data.length; i += 64) {
      if (data[i] === 0) {
        transparentPixels += 16
      }
    }

    return Math.min(100, Math.round((transparentPixels / totalPixels) * 100))
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

      if (percent >= minScratchThreshold && !isRevealed) {
        setIsRevealed(true)
        setShowConfetti(true)
        onRevealed?.()
      }
    },
    [calculateScratchPercent, isRevealed, minScratchThreshold, onRevealed]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed) return
    isDrawing.current = true
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

  const handlePointerUp = () => {
    isDrawing.current = false
    lastPoint.current = null
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
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-pink-300/80 bg-[#fff5f8] shadow-sm select-none" style={{ minHeight: height }}>
      {showConfetti && <HeartConfetti />}

      {/* Conteúdo Secreto Ocultado / Revelado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-gradient-to-br from-[#fff0f4] to-[#ffe4ec]">
        <span className="text-xs font-bold text-[#e11d48] uppercase tracking-wider mb-1 flex items-center gap-1">
          <Sparkles size={13} /> {secretSubtitle}
        </span>
        <p className="font-display font-bold text-base sm:text-lg text-[#4c0519] leading-snug">
          {secretText}
        </p>

        {isRevealed && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={handleReset}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#be123c] hover:text-[#e11d48] transition-colors cursor-pointer"
          >
            <RotateCcw size={12} /> Raspar novamente
          </motion.button>
        )}
      </div>

      {/* Camada de Raspadinha Interativa (Canvas) */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
            className="absolute inset-0 z-10 touch-none cursor-crosshair"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full h-full block"
            />
            {scratchPercent > 0 && scratchPercent < minScratchThreshold && (
              <div className="absolute bottom-2 right-3 pointer-events-none text-[11px] font-bold text-[#4c0519] bg-white/85 px-2 py-0.5 rounded-full shadow-xs backdrop-blur-2xs">
                {scratchPercent}% raspado
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
