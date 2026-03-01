import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="relative py-8 px-6 mt-12 mb-6">
      <div className="max-w-7xl mx-auto glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 opacity-50 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6 text-primary fill-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-text">Correio Elegante</span>
            </Link>
            <p className="text-sm text-text-light max-w-xs leading-relaxed">
              Envie mensagens especiais para quem você ama. Uma forma digital e elegante de expressar sentimentos.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Navegação</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                Início
              </Link>
              <Link to="/create" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                Escrever Mensagem
              </Link>
              <Link to="/contact" className="text-sm text-text-light hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                Contato
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Sobre o projeto</h3>
            <p className="text-sm text-text-light bg-white/40 p-4 rounded-xl border border-white/40">
              Originalmente um projeto escolar desenvolvido para arrecadação de fundos. 
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-xs text-text-muted font-medium">
            © {new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.
          </p>
          <p className="text-xs text-text-muted flex items-center gap-1 font-medium bg-white/30 px-3 py-1 rounded-full border border-white/20">
            Feito com <Heart className="w-3 h-3 text-primary fill-primary animate-pulse" /> para você
          </p>
        </div>
      </div>
    </footer>
  )
}
