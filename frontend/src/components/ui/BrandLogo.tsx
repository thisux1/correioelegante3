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

  const iconContainerSize = isSm ? 'w-7 h-7' : isLg ? 'w-10 h-10' : 'w-8 h-8'
  const iconSize = isSm ? 16 : isLg ? 22 : 18
  const titleSize = isSm
    ? 'text-base sm:text-lg'
    : isLg
      ? 'text-2xl sm:text-3xl'
      : 'text-lg sm:text-xl'

  const MinimalistIcon = (
    <div
      className={`relative flex ${iconContainerSize} items-center justify-center rounded-xl bg-pink-100/60 text-[#e11d48] border border-pink-200/70 shrink-0 transition-colors duration-200 group-hover:bg-rose-100 group-hover:border-rose-300`}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Envelope minimalist frame */}
        <rect
          x="3"
          y="5.5"
          width="18"
          height="13"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Fold line */}
        <path
          d="M3.5 7L10.5 12.2C11.4 12.9 12.6 12.9 13.5 12.2L20.5 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Minimal dot/heart accent */}
        <circle cx="12" cy="15.5" r="1" fill="currentColor" />
      </svg>
    </div>
  )

  return (
    <div className={`group inline-flex items-center gap-2.5 select-none ${className}`}>
      {withMotion ? (
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {MinimalistIcon}
        </motion.div>
      ) : (
        MinimalistIcon
      )}

      <div className="flex flex-col text-left">
        <span className={`font-display font-bold tracking-tight text-[#4c0519] ${titleSize}`}>
          Correio <span className="font-serif italic font-normal text-[#e11d48]">Elegante</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wider text-[#701a35]/70 uppercase">
            Cartas Digitais
          </span>
        )}
      </div>
    </div>
  )
}
