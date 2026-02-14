import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="font-display text-lg font-bold">Correio Elegante</span>
            </div>
            <p className="text-sm text-text-light max-w-xs">
              Envie mensagens especiais para quem você ama. Uma forma digital e elegante de expressar sentimentos.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-text">Links</h4>
            <Link to="/" className="text-sm text-text-light hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/create" className="text-sm text-text-light hover:text-primary transition-colors">
              Escrever Mensagem
            </Link>
            <Link to="/contact" className="text-sm text-text-light hover:text-primary transition-colors">
              Contato
            </Link>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-text">Projeto Escolar</h4>
            <p className="text-sm text-text-light">
              Plataforma desenvolvida para arrecadação de fundos escolares.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.
          </p>
          <p className="text-xs text-text-muted flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-primary fill-primary" /> para você
          </p>
        </div>
      </div>
    </footer>
  )
}
