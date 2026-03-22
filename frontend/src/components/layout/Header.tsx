import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Heart, Menu, X, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { MagneticButton } from '@/components/animations/MagneticButton'

const navLinks = [
  { path: '/', label: 'Início' },
  { path: '/create', label: 'Escrever' },
  { path: '/contact', label: 'Contato' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuPanelRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const isEditorRoute = location.pathname.startsWith('/editor')
  const useMobileLiteGlass = isEditorRoute
  const { scrollYProgress } = useScroll()
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 190,
    damping: 30,
    mass: 0.7,
  })
  const progressOpacity = useTransform(smoothScrollProgress, [0, 0.04], [0, 1])
  const progressScale = useTransform(smoothScrollProgress, [0, 1], [0.9, 1])

  const mobileSurfaceClass = useMobileLiteGlass
    ? 'glass border border-primary/12 bg-white/85 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.34)] backdrop-blur-sm'
    : 'glass border border-primary/15 shadow-[0_16px_40px_-22px_rgba(0,0,0,0.35)]'

  const mobilePanelClass = useMobileLiteGlass
    ? 'glass mx-auto w-full max-w-sm rounded-3xl border border-primary/12 bg-white/85 shadow-[0_18px_42px_-24px_rgba(0,0,0,0.38)] backdrop-blur-sm'
    : 'glass mx-auto w-full max-w-sm rounded-3xl border border-primary/15 shadow-[0_20px_45px_-26px_rgba(0,0,0,0.45)]'

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  return (
    <header className="z-40">
      <div className="fixed top-0 left-0 right-0 hidden md:block">
        <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden glass">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-2xl">
            <rect
              width="100%"
              height="100%"
              rx="16"
              ry="16"
              fill="none"
              strokeWidth="4"
              className="stroke-primary/50"
            />
          </svg>

          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
            <Link to="/" className="flex items-center gap-2 group">
              <MagneticButton>
                <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
              </MagneticButton>
              <span className="font-display text-xl font-bold text-text">
                Correio <span className="text-gradient">Elegante</span>
              </span>
              <motion.span
                style={{ opacity: progressOpacity, scale: progressScale }}
                className="inline-flex h-5 w-5 items-center justify-center"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" shapeRendering="geometricPrecision" style={{ transform: 'translateZ(0)' }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-primary/20" />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="text-primary"
                    style={{ pathLength: smoothScrollProgress }}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </motion.span>
            </Link>

            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative text-sm font-medium text-text-light hover:text-text transition-colors"
                >
                  {link.label}
                  {location.pathname === link.path ? (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <User size={16} />
                  Perfil
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-[90] px-4 md:hidden">
        <div className={`relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl ${mobileSurfaceClass}`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Heart className="h-5 w-5 text-primary fill-primary transition-transform group-active:scale-95" />
              <span className="font-display text-base font-bold text-text">Correio Elegante</span>
              <motion.span
                style={{ opacity: progressOpacity, scale: progressScale }}
                className="inline-flex h-4.5 w-4.5 items-center justify-center"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" shapeRendering="geometricPrecision" style={{ transform: 'translateZ(0)' }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-primary/20" />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="text-primary"
                    style={{ pathLength: smoothScrollProgress }}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
              </motion.span>
            </Link>

            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-white/80 text-text backdrop-blur-sm transition-colors hover:bg-primary/10"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setIsMenuOpen(false)}
            className={`fixed inset-0 z-[80] md:hidden ${useMobileLiteGlass ? 'bg-black/18' : 'bg-black/25'}`}
          />

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`fixed inset-x-0 z-[95] px-4 md:hidden ${isEditorRoute ? 'bottom-44' : 'bottom-20'}`}
          >
            <div ref={menuPanelRef} className={mobilePanelClass}>
              <nav className="p-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block w-full rounded-2xl px-4 py-3.5 text-center text-base font-semibold transition-colors ${location.pathname === link.path
                      ? 'bg-primary/12 text-primary'
                      : 'text-text-light hover:bg-black/5'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={isAuthenticated ? '/profile' : '/auth'}
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 block w-full rounded-2xl px-4 py-3.5 text-center text-base font-semibold bg-primary text-white"
                >
                  {isAuthenticated ? 'Perfil' : 'Entrar'}
                </Link>
              </nav>
            </div>
          </motion.div>
        </>
      ) : null}
    </header>
  )
}
