import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { BrandLogo } from '@/components/ui/BrandLogo'

interface ErrorLayoutProps {
  icon: ReactNode
  badge?: string
  title: string
  description: string
  buttonLabel: string
  onClick?: () => void
  to?: string
  secondaryButtonLabel?: string
  secondaryTo?: string
  onSecondaryClick?: () => void
}

export function ErrorLayout({
  icon,
  badge,
  title,
  description,
  buttonLabel,
  onClick,
  to,
  secondaryButtonLabel,
  secondaryTo,
  onSecondaryClick,
}: ErrorLayoutProps) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center pt-28 pb-20 px-4 bg-gradient-to-b from-[#fff5f7] via-[#fff9fa] to-[#fff5f7]">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white border-2 border-pink-200/80 p-8 sm:p-12 shadow-2xl shadow-rose-500/10 text-center"
        >
          {/* Logo discreto no topo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <BrandLogo size="sm" withMotion={false} />
            </Link>
          </div>

          {/* Ilustração / Ícone do erro */}
          <div className="flex justify-center mb-6">{icon}</div>

          {badge && (
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#e11d48]">
              {badge}
            </div>
          )}

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#4c0519] mb-3 leading-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-[#701a35] max-w-md mx-auto mb-8 leading-relaxed font-sans">
            {description}
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {to ? (
              <Link
                to={to}
                className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-rose-500/25 hover:from-[#f43f5e] hover:to-[#e11d48] hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
              >
                {buttonLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onClick}
                className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-rose-500/25 hover:from-[#f43f5e] hover:to-[#e11d48] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                {buttonLabel}
              </button>
            )}

            {secondaryButtonLabel && secondaryTo && (
              <Link
                to={secondaryTo}
                className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-pink-200 bg-white px-6 py-3 text-sm sm:text-base font-bold text-[#4c0519] hover:bg-rose-50 hover:text-[#e11d48] hover:border-pink-300 transition-all text-center"
              >
                {secondaryButtonLabel}
              </Link>
            )}

            {secondaryButtonLabel && onSecondaryClick && !secondaryTo && (
              <button
                type="button"
                onClick={onSecondaryClick}
                className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-pink-200 bg-white px-6 py-3 text-sm sm:text-base font-bold text-[#4c0519] hover:bg-rose-50 hover:text-[#e11d48] hover:border-pink-300 transition-all cursor-pointer text-center"
              >
                {secondaryButtonLabel}
              </button>
            )}
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
