import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { BrandLogo } from '@/components/ui/BrandLogo'

export function Footer() {
  return (
    <footer className="relative z-10 pb-6 pt-12 md:pb-8 md:pt-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-white/55 bg-white/92 px-8 py-12 shadow-[0_20px_45px_-26px_rgba(0,0,0,0.24)] supports-[backdrop-filter:blur(0px)]:bg-white/70 supports-[backdrop-filter:blur(0px)]:backdrop-blur-md md:px-12 md:py-16">
          {/* Subtle light layer to enhance the glass */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/10 to-transparent opacity-100 pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between gap-12 lg:flex-row lg:gap-16">
            
            {/* Brand Column */}
            <div className="flex max-w-sm flex-col gap-5">
              <Link to="/" className="group flex w-fit items-center gap-2">
                <BrandLogo size="md" />
              </Link>
              <p className="text-sm leading-relaxed text-text-light">
                Cartas digitais exclusivas entregues por QR Code e link interativo. Porque às vezes um recado afetuoso vale mais que qualquer presente material.
              </p>
              <div className="pt-1">
                <a
                  href="mailto:contato@correioelegante.studio"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#e11d48] hover:underline"
                >
                  <Mail size={15} />
                  contato@correioelegante.studio
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="flex flex-col gap-10 sm:flex-row sm:gap-14 lg:gap-16">
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text/60 font-mono">Navegação</h3>
                <nav className="flex flex-col gap-3">
                  <Link to="/" className="text-sm font-medium text-text-light hover:text-text transition-colors">Início</Link>
                  <Link to="/planos" className="text-sm font-medium text-text-light hover:text-text transition-colors">Planos</Link>
                  <Link to="/create" className="text-sm font-medium text-text-light hover:text-text transition-colors">Escrever Carta</Link>
                  <Link to="/contact" className="text-sm font-medium text-text-light hover:text-text transition-colors">Central de Ajuda</Link>
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text/60 font-mono">Atendimento</h3>
                <div className="flex flex-col gap-2.5 text-xs text-text-light leading-relaxed">
                  <span className="font-semibold text-text">Suporte ao Cliente:</span>
                  <a href="mailto:contato@correioelegante.studio" className="text-primary hover:underline font-mono">
                    contato@correioelegante.studio
                  </a>
                  <span>Segunda a Sábado, 08h às 20h</span>
                  <span className="text-emerald-700 font-medium">Resposta em até 2h úteis</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text/60 font-mono">Legal</h3>
                <nav className="flex flex-col gap-3">
                  <Link to="/legal/terms" className="text-sm font-medium text-text-light hover:text-text transition-colors">Termos de Uso</Link>
                  <Link to="/legal/privacy" className="text-sm font-medium text-text-light hover:text-text transition-colors">Privacidade</Link>
                  <Link to="/legal/cookies" className="text-sm font-medium text-text-light hover:text-text transition-colors">Cookies</Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-14 flex flex-col items-center justify-between gap-6 border-t border-pink-100 pt-8 md:flex-row md:gap-4">
            <p className="text-xs font-medium text-[#701a35]">
              © {new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.
            </p>
            <p className="text-xs text-text-light">
              Plataforma 100% segura para criação e compartilhamento de cartas digitais.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
