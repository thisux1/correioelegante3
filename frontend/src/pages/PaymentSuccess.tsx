import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { paymentService } from '@/services/messageService'

export function PaymentSuccess() {
  const { messageId } = useParams<{ messageId: string }>()
  const [confirmed, setConfirmed] = useState(false)

  // Aguarda o webhook confirmar o pagamento (pode haver delay do Stripe)
  useEffect(() => {
    if (!messageId) return

    const check = async () => {
      try {
        const res = await paymentService.getStatus(messageId)
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
  }, [messageId])

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <Card glass className="text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-display text-3xl font-bold text-text mb-3">
              Pagamento Confirmado! 🎉
            </h2>
            <p className="text-text-light mb-8">
              Seu correio elegante está pronto para ser compartilhado.
            </p>
            {confirmed ? (
              <div className="flex flex-col gap-3">
                <Link to={`/card/${messageId}`}>
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
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Confirmando pagamento...
              </div>
            )}
          </motion.div>
        </Card>
      </div>
    </div>
  )
}
