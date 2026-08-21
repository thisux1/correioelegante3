import { ShieldCheck, Lock, Zap } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Skeleton } from './Skeleton'

export interface PaymentPageSkeletonProps {
  className?: string
}

export function PaymentPageSkeleton({
  className = '',
}: PaymentPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando pagamento..."
      className={`min-h-screen pt-28 pb-16 px-4 sm:px-6 ${className}`}
    >
      <Container size="default" className="max-w-4xl mx-auto">
        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Resumo da Carta, Valor e Selos de Segurança */}
          <div
            className="lg:col-span-5 space-y-6"
            data-testid="payment-skeleton-summary-column"
          >
            <div className="rounded-3xl border border-primary/20 bg-surface/80 p-6 shadow-md backdrop-blur-sm space-y-6">
              {/* Header do Resumo */}
              <div className="space-y-1">
                <Skeleton variant="text" className="h-6 w-36 rounded-lg" />
                <Skeleton variant="text" className="h-3.5 w-48 rounded-md opacity-70" />
              </div>

              {/* Card de Detalhes da Carta */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/60 p-4">
                <Skeleton variant="rounded" className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-32 rounded-md" />
                  <Skeleton variant="text" className="h-3 w-20 rounded-md opacity-70" />
                </div>
              </div>

              {/* Valores e Total */}
              <div className="space-y-3 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-4 w-20 rounded-md" />
                  <Skeleton variant="text" className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <Skeleton variant="text" className="h-5 w-16 rounded-md" />
                  <Skeleton variant="text" className="h-7 w-24 rounded-lg" />
                </div>
              </div>

              {/* Selos de Segurança */}
              <div
                className="space-y-3.5 border-t border-border/60 pt-5"
                data-testid="payment-skeleton-security-seals"
              >
                <div className="flex items-center gap-2.5 text-xs text-text-light">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <Lock size={14} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Skeleton variant="text" className="h-3.5 w-36 rounded-md" />
                    <Skeleton variant="text" className="h-2.5 w-44 rounded-md opacity-60" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-text-light">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                    <Zap size={14} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Skeleton variant="text" className="h-3.5 w-40 rounded-md" />
                    <Skeleton variant="text" className="h-2.5 w-36 rounded-md opacity-60" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-text-light">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Skeleton variant="text" className="h-3.5 w-32 rounded-md" />
                    <Skeleton variant="text" className="h-2.5 w-40 rounded-md opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Métodos de Pagamento e Caixa de QR Code */}
          <div
            className="lg:col-span-7 space-y-6"
            data-testid="payment-skeleton-methods-column"
          >
            <div className="rounded-3xl border border-primary/20 bg-surface/80 p-6 sm:p-8 shadow-md backdrop-blur-sm space-y-6">
              {/* Cabeçalho da Seção de Métodos */}
              <div className="space-y-2">
                <Skeleton variant="text" className="h-7 w-52 rounded-xl" />
                <Skeleton variant="text" className="h-4 w-72 max-w-full rounded-md opacity-70" />
              </div>

              {/* Abas / Botões de Métodos de Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="payment-skeleton-method-tabs">
                {/* Aba PIX */}
                <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-400/40 bg-emerald-50/50 p-3.5">
                  <Skeleton variant="rounded" className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton variant="text" className="h-4 w-12 rounded-md" />
                    <Skeleton variant="text" className="h-3 w-28 rounded-md opacity-70" />
                  </div>
                </div>

                {/* Aba Cartão */}
                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-white/60 p-3.5">
                  <Skeleton variant="rounded" className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton variant="text" className="h-4 w-28 rounded-md" />
                    <Skeleton variant="text" className="h-3 w-24 rounded-md opacity-70" />
                  </div>
                </div>
              </div>

              {/* Caixa do QR Code em Shimmer */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-white/90 p-6 sm:p-8 text-center space-y-4 shadow-2xs"
                data-testid="payment-skeleton-qrcode-box"
              >
                {/* Badge de status do QR Code */}
                <Skeleton variant="rounded" className="h-6 w-36 rounded-full" />

                {/* Caixa do QR Code */}
                <div className="p-3 rounded-2xl border border-border/60 bg-white shadow-xs">
                  <Skeleton variant="rounded" className="h-48 w-48 sm:h-52 sm:w-52 rounded-xl" />
                </div>

                {/* Linha explicativa */}
                <Skeleton variant="text" className="h-3.5 w-56 rounded-md opacity-70" />

                {/* Input de Pix Copia e Cola */}
                <div className="w-full space-y-2 pt-2">
                  <Skeleton variant="rounded" className="h-10 w-full rounded-xl" />
                  <Skeleton variant="rounded" className="h-11 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
