import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw, ArrowRight, ShieldCheck, MessageSquare, Copy, Check } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { BrandLogo } from '@/components/ui/BrandLogo'

interface Error500Props {
  onRetry?: () => void
  errorDetails?: string
}

export function Error500({ onRetry, errorDetails }: Error500Props) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    if (onRetry) {
      try {
        onRetry()
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      window.location.reload()
    }, 400)
  }

  const handleCopyDetails = () => {
    const textToCopy = errorDetails || `Timestamp: ${new Date().toISOString()} - Erro de Renderização / Servidor`
    void navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center pt-28 pb-20 px-4 bg-gradient-to-b from-[#fff5f7] via-[#fff9fa] to-[#fff5f7]">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white border-2 border-pink-200/80 p-6 sm:p-10 md:p-12 shadow-2xl shadow-rose-500/10 text-center"
        >
          {/* Logo no topo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <BrandLogo size="md" />
            </Link>
          </div>

          {/* Ilustração Editorial de Tinta / Instabilidade */}
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
            {/* Aura suave de fundo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-300/40 via-amber-200/30 to-pink-200/40 blur-xl" />

            {/* Ícone de envelope com selo de recarregamento */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff5f7] to-[#ffe4ec] border-2 border-pink-200 text-[#e11d48] shadow-md">
              <RefreshCw
                className={`w-12 h-12 text-[#e11d48] ${isRetrying ? 'animate-spin' : ''}`}
                strokeWidth={1.75}
              />

              {/* Carimbo postal vintage circular no canto */}
              <div
                className="absolute -top-3 -right-3 flex h-10 w-10 rotate-12 items-center justify-center rounded-full bg-[#be123c] text-white shadow-md border-2 border-white text-[9px] font-mono font-bold tracking-tighter"
                title="Status 500"
              >
                500
              </div>
            </div>
          </div>

          {/* Título & Mensagem */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#4c0519] mb-3 leading-tight">
            A tinta borrou um pouquinho...
          </h1>

          <p className="text-sm sm:text-base text-[#701a35] max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Tivemos uma breve oscilação na conexão ou no carregamento desta página. Não se preocupe: suas cartas e rascunhos continuam salvos e em segurança.
          </p>

          {/* Selo de Segurança de Dados */}
          <div className="mb-8 mx-auto inline-flex items-center gap-2 rounded-xl bg-pink-50 border border-pink-200/60 px-3.5 py-1.5 text-xs font-semibold text-[#701a35]">
            <ShieldCheck size={16} className="text-[#e11d48]" />
            <span>Seus dados e cartas continuam 100% protegidos</span>
          </div>

          {/* Botões Principais de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-rose-500/25 hover:from-[#f43f5e] hover:to-[#e11d48] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 transition-all cursor-pointer text-center"
            >
              <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
              <span>{isRetrying ? 'Recarregando...' : 'Recarregar e Tentar Novamente'}</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-white px-6 py-3 text-sm sm:text-base font-bold text-[#4c0519] hover:bg-rose-50 hover:text-[#e11d48] hover:border-pink-300 transition-all text-center"
            >
              <span>Voltar ao Início</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Detalhes Técnicos / Ajuda */}
          <div className="pt-6 border-t border-pink-100 flex flex-col items-center gap-3 text-xs text-[#701a35]">
            <div className="flex items-center gap-4">
              <Link to="/contact" className="inline-flex items-center gap-1.5 font-medium hover:text-[#e11d48] transition-colors">
                <MessageSquare size={14} />
                <span>Falar com o Suporte</span>
              </Link>
              <span className="text-pink-300">•</span>
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="font-medium hover:text-[#e11d48] transition-colors cursor-pointer"
              >
                {showTechnicalDetails ? 'Ocultar Detalhes' : 'Detalhes Técnicos'}
              </button>
            </div>

            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="w-full mt-2 rounded-xl bg-[#fff5f8] border border-pink-200 p-3 text-left font-mono text-[11px] text-[#4c0519] relative"
              >
                <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold text-[#701a35]/70">
                  <span>Código de Diagnóstico</span>
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="flex items-center gap-1 text-[#e11d48] hover:underline cursor-pointer"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="break-all">{errorDetails || `HTTP 500 / Memory Eviction Auto-Handler: ${window.location.pathname}`}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
