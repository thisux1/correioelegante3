import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Music2 } from 'lucide-react'

interface VintagePlayerDeckProps {
  coverSrc?: string
  title?: string
  artist?: string
  isPlaying: boolean
  progressPercent?: number
  currentTime?: number
  duration?: number
  onClick?: () => void
}

export function VintagePlayerDeck({
  coverSrc,
  title,
  artist,
  isPlaying,
  progressPercent = 0,
  onClick,
}: VintagePlayerDeckProps) {
  const shouldReduceMotion = useReducedMotion()
  const hasCover = Boolean(coverSrc && (coverSrc.startsWith('http://') || coverSrc.startsWith('https://') || coverSrc.startsWith('data:')))

  // Random micro-oscillation for analog VU meters when playing
  const [vuLeft, setVuLeft] = useState(35)
  const [vuRight, setVuRight] = useState(30)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setVuLeft(35 + Math.random() * 45)
      setVuRight(30 + Math.random() * 50)
    }, 180)

    return () => clearInterval(interval)
  }, [isPlaying])

  const effectiveVuLeft = isPlaying ? vuLeft : 8
  const effectiveVuRight = isPlaying ? vuRight : 6

  // Tonearm physics angles:
  // Rest angle: 0deg (pointing to the arm rest clip)
  // Lead-in groove (start of vinyl): 21deg
  // Lead-out groove (end of vinyl): 35deg
  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const playingAngle = 21 + (clampedProgress / 100) * 14
  const tonearmAngle = isPlaying ? playingAngle : 0

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-1 sm:p-2 select-none group cursor-pointer w-full"
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {/* ========================================================================= */}
      {/* 1. GABINETE DO TOCA-DISCOS (TURNTABLE PLINTH / CHASSIS) */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-[340px] sm:max-w-[390px] aspect-[1.18/1] rounded-3xl p-2.5 sm:p-3.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] border-2 border-border/70 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black overflow-hidden transition-transform duration-300 group-hover:scale-[1.01]">
        {/* Textura de Alumínio Escovado e Madeira Nobre */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-25"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Placa metálica de acabamento interno */}
        <div className="relative w-full h-full rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#0c0d10] p-2 sm:p-2.5 flex flex-col justify-between shadow-inner">

          {/* Top Bar Minimalista: Apenas LED Indicador de Alimentação */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse'
                      : 'bg-zinc-700 shadow-none'
                  }`}
                />
                {isPlaying && (
                  <span className="absolute -inset-0.5 rounded-full bg-rose-500/30 animate-ping" />
                )}
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 2. ÁREA CENTRAL: PRATO DE VINIL + BRAÇO COM AGULHA MECÂNICA */}
          {/* ===================================================================== */}
          <div className="relative flex-1 flex items-center justify-center my-0.5">

            {/* 2.1 PRATO DE ALUMÍNIO E DISCO DE VINIL */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
              {/* Borda Externa Metálica com Pontos Estroboscópicos */}
              <div className="absolute inset-0 rounded-full border-[3px] border-zinc-700 bg-zinc-950 shadow-inner flex items-center justify-center">
                <div
                  className="absolute inset-0.5 rounded-full border border-dashed border-zinc-500/30 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at center, transparent 96%, rgba(255,255,255,0.2) 97%)',
                  }}
                />
              </div>

              {/* DISCO DE VINIL 12" GIRATÓRIO */}
              <motion.div
                initial={false}
                animate={{
                  rotate: isPlaying && !shouldReduceMotion ? 360 : 0,
                }}
                transition={{
                  rotate: isPlaying
                    ? { duration: 2.8, repeat: Infinity, ease: 'linear' }
                    : { duration: 0.9, ease: 'easeOut' },
                }}
                className="relative w-[92%] h-[92%] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden"
                style={{
                  background: 'radial-gradient(circle, #1a1a1a 0%, #0d0d0d 38%, #141414 70%, #050505 100%)',
                }}
              >
                {/* Micro-sulcos e Ranhuras Concêntricas do Vinil */}
                <div className="absolute inset-2 rounded-full border border-white/5" />
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <div className="absolute inset-7 rounded-full border border-white/5" />
                <div className="absolute inset-10 rounded-full border border-white/10" />
                <div className="absolute inset-13 rounded-full border border-white/5" />
                <div className="absolute inset-16 rounded-full border border-white/10" />

                {/* Efeito de Reflexo de Luz Especular (Conic Highlight) */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-40"
                  style={{
                    background:
                      'conic-gradient(from 30deg, transparent 0deg, rgba(255,255,255,0.22) 45deg, transparent 90deg, rgba(255,255,255,0.18) 225deg, transparent 270deg)',
                  }}
                />

                {/* SELO CENTRAL DO DISCO (LABEL com Capa ou Monograma) */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-300/60 bg-gradient-to-br from-primary via-primary-dark to-rose-950 flex flex-col items-center justify-center shadow-inner text-center p-1">
                  {hasCover ? (
                    <img
                      src={coverSrc}
                      alt={title || 'Capa do disco'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Music2 size={15} className="text-white drop-shadow-md mb-0.5" />
                      <span className="font-display text-[7px] sm:text-[8px] font-bold text-white leading-tight truncate max-w-[56px]">
                        {title || 'Vinil Romântico'}
                      </span>
                      {artist && (
                        <span className="font-mono text-[6px] text-white/70 leading-tight truncate max-w-[56px]">
                          {artist}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Eixo Central Cromado (Spindle) */}
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 border border-white/60 shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* =================================================================== */}
            {/* 2.2 BRAÇO FONOCAPTOR REALISTA COM AGULHA (TONEARM & STYLUS NEEDLE) */}
            {/* =================================================================== */}
            <div className="absolute top-1 right-2 sm:right-3 w-28 sm:w-36 h-48 sm:h-56 pointer-events-none z-30">
              {/* BASE DO BRAÇO (Gimbal assembly & Pivot) */}
              <div className="absolute top-2 right-4 w-10 h-10 rounded-full border-2 border-zinc-600 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 shadow-lg flex items-center justify-center">
                {/* Contrapeso cilíndrico traseiro (Counterweight) */}
                <div className="absolute -top-3 w-5 h-6 rounded-md bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-600 border border-black/40 shadow-md" />

                {/* Anel de rolamento central */}
                <div className="w-5 h-5 rounded-full border border-amber-300/40 bg-zinc-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                {/* Suporte de Descanso do Braço (Arm Rest com trava) */}
                <div className="absolute top-14 right-1 w-3 h-5 border-l-2 border-b-2 border-zinc-500 rounded-bl-sm opacity-80" />
              </div>

              {/* HASTE DO BRAÇO GIRATÓRIA (TONEARM ROD) COM FÍSICA DE ELEVAÇÃO/QUEDA */}
              <motion.div
                initial={false}
                style={{
                  transformOrigin: 'calc(100% - 24px) 20px',
                }}
                animate={{
                  rotate: tonearmAngle,
                  y: isPlaying ? 0 : -8,
                  scale: isPlaying ? 1 : 0.97,
                }}
                transition={{
                  rotate: {
                    duration: isPlaying ? 0.9 : 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  y: {
                    duration: 0.5,
                    delay: isPlaying ? 0.45 : 0, // Desce a agulha APÓS girar sobre o disco
                    ease: [0.34, 1.56, 0.64, 1], // Efeito mola amortecido ao pousar
                  },
                  scale: {
                    duration: 0.5,
                    delay: isPlaying ? 0.45 : 0,
                  },
                }}
                className="absolute inset-0 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              >
                {/* SVG do Braço Curvado em 'S' de Alta Precisão */}
                <svg
                  viewBox="0 0 140 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    {/* Gradiente Cromado Realista para a Haste */}
                    <linearGradient id="tonearm-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="30%" stopColor="#94a3b8" />
                      <stop offset="60%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                  </defs>

                  {/* Sombra da Haste no Vinil */}
                  <path
                    d="M 116 20 Q 95 70 85 110 Q 75 150 48 185 L 42 195"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="translate-x-1 translate-y-2 blur-[1px]"
                  />

                  {/* Haste Metálica em 'S' (Tonearm Rod) */}
                  <path
                    d="M 116 20 Q 95 70 85 110 Q 75 150 48 185 L 42 195"
                    stroke="url(#tonearm-chrome)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Cabeçote / Cápsula Fonocaptora (Headshell & Cartridge) */}
                  <g transform="translate(42, 195) rotate(-28)">
                    {/* Corpo do Headshell */}
                    <rect
                      x="-7"
                      y="-2"
                      width="14"
                      height="24"
                      rx="3"
                      fill="#1e293b"
                      stroke="#475569"
                      strokeWidth="1"
                    />

                    {/* Cápsula / Cartridge vermelha de alta performance */}
                    <rect
                      x="-5"
                      y="14"
                      width="10"
                      height="8"
                      rx="1.5"
                      fill="#e11d48"
                      stroke="#be123c"
                      strokeWidth="0.5"
                    />

                    {/* Alça do cabeçote (Finger lift) */}
                    <path
                      d="M 7 4 Q 14 6 12 12"
                      stroke="url(#tonearm-chrome)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Agulha de Diamante (Stylus Needle) */}
                    <circle
                      cx="0"
                      cy="23"
                      r="1.5"
                      fill="#ffffff"
                      className={isPlaying ? 'animate-pulse' : ''}
                    />

                    {/* Micro ponto de luz de leitura quando tocando */}
                    {isPlaying && (
                      <circle
                        cx="0"
                        cy="23"
                        r="3.5"
                        fill="#f43f5e"
                        opacity="0.6"
                      />
                    )}
                  </g>
                </svg>
              </motion.div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. PAINEL DE CONTROLE INFERIOR: BOTÃO START/STOP & VU METERS */}
          {/* ===================================================================== */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10 px-1">
            {/* Botão Físico Power / Start-Stop Metálico */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono text-[10px] font-bold tracking-wider transition-all duration-150 cursor-pointer ${
                  isPlaying
                    ? 'border-primary bg-primary/20 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] translate-y-0.5'
                    : 'border-zinc-600 bg-gradient-to-b from-zinc-700 to-zinc-900 text-zinc-300 shadow-md hover:border-zinc-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-zinc-500'}`} />
                <span>{isPlaying ? 'STOP' : 'START'}</span>
              </button>

            </div>

            {/* Medidores Analógicos Estéreo Minimalistas */}
            <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-xl border border-white/10">
              {/* Canal 1 */}
              <div className="relative w-7 h-3.5 rounded bg-amber-950/40 border border-amber-500/20 overflow-hidden flex items-end justify-center">
                <div
                  className="absolute bottom-0 w-0.5 bg-amber-400 origin-bottom transition-all duration-150"
                  style={{
                    height: '85%',
                    transform: `rotate(${effectiveVuLeft - 45}deg)`,
                  }}
                />
              </div>

              {/* Canal 2 */}
              <div className="relative w-7 h-3.5 rounded bg-amber-950/40 border border-amber-500/20 overflow-hidden flex items-end justify-center">
                <div
                  className="absolute bottom-0 w-0.5 bg-amber-400 origin-bottom transition-all duration-150"
                  style={{
                    height: '85%',
                    transform: `rotate(${effectiveVuRight - 45}deg)`,
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
