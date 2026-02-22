import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
interface ApiErrorResponse {
  error?: string
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.error || fallback
  }
  return fallback
}

export function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function handleLogin(data: LoginForm) {
    setIsSubmitting(true)
    setError('')
    try {
      const response = await authService.login(data)
      setAuth(response.data.user, response.data.accessToken)
      navigate('/create')
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao fazer login'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(data: RegisterForm) {
    setIsSubmitting(true)
    setError('')
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
      })
      setAuth(response.data.user, response.data.accessToken)
      navigate('/create')
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
    </div>
  )
}
