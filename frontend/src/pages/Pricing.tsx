import { useState, useEffect, useRef } from 'react'

import { useNavigate, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  Check,
  Sparkles,
  Zap,
  CreditCard,
  Smartphone,
  Copy,
  Clock,
  HelpCircle,
  ShieldCheck,
  Infinity as InfinityIcon,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Container } from '@/components/layout/Container'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { Turnstile, type TurnstileRef } from '@/components/ui/Turnstile'
import { PricingPageSkeleton } from '@/components/ui/PricingPageSkeleton'
import { useAuthStore } from '@/store/authStore'
import { paymentService, type PixPaymentResponse } from '@/services/paymentService'

export interface PricingProps {
  isLoading?: boolean
}

export function Pricing({ isLoading: propIsLoading = false }: PricingProps = {}) {
  const navigate = useNavigate()
  const { isAuthenticated, user, refreshUser } = useAuthStore()

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'pix' | 'success'>('select')
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMethod, setLoadingMethod] = useState<'pix' | 'credit_card' | 'mercadopago_checkout' | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileRef>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)



  const isSubscribed = user?.isSubscribed || user?.subscriptionStatus === 'active'

  // Polling de aprovação da assinatura
  useEffect(() => {
    if (checkoutStep !== 'pix' || !isCheckoutModalOpen) return

    const interval = setInterval(async () => {
      try {
        const { data } = await paymentService.getSubscriptionStatus()
        if (data.isSubscribed) {
          setCheckoutStep('success')
          await refreshUser()
          clearInterval(interval)
          setTimeout(() => {
            navigate('/planos/sucesso')
          }, 1500)
        }
      } catch {
        // Ignora erros momentâneos de polling
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [checkoutStep, isCheckoutModalOpen, navigate, refreshUser])

  // Countdown do Pix
  useEffect(() => {
    if (!pixData?.pixExpiresAt) return

    const expiresAt = new Date(pixData.pixExpiresAt).getTime()
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [pixData?.pixExpiresAt])

  const handleOpenSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/planos')
      return
    }
    setError(null)
    setCheckoutStep('select')
    setIsCheckoutModalOpen(true)
  }

  const handleStartPix = async () => {
    setIsLoading(true)
    setLoadingMethod('pix')
    setError(null)
    try {
      const { data } = await paymentService.createSubscriptionPix(turnstileToken || undefined)
      setPixData(data)
      setCheckoutStep('pix')
    } catch (err: unknown) {
      turnstileRef.current?.reset()
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao gerar Pix da assinatura. Tente novamente.')
    } finally {
      setIsLoading(false)
      setLoadingMethod(null)
    }
  }

  const handleStartCardStripe = async () => {
    setIsLoading(true)
    setLoadingMethod('credit_card')
    setError(null)
    try {
      const { data } = await paymentService.createSubscriptionCard(turnstileToken || undefined)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError('Não foi possível redirecionar para o pagamento seguro no momento.')
      }
    } catch (err: unknown) {
      turnstileRef.current?.reset()
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao iniciar pagamento com cartão.')
    } finally {
      setIsLoading(false)
      setLoadingMethod(null)
    }
  }

  const handleStartMercadoPago = async () => {
    setIsLoading(true)
    setLoadingMethod('mercadopago_checkout')
    setError(null)
    try {
      const { data } = await paymentService.createSubscriptionMercadoPagoCheckout(turnstileToken || undefined)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError('Não foi possível abrir o Checkout do Mercado Pago.')
      }
    } catch (err: unknown) {
      turnstileRef.current?.reset()
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao iniciar Checkout do Mercado Pago.')
    } finally {
      setIsLoading(false)
      setLoadingMethod(null)
    }
  }



  const handleCopyPix = async () => {
    if (!pixData?.pixQrCode) return
    try {
      await navigator.clipboard.writeText(pixData.pixQrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback manual
    }
  }

  const handleSimulate = async () => {
    setIsSimulating(true)
    setError(null)
    try {
      await paymentService.simulateSubscriptionApproval()
      await refreshUser()
      setCheckoutStep('success')
      setTimeout(() => {
        setIsCheckoutModalOpen(false)
        navigate('/planos/sucesso')
      }, 1000)
    } catch {

      setError('Falha ao simular aprovação.')
    } finally {
      setIsSimulating(false)
    }
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (propIsLoading) {
    return <PricingPageSkeleton />
  }

  return (
    <div className="min-h-screen pb-20 pt-28">
      <Container size="default">
        {/* Header */}
        <ScrollReveal animateOnMount>
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} />
              Planos e Assinaturas
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl">
              Crie declarações <span className="text-gradient">sem limites</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-text-light sm:text-lg">
              Escolha entre o envio avulso ou tenha 30 dias de acesso ilimitado para criar quantas cartas, mensagens e páginas personalizadas quiser.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mb-20 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Plano Avulso */}
          <ScrollReveal animateOnMount delay={0.05}>
            <Card glass className="relative flex h-full flex-col justify-between p-8 sm:p-10 border-primary/15">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-text">Avulso</h3>
                  <Badge variant="default" className="text-xs">Por envio</Badge>
                </div>
                <p className="mt-2 text-sm text-text-light">
                  Ideal se você quer criar apenas um correio elegante pontual.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm font-medium text-text-muted">R$</span>
                  <span className="font-display text-4xl font-bold text-text">4,99</span>
                  <span className="text-xs text-text-muted">/ por carta</span>
                </div>

                <div className="mt-8 space-y-3.5 text-sm text-text">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>1 Carta ou Página personalizada</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Link público e QR Code exclusivo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Fotos, música de fundo e animações</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Acesso permanente para o destinatário</span>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link to="/create" className="w-full block">
                  <Button variant="outline" size="lg" className="w-full font-medium">
                    Criar Carta Avulsa
                  </Button>
                </Link>
              </div>
            </Card>
          </ScrollReveal>

          {/* Plano Ilimitado (Destaque) */}
          <ScrollReveal animateOnMount delay={0.12}>
            <div className="relative h-full">
              <Card glass className="relative flex h-full flex-col justify-between p-8 sm:p-10 border-2 border-primary/40 shadow-xl bg-surface">
                <div className="absolute -top-3.5 right-8">
                  <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                    Mais Popular • Recomendado
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-2xl font-bold text-text">Ilimitado Mensal</h3>
                      <InfinityIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-text-light">
                    Liberdade total para declarar tudo o que sente durante 30 dias.
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-sm font-medium text-text-muted">R$</span>
                    <span className="font-display text-5xl font-extrabold text-primary">15,00</span>
                    <span className="text-sm font-medium text-text-muted">/ 1 mês (30 dias)</span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <Sparkles size={13} className="text-emerald-600" />
                    <span>Crie a partir de 4 cartas e já está economizando!</span>
                  </p>


                  <div className="mt-8 space-y-3.5 text-sm text-text font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span><strong>Cartas e páginas ilimitadas</strong> por 30 dias</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span><strong>Publicação com 1 clique</strong> (sem pagar por envio)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>Todos os templates e blocos interativos liberados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>Upload ilimitado de músicas, fotos e mensagens</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>Selo exclusivo <strong>PRO</strong> no seu perfil</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  {isSubscribed ? (
                    <div className="space-y-2">
                      <Button disabled size="lg" className="w-full bg-emerald-600 text-white cursor-default">
                        <Check size={18} />
                        Assinatura Ativa
                      </Button>
                      <Link to="/create" className="block text-center text-xs font-semibold text-primary hover:underline">
                        Ir criar uma nova carta agora &rarr;
                      </Link>
                    </div>
                  ) : (
                    <Button
                      onClick={handleOpenSubscribe}
                      size="lg"
                      className="w-full bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-colors font-bold text-base"
                    >
                      <Zap size={18} />
                      Assinar Plano Ilimitado
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>

        {/* Benefits Banner */}
        <ScrollReveal animateOnMount>
          <div className="mb-20 rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              Por que escolher o Plano Ilimitado?
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-2 p-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <InfinityIcon size={24} />
                </div>
                <h3 className="font-display text-lg font-bold text-text">Envios Sem Limites</h3>
                <p className="text-xs text-text-light">
                  Mande cartas para seu amor, amigos, familiares ou crush sem se preocupar com taxas individuais.
                </p>
              </div>
              <div className="space-y-2 p-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap size={24} />
                </div>
                <h3 className="font-display text-lg font-bold text-text">Publicação Instantânea</h3>
                <p className="text-xs text-text-light">
                  Edite no editor modular e publique na hora com 1 clique, gerando QR code e link automaticamente.
                </p>
              </div>
              <div className="space-y-2 p-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-display text-lg font-bold text-text">Garantia & Sem Pegadinhas</h3>
                <p className="text-xs text-text-light">
                  Acesso completo por 30 dias corridos. Suas cartas continuam ativas para sempre mesmo após o término.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQs */}
        <ScrollReveal animateOnMount>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl font-bold text-text">
              Dúvidas Frequentes
            </h2>
            <div className="mt-8 space-y-4">
              <Card glass className="p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-text">
                  <HelpCircle size={18} className="text-primary" />
                  O que acontece com as cartas criadas depois dos 30 dias?
                </h3>
                <p className="mt-2 text-sm text-text-light">
                  Todas as cartas criadas e publicadas durante a sua assinatura continuam acessíveis e ativas para sempre! Seus destinatários poderão ler suas mensagens sem nenhuma restrição.
                </p>
              </Card>

              <Card glass className="p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-text">
                  <HelpCircle size={18} className="text-primary" />
                  Como funciona o pagamento por Pix?
                </h3>
                <p className="mt-2 text-sm text-text-light">
                  Ao selecionar Pix, geramos um QR Code e código Copia e Cola instantâneo. Assim que o banco processar a transferência, seu plano é liberado automaticamente em poucos segundos.
                </p>
              </Card>

              <Card glass className="p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-text">
                  <HelpCircle size={18} className="text-primary" />
                  Existe limite de destinatários ou visualizações?
                </h3>
                <p className="mt-2 text-sm text-text-light">
                  Não! Não há limite de visualizações ou acessos aos seus links de correio elegante.
                </p>
              </Card>
            </div>
          </div>
        </ScrollReveal>
      </Container>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title={checkoutStep === 'pix' ? 'Pagamento via Pix (Assinatura)' : 'Assinar Plano Ilimitado'}
      >
        <div className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          ) : null}

          {checkoutStep === 'select' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-5 text-center shadow-xs">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Você está assinando</p>
                <h4 className="font-display text-xl font-bold text-text mt-1">Correio Elegante Ilimitado (1 Mês)</h4>
                <p className="font-display text-3xl font-extrabold text-primary mt-2">R$ 15,00</p>
                <p className="text-xs font-medium text-text-light mt-1">Acesso irrestrito por 30 dias corridos</p>
              </div>

              <div className="my-2 flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  action="subscription_checkout"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => turnstileRef.current?.reset()}
                />
              </div>

              <p className="text-xs font-semibold text-text-light">Escolha a forma de pagamento:</p>

              <div className="grid grid-cols-1 gap-3">
                <button

                  type="button"
                  onClick={handleStartPix}
                  disabled={isLoading}
                  className="flex items-center justify-between rounded-2xl border-2 border-emerald-200/80 bg-emerald-50/40 p-4 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">Pix Instantâneo</p>
                      <p className="text-xs text-text-light">Liberação imediata via QR Code</p>
                    </div>
                  </div>
                  {loadingMethod === 'pix' ? (
                    <Loader2 size={20} className="animate-spin shrink-0 aspect-square text-emerald-600" />
                  ) : (
                    <Badge variant="success" className="text-xs">Mais Rápido</Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStartCardStripe}
                  disabled={isLoading}
                  className="flex items-center justify-between rounded-2xl border-2 border-violet-200/80 bg-violet-50/40 p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-50 hover:shadow-md disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-white shadow-sm shadow-violet-500/20">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">Cartão de Crédito</p>
                      <p className="text-xs text-text-light">Stripe Checkout seguro</p>
                    </div>
                  </div>
                  {loadingMethod === 'credit_card' ? (
                    <Loader2 size={20} className="animate-spin shrink-0 aspect-square text-violet-600" />
                  ) : (
                    <ArrowRight size={18} className="text-text-muted transition-transform group-hover:translate-x-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStartMercadoPago}
                  disabled={isLoading}
                  className="flex items-center justify-between rounded-2xl border-2 border-sky-200/80 bg-sky-50/40 p-4 text-left transition-all hover:border-sky-500 hover:bg-sky-50 hover:shadow-md disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/20">
                      <Zap size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">Mercado Pago</p>
                      <p className="text-xs text-text-light">Boleto, saldo MP ou cartão</p>
                    </div>
                  </div>
                  {loadingMethod === 'mercadopago_checkout' ? (
                    <Loader2 size={20} className="animate-spin shrink-0 aspect-square text-sky-600" />
                  ) : (
                    <ArrowRight size={18} className="text-text-muted transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </div>


              {/* Dev Simulation Button */}
              {import.meta.env.DEV ? (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="w-full text-xs text-text-muted hover:text-primary"
                  >
                    <Sparkles size={14} />
                    {isSimulating ? 'Ativando...' : '⚡ Simular Aprovação Instantânea (Ambiente de Teste)'}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {checkoutStep === 'pix' && pixData ? (
            <div className="space-y-5 text-center">
              <p className="text-xs text-text-light">
                Escaneie o QR Code no app do seu banco ou use a chave Copia e Cola.
              </p>

              {pixData.pixQrCodeUrl ? (
                <div className="mx-auto flex w-fit justify-center rounded-2xl border border-primary/20 bg-white p-4 shadow-sm">
                  <img src={pixData.pixQrCodeUrl} alt="QR Code Pix" width={200} height={200} className="rounded-xl" />
                </div>
              ) : pixData.pixQrCode ? (
                <div className="mx-auto flex w-fit justify-center rounded-2xl border border-primary/20 bg-white p-4 shadow-sm">
                  <QRCodeSVG value={pixData.pixQrCode} size={200} />
                </div>
              ) : null}


              {secondsLeft !== null ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Clock size={13} />
                  Expira em {formatCountdown(secondsLeft)}
                </div>
              ) : null}

              {pixData.pixQrCode ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyPix}
                    className="w-full font-medium"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
                  </Button>
                </div>
              ) : null}

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                <RefreshCw size={13} className="animate-spin text-primary" />
                <span>Aguardando confirmação bancária em tempo real...</span>
              </div>

              {import.meta.env.DEV ? (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="w-full text-xs text-text-muted hover:text-primary"
                  >
                    <Sparkles size={14} />
                    {isSimulating ? 'Ativando...' : '⚡ Simular Pagamento Concluído (Dev)'}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {checkoutStep === 'success' ? (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check size={32} strokeWidth={3} />
              </div>
              <h4 className="font-display text-2xl font-bold text-text">Pagamento Aprovado!</h4>
              <p className="text-sm text-text-light">
                Seu Plano Ilimitado está ativo. Redirecionando...
              </p>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
