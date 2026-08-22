import { motion } from 'framer-motion'

interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  withMotion?: boolean
}

export function BrandLogo({
  className = '',
  size = 'md',
  showTagline = false,
  withMotion = true,
}: BrandLogoProps) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  const sealSize = isSm ? 'w-8 h-8' : isLg ? 'w-12 h-12' : 'w-9 h-9'
  const iconSize = isSm ? 14 : isLg ? 22 : 16
  const titleSize = isSm
    ? 'text-lg leading-none'
    : isLg
      ? 'text-2xl sm:text-3xl'
      : 'text-xl'

  const SealEmblem = (
    <div
      className={`relative flex ${sealSize} items-center justify-center rounded-full bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#be123c] text-white shadow-md shadow-rose-500/25 border border-white/50 ring-2 ring-rose-400/20 shrink-0 select-none`}
      aria-hidden="true"
    >
      {/* Borda interna vintage pontilhada */}
      <div className="absolute inset-0.5 rounded-full border border-dashed border-white/40" />

      {/* Ícone de envelope com coração estilizado em SVG vetorial */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-xs"
      >
        {/* Envelope base */}
        <path
          d="M3 6.5C3 5.11929 4.11929 4 5.5 4H18.5C19.8807 4 21 5.11929 21 6.5V17.5C21 18.8807 19.8807 20 18.5 20H5.5C4.11929 20 3 18.8807 3 17.5V6.5Z"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dobra do envelope */}
        <path
          d="M3.5 6L12 12.5L20.5 6"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pequeno coração em relevo no centro */}
        <path
          d="M12 16.5C12 16.5 8.5 14 8.5 11.5C8.5 10 9.8 9 11 10C11.5 10.4 12 11 12 11C12 11 12.5 10.4 13 10C14.2 9 15.5 10 15.5 11.5C15.5 14 12 16.5 12 16.5Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {withMotion ? (
        <motion.div
          whileHover={{ scale: 1.06, rotate: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {SealEmblem}
        </motion.div>
      ) : (
        SealEmblem
      )}

      <div className="flex flex-col text-left">
        <span className={`font-display font-extrabold tracking-tight text-[#4c0519] ${titleSize}`}>
          Correio <span className="bg-gradient-to-r from-[#e11d48] to-[#be123c] bg-clip-text text-transparent">Elegante</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wide text-[#701a35]/80 uppercase">
            Cartas & Homenagens Digitais
          </span>
        )}
      </div>
    </div>
  )
}
