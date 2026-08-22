import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Heart, Mail } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { BrandLogo } from '@/components/ui/BrandLogo'

export function Error404() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    // Se o usuário colou uma URL completa ou um ID
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed)
        navigate(url.pathname)
        return
      } catch {
        // segue para busca como rota relativa
      }
    }

    if (trimmed.startsWith('/')) {
      navigate(trimmed)
    } else if (trimmed.length === 24 || trimmed.length === 36 || trimmed.includes('-')) {
      navigate(`/card/page/${trimmed}`)
    } else {
      navigate(`/create`)
    }
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

          {/* Ilustração Editorial do Envelope Extraviado */}
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
            {/* Aura de fundo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-200/50 via-rose-100/40 to-amber-100/30 blur-xl" />

            {/* Envelope estilizado em relevo */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff5f7] to-[#ffe4ec] border-2 border-pink-200 text-[#e11d48] shadow-md">
              <Mail className="w-12 h-12 text-[#e11d48]" strokeWidth={1.75} />

              {/* Carimbo postal vintage circular no canto */}
              <div
                className="absolute -top-3 -right-3 flex h-10 w-10 rotate-12 items-center justify-center rounded-full bg-[#e11d48] text-white shadow-md border-2 border-white text-[9px] font-mono font-bold tracking-tighter"
                title="Selo Postal 404"
              >
                404
              </div>
            </div>
          </div>

          {/* Título & Mensagem Afetuosa */}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#4c0519] mb-3 leading-tight">
            Esta carta se perdeu no caminho
          </h1>

          <p className="text-sm sm:text-base text-[#701a35] max-w-md mx-auto mb-8 leading-relaxed font-sans">
            Não conseguimos localizar esta página ou homenagem. O link pode ter sido arquivado, expirado ou digitado com o coração um pouquinho acelerado demais.
          </p>

          {/* Busca Rápida de Link / Código de Carta */}
          <form
            onSubmit={handleSearchSubmit}
            className="mb-8 mx-auto max-w-md"
          >
            <div className="flex items-center gap-2 rounded-2xl border-2 border-pink-200 bg-[#fff5f8] p-1.5 focus-within:border-[#e11d48] focus-within:ring-2 focus-within:ring-rose-400/20 transition-all">
              <Search size={18} className="text-[#701a35] ml-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cole o link ou código da sua carta..."
                className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm font-medium text-[#4c0519] placeholder:text-[#701a35]/50 outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#e11d48] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#be123c] transition-colors cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Botões Principais de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to="/create"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-rose-500/25 hover:from-[#f43f5e] hover:to-[#e11d48] hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              <Heart size={18} className="fill-white" />
              <span>Escrever uma Carta</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-white px-6 py-3 text-sm sm:text-base font-bold text-[#4c0519] hover:bg-rose-50 hover:text-[#e11d48] hover:border-pink-300 transition-all text-center"
            >
              <span>Voltar ao Início</span>
            </Link>
          </div>

          {/* Atalhos Rápidos Úteis */}
          <div className="pt-6 border-t border-pink-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#701a35]">
            <Link to="/planos" className="hover:text-[#e11d48] transition-colors">
              Planos & Preços
            </Link>
            <span className="text-pink-300">•</span>
            <Link to="/contact" className="hover:text-[#e11d48] transition-colors">
              Central de Ajuda & Contato
            </Link>
            <span className="text-pink-300">•</span>
            <Link to="/legal/terms" className="hover:text-[#e11d48] transition-colors">
              Termos de Uso
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
