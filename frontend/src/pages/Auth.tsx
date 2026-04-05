import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Container } from '@/components/layout/Container'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string(),
  age: z.string()
    .min(1, 'Idade é obrigatória')
    .refine((value) => !Number.isNaN(Number(value)), 'Idade inválida')
    .refine((value) => Number(value) >= 13, 'Você precisa ter pelo menos 13 anos'),
  legalAccepted: z.boolean().refine((value) => value, {
    message: 'Você precisa aceitar os Termos, Privacidade e Cookies',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
interface ApiErrorResponse {
  error?: string
  code?: string
}

type AuthApiErrorCode =
  | 'AUTH_EMAIL_NOT_FOUND'
  | 'AUTH_INVALID_PASSWORD'
  | 'AUTH_EMAIL_ALREADY_REGISTERED'

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorResponse>(err)) {
    const code = err.response?.data?.code
    if (code === 'AUTH_EMAIL_NOT_FOUND') {
      return 'Nao encontramos esse email. Confira o endereco ou crie sua conta.'
    }

    if (code === 'AUTH_INVALID_PASSWORD') {
      return 'Senha incorreta. Verifique e tente novamente.'
    }

    if (code === 'AUTH_EMAIL_ALREADY_REGISTERED') {
      return 'Este email ja esta cadastrado. Entre para continuar.'
    }

    return err.response?.data?.error || fallback
  }
  return fallback
}

function getApiErrorCode(err: unknown): AuthApiErrorCode | undefined {
  if (!isAxiosError<ApiErrorResponse>(err)) {
    return undefined
  }

  const code = err.response?.data?.code
  if (
    code === 'AUTH_EMAIL_NOT_FOUND'
    || code === 'AUTH_INVALID_PASSWORD'
    || code === 'AUTH_EMAIL_ALREADY_REGISTERED'
  ) {
    return code
  }

  return undefined
}

export function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  // Selector prevents re-renders when unrelated store state changes
  const setAuth = useAuthStore((s) => s.setAuth)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      age: '',
      legalAccepted: false,
    },
  })

  async function handleLogin(data: LoginForm) {
    setIsSubmitting(true)
    setError('')
    loginForm.clearErrors()
    try {
      const response = await authService.login(data)
      setAuth(response.data.user, response.data.accessToken)
      navigate('/create')
    } catch (err: unknown) {
      const code = getApiErrorCode(err)

      if (code === 'AUTH_EMAIL_NOT_FOUND') {
        loginForm.setError('email', {
          type: 'server',
          message: 'Este email nao esta cadastrado.',
        })
        setError('Nao encontramos esse email. Confira o endereco ou crie sua conta.')
        return
      }

      if (code === 'AUTH_INVALID_PASSWORD') {
        loginForm.setError('password', {
          type: 'server',
          message: 'Senha incorreta para este email.',
        })
        setError('Senha incorreta. Verifique e tente novamente.')
        return
      }

      setError(getApiErrorMessage(err, 'Erro ao fazer login'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(data: RegisterForm) {
    setIsSubmitting(true)
    setError('')
    registerForm.clearErrors()
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        age: Number(data.age),
        legalAccepted: data.legalAccepted,
      })
      setAuth(response.data.user, response.data.accessToken)
      navigate('/create')
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      if ((isAxiosError(err) && err.response?.status === 409) || code === 'AUTH_EMAIL_ALREADY_REGISTERED') {
        registerForm.setError('email', {
          type: 'server',
          message: 'Este email ja possui conta.',
        })
        setError('Este email já está cadastrado. Faça login para continuar.')
        setMode('login')
      } else {
        setError(getApiErrorMessage(err, 'Erro ao criar conta'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16">
      <Container size="narrow" className="flex justify-center">
      <ScrollReveal animateOnMount>
        <Card glass className="w-full max-w-md">
          <div className="text-center mb-8">
            <Heart className="w-10 h-10 text-primary fill-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-text mb-2">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </h1>
            <p className="text-text-light text-sm">
              {mode === 'login'
                ? 'Entre para enviar seu correio elegante'
                : 'Crie sua conta para começar'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === tab
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-light hover:text-text'
                  }`}
              >
                {tab === 'login' ? 'Entrar' : 'Registrar'}
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-50 text-red-600 text-sm mb-4"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')}
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />
                <Button type="submit" isLoading={isSubmitting} size="lg" className="mt-2">
                  Entrar
                  <ArrowRight size={18} />
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register('email')}
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                />
                <Input
                  label="Idade"
                  type="number"
                  min={13}
                  placeholder="Ex.: 18"
                  error={registerForm.formState.errors.age?.message}
                  {...registerForm.register('age')}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-3 text-sm text-text-light leading-relaxed">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-white/40 accent-primary"
                      {...registerForm.register('legalAccepted')}
                    />
                    <span>
                      Li e aceito os{' '}
                      <Link to="/legal/terms" className="text-primary hover:underline">
                        Termos de Uso
                      </Link>
                      , a{' '}
                      <Link to="/legal/privacy" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                      {' '}e a{' '}
                      <Link to="/legal/cookies" className="text-primary hover:underline">
                        Política de Cookies
                      </Link>
                      .
                    </span>
                  </label>
                  {registerForm.formState.errors.legalAccepted?.message && (
                    <span className="text-xs text-red-500">
                      {registerForm.formState.errors.legalAccepted.message}
                    </span>
                  )}
                </div>
                <Input
                  label="Confirmar Senha"
                  type="password"
                  placeholder="Repita a senha"
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')}
                />
                <Button type="submit" isLoading={isSubmitting} size="lg" className="mt-2">
                  Criar Conta
                  <ArrowRight size={18} />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </ScrollReveal>
      </Container>
    </div>
  )
}
