import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Card as UICard } from '@/components/ui/Card'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { PageRenderer } from '@/editor/components/PageRenderer'
import type { PageSummary } from '@/services/pageService'
import { pageService } from '@/services/pageService'

export function PageCard() {
  const { pageId } = useParams<{ pageId: string }>()
  const [page, setPage] = useState<PageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shimmer w-16 h-16 bg-primary/10 rounded-2xl" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6">
        <UICard glass className="text-center max-w-md w-full py-12">
          <Heart className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-text mb-2">
            Ops!
          </h2>
          <p className="text-text-light">{error || 'Pagina nao encontrada'}</p>
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
        className="w-full max-w-3xl"
      >
        <CardTilt3D intensity={6}>
          <div className="rounded-3xl border-2 border-border bg-gradient-to-br from-surface to-background p-6 shadow-2xl md:p-8">
            <PageRenderer blocks={page.blocks} theme={page.theme} />
          </div>
        </CardTilt3D>
      </motion.div>
    </div>
  )
}
