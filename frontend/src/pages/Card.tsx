import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { PageCardSkeleton } from '@/components/ui/PageCardSkeleton'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { AtmosphereCanvas } from '@/components/animations/AtmosphereCanvas'
import { EnvelopeUnboxing } from '@/components/animations/EnvelopeUnboxing'
import { messageService } from '@/services/messageService'
import type { PageStatus, PageVisibility } from '@/editor/types'
import { buildThemeStyle, getThemeAtmosphere, resolveThemeId } from '@/editor/themes'

interface CardData {
  id: string
  message: string
  recipient: string
  mediaUrl?: string
  theme: string
  status: PageStatus
  visibility: PageVisibility
  publishedAt: string | null
  createdAt: string
}

export function Card() {
  const { id } = useParams<{ id: string }>()
  const [card, setCard] = useState<CardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false)

  useEffect(() => {
    if (!id) return

    const abortController = new AbortController()

    async function fetchCard() {
      try {
        const response = await messageService.getPublicCard(id!)
        if (!abortController.signal.aborted) {
          setCard(response.data.message)
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          const axiosErr = err as { response?: { data?: { error?: string } } }
          setError(axiosErr.response?.data?.error || 'Cartão não encontrado ou pagamento pendente')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchCard()
    return () => abortController.abort()
  }, [id])

  useEffect(() => {
    if (card?.recipient) {
      document.title = `Correio Elegante — Para ${card.recipient}`
    } else {
      document.title = 'Correio Elegante'
    }
    return () => {
      document.title = 'Correio Elegante'
    }
  }, [card])

  if (isLoading) {
    return <PageCardSkeleton maxWidth="lg" />
  }

  if (error || !card) {
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
            Cartão não disponível
          </h2>

          <p className="text-sm sm:text-base text-[#701a35] max-w-md mx-auto mb-8 leading-relaxed font-sans">
            {error || 'Este cartão ainda não está disponível ou o link informado está incorreto.'}
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

  const atmosphere = getThemeAtmosphere(card.theme)

  return (
    <div
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden"
      style={buildThemeStyle(resolveThemeId(card.theme))}
    >
      <AtmosphereCanvas atmosphere={atmosphere} position="fixed" />

      {/* Ritual de Abertura do Envelope em Tela Cheia */}
      {!isEnvelopeOpened && (
        <EnvelopeUnboxing
          recipientName={card.recipient}
          theme={card.theme}
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
        className="w-full max-w-lg relative z-10"
      >
        <CardTilt3D intensity={6}>
          <div className="rounded-3xl border-2 border-pink-300/80 bg-white p-8 sm:p-10 shadow-2xl shadow-rose-900/10">
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.2, delay: i * 0.25, repeat: Infinity }}
                >
                  <Heart className="w-5 h-5 text-[#e11d48]/40 fill-[#e11d48]/40" />
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs sm:text-sm text-[#701a35] mb-1 font-semibold uppercase tracking-wider">
              Para
            </p>
            <p className="text-center font-display text-3xl sm:text-4xl font-extrabold text-[#4c0519] mb-8">
              {card.recipient}
            </p>

            <div className="mb-8 rounded-2xl border-2 border-pink-200/80 bg-[#fffafc] p-6 sm:p-8 shadow-xs">
              <p className="font-serif italic text-xl sm:text-2xl text-[#4c0519] leading-relaxed text-center font-medium">
                "{card.message}"
              </p>
            </div>

            {card.mediaUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-md border-2 border-pink-200/60 polaroid-frame">
                <img
                  src={card.mediaUrl}
                  alt="Mídia anexada"
                  className="w-full object-cover rounded-xl"
                />
              </div>
            )}

            <div className="text-center pt-5 border-t border-pink-100">
              <p className="text-xs text-[#701a35] mb-1.5 font-medium">
                {new Date(card.createdAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-[#be123c] flex items-center justify-center gap-1.5 font-bold">
                <Heart className="w-3.5 h-3.5 text-[#e11d48] fill-[#e11d48]" />
                <span>Correio Elegante • Edição Exclusiva</span>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-pink-200/80 text-center">
              <p className="text-xs font-semibold text-[#701a35] mb-3">
                Gostou dessa homenagem inesquecível?
              </p>
              <Link to="/create">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Envie uma carta especial também</span>
                </button>
              </Link>
            </div>
          </div>
        </CardTilt3D>
      </motion.div>
    </div>
  )
}
