import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { paymentService } from '@/services/messageService'

interface PaymentData {
  paymentId: string
  qrCode: string
  qrCodeBase64: string
  status: 'pending' | 'paid'
}

export function Payment() {
  const { messageId } = useParams<{ messageId: string }>()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')

  useEffect(() => {
    if (!messageId) return
    const currentMessageId: string = messageId

    async function createPayment() {
      try {
        const response = await paymentService.create(currentMessageId)
        setPaymentData(response.data)
      } catch (err) {
        console.error('Erro ao criar pagamento:', err)
      } finally {
        setIsLoading(false)
      }
    }

    createPayment()
  }, [messageId])

  // Poll payment status
  useEffect(() => {
    if (!messageId || status === 'paid') return

    const interval = setInterval(async () => {
      try {
        const response = await paymentService.getStatus(messageId)
        if (response.data.status === 'paid') {
          setStatus('paid')
          clearInterval(interval)
        }
      } catch { /* ignore */ }
    }, 5000)

    return () => clearInterval(interval)
  }, [messageId, status])

  async function handleCopy() {
    if (paymentData?.qrCode) {
      await navigator.clipboard.writeText(paymentData.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="shimmer w-16 h-16 bg-primary/10 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <Card glass className="text-center">
          {status === 'paid' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8"
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
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <Badge variant="warning" className="mb-4">
                  <Clock size={14} className="mr-1" />
                  Aguardando pagamento
                </Badge>
                <h2 className="font-display text-2xl font-bold text-text mb-2">
                  Pague com Pix
                </h2>
                <p className="text-text-light text-sm">
                  Escaneie o QR Code abaixo ou copie o código Pix
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 inline-block mb-6 shadow-sm">
                <QRCodeSVG
                  value={paymentData?.qrCode || 'placeholder'}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="mb-6">
                <p className="text-xs text-text-muted mb-2">Código Pix Copia e Cola</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  <code className="text-xs text-text-light flex-1 truncate">
                    {paymentData?.qrCode}
                  </code>
                  <button
                    onClick={handleCopy}
                    aria-label={copied ? 'Código copiado' : 'Copiar código Pix'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} className="text-text-light" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Verificando pagamento automaticamente...
              </div>

              <Link to="/create" className="inline-flex mt-6">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} />
                  Voltar
                </Button>
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
