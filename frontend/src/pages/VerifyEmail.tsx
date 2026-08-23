import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MailCheck, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { authService } from '@/services/authService'

type VerificationStatus = 'verifying' | 'success' | 'error'

function readTokenFromUrl(): string {
  return new URLSearchParams(window.location.search).get('token') ?? ''
}

export function VerifyEmail() {
  const [token] = useState(readTokenFromUrl)
  const [status, setStatus] = useState<VerificationStatus>(() => (readTokenFromUrl() ? 'verifying' : 'error'))
  const [errorMessage, setErrorMessage] = useState(() =>
    readTokenFromUrl()
      ? ''
      : 'Link de verificação inválido ou incompleto. Solicite um novo e-mail na sua página de perfil.'
  )

  useEffect(() => {
    if (!token) return

    let isActive = true

    async function verify() {
      try {
        await authService.verifyEmail(token)
        if (isActive) setStatus('success')
      } catch (err: unknown) {
        if (!isActive) return
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setErrorMessage(
          axiosErr.response?.data?.error ||
            'Não foi possível verificar seu e-mail. O link pode ter expirado — solicite um novo na sua página de perfil.'
        )
        setStatus('error')
      }
    }

    verify()

    return () => {
      isActive = false
    }
  }, [token])

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-md mx-auto"
        >
          <Card glass className="p-8 shadow-xl border border-border/80 bg-white/95 rounded-3xl">
            {status === 'verifying' && (
              <div className="text-center py-6" role="status" aria-live="polite">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl font-bold text-text mb-2">Verificando seu e-mail</h1>
                <p className="text-sm text-text-light">
                  Aguarde um instante enquanto confirmamos o seu endereço.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <MailCheck className="w-8 h-8" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl font-bold text-text mb-2">E-mail verificado</h1>
                <p className="text-sm text-text-light mb-6">
                  Seu endereço foi confirmado com sucesso. Agora você está pronto para enviar e receber cartas sem preocupações.
                </p>
                <Link to="/auth?mode=login" className="block">
                  <Button size="lg" className="w-full font-semibold">
                    Ir para o login
                  </Button>
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
                  <AlertCircle className="w-8 h-8" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl font-bold text-text mb-2">Não foi possível verificar</h1>
                <p className="text-sm text-text-light mb-6">{errorMessage}</p>
                <Link to="/auth?mode=login" className="block">
                  <Button variant="outline" className="w-full font-semibold">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
