import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { PageCardSkeleton } from '@/components/ui/PageCardSkeleton'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { AtmosphereCanvas } from '@/components/animations/AtmosphereCanvas'
import { EnvelopeUnboxing } from '@/components/animations/EnvelopeUnboxing'
import { PageRenderer } from '@/editor/components/PageRenderer'
import { buildThemeStyle, getThemeAtmosphere } from '@/editor/themes'
import type { PageSummary } from '@/services/pageService'
import { pageService } from '@/services/pageService'

export function PageCard() {
  const { pageId } = useParams<{ pageId: string }>()
  const [page, setPage] = useState<PageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false)

  useEffect(() => {
    if (!pageId) {
      setError('Pagina nao encontrada')
      setIsLoading(false)
      return
    }

    const abortController = new AbortController()

    async function fetchPageCard() {
      if (!pageId) {
        return
      }

      try {
        const loadedPage = await pageService.loadPage(pageId)
        if (!abortController.signal.aborted) {
          setPage(loadedPage)
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          const axiosErr = err as { response?: { data?: { error?: string } } }
          setError(axiosErr.response?.data?.error || 'Pagina nao encontrada ou pagamento pendente')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchPageCard()
    return () => abortController.abort()
  }, [pageId])

  useEffect(() => {
    if (!page) {
      document.title = 'Correio Elegante'
      return
    }

    const firstTextBlock = page.blocks.find((b) => b.type === 'text')
    const rawText =
      firstTextBlock && 'text' in firstTextBlock.props
        ? (firstTextBlock.props as { text: string }).text
        : ''
    const cleanSnippet = rawText.trim().replace(/\s+/g, ' ').slice(0, 40)

    if (cleanSnippet) {
      document.title = `Correio Elegante — ${cleanSnippet}`
    } else {
      document.title = 'Correio Elegante — Mensagem Especial'
    }

    return () => {
      document.title = 'Correio Elegante'
    }
  }, [page])

  if (isLoading) {
    return <PageCardSkeleton maxWidth="3xl" />
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 bg-gradient-to-b from-[#fff5f7] via-[#fff9fa] to-[#fff5f7]">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white border-2 border-pink-200/80 p-8 sm:p-12 shadow-2xl shadow-rose-500/10 text-center"
        >
          <div className="flex justify-center mb-6">
            <Link to="/">
              <BrandLogo size="md" />
            </Link>
          </div>

          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-pink-100/70 border border-pink-200 text-[#e11d48]">
            <Heart className="w-10 h-10 text-[#e11d48]" strokeWidth={1.75} />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#4c0519] mb-3 leading-tight">
            Carta não disponível
          </h2>

          <p className="text-sm sm:text-base text-[#701a35] max-w-md mx-auto mb-8 leading-relaxed font-sans">
            {error || 'Esta carta ainda não foi publicada ou o endereço de acesso está incorreto.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/create"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#be123c] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:from-[#f43f5e] hover:to-[#e11d48] hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              Escrever Minha Carta
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-pink-200 bg-white px-6 py-3 text-sm font-bold text-[#4c0519] hover:bg-rose-50 hover:text-[#e11d48] hover:border-pink-300 transition-all text-center"
            >
              Ir para o Início
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const atmosphere = getThemeAtmosphere(page.theme)

  // Extrai informações do envelope/destinatário dos blocos da carta
  const envelopeBlock = page.blocks.find((b) => b.type === 'envelope')
  const envelopeProps = envelopeBlock && 'recipientName' in envelopeBlock.props
    ? (envelopeBlock.props as { recipientName?: string; senderName?: string })
    : undefined

  const recipientName = envelopeProps?.recipientName
  const senderName = envelopeProps?.senderName

  return (
    <div
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden"
      style={buildThemeStyle(page.theme)}
    >
      <AtmosphereCanvas atmosphere={atmosphere} position="fixed" />

      {/* Ritual de Abertura do Envelope em Tela Cheia */}
      {!isEnvelopeOpened && (
        <EnvelopeUnboxing
          recipientName={recipientName}
          senderName={senderName}
          theme={page.theme}
          onOpenComplete={() => setIsEnvelopeOpened(true)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12, filter: 'blur(4px)' }}
        animate={{
          opacity: isEnvelopeOpened ? 1 : 0,
          scale: isEnvelopeOpened ? 1 : 0.96,
          y: isEnvelopeOpened ? 0 : 12,
          filter: isEnvelopeOpened ? 'blur(0px)' : 'blur(4px)',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl relative z-10"
      >
        <CardTilt3D intensity={6}>
          <div className="rounded-3xl border-2 border-border bg-gradient-to-br from-surface to-background p-6 shadow-2xl md:p-8">
            <PageRenderer blocks={page.blocks} theme={page.theme} showAtmosphere={false} />

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <p className="text-xs text-text-light mb-2.5">
                Gostou dessa página mágica?
              </p>
              <Link to="/create">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Crie um correio elegante você também</span>
                </button>
              </Link>
            </div>
          </div>
        </CardTilt3D>
      </motion.div>
    </div>
  )
}
