import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Mail,
  Trash2,
  LogOut,

  Settings,
  MessageCircle,
  AlertTriangle,
  Key,
  ChevronDown,
  Zap,
  Infinity as InfinityIcon,
  Copy,
  Check,
  Eye,
  Pencil,
  FileText,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SectionCard } from '@/components/ui/SectionCard'
import { SettingRow } from '@/components/ui/SettingRow'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { pageService, type PageSummary } from '@/services/pageService'
import { paymentService, type SubscriptionStatusResponse } from '@/services/paymentService'
import { Container } from '@/components/layout/Container'

export function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'messages' | 'settings'>('messages')
  const [messageFilter, setMessageFilter] = useState<'all' | 'published' | 'drafts'>('all')
  const [editorPages, setEditorPages] = useState<PageSummary[]>([])
  const [isLoadingEditorPages, setIsLoadingEditorPages] = useState(false)
  const [editorPagesError, setEditorPagesError] = useState('')
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null)

  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)

  // Password Change State
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete Page State
  const [pageToDelete, setPageToDelete] = useState<PageSummary | null>(null)
  const [isDeletingPage, setIsDeletingPage] = useState(false)
  const [deletePageError, setDeletePageError] = useState('')

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
          setEditorPagesError(axiosErr.response?.data?.error || 'Erro ao carregar páginas.')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingEditorPages(false)
        }
      }
    }

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

    fetchEditorPages()
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

  async function handleDeletePage() {
    if (!pageToDelete) return
    setIsDeletingPage(true)
    setDeletePageError('')
    try {
      await pageService.deletePage(pageToDelete.id)
      setEditorPages((prev) => prev.filter((p) => p.id !== pageToDelete.id))
      setPageToDelete(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setDeletePageError(axiosErr.response?.data?.error || 'Erro ao excluir carta. Tente novamente.')
    } finally {
      setIsDeletingPage(false)
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

  function handleCopyLink(page: PageSummary) {
    const publicHref = resolvePublicPageHref(page)
    if (!publicHref) return

    const fullUrl = isAbsoluteUrl(publicHref)
      ? publicHref
      : `${window.location.origin}${publicHref}`

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedPageId(page.id)
      setTimeout(() => {
        setCopiedPageId(null)
      }, 2500)
    })
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
    if (subscription?.isSubscribed || user?.isSubscribed || user?.subscriptionStatus === 'active') {
      return false
    }

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

  function resolveDisplayName(page: PageSummary, defaultPrefix = 'Carta') {
    let normalizedText: string | null = null

    for (const block of page.blocks) {
      if (block.type !== 'text') {
        continue
      }

      const trimmed = block.props.text.trim()
      if (!trimmed) {
        continue
      }

      normalizedText = trimmed.replace(/\s+/g, ' ')
      break
    }

    if (normalizedText) {
      return normalizedText.length > 56 ? `${normalizedText.slice(0, 53)}...` : normalizedText
    }

    return `${defaultPrefix} (${page.theme || 'Padrão'})`
  }

  const displayedPages = messageFilter === 'published'
    ? editorPublishedPages
    : messageFilter === 'drafts'
      ? editorDraftPages
      : [...editorPublishedPages, ...editorDraftPages]

  return (
    <div className="min-h-screen pb-16 pt-28">
      <Container size="narrow">
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

          {/* Banner de Assinatura */}
          {(subscription?.isSubscribed || user?.isSubscribed || user?.subscriptionStatus === 'active') ? (
            <div className="rounded-2xl border border-amber-300/60 bg-amber-50/40 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                    <Zap size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-text">Plano Ilimitado Ativo</h3>
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">PRO</span>
                    </div>
                    <p className="text-xs text-text-light mt-0.5">
                      {subscription?.daysRemaining ? `Restam ${subscription.daysRemaining} dias de acesso irrestrito para criar quantas cartas quiser.` : 'Criação e publicação de cartas ilimitadas liberadas.'}
                    </p>
                  </div>
                </div>
                <Link to="/create" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto font-semibold shadow-xs">
                    <Heart size={14} />
                    Nova Carta
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <InfinityIcon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-text">Plano Avulso</h3>
                      <Badge variant="default" className="text-[10px]">R$ 4,99/carta</Badge>
                    </div>
                    <p className="text-xs text-text-light mt-0.5">
                      Assine o <strong>Plano Ilimitado por R$ 15,00/mês</strong> e publique cartas sem limite por 30 dias!
                    </p>
                  </div>
                </div>
                <Link to="/planos" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto bg-primary font-semibold text-white shadow-xs hover:bg-primary/90">
                    <Zap size={14} />
                    Assinar Ilimitado (R$ 15)
                  </Button>
                </Link>
              </div>
            </div>
          )}

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
                Minhas Cartas ({editorPages.length})
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
              <div>
                <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
                  Cartas Criadas
                </h2>
                <p className="text-xs sm:text-sm text-text-light mt-0.5">
                  Gerencie seus correios elegantes publicados e rascunhos em andamento.
                </p>
              </div>
              <Link to="/create" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto font-semibold">
                  <Heart size={14} />
                  Criar Nova Carta
                </Button>
              </Link>
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-raised/80 rounded-xl border border-border/80 w-fit">
              <button
                type="button"
                onClick={() => setMessageFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  messageFilter === 'all'
                    ? 'bg-white text-text shadow-xs'
                    : 'text-text-light hover:text-text'
                }`}
              >
                Todas ({editorPages.length})
              </button>
              <button
                type="button"
                onClick={() => setMessageFilter('published')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  messageFilter === 'published'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-text-light hover:text-text'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Publicadas ({editorPublishedPages.length})
              </button>
              <button
                type="button"
                onClick={() => setMessageFilter('drafts')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  messageFilter === 'drafts'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-text-light hover:text-text'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Rascunhos ({editorDraftPages.length})
              </button>
            </div>

            {isLoadingEditorPages ? (
              <div className="space-y-3" aria-live="polite">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer h-28 rounded-2xl bg-white/60" />
                ))}
              </div>
            ) : editorPagesError ? (
              <InlineAlert tone="danger">{editorPagesError}</InlineAlert>
            ) : displayedPages.length === 0 ? (
              <Card glass className="py-12 text-center sm:py-16">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-text mb-1">
                  {messageFilter === 'published'
                    ? 'Nenhuma carta publicada ainda'
                    : messageFilter === 'drafts'
                      ? 'Nenhum rascunho em andamento'
                      : 'Você ainda não criou nenhuma carta'}
                </h3>
                <p className="text-xs sm:text-sm text-text-light max-w-sm mx-auto mb-5">
                  Surpreenda quem você ama com um correio elegante digital emocionante e personalizado.
                </p>
                <Link to="/create">
                  <Button size="sm" className="font-semibold shadow-xs">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Criar minha primeira carta
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3.5">
                {displayedPages.map((page) => {
                  const isPublished = page.status === 'published'
                  const publicHref = resolvePublicPageHref(page)
                  const isCopied = copiedPageId === page.id

                  return (
                    <Card
                      key={page.id}
                      glass
                      hover
                      className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 transition-all ${
                        isPublished ? 'border-emerald-500/20 bg-white/90' : 'bg-white/70'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-text text-sm sm:text-base break-words">
                            {resolveDisplayName(page, isPublished ? 'Carta Publicada' : 'Rascunho')}
                          </p>
                          {isPublished ? (
                            <Badge variant="success" className="text-[11px] font-semibold">
                              Publicada
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[11px] font-semibold">
                              Rascunho
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                          <span>
                            {isPublished && page.publishedAt
                              ? `Publicada em: ${new Date(page.publishedAt).toLocaleDateString('pt-BR')}`
                              : `Atualizada em: ${new Date(page.updatedAt).toLocaleDateString('pt-BR')}`}
                          </span>
                          <span>•</span>
                          <span>{page.blocks.length} {page.blocks.length === 1 ? 'bloco' : 'blocos'}</span>
                        </div>
                      </div>

                      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                        {isPublished && publicHref ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(page)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-raised transition-colors flex-1 sm:flex-initial"
                              title="Copiar link da carta"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-text-muted" />
                                  <span>Copiar Link</span>
                                </>
                              )}
                            </button>

                            {isAbsoluteUrl(publicHref) ? (
                              <a
                                href={publicHref}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-initial"
                              >
                                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Ver Carta
                                </Button>
                              </a>
                            ) : (
                              <Link to={publicHref} className="flex-1 sm:flex-initial">
                                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Ver Carta
                                </Button>
                              </Link>
                            )}
                          </>
                        ) : null}

                        <Link to={`/editor/${page.id}`} className="flex-1 sm:flex-initial">
                          <Button variant="ghost" size="sm" className="w-full text-xs font-semibold">
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>

                        {shouldShowPayNow(page) ? (
                          <Link to={`/payment/page/${page.id}`} className="flex-1 sm:flex-initial">
                            <Button size="sm" className="w-full text-xs font-semibold shadow-xs">
                              <Zap className="w-3.5 h-3.5 mr-1" />
                              Pagar e Publicar
                            </Button>
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setPageToDelete(page)}
                          className="p-2 rounded-xl text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir carta"
                          aria-label="Excluir carta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Modal de confirmação de exclusão de carta */}
            <Modal
              isOpen={Boolean(pageToDelete)}
              onClose={() => setPageToDelete(null)}
              title="Excluir Carta"
            >
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                  <Trash2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-text">
                    Tem certeza que deseja excluir esta carta?
                  </h3>
                  <p className="text-xs text-text-light mt-1">
                    Esta ação é permanente e o link deixará de funcionar.
                  </p>
                </div>

                {deletePageError ? (
                  <InlineAlert tone="danger">{deletePageError}</InlineAlert>
                ) : null}

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold"
                    onClick={handleDeletePage}
                    disabled={isDeletingPage}
                  >
                    {isDeletingPage ? 'Excluindo...' : 'Sim, excluir carta'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setPageToDelete(null)}
                    disabled={isDeletingPage}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Modal>
          </section>
        ) : (
          <section className="space-y-6" aria-label="Configurações">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
                Configurações da Conta
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-text-light sm:text-base">
                Ajuste segurança, sessão e dados da sua conta.
              </p>
            </div>

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

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.02, ease: [0.19, 1, 0.22, 1] }}
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
              title="Excluir Conta"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                    <Trash2 className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-text-light sm:text-base">
                    Tem certeza que deseja excluir sua conta? Esta ação é{' '}
                    <strong className="text-red-600">irreversível</strong>.
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
                    className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 font-semibold"
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
          </section>
        )}
      </Container>
    </div>
  )
}
