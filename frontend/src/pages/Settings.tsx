import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Zap,
  Mail,
  LogOut,
  Key,
  ChevronDown,
  AlertTriangle,
  Trash2,
  MailOpen,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SectionCard } from '@/components/ui/SectionCard'
import { SettingRow } from '@/components/ui/SettingRow'
import { TicketsInboxModal } from '@/components/support/TicketsInboxModal'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { paymentService, type SubscriptionStatusResponse } from '@/services/paymentService'
import { Container } from '@/components/layout/Container'

export function Settings() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)

  // Password Change State
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Support Tickets State
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false)

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    const abortController = new AbortController()

    async function fetchSubscription() {
      try {
        const { data } = await paymentService.getSubscriptionStatus()
        if (!abortController.signal.aborted) {
          setSubscription(data)
        }
      } catch {
        // Fallback default
      }
    }

    fetchSubscription()
    return () => abortController.abort()
  }, [isAuthenticated, navigate])

  async function handleLogout() {
    try {
      await authService.logout()
    } catch { /* ignore */ }
    clearAuth()
    navigate('/')
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({ oldPassword, newPassword })
      setPasswordSuccess('Senha alterada com sucesso!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setPasswordError(axiosErr.response?.data?.error || 'Erro ao alterar senha. Verifique sua senha atual.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true)
    setDeleteAccountError('')
    try {
      await authService.deleteAccount()
      clearAuth()
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setDeleteAccountError(axiosErr.response?.data?.error || 'Erro ao excluir conta. Tente novamente mais tarde.')
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen pb-16 pt-28">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
          className="mb-8 space-y-6 sm:mb-10"
        >
          {/* Breadcrumb / Botão de Voltar para Minhas Cartas */}
          <div className="flex items-center justify-between">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-light hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para Minhas Cartas
            </Link>

            <Link to="/profile">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                <MailOpen size={14} className="mr-1.5" />
                Minhas Cartas
              </Button>
            </Link>
          </div>

          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SettingsIcon size={22} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">
                  Configurações da Conta
                </h1>
                <p className="text-xs sm:text-sm text-text-light mt-0.5">
                  Gerencie segurança, assinatura e preferências da sua conta.
                </p>
              </div>
            </div>
          </header>
        </motion.div>

        <section className="space-y-6" aria-label="Configurações">
          {/* Sessão de Assinatura */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.19, 1, 0.22, 1] }}
          >
            <SectionCard
              title="Sua Assinatura"
              description="Consulte o status do seu plano e benefícios disponíveis."
              className="border border-primary/10"
            >
              <SettingRow
                icon={<Zap size={18} className="text-primary" />}
                label="Plano atual"
                value={
                  (subscription?.isSubscribed || user?.isSubscribed || user?.subscriptionStatus === 'active')
                    ? 'Ilimitado Mensal (PRO)'
                    : 'Avulso (Gratuito)'
                }
                className="flex-col items-start border-primary/10 bg-white/55 sm:flex-row sm:items-center"
                action={
                  (subscription?.isSubscribed || user?.isSubscribed || user?.subscriptionStatus === 'active') ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      Ativo {subscription?.daysRemaining ? `(${subscription.daysRemaining} dias restantes)` : ''}
                    </span>
                  ) : (
                    <Link to="/planos">
                      <Button size="sm" className="bg-primary text-white font-medium">
                        Fazer Upgrade (R$ 15/mês)
                      </Button>
                    </Link>
                  )
                }
              />
            </SectionCard>
          </motion.div>

          {/* Sessão de Conta & Sessão */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.02, ease: [0.19, 1, 0.22, 1] }}
          >
            <SectionCard
              title="Sua Conta"
              description="Gerencie seus dados e sessões com total segurança."
              className="border border-primary/10"
            >
              <SettingRow
                icon={<Mail size={18} />}
                label="E-mail cadastrado"
                value={user?.email}
                className="flex-col items-start border-primary/10 bg-white/55 sm:flex-row sm:items-center"
                action={(
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full text-text-light hover:bg-white/60 hover:text-text sm:w-auto"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sair da conta
                  </Button>
                )}
              />
            </SectionCard>
          </motion.div>

          {/* Sessão de Atendimento & Chamados (Visível apenas para Administradores) */}
          {user?.isAdmin ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.03, ease: [0.19, 1, 0.22, 1] }}
            >
              <SectionCard
                title="Atendimento & Chamados"
                description="Painel de suporte para gestão de chamados e respostas por e-mail via Resend."
                className="border border-primary/10"
              >
                <SettingRow
                  icon={<LifeBuoy size={18} className="text-primary" />}
                  label="Central de Chamados"
                  value="Consulte mensagens dos clientes e envie retornos oficiais com protocolo."
                  className="flex-col items-start border-primary/10 bg-white/55 sm:flex-row sm:items-center"
                  action={(
                    <Button
                      variant="outline"
                      onClick={() => setIsTicketsModalOpen(true)}
                      className="w-full font-semibold sm:w-auto mt-2 sm:mt-0"
                    >
                      <LifeBuoy size={15} className="mr-2" />
                      Abrir Chamados
                    </Button>
                  )}
                />
              </SectionCard>
            </motion.div>
          ) : null}

          {/* Formulário de Alteração de Senha */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.04, ease: [0.19, 1, 0.22, 1] }}
          >
            <Card glass className="overflow-hidden border border-primary/10 p-0">
              <button
                type="button"
                onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
                className="group flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:items-center sm:p-6"
                aria-expanded={isPasswordFormOpen}
              >
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                    <Key size={20} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-text">
                      Alterar Senha
                    </h2>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-light">
                      Atualize sua senha para manter sua conta segura.
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isPasswordFormOpen ? 180 : 0 }}
                  transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
                >
                  <ChevronDown size={20} className="text-text-muted" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isPasswordFormOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <div className="border-t border-white/30 p-5 pt-4 sm:p-6 sm:pt-4">
                      <form onSubmit={handleChangePassword} className="mx-auto w-full max-w-md space-y-4">
                        <Input
                          label="Senha atual"
                          type="password"
                          placeholder="Sua senha atual"
                          value={oldPassword}
                          onChange={(event) => setOldPassword(event.target.value)}
                          disabled={isChangingPassword}
                          required
                        />
                        <Input
                          label="Nova senha"
                          type="password"
                          placeholder="Mínimo de 6 caracteres"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          disabled={isChangingPassword}
                          required
                        />
                        <Input
                          label="Confirmar nova senha"
                          type="password"
                          placeholder="Repita a nova senha"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          disabled={isChangingPassword}
                          required
                        />

                        {passwordError ? <InlineAlert tone="danger">{passwordError}</InlineAlert> : null}
                        {passwordSuccess ? <InlineAlert tone="success">{passwordSuccess}</InlineAlert> : null}

                        <div className="pt-2">
                          <Button
                            type="submit"
                            className="w-full sm:w-auto font-semibold"
                            disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                          >
                            {isChangingPassword ? 'Salvando...' : 'Salvar nova senha'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Zona de Perigo */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.08, ease: [0.19, 1, 0.22, 1] }}
          >
            <SectionCard title="Zona de Perigo" className="border border-red-200/60 bg-red-50/35">
              <div className="mb-2 flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                <p className="text-sm font-medium">Atenção</p>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-text-light">
                A exclusão da conta é permanente e não pode ser desfeita.
                Todos os seus correios elegantes serão apagados permanentemente.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-500/30 text-red-500 hover:border-red-500/50 hover:bg-red-500/10 sm:w-auto font-semibold"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Excluir minha conta
              </Button>
            </SectionCard>
          </motion.div>

          {/* Modal de exclusão de conta */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Excluir Conta"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <Trash2 className="h-8 w-8 text-red-500" />
                </div>
                <p className="mb-4 text-sm leading-relaxed text-text-light sm:text-base">
                  Tem certeza que deseja excluir sua conta? Esta ação é{' '}
                  <strong className="text-red-500">irreversível</strong>.
                  <br />
                  Todas as suas cartas e dados serão apagados permanentemente.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {deleteAccountError ? (
                  <InlineAlert tone="danger" className="text-center">
                    {deleteAccountError}
                  </InlineAlert>
                ) : null}
                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-500 hover:border-red-500/50 hover:bg-red-500/10 font-semibold"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? 'Apagando conta...' : 'Sim, excluir para sempre'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingAccount}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Modal>

          {/* Modal de Gestão de Chamados & Respostas por E-mail via Resend */}
          <TicketsInboxModal
            isOpen={isTicketsModalOpen}
            onClose={() => setIsTicketsModalOpen(false)}
          />
        </section>
      </Container>
    </div>
  )
}
