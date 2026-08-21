import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Container } from '@/components/layout/Container'

const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const forgotSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
})

const registerSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  ageConfirmed: z.boolean().refine((value) => value === true, {
    message: 'Você precisa confirmar ter 13 anos ou mais',
  }),
  legalAccepted: z.boolean().refine((value) => value === true, {
    message: 'Você precisa aceitar os Termos e Políticas para continuar',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type ForgotForm = z.infer<typeof forgotSchema>
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
      return 'Não encontramos uma conta com este e-mail. Verifique o endereço ou crie sua conta.'
    }

    if (code === 'AUTH_INVALID_PASSWORD') {
      return 'Senha incorreta. Verifique e tente novamente.'
    }

    if (code === 'AUTH_EMAIL_ALREADY_REGISTERED') {
      return 'Este e-mail já está cadastrado. Faça login para continuar.'
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

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
  bgColor: string
} {
  if (!password) {
    return { score: 0, label: '', color: 'bg-gray-200', bgColor: 'text-gray-400' }
  }

  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1

  if (score <= 1) {
    return { score: 1, label: 'Fraca (mínimo 6 caracteres)', color: 'bg-rose-500', bgColor: 'text-rose-600' }
  }
  if (score <= 2) {
    return { score: 2, label: 'Média (adicione números ou símbolos)', color: 'bg-amber-500', bgColor: 'text-amber-600' }
  }
  return { score: 3, label: 'Forte (ótima senha)', color: 'bg-emerald-500', bgColor: 'text-emerald-600' }
}

export function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : (searchParams.get('mode') === 'forgot' ? 'forgot' : 'login')
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode)
  const [forgotSent, setForgotSent] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const urlMode = searchParams.get('mode')
    if (urlMode === 'register' || urlMode === 'login' || urlMode === 'forgot') {
      setMode(urlMode)
    }
  }, [searchParams])

  const handleTabChange = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode)
    setError('')
    setForgotSent(false)
    setSearchParams({ mode: newMode }, { replace: true })
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const forgotForm = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      ageConfirmed: false,
      legalAccepted: false,
    },
  })

  const registerPassword = registerForm.watch('password') || ''
  const registerConfirmPassword = registerForm.watch('confirmPassword') || ''
  const strength = useMemo(() => getPasswordStrength(registerPassword), [registerPassword])
  const passwordsMatch = registerPassword.length > 0 && registerConfirmPassword.length > 0 && registerPassword === registerConfirmPassword

  const targetRedirect = useMemo(() => {
    const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname
    const queryRedirect = searchParams.get('redirect')
    return queryRedirect || fromLocation || '/create'
  }, [location.state, searchParams])

  async function handleLogin(data: LoginForm) {
    setIsSubmitting(true)
    setError('')
    loginForm.clearErrors()
    try {
      const response = await authService.login(data)
      setAuth(response.data.user, response.data.accessToken)
      navigate(targetRedirect)
    } catch (err: unknown) {
      const code = getApiErrorCode(err)

      if (code === 'AUTH_EMAIL_NOT_FOUND') {
        loginForm.setError('email', {
          type: 'server',
          message: 'Este e-mail não está cadastrado.',
        })
        setError('Não encontramos este e-mail. Confira o endereço ou crie sua conta.')
        return
      }

      if (code === 'AUTH_INVALID_PASSWORD') {
        loginForm.setError('password', {
          type: 'server',
          message: 'Senha incorreta para este e-mail.',
        })
        setError('Senha incorreta. Verifique e tente novamente.')
        return
      }

      setError(getApiErrorMessage(err, 'Erro ao fazer login. Verifique sua conexão e tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgot(data: ForgotForm) {
    setIsSubmitting(true)
    setError('')
    forgotForm.clearErrors()
    try {
      await authService.forgotPassword(data.email)
      setForgotSent(true)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao solicitar recuperação de senha. Tente novamente.'))
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
        ageConfirmed: data.ageConfirmed,
        legalAccepted: data.legalAccepted,
      })
      setAuth(response.data.user, response.data.accessToken)
      navigate(targetRedirect)
    } catch (err: unknown) {
      const code = getApiErrorCode(err)
      if ((isAxiosError(err) && err.response?.status === 409) || code === 'AUTH_EMAIL_ALREADY_REGISTERED') {
        registerForm.setError('email', {
          type: 'server',
          message: 'Este e-mail já possui conta cadastrada.',
        })
        setError('Este e-mail já está cadastrado. Faça login para continuar.')
        setMode('login')
        setSearchParams({ mode: 'login' }, { replace: true })
      } else {
        setError(getApiErrorMessage(err, 'Erro ao criar conta. Tente novamente em instantes.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center pt-28 pb-16 px-4 overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-rose-200/30 via-pink-100/20 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container size="narrow" className="w-full flex justify-center">
        <div className="w-full max-w-md">
          <ScrollReveal animateOnMount>
            <Card glass className="w-full bg-white/80 border border-white/60 shadow-xl shadow-rose-950/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
              
              <div className="text-center mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3.5 border border-primary/15">
                  <Heart className="w-5 h-5 fill-primary/20" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-text tracking-tight">
                  {mode === 'login'
                    ? 'Bem-vindo de volta'
                    : mode === 'register'
                    ? 'Criar sua conta'
                    : 'Recuperar Senha'}
                </h1>
                <p className="text-text-light text-xs sm:text-sm mt-1.5">
                  {mode === 'login'
                    ? 'Entre para gerenciar e enviar seus correios elegantes'
                    : mode === 'register'
                    ? 'Preencha os dados abaixo para começar'
                    : 'Digite seu e-mail para receber as instruções de recuperação'}
                </p>
              </div>

              {/* Mode switch tabs */}
              {mode !== 'forgot' && (
                <div className="relative flex p-1 bg-gray-100/80 rounded-2xl mb-6 border border-gray-200/40">
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className={`relative flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 z-10 ${
                      mode === 'login' ? 'text-primary font-semibold' : 'text-text-light hover:text-text'
                    }`}
                  >
                    {mode === 'login' && (
                      <motion.div
                        layoutId="authTabPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-black/5"
                      />
                    )}
                    <span className="relative z-10">Entrar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className={`relative flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 z-10 ${
                      mode === 'register' ? 'text-primary font-semibold' : 'text-text-light hover:text-text'
                    }`}
                  >
                    {mode === 'register' && (
                      <motion.div
                        layoutId="authTabPill"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-black/5"
                      />
                    )}
                    <span className="relative z-10">Criar Conta</span>
                  </button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-50/90 border border-rose-200/70 text-rose-700 text-xs sm:text-sm mb-5 flex items-start gap-2.5 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug flex-1">{error}</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {mode === 'forgot' ? (
                  <motion.form
                    key="forgot-form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onSubmit={forgotForm.handleSubmit(handleForgot)}
                    className="flex flex-col gap-4"
                    noValidate
                  >
                    {forgotSent ? (
                      <div className="text-center py-4 space-y-3">
                        <div className="w-14 h-14 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-md shadow-emerald-500/15">
                          <Check size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-text">E-mail Enviado! 💌</h3>
                        <p className="text-xs text-text-light leading-relaxed">
                          Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinir sua senha em instantes. Verifique sua caixa de entrada e pasta de spam.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleTabChange('login')}
                          className="mt-3 w-full font-medium"
                        >
                          Voltar para o Login
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input
                          label="E-mail Cadastrado"
                          type="email"
                          id="forgot-email"
                          autoComplete="email"
                          placeholder="seu@email.com"
                          leftIcon={<Mail className="w-4 h-4" />}
                          error={forgotForm.formState.errors.email?.message}
                          {...forgotForm.register('email')}
                        />

                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          size="lg"
                          className="mt-2 w-full text-base font-semibold"
                        >
                          <span>Enviar Link de Recuperação</span>
                          <ArrowRight size={18} />
                        </Button>

                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => handleTabChange('login')}
                            className="text-xs text-primary font-semibold hover:underline"
                          >
                            Voltar para o Login
                          </button>
                        </div>
                      </>
                    )}
                  </motion.form>
                ) : mode === 'login' ? (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="flex flex-col gap-4"
                    noValidate
                  >
                    <Input
                      label="E-mail"
                      type="email"
                      id="login-email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={loginForm.formState.errors.email?.message}
                      {...loginForm.register('email')}
                    />

                    <div>
                      <Input
                        label="Senha"
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-text-muted hover:text-text focus:outline-hidden transition-colors"
                            aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                        error={loginForm.formState.errors.password?.message}
                        {...loginForm.register('password')}
                      />
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot')
                            setError('')
                            setForgotSent(false)
                          }}
                          className="text-xs text-text-light hover:text-primary transition-colors focus:outline-hidden"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      size="lg"
                      className="mt-2 w-full text-base font-semibold"
                    >
                      <span>Entrar na Conta</span>
                      <ArrowRight size={18} />
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-text-light">
                        Ainda não tem cadastro?{' '}
                        <button
                          type="button"
                          onClick={() => handleTabChange('register')}
                          className="text-primary font-semibold hover:underline"
                        >
                          Criar conta
                        </button>
                      </p>
                    </div>
                  </motion.form>
                ) : (

                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="flex flex-col gap-4"
                    noValidate
                  >
                    <Input
                      label="E-mail"
                      type="email"
                      id="register-email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={registerForm.formState.errors.email?.message}
                      {...registerForm.register('email')}
                    />

                    <div className="flex flex-col gap-1.5">
                      <Input
                        label="Senha"
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        autoComplete="new-password"
                        placeholder="Mínimo 6 caracteres"
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-text-muted hover:text-text focus:outline-hidden transition-colors"
                            aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                        error={registerForm.formState.errors.password?.message}
                        {...registerForm.register('password')}
                      />

                      {registerPassword && (
                        <div className="mt-1 px-0.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  strength.score >= 1 ? strength.color : 'bg-transparent'
                                }`}
                                style={{ width: '33.3%' }}
                              />
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  strength.score >= 2 ? strength.color : 'bg-transparent'
                                }`}
                                style={{ width: '33.3%' }}
                              />
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  strength.score >= 3 ? strength.color : 'bg-transparent'
                                }`}
                                style={{ width: '33.3%' }}
                              />
                            </div>
                            <span className={`text-[11px] font-medium ${strength.bgColor}`}>
                              {strength.label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Input
                      label="Confirmar Senha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="register-confirm-password"
                      autoComplete="new-password"
                      placeholder="Repita a mesma senha"
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                      rightElement={
                        <div className="flex items-center gap-1">
                          {passwordsMatch && (
                            <span className="text-emerald-600 mr-1" title="Senhas coincidem">
                              <Check size={16} />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="p-1 text-text-muted hover:text-text focus:outline-hidden transition-colors"
                            aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      }
                      error={registerForm.formState.errors.confirmPassword?.message}
                      {...registerForm.register('confirmPassword')}
                    />

                    <div className="flex flex-col gap-2.5 pt-1">
                      <div className={`p-3 rounded-xl border transition-all ${
                        registerForm.formState.errors.ageConfirmed
                          ? 'bg-rose-50/60 border-rose-300'
                          : 'bg-white/40 border-gray-200/50 hover:bg-white/60'
                      }`}>
                        <label className="flex items-start gap-2.5 text-xs text-text-light leading-relaxed cursor-pointer select-none">
                          <input
                            type="checkbox"
                            id="ageConfirmed"
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/30 cursor-pointer shrink-0"
                            {...registerForm.register('ageConfirmed')}
                          />
                          <span>
                            Confirmo que tenho <strong>13 anos ou mais</strong>.
                          </span>
                        </label>
                        {registerForm.formState.errors.ageConfirmed?.message && (
                          <span className="text-xs text-rose-500 font-medium block mt-1.5 pl-6.5">
                            {registerForm.formState.errors.ageConfirmed.message}
                          </span>
                        )}
                      </div>

                      <div className={`p-3 rounded-xl border transition-all ${
                        registerForm.formState.errors.legalAccepted
                          ? 'bg-rose-50/60 border-rose-300'
                          : 'bg-white/40 border-gray-200/50 hover:bg-white/60'
                      }`}>
                        <label className="flex items-start gap-2.5 text-xs text-text-light leading-relaxed cursor-pointer select-none">
                          <input
                            type="checkbox"
                            id="legalAccepted"
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/30 cursor-pointer shrink-0"
                            {...registerForm.register('legalAccepted')}
                          />
                          <span>
                            Li e concordo com os{' '}
                            <Link to="/legal/terms" target="_blank" className="text-primary font-semibold hover:underline">
                              Termos de Uso
                            </Link>
                            , a{' '}
                            <Link to="/legal/privacy" target="_blank" className="text-primary font-semibold hover:underline">
                              Política de Privacidade
                            </Link>
                            {' '}e os{' '}
                            <Link to="/legal/cookies" target="_blank" className="text-primary font-semibold hover:underline">
                              Cookies
                            </Link>
                            .
                          </span>
                        </label>
                        {registerForm.formState.errors.legalAccepted?.message && (
                          <span className="text-xs text-rose-500 font-medium block mt-1.5 pl-6.5">
                            {registerForm.formState.errors.legalAccepted.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      size="lg"
                      className="mt-2 w-full text-base font-semibold"
                    >
                      <span>Criar Conta</span>
                      <ArrowRight size={18} />
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-text-light">
                        Já possui uma conta?{' '}
                        <button
                          type="button"
                          onClick={() => handleTabChange('login')}
                          className="text-primary font-semibold hover:underline"
                        >
                          Faça login aqui
                        </button>
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </Card>
          </ScrollReveal>
        </div>
      </Container>
    </div>
  )
}
