import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Card as UICard } from '@/components/ui/Card'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { messageService } from '@/services/messageService'

interface CardData {
  id: string
  message: string
  recipient: string
  mediaUrl?: string
  theme: string
  createdAt: string
}

const themeStyles: Record<string, string> = {
  classic: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
  romantic: 'bg-gradient-to-br from-pink-50 to-fuchsia-50 border-pink-200',
  friendship: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200',
  secret: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
}

export function Card() {
  const { id } = useParams<{ id: string }>()
  const [card, setCard] = useState<CardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shimmer w-16 h-16 bg-primary/10 rounded-2xl" />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6">
        <UICard glass className="text-center max-w-md w-full py-12">
          <Heart className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-text mb-2">
            Ops!
          </h2>
          <p className="text-text-light">{error || 'Cartão não encontrado'}</p>
        </UICard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-lg"
      >
        <CardTilt3D intensity={8}>
          <div
            className={`rounded-3xl p-10 border-2 shadow-2xl ${
              themeStyles[card.theme] || themeStyles.classic
            }`}
          >
            {/* Decorative hearts */}
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                >
                  <Heart className="w-5 h-5 text-primary/40 fill-primary/40" />
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm text-text-light mb-2 font-medium">
              Para:
            </p>
            <p className="text-center font-display text-2xl font-bold text-text mb-8">
              {card.recipient}
            </p>

            <div className="bg-white/60 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <p className="font-cursive text-xl text-text leading-relaxed text-center">
                {card.message}
              </p>
            </div>

            {card.mediaUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={card.mediaUrl}
                  alt="Mídia anexada"
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="text-center pt-4 border-t border-black/5">
              <p className="text-xs text-text-muted mb-1">
                {new Date(card.createdAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-text-muted flex items-center justify-center gap-1">
                💌 Correio Elegante
              </p>
            </div>
          </div>
        </CardTilt3D>
      </motion.div>
    </div>
  )
}
