import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SuccessPageSkeleton } from '@/components/ui/SuccessPageSkeleton'
import { paymentService, type PaymentTarget } from '@/services/paymentService'

export interface PaymentSuccessProps {
  isLoading?: boolean
}

export function PaymentSuccess({ isLoading }: PaymentSuccessProps = {}) {
  const location = useLocation()
  const { messageId, pageId } = useParams<{ messageId?: string; pageId?: string }>()
  const [confirmed, setConfirmed] = useState(false)

  const isPageFlow = location.pathname.includes('/payment/page')
  const resolvedPageId = pageId || (isPageFlow ? location.pathname.split('/payment/page/')[1]?.split('/')[0]?.split('?')[0] : undefined)
  const resolvedMessageId = messageId || (!isPageFlow ? location.pathname.split('/payment/')[1]?.split('/')[0]?.split('?')[0] : undefined)

  const target = useMemo<PaymentTarget | null>(() => {
    if (isPageFlow) {
      return resolvedPageId ? { resourceType: 'page', resourceId: resolvedPageId } : null
    }

    return resolvedMessageId ? { resourceType: 'message', resourceId: resolvedMessageId } : null
  }, [isPageFlow, resolvedMessageId, resolvedPageId])

  const cardHref = isPageFlow && resolvedPageId
    ? `/card/page/${resolvedPageId}`
    : resolvedMessageId
      ? `/card/${resolvedMessageId}`
      : '/profile'

  // Aguarda o webhook confirmar o pagamento (pode haver delay do Stripe)
  useEffect(() => {
    if (!target) return

    const check = async () => {
      try {
        const res = await paymentService.getStatus(target)
        if (res.data.status === 'paid') {
          setConfirmed(true)
          return true
        }
      } catch { /* ignorar */ }
      return false
    }

    let tries = 0
    const interval = setInterval(async () => {
      const done = await check()
      if (done || tries++ > 10) clearInterval(interval)
    }, 2000)

    check()
    return () => clearInterval(interval)
  }, [target])

  if (isLoading) {
    return <SuccessPageSkeleton />
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <Card glass className="text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-600">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="font-display text-3xl font-bold text-text mb-3">
              Pagamento Confirmado
            </h2>
            <p className="text-text-light mb-8">
              Seu correio elegante está pronto para ser compartilhado.
            </p>

            {confirmed ? (
              <div className="flex flex-col gap-3">
                <Link to={cardHref}>
                  <Button size="lg" className="w-full">Ver Cartão</Button>
                </Link>
                <Link to="/create">
                  <Button variant="ghost" size="md" className="w-full">
                    Enviar outro correio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <Loader2 size={16} className="animate-spin shrink-0 aspect-square text-primary" />
                Confirmando pagamento...
              </div>
            )}
          </motion.div>
        </Card>
      </div>
    </div>
  )
}
