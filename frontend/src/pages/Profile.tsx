import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Mail, Trash2, ExternalLink, LogOut, Settings, MessageCircle, AlertTriangle, Key, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SectionCard } from '@/components/ui/SectionCard'
import { SettingRow } from '@/components/ui/SettingRow'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { messageService } from '@/services/messageService'
import { authService } from '@/services/authService'
import { pageService, type PageSummary } from '@/services/pageService'

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const { messages, setMessages, removeMessage, setLoading, isLoading } = useMessageStore()

  const [activeTab, setActiveTab] = useState<'messages' | 'settings'>('messages')
  const [fetchError, setFetchError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [editorPages, setEditorPages] = useState<PageSummary[]>([])
  const [isLoadingEditorPages, setIsLoadingEditorPages] = useState(false)
  const [editorPagesError, setEditorPagesError] = useState('')

  // Password Change State
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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

    async function fetchMessages() {
      setFetchError('')
      setLoading(true)
      try {
        const response = await messageService.getAll()
        if (!abortController.signal.aborted) {
          setMessages(response.data.messages)
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          const axiosErr = err as { response?: { data?: { error?: string } } }
          setFetchError(axiosErr.response?.data?.error || 'Erro ao carregar mensagens.')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    async function fetchEditorPages() {
      setEditorPagesError('')
      setIsLoadingEditorPages(true)
      try {
        const pages = await pageService.listPages()
        if (!abortController.signal.aborted) {
          setEditorPages(pages)
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          const axiosErr = err as { response?: { data?: { error?: string } } }
          setEditorPagesError(axiosErr.response?.data?.error || 'Erro ao carregar paginas do editor.')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingEditorPages(false)
        }
      }
    }

    fetchMessages()
    fetchEditorPages()
    return () => abortController.abort()
  }, [isAuthenticated, navigate, setMessages, setLoading])

  async function handleDelete(id: string) {
    setDeleteError('')
    try {
      await messageService.delete(id)
      removeMessage(id)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setDeleteError(axiosErr.response?.data?.error || 'Erro ao deletar mensagem. Tente novamente.')
    }
  }

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

  const tabButtonBase = 'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
  const editorDraftPages = editorPages.filter((page) => page.status !== 'published')
  const editorPublishedPages = editorPages.filter((page) => page.status === 'published')

  function resolvePublicPageHref(page: PageSummary): string | null {
    const candidate = (
      page as PageSummary & {
        publicPath?: string
        path?: string
        route?: string
        publicUrl?: string
        slug?: string
      }
    )

    if (typeof candidate.publicPath === 'string' && candidate.publicPath.trim()) {
      return candidate.publicPath.trim()
    }

    if (typeof candidate.path === 'string' && candidate.path.trim()) {
      return candidate.path.trim()
    }

    if (typeof candidate.route === 'string' && candidate.route.trim()) {
      return candidate.route.trim()
    }

    if (typeof candidate.publicUrl === 'string' && candidate.publicUrl.trim()) {
      return candidate.publicUrl.trim()
    }

    if (typeof candidate.slug === 'string' && candidate.slug.trim()) {
      return `/page/${candidate.slug.trim()}`
    }

    return `/card/page/${page.id}`
  }

  function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value)
  }

  function shouldShowPayNow(page: PageSummary) {
    const candidate = (
      page as PageSummary & {
        paymentStatus?: 'pending' | 'paid'
        isPaid?: boolean
        paid?: boolean
      }
    )

    const isPaid = typeof candidate.paymentStatus === 'string'
      ? candidate.paymentStatus === 'paid'
      : typeof candidate.isPaid === 'boolean'
        ? candidate.isPaid
        : typeof candidate.paid === 'boolean'
          ? candidate.paid
          : false

    return page.status !== 'published' || !isPaid
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
          className="mb-8 space-y-6 sm:mb-10"
        >
          <header className="space-y-2">
            <h1 className="font-display text-4xl font-bold text-text sm:text-5xl">
              Meu Perfil
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-text-light sm:text-base">
              Crie, envie e gerencie a magia dos seus correios elegantes.
            </p>
          </header>

          <div className="glass rounded-2xl p-2">
            <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Seções do perfil">
              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                className={`${tabButtonBase} ${activeTab === 'messages'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-text-light hover:bg-white/60 hover:text-text'
                  }`}
                aria-current={activeTab === 'messages' ? 'page' : undefined}
              >
                <MessageCircle size={18} />
                Mensagens
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`${tabButtonBase} ${activeTab === 'settings'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-text-light hover:bg-white/60 hover:text-text'
                  }`}
                aria-current={activeTab === 'settings' ? 'page' : undefined}
              >
                <Settings size={18} />
                Configurações
              </button>
            </nav>
          </div>
        </motion.div>

        {activeTab === 'messages' ? (
          <section className="space-y-6" aria-label="Mensagens">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
                Minhas Mensagens ({messages.length})
              </h2>
              <Link to="/create" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto">
                  <Heart size={14} />
                  Nova mensagem
                </Button>
              </Link>
            </div>

            <section className="space-y-4" aria-label="Drafts do editor">
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">
                  Drafts do Editor ({editorDraftPages.length})
                </h3>
                <p className="text-sm text-text-light">
                  Continue a edição dos rascunhos ou finalize o pagamento quando necessário.
                </p>
              </div>

              {isLoadingEditorPages ? (
                <div className="space-y-3" aria-live="polite">
                  {[1, 2].map((i) => (
                    <div key={i} className="shimmer h-24 rounded-2xl bg-white/60" />
                  ))}
                </div>
              ) : editorPagesError ? (
                <InlineAlert tone="danger">{editorPagesError}</InlineAlert>
              ) : editorDraftPages.length === 0 ? (
                <Card glass className="py-8 text-center sm:py-10">
                  <p className="text-sm text-text-light sm:text-base">
                    Nenhum draft do editor encontrado.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {editorDraftPages.map((page) => (
                    <Card
                      key={page.id}
                      glass
                      hover
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-text break-all">Pagina #{page.id}</p>
                          <Badge variant="warning">Draft</Badge>
                        </div>
                        <p className="text-xs text-text-muted">
                          Última atualização: {new Date(page.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Link to={`/editor/${page.id}`} className="w-full sm:w-auto">
                          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                            Continuar edição
                          </Button>
                        </Link>
                        {shouldShowPayNow(page) ? (
                          <Link to={`/payment/page/${page.id}`} className="w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              Pagar agora
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4" aria-label="Publicadas do editor">
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">
                  Publicadas do Editor ({editorPublishedPages.length})
                </h3>
                <p className="text-sm text-text-light">
                  Abra o card público quando a rota estiver disponível.
                </p>
              </div>

              {isLoadingEditorPages ? (
                <div className="space-y-3" aria-live="polite">
                  {[1, 2].map((i) => (
                    <div key={i} className="shimmer h-24 rounded-2xl bg-white/60" />
                  ))}
                </div>
              ) : editorPagesError ? (
                <InlineAlert tone="danger">{editorPagesError}</InlineAlert>
              ) : editorPublishedPages.length === 0 ? (
                <Card glass className="py-8 text-center sm:py-10">
                  <p className="text-sm text-text-light sm:text-base">
                    Nenhuma pagina publicada no editor ainda.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {editorPublishedPages.map((page) => {
                    const publicHref = resolvePublicPageHref(page)

                    return (
                      <Card
                        key={page.id}
                        glass
                        hover
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6"
                      >
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-text break-all">Pagina #{page.id}</p>
                            <Badge variant="success">Publicada</Badge>
                          </div>
                          <p className="text-xs text-text-muted">
                            Publicada em: {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString('pt-BR') : 'Sem data'}
                          </p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                          <Link to={`/editor/${page.id}`} className="w-full sm:w-auto">
                            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                              Continuar edição
                            </Button>
                          </Link>

                          {shouldShowPayNow(page) ? (
                            <Link to={`/payment/page/${page.id}`} className="w-full sm:w-auto">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                Pagar agora
                              </Button>
                            </Link>
                          ) : null}

                          {publicHref ? (
                            isAbsoluteUrl(publicHref) ? (
                              <a href={publicHref} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                  <ExternalLink size={14} />
                                  Abrir card público
                                </Button>
                              </a>
                            ) : (
                              <Link to={publicHref} className="w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                  <ExternalLink size={14} />
                                  Abrir card público
                                </Button>
                              </Link>
                            )
                          ) : null}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="space-y-4" aria-label="Mensagens legadas">
              <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">
                Mensagens legadas
              </h3>

              {isLoading ? (
                <div className="space-y-4" aria-live="polite">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer h-32 rounded-2xl bg-white/60" />
                  ))}
                </div>
              ) : fetchError ? (
                <Card glass className="py-8 text-center sm:py-10">
                  <InlineAlert tone="danger" className="mx-auto max-w-xl text-center">
                    {fetchError}
                  </InlineAlert>
                </Card>
              ) : messages.length === 0 ? (
                <Card glass className="py-14 text-center sm:py-16">
                  <Heart className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                  <h3 className="mb-2 font-display text-2xl font-bold text-text">
                    Nenhuma mensagem ainda
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-text-light sm:text-base">
                    Que tal enviar seu primeiro correio elegante?
                  </p>
                  <Link to="/create" className="inline-flex w-full justify-center sm:w-auto">
                    <Button className="w-full sm:w-auto">Escrever mensagem</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {deleteError ? <InlineAlert tone="danger">{deleteError}</InlineAlert> : null}

                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      glass
                      hover
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-text break-words">
                            Para: {message.recipient}
                          </p>
                          <Badge variant={message.paymentStatus === 'paid' ? 'success' : 'warning'}>
                            {message.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>

                        <p className="break-words text-sm leading-relaxed text-text-light sm:text-base">
                          {message.message}
                        </p>

                        <p className="text-xs text-text-muted">
                          {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        {message.paymentStatus === 'paid' ? (
                          <Link to={`/card/${message.id}`} className="w-full sm:w-auto">
                            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                              <ExternalLink size={14} />
                              Abrir cartão
                            </Button>
                          </Link>
                        ) : (
                          <Link to={`/payment/${message.id}`} className="w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              Pagar agora
                            </Button>
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-600 hover:bg-red-50 hover:text-red-600 sm:w-auto"
                          onClick={() => handleDelete(message.id)}
                          aria-label={`Excluir mensagem para ${message.recipient}`}
                        >
                          <Trash2 size={14} />
                          Excluir
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </section>
        ) : (
          <section className="space-y-6" aria-label="Configurações">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
                Configurações da Conta
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-text-light sm:text-base">
                Ajuste segurança, sessão e dados sensíveis no mesmo padrão visual do restante da experiência.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.19, 1, 0.22, 1] }}
            >
              <SectionCard
                title="Sua Conta"
                description="Gerencie seus dados e sessões com uma interface consistente."
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
                      Atualize sua senha para manter sua conta mágica segura.
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
                            className="w-full sm:w-auto"
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
                Todos os seus correios elegantes serão apagados.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 sm:w-auto"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Excluir minha conta
              </Button>
            </SectionCard>
            </motion.div>

            <Modal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              title="Excluir Conta Mágica"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-text-light sm:text-base">
                    Tem certeza que deseja excluir sua conta? Esta ação é{' '}
                    <strong className="text-red-600">irreversível</strong>.
                    <br />
                    Toda a magia guardada aqui será perdida para sempre.
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
                    className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? 'A tristeza é grande, apagando...' : 'Sim, excluir para sempre'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeletingAccount}
                  >
                    Cancelar e voltar à magia
                  </Button>
                </div>
              </div>
            </Modal>
          </section>
        )}
      </div>
    </div>
  )
}
