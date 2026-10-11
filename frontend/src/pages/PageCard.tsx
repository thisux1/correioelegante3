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
import { ReportPageModal } from '@/components/modals/ReportPageModal'
import { PixelHeart } from '@/components/ui/PixelHeart'
import { buildThemeStyle, getThemeAtmosphere } from '@/editor/themes'
import type { PageSummary } from '@/services/pageService'
import { pageService } from '@/services/pageService'

export function PageCard() {
  const { pageId, id } = useParams<{ pageId?: string; id?: string }>()
  const resolvedPageId = pageId || id
  const [page, setPage] = useState<PageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(resolvedPageId))
  const [error, setError] = useState(() => (resolvedPageId ? '' : 'Página não encontrada'))
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Privacidade: Garante que cartas acessíveis por link direto NUNCA sejam indexadas por buscadores (Google/Bing)
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')

    return () => {
      if (created && meta && meta.parentNode) {
        meta.parentNode.removeChild(meta)
      } else if (meta) {
        meta.setAttribute('content', 'index, follow')
      }
    }
  }, [])

  useEffect(() => {
    if (!resolvedPageId) {
      return
    }

    const pageIdToLoad = resolvedPageId
    const abortController = new AbortController()

    async function fetchPageCard() {
      try {
        const loadedPage = await pageService.loadPage(pageIdToLoad)
        if (!abortController.signal.aborted) {
          setPage(loadedPage)
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          const axiosErr = err as { response?: { data?: { error?: string } } }
          setError(axiosErr.response?.data?.error || 'Página não encontrada ou com pagamento pendente')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchPageCard()
    return () => abortController.abort()
  }, [resolvedPageId])

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

  // Páginas geradas (seções presentes, S6+) entram no chrome romantic-OS —
  // mesmo recipient view prometido pela LP e pela /demo.
  const isGenerated = (page.sections?.length ?? 0) > 0
  const windowTitle = recipientName
    ? `para_${recipientName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'voce'}.exe`
    : 'carta.exe'

  const pageFooter = (
    <div className={`mt-8 border-t text-center ${isGenerated ? 'border-[#ffe4ec] pt-6' : 'border-border/40 pt-6'}`}>
      <p className={`mb-2.5 ${isGenerated ? 'font-pixel-ui text-[15px] font-bold text-[#701a35]' : 'text-xs text-text-light'}`}>
        {isGenerated ? 'ESSA PÁGINA FOI FEITA NO CORREIO ELEGANTE' : 'Gostou dessa página mágica?'}
      </p>
      <Link to="/create">
        <button
          type="button"
          className={isGenerated
            ? 'os-btn os-btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 text-sm'
            : 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors'
          }
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>Crie um correio elegante você também</span>
        </button>
      </Link>
      <p className="mt-4">
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="min-h-11 px-3 text-xs text-text-light/70 underline decoration-dotted underline-offset-4 hover:text-text-light transition-colors"
        >
          denunciar esta página
        </button>
      </p>
    </div>
  )

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
        {isGenerated ? (
          <div className="os-window">
            <div className="os-titlebar">
              <PixelHeart className="h-3.5 w-4 shrink-0" color="#ffffff" />
              <span className="min-w-0 flex-1 truncate">{windowTitle}</span>
              <span className="os-caption-btn" aria-hidden="true">×</span>
            </div>
            <div className="p-4 sm:p-8">
              <PageRenderer
                blocks={page.blocks}
                theme={page.theme}
                showAtmosphere={false}
                pageId={page.id}
              />
              {pageFooter}
            </div>
            <div className="os-statusbar">
              <span className="os-sunken flex-1 px-2 py-1 font-pixel-ui text-[13px] text-[#701a35]">
                página interativa — tudo aqui responde a toques
              </span>
            </div>
          </div>
        ) : (
          <CardTilt3D intensity={6}>
            <div className="rounded-3xl border-2 border-border bg-gradient-to-br from-surface to-background p-6 shadow-2xl md:p-8">
              <PageRenderer
                blocks={page.blocks}
                theme={page.theme}
                showAtmosphere={false}
                pageId={page.id}
              />
              {pageFooter}
            </div>
          </CardTilt3D>
        )}

        <ReportPageModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          pageId={page.id}
        />
      </motion.div>
    </div>
  )
}
