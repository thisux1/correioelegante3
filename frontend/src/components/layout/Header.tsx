import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Heart, Menu, X, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { MagneticButton } from '@/components/animations/MagneticButton'

const navLinks = [
  { path: '/', label: 'Início' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden glass">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-2xl">
          <motion.rect
            width="100%"
            height="100%"
            rx="16" // Matches rounded-2xl (16px)
            ry="16"
            fill="none"
            strokeWidth="4"
            className="stroke-primary/50" // Color of the border
            style={{
              pathLength: smoothProgress,
            }}
          />
        </svg>

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-2 group">
            <MagneticButton>
              <Heart
                className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform"
              />
            </MagneticButton>
            <span className="font-display text-xl font-bold text-text">
              Auth <span className="text-gradient">Boilerplate</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm font-medium text-text-light hover:text-text transition-colors"
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
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

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="md:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass mx-4 mt-2 rounded-2xl md:hidden"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-light hover:bg-black/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={isAuthenticated ? '/profile' : '/auth'}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-primary text-white text-center mt-2"
              >
                {isAuthenticated ? 'Perfil' : 'Entrar'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
