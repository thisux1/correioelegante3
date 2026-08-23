import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Check, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { AuthPageSkeleton } from '@/components/ui/AuthPageSkeleton'
import { Container } from '@/components/layout/Container'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (!password) return { score: 0, label: 'Muito fraca', color: 'bg-neutral-200' }
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score === 1) return { score: 1, label: 'Fraca', color: 'bg-rose-500' }
  if (score === 2) return { score: 2, label: 'Razoável', color: 'bg-amber-500' }
  if (score === 3) return { score: 3, label: 'Boa', color: 'bg-emerald-500' }
  return { score: 4, label: 'Forte', color: 'bg-emerald-600' }
}

export interface ResetPasswordProps {
  isLoading?: boolean
}

export function ResetPassword({ isLoading = false }: ResetPasswordProps = {}) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = form.watch('password') || ''
  const confirmValue = form.watch('confirmPassword') || ''
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue])
  const passwordsMatch = passwordValue.length > 0 && confirmValue.length > 0 && passwordValue === confirmValue

  async function handleSubmit(data: ResetPasswordForm) {
    if (!token) {
      setError('Token de recuperação não encontrado. Solicite um novo link.')
      return
    }

    setIsSubmitting(true)
    setError('')
    form.clearErrors()

    try {
      const response = await authService.resetPassword({
        token,
        password: data.password,
      })

      setIsSuccess(true)
      if (response.data?.user && response.data?.accessToken) {
        setAuth(response.data.user, response.data.accessToken)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(
        axiosErr.response?.data?.error ||
          'Link de recuperação inválido ou expirado. Solicite uma nova redefinição de senha.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <AuthPageSkeleton isResetPassword />
  }

  if (!token) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
        <Container size="narrow">
          <Card glass className="p-8 text-center max-w-md mx-auto border border-rose-200">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text mb-2">Link Inválido</h1>
            <p className="text-sm text-text-light mb-6">
              Este link de recuperação não possui um código de validação válido.
            </p>
            <Link to="/auth?mode=login">
              <Button className="w-full">Voltar para o Login</Button>
            </Link>
          </Card>
        </Container>
      </div>
    )
  }

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
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl font-bold text-text mb-2">Senha Atualizada</h2>
                <p className="text-sm text-text-light mb-6">
                  Sua nova senha foi salva com segurança. Você já pode continuar navegando na plataforma.
                </p>
                <div className="flex flex-col gap-2.5">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/create', { replace: true })}
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-text-light"
                    onClick={() => navigate('/profile', { replace: true })}
                  >
                    Ir para o meu perfil
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-text">Redefinir Senha</h1>
                  <p className="text-xs text-text-light mt-1">
                    Digite a sua nova senha de acesso abaixo.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-5 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug flex-1">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                  <div>
                    <Input
                      label="Nova Senha"
                      type={showPassword ? 'text' : 'password'}
                      id="reset-password"
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-text-muted hover:text-text focus:outline-hidden"
                          aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={form.formState.errors.password?.message}
                      {...form.register('password')}
                    />

                    {passwordValue.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1.5 h-1.5 w-full">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full flex-1 rounded-full transition-colors duration-200 ${
                                step <= strength.score ? strength.color : 'bg-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-text-muted">
                          <span>Força: {strength.label}</span>
                          {strength.score >= 3 && (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Senha segura
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Confirmar Nova Senha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="reset-confirm-password"
                      autoComplete="new-password"
                      placeholder="Repita a nova senha"
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="p-1 text-text-muted hover:text-text focus:outline-hidden"
                          aria-label={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={form.formState.errors.confirmPassword?.message}
                      {...form.register('confirmPassword')}
                    />

                    {confirmValue.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[11px]">
                        {passwordsMatch ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-medium">
                            <Check className="w-3.5 h-3.5" /> As senhas conferem
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> As senhas não coincidem
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    size="lg"
                    className="mt-2 w-full font-semibold"
                  >
                    <span>Salvar Nova Senha</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <div className="text-center pt-2">
                    <Link to="/auth?mode=login" className="text-xs text-primary font-semibold hover:underline">
                      Voltar para o Login
                    </Link>
                  </div>
                </form>
              </>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
