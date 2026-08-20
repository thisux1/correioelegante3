import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowLeft, Clock, AlertCircle, CreditCard, Smartphone, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/layout/Container'
import { useAuthStore } from '@/store/authStore'
import {
  paymentService,
  type PaymentMethod,
  type PixPaymentResponse,
  type PaymentTarget,
} from '@/services/paymentService'

type Step = 'select' | 'pix' | 'card_redirect' | 'paid'

export function Payment() {
  const location = useLocation()
  const { messageId, pageId } = useParams<{ messageId?: string; pageId?: string }>()
  const [step, setStep] = useState<Step>('select')
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  const isPageFlow = location.pathname.includes('/payment/page')
  const resolvedPageId = pageId || (isPageFlow ? location.pathname.split('/payment/page/')[1]?.split('/')[0]?.split('?')[0] : undefined)
  const resolvedMessageId = messageId || (!isPageFlow ? location.pathname.split('/payment/')[1]?.split('/')[0]?.split('?')[0] : undefined)

  const target = useMemo<PaymentTarget | null>(() => {
    if (isPageFlow) {
      return resolvedPageId ? { resourceType: 'page', resourceId: resolvedPageId } : null
    }

    return resolvedMessageId ? { resourceType: 'message', resourceId: resolvedMessageId } : null
  }, [isPageFlow, resolvedMessageId, resolvedPageId])

  const backHref = isPageFlow && resolvedPageId ? `/editor/${resolvedPageId}` : '/create'

  const cardHref = isPageFlow && resolvedPageId
    ? `/card/page/${resolvedPageId}`
    : resolvedMessageId
      ? `/card/${resolvedMessageId}`
      : '/profile'

  // Polling de status (ativo quando aguardando confirmação do Pix)
  useEffect(() => {
    if (!target || step !== 'pix') return

    const interval = setInterval(async () => {
      try {
        const response = await paymentService.getStatus(target)
        if (response.data.status === 'paid') {
          setStep('paid')
          clearInterval(interval)
        }
      } catch { /* ignorar erros de polling */ }
    }, 4000)

    return () => clearInterval(interval)
  }, [step, target])

  // Countdown de expiração do QR Code Pix
  useEffect(() => {
    if (!pixData?.pixExpiresAt) return

    const expiresAt = new Date(pixData.pixExpiresAt).getTime()
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [pixData?.pixExpiresAt])

  const user = useAuthStore((state) => state.user)
  const isSubscribed = user?.isSubscribed || user?.subscriptionStatus === 'active'

  async function handleSelectMethod(method: PaymentMethod) {
    if (!target) return
    setIsLoading(true)
    setError(null)

    try {
      if (method === 'pix') {
        const response = await paymentService.createPix(target)
        if (response.data.status === 'paid') {
          setStep('paid')
          return
        }
        if (response.data.pixQrCode) {
          setPixData(response.data)
          setStep('pix')
        } else if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl
        } else {
          setError('Não foi possível gerar a chave Pix. Tente novamente.')
        }
      } else {
        const response = await paymentService.createCard(target)
        if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl
        } else {
          setError('Não foi possível iniciar o pagamento com cartão. Tente novamente.')
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao criar pagamento. Tente recarregar a página.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMercadoPagoCheckout() {
    if (!target) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await paymentService.createMercadoPagoCheckout(target)
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl
      } else {
        setError('Não foi possível iniciar o Checkout do Mercado Pago.')
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao iniciar checkout do Mercado Pago.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    if (!pixData?.pixQrCode) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(pixData.pixQrCode)
      } else {
        throw new Error('Clipboard API not available')
      }
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = pixData.pixQrCode
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textArea)
      }
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (!target) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6">
        <Container size="narrow" className="flex justify-center">
          <Card glass className="text-center max-w-md w-full py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-text mb-2">
              Identificador não encontrado
            </h2>
            <p className="text-text-light mb-6">Não foi possível identificar o item para pagamento.</p>
            <Link to="/profile">
              <Button variant="outline" className="w-full">Voltar ao Perfil</Button>
            </Link>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <Container size="narrow" className="max-w-lg mx-auto">
        <Card glass className="text-center">

          {/* ── PAGO ── */}
          {step === 'paid' && (
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
                <Link to={cardHref}>
                  <Button size="lg" className="w-full">Ver Cartão</Button>
                </Link>
                <Link to="/create">
                  <Button variant="ghost" size="md" className="w-full">
                    Enviar outro correio
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── SELECIONAR MÉTODO ── */}
          {step === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-4"
            >
              {isSubscribed ? (
                <div className="mb-8 rounded-2xl border border-primary/20 bg-surface p-6 text-center shadow-sm">
                  <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    <Zap size={13} />
                    Assinatura Ilimitada Ativa
                  </div>
                  <h2 className="font-display text-2xl font-bold text-text">
                    Publicar com seu Plano PRO
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-xs text-text-light">
                    Você tem acesso ilimitado para publicar quantas cartas e páginas desejar sem pagar nada a mais.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => handleSelectMethod('pix')}
                      disabled={isLoading}
                      size="lg"
                      className="w-full font-bold shadow-md shadow-primary/20 text-base"
                    >
                      {isLoading ? 'Publicando...' : '✨ Publicar Agora Gratuitamente'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 rounded-2xl border border-border bg-surface p-4 text-left shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                          <Zap size={13} /> Economize com o Plano Ilimitado
                        </span>
                        <p className="mt-0.5 text-xs text-text font-medium">
                          Assine por <strong>R$ 15,00/mês</strong> e crie quantas cartas quiser por 30 dias!
                        </p>
                      </div>
                      <Link to="/planos" className="shrink-0">
                        <Button size="sm" variant="outline" className="text-xs font-bold border-primary/40 text-primary hover:bg-primary hover:text-white">
                          Ver Planos
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="font-display text-2xl font-bold text-text mb-2">
                      Como deseja pagar?
                    </h2>
                    <p className="text-text-light text-sm">
                      Pagamento avulso: <span className="font-semibold text-text">R$ 4,99</span>
                    </p>
                  </div>
                </>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-6 flex items-start gap-2.5 text-left"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug flex-1">{error}</span>
                </motion.div>
              )}

              <div className="flex flex-col gap-4 mb-6">
                <button
                  onClick={() => handleSelectMethod('pix')}
                  disabled={isLoading}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-transparent bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Pix</p>
                    <p className="text-sm text-text-light">Pagamento instantâneo via QR Code</p>
                  </div>
                  {isLoading && (
                    <div className="ml-auto w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>

                <button
                  onClick={() => handleSelectMethod('credit_card')}
                  disabled={isLoading}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-transparent bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Cartão de Crédito (Stripe)</p>
                    <p className="text-sm text-text-light">Visa, Mastercard, Elo e outros</p>
                  </div>
                  {isLoading && (
                    <div className="ml-auto w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>

                <button
                  onClick={handleMercadoPagoCheckout}
                  disabled={isLoading}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-transparent bg-sky-50 hover:border-sky-400 hover:bg-sky-100 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Mercado Pago (Checkout Pro)</p>
                    <p className="text-sm text-text-light">Teste com Cartões de Teste Sandbox</p>
                  </div>
                  {isLoading && (
                    <div className="ml-auto w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>

              <Link to={backHref} className="inline-flex mt-2">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} />
                  Voltar
                </Button>
              </Link>
            </motion.div>
          )}

          {/* ── PIX QR CODE ── */}
          {step === 'pix' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
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

              <div className="bg-white rounded-3xl p-6 inline-flex flex-col items-center justify-center mb-6 shadow-sm border border-gray-100">
                {pixData?.pixQrCodeBase64 ? (
                  <img
                    src={`data:image/png;base64,${pixData.pixQrCodeBase64}`}
                    alt="QR Code Pix"
                    width={220}
                    height={220}
                    className="rounded-xl"
                  />
                ) : (
                  <QRCodeSVG
                    value={pixData?.pixQrCode || ''}
                    size={220}
                    level="H"
                    includeMargin
                  />
                )}
                <span className="text-[11px] text-text-muted mt-3 font-medium">
                  Aponte a câmera do seu banco para pagar
                </span>
              </div>

              <div className="mb-6 text-left">
                <label htmlFor="pix-copia-e-cola" className="block text-xs font-semibold text-text-muted mb-2">
                  Ou pague com o Pix Copia e Cola:
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2.5 mb-3 focus-within:ring-2 focus-within:ring-primary/30">
                  <input
                    id="pix-copia-e-cola"
                    type="text"
                    readOnly
                    value={pixData?.pixQrCode || ''}
                    onFocus={(e) => e.target.select()}
                    onClick={handleCopy}
                    className="text-xs text-text-light font-mono bg-transparent flex-1 outline-none truncate cursor-pointer select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? 'Código copiado' : 'Copiar código Pix'}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      copied ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-200 text-text-light'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <Button
                  onClick={handleCopy}
                  className={`w-full gap-2 font-medium ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : ''
                  }`}
                  size="md"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Código Pix Copiado com Sucesso!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copiar Código Pix
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-text-muted mb-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Verificando pagamento automaticamente...
              </div>

              {secondsLeft !== null && (
                <div className="text-center text-sm mb-6">
                  {secondsLeft > 0 ? (
                    <span className="text-text-light">
                      O QR Code expira em{' '}
                      <span className="font-semibold text-text">
                        {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                      </span>
                    </span>
                  ) : (
                    <span className="text-rose-500">
                      Este QR Code expirou. Volte e gere um novo pagamento.
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep('select')}
                className="inline-flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
              >
                <ArrowLeft size={16} />
                Escolher outro método
              </button>
            </motion.div>
          )}

        </Card>
      </Container>
    </div>
  )
}
