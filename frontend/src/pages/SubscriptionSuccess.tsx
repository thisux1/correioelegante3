import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles, Heart, Zap, ArrowRight, Infinity as InfinityIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SuccessPageSkeleton } from '@/components/ui/SuccessPageSkeleton'
import { useAuthStore } from '@/store/authStore'
import { paymentService } from '@/services/paymentService'

export function SubscriptionSuccess() {
  const { refreshUser } = useAuthStore()
  const [daysRemaining, setDaysRemaining] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStatus() {
      try {
        await refreshUser()
        const { data } = await paymentService.getSubscriptionStatus()
        if (isMounted && data.daysRemaining) {
          setDaysRemaining(data.daysRemaining)
        }
      } catch {
        // Fallback default 30 dias
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStatus()

    return () => {
      isMounted = false
    }
  }, [refreshUser])

  if (isLoading) {
    return <SuccessPageSkeleton />
  }


  return (
    <div className="min-h-screen pb-16 pt-28">
      <Container size="narrow">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
        >
          <Card glass className="relative overflow-hidden border-2 border-primary/30 p-8 text-center sm:p-12 shadow-2xl bg-white/90">
            {/* Background Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-rose-400 text-white shadow-xl shadow-primary/30">
                <Sparkles size={36} />
              </div>

              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <InfinityIcon size={14} />
                Plano Ilimitado Ativado
              </div>

              <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">
                Parabéns! Você é <span className="text-gradient">PRO</span>
              </h1>


              <p className="mx-auto mt-3 max-w-md text-sm text-text-light sm:text-base">
                Seu acesso ilimitado de <strong>{daysRemaining} dias</strong> está ativo. Agora você pode criar e publicar quantas cartas e páginas personalizadas desejar sem custos adicionais.
              </p>

              <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left text-xs text-text space-y-2.5 max-w-md mx-auto">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Zap size={15} />
                  Seus benefícios liberados:
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Criação e publicação ilimitada com 1 clique</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Todos os templates, músicas e temas premium</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>QR Codes e links públicos imediatos</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/create" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/25">
                    <Heart size={16} />
                    Começar a Escrever Agora
                  </Button>
                </Link>
                <Link to="/profile" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full font-medium">
                    Ver Meu Perfil
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
