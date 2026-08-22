import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Shield, LogIn } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { BrandLogo } from '@/components/ui/BrandLogo'

export function ErrorSession() {
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

          {/* Ilustração Editorial do Lacre de Segurança */}
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
            {/* Aura suave de fundo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-300/40 via-rose-200/30 to-amber-100/40 blur-xl" />

            {/* Ícone de envelope protegido com cadeado */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff5f7] to-[#ffe4ec] border-2 border-pink-200 text-[#e11d48] shadow-md">
              <Lock className="w-12 h-12 text-[#e11d48]" strokeWidth={1.75} />

              {/* Carimbo postal vintage circular no canto */}
              <div
                className="absolute -top-3 -right-3 flex h-10 w-10 rotate-12 items-center justify-center rounded-full bg-[#e11d48] text-white shadow-md border-2 border-white text-[9px] font-mono font-bold tracking-tighter"
                title="Proteção de Privacidade"
              >
                LOCK
              </div>
            </div>
          </div>

          {/* Título & Mensagem */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#4c0519] mb-3 leading-tight">
            O lacre de segurança foi fechado
          </h1>

          <p className="text-sm sm:text-base text-[#701a35] max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Para garantir o sigilo das suas cartas e mensagens especiais, encerramos sua sessão após um período de inatividade. Faça login novamente para continuar escrevendo.
          </p>

          {/* Selo de Privacidade */}
          <div className="mb-8 mx-auto inline-flex items-center gap-2 rounded-xl bg-pink-50 border border-pink-200/60 px-3.5 py-1.5 text-xs font-semibold text-[#701a35]">
            <Shield size={16} className="text-[#e11d48]" />
            <span>Suas cartas e rascunhos continuam salvos e intactos</span>
          </div>

          {/* Botões Principais de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to="/auth"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-rose-500/25 hover:from-[#f43f5e] hover:to-[#e11d48] hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              <LogIn size={18} />
              <span>Entrar na Minha Conta</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-white px-6 py-3 text-sm sm:text-base font-bold text-[#4c0519] hover:bg-rose-50 hover:text-[#e11d48] hover:border-pink-300 transition-all text-center"
            >
              <span>Voltar ao Início</span>
            </Link>
          </div>

          {/* Atalhos */}
          <div className="pt-6 border-t border-pink-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#701a35]">
            <Link to="/create" className="hover:text-[#e11d48] transition-colors">
              Criar Nova Carta
            </Link>
            <span className="text-pink-300">•</span>
            <Link to="/contact" className="hover:text-[#e11d48] transition-colors">
              Suporte & Ajuda
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
