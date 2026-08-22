import { Link } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { BrandLogo } from '@/components/ui/BrandLogo'

export function Footer() {
  return (
    <footer className="relative z-10 pb-6 pt-12 md:pb-8 md:pt-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-white/55 bg-white/92 px-8 py-12 shadow-[0_20px_45px_-26px_rgba(0,0,0,0.24)] supports-[backdrop-filter:blur(0px)]:bg-white/70 supports-[backdrop-filter:blur(0px)]:backdrop-blur-md md:px-12 md:py-16">
          {/* Subtle light layer to enhance the glass */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/10 to-transparent opacity-100 pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between gap-12 lg:flex-row lg:gap-24">
            
            {/* Brand Column */}
            <div className="flex max-w-sm flex-col gap-6">
              <Link to="/" className="group flex w-fit items-center gap-2">
                <BrandLogo size="md" />
              </Link>
              <p className="text-sm leading-relaxed text-text-light">
                Cartas digitais exclusivas entregues por QR Code. Porque às vezes um recado afetuoso vale mais que qualquer presente material.
              </p>
            </div>

            {/* Links Columns */}
            <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-24 lg:mr-8">
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text/60">Navegação</h3>
                <nav className="flex flex-col gap-3.5">
                  <Link to="/" className="text-sm font-medium text-text-light hover:text-text transition-colors">Início</Link>
                  <Link to="/create" className="text-sm font-medium text-text-light hover:text-text transition-colors">Escrever</Link>
                  <Link to="/contact" className="text-sm font-medium text-text-light hover:text-text transition-colors">Contato</Link>
                </nav>
              </div>
              
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text/60">Legal</h3>
                <nav className="flex flex-col gap-3.5">
                  <Link to="/legal/terms" className="text-sm font-medium text-text-light hover:text-text transition-colors">Termos de Uso</Link>
                  <Link to="/legal/privacy" className="text-sm font-medium text-text-light hover:text-text transition-colors">Privacidade</Link>
                  <Link to="/legal/cookies" className="text-sm font-medium text-text-light hover:text-text transition-colors">Cookies</Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 flex flex-col items-center justify-between gap-6 border-t border-pink-100 pt-8 md:flex-row md:gap-4">
            <p className="text-xs font-medium text-[#701a35]">
              © {new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
