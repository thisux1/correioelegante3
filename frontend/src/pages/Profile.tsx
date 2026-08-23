import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart,
  Trash2,
  Settings as SettingsIcon,
  Zap,
  Infinity as InfinityIcon,
  Copy,
  Check,
  Eye,
  Pencil,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { ProfileCardSkeleton } from '@/components/ui/ProfileCardSkeleton'
import { useAuthStore } from '@/store/authStore'
import { pageService, type PageSummary } from '@/services/pageService'
import { paymentService, type SubscriptionStatusResponse } from '@/services/paymentService'
import { Container } from '@/components/layout/Container'

export function Profile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  // Se vier com ?tab=settings, redireciona para a página dedicada de configurações
  useEffect(() => {
    if (searchParams.get('tab') === 'settings') {
      navigate('/settings', { replace: true })
    }
  }, [searchParams, navigate])

  const [messageFilter, setMessageFilter] = useState<'all' | 'published' | 'drafts'>('all')
  const [editorPages, setEditorPages] = useState<PageSummary[]>([])
  const [isLoadingEditorPages, setIsLoadingEditorPages] = useState(false)
  const [editorPagesError, setEditorPagesError] = useState('')
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null)

  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)

  // Delete Page State
  const [pageToDelete, setPageToDelete] = useState<PageSummary | null>(null)
  const [isDeletingPage, setIsDeletingPage] = useState(false)
  const [deletePageError, setDeletePageError] = useState('')

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

    if (Array.isArray(page.blocks)) {
      for (const block of page.blocks) {
        if (!block || typeof block !== 'object') continue

        if (block.type === 'envelope' && block.props) {
          const envelopeProps = block.props as { recipientName?: string }
          if (typeof envelopeProps.recipientName === 'string' && envelopeProps.recipientName.trim()) {
            normalizedText = `Para ${envelopeProps.recipientName.trim()}`
            break
          }
        }

        if (block.type === 'text' && block.props) {
          const textProps = block.props as { text?: string; html?: string }
          const rawText = typeof textProps.text === 'string'
            ? textProps.text
            : typeof textProps.html === 'string'
              ? textProps.html.replace(/<[^>]*>/g, '')
              : ''
          const trimmed = rawText.trim()
          if (trimmed) {
            normalizedText = trimmed.replace(/\s+/g, ' ')
            break
          }
        }
      }
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
          {/* Header Superior com Título e Ações Rápidas */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <header className="space-y-1.5">
              <h1 className="font-display text-4xl font-bold text-text sm:text-5xl">
                Minhas Cartas
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-light sm:text-base">
                Crie, envie e gerencie a magia dos seus correios elegantes.
              </p>
            </header>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link to="/settings">
                <Button variant="outline" size="sm" className="font-semibold text-xs sm:text-sm">
                  <SettingsIcon size={16} className="mr-1.5 text-text-light" />
                  Configurações
                </Button>
              </Link>
              <Link to="/create">
                <Button size="sm" className="font-semibold text-xs sm:text-sm shadow-xs">
                  <Heart size={15} className="mr-1.5 fill-white" />
                  Nova Carta
                </Button>
              </Link>
            </div>
          </div>

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
        </motion.div>

        <section className="space-y-6" aria-label="Minhas Cartas">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-raised/80 rounded-xl border border-border/80 w-fit">
            <button
              type="button"
              onClick={() => setMessageFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                messageFilter === 'all'
                  ? 'bg-white text-[#4c0519] shadow-xs'
                  : 'text-text-light hover:text-text'
              }`}
            >
              Todas ({editorPages.length})
            </button>
            <button
              type="button"
              onClick={() => setMessageFilter('published')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
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
            <ProfileCardSkeleton count={3} />
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
                  <Heart className="w-4 h-4 mr-1.5 fill-white" />
                  Criar minha primeira carta
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-5">
              {displayedPages.map((page) => {
                const isPublished = page.status === 'published'
                const publicHref = resolvePublicPageHref(page)
                const isCopied = copiedPageId === page.id

                return (
                  <div
                    key={page.id}
                    className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      isPublished
                        ? 'bg-white border-rose-300 shadow-lg shadow-rose-950/5'
                        : 'bg-[#fffdfa] border-dashed border-amber-400 shadow-md shadow-amber-950/5'
                    }`}
                  >
                    {/* Aba Superior do Envelope com Chanfro em Formato de V */}
                    <div className="relative w-full overflow-visible">
                      {/* Fundo da aba com o chanfro em V */}
                      <div
                        className={`relative w-full pt-3 px-5 sm:px-7 pb-6 ${
                          isPublished
                            ? 'bg-gradient-to-b from-[#fff0f4] via-[#ffe4ec] to-[#fecdd3]/70'
                            : 'bg-gradient-to-b from-[#fff9ec] via-[#fef3c7] to-[#fde68a]/60'
                        }`}
                        style={{
                          clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 16px), 50% 100%, 0% calc(100% - 16px))',
                        }}
                      >
                        <div className="flex items-center justify-between pb-2">
                          {/* Carimbo Postal de Registro / Linha Aérea */}
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${isPublished ? 'bg-[#e11d48]' : 'bg-amber-500'}`} />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#701a35]/80">
                              {isPublished ? 'CORREIO REGISTRADO' : 'RASCUNHO EM ANDAMENTO'}
                            </span>
                          </div>

                          {/* Selo Postal no Canto Superior Direito (Sempre Visível) */}
                          <div
                            className={`flex items-center gap-1.5 rounded-md border-2 border-dashed px-2.5 py-1 shadow-xs select-none ${
                              isPublished
                                ? 'border-rose-400 bg-white text-[#e11d48]'
                                : 'border-amber-400 bg-white text-amber-800'
                            }`}
                            title="Selo Postal"
                          >
                            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider">
                              {isPublished ? 'SELO POSTAL' : 'NÃO SELADO'}
                            </span>
                            <span className="text-[10px] opacity-60 font-serif">≈≈</span>
                          </div>
                        </div>
                      </div>

                      {/* Linha de borda do chanfro em V */}
                      <svg
                        className="pointer-events-none absolute bottom-0 inset-x-0 w-full h-4"
                        viewBox="0 0 100 16"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M0,0 L50,16 L100,0"
                          fill="none"
                          stroke={isPublished ? '#fda4af' : '#fbbf24'}
                          strokeWidth="1.5"
                        />
                      </svg>

                      {/* Lacre de Cera / Wax Seal Exatamente na Ponta do V */}
                      <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 z-20 pointer-events-none">
                        {isPublished ? (
                          <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 via-[#e11d48] to-[#9f1239] text-white shadow-lg border-2 border-white ring-2 ring-rose-400/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                            title="Lacre de Cera Fechado"
                          >
                            <Heart className="w-4.5 h-4.5 fill-white text-white drop-shadow-xs" />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 border-2 border-amber-400 shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                            title="Rascunho Aberto"
                          >
                            <Pencil className="w-4.5 h-4.5 text-amber-700" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Corpo do Envelope / Conteúdo da Carta */}
                    <div className="p-5 sm:p-7 pt-6 sm:pt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      {/* Seção esquerda: Informações de Endereçamento */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#701a35]/60 font-mono">
                          <span>{isPublished ? 'Para:' : 'Título:'}</span>
                        </div>

                        <h4 className="font-display font-extrabold text-[#4c0519] text-lg sm:text-2xl truncate group-hover:text-[#e11d48] transition-colors">
                          {resolveDisplayName(page, isPublished ? 'Carta Publicada' : 'Rascunho')}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#701a35]/80 font-medium pt-1">
                          <span className="font-mono">
                            {isPublished && page.publishedAt
                              ? `Expedição: ${new Date(page.publishedAt).toLocaleDateString('pt-BR')}`
                              : `Salvo em: ${new Date(page.updatedAt).toLocaleDateString('pt-BR')}`}
                          </span>
                          <span>•</span>
                          <span>{page.blocks.length} {page.blocks.length === 1 ? 'bloco' : 'blocos'}</span>
                          {page.theme ? (
                            <>
                              <span>•</span>
                              <span className="capitalize">{page.theme.replace(/-/g, ' ')}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Seção direita: Ações da Carta */}
                      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap shrink-0">
                        {isPublished && publicHref ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(page)}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-rose-200/80 bg-white text-xs font-bold text-[#4c0519] hover:bg-rose-50 hover:border-rose-300 transition-colors flex-1 sm:flex-initial shadow-2xs cursor-pointer"
                              title="Copiar link da carta"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-[#701a35]" />
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
                                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-2 border-rose-200/80">
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Ver
                                </Button>
                              </a>
                            ) : (
                              <Link to={publicHref} className="flex-1 sm:flex-initial">
                                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-2 border-rose-200/80">
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Ver
                                </Button>
                              </Link>
                            )}
                          </>
                        ) : null}

                        <Link to={`/editor/${page.id}`} className="flex-1 sm:flex-initial">
                          <Button
                            variant={isPublished ? 'ghost' : 'outline'}
                            size="sm"
                            className={`w-full text-xs font-bold ${
                              !isPublished ? 'border-2 border-amber-400/80 bg-white text-amber-900 hover:bg-amber-50' : 'border border-transparent'
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                        </Link>

                        {shouldShowPayNow(page) ? (
                          <Link to={`/payment/page/${page.id}`} className="flex-1 sm:flex-initial">
                            <Button size="sm" className="w-full text-xs font-bold shadow-xs">
                              <Zap className="w-3.5 h-3.5 mr-1" />
                              Pagar e Publicar
                            </Button>
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setPageToDelete(page)}
                          className="p-2.5 rounded-xl text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir carta"
                          aria-label="Excluir carta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
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
      </Container>
    </div>
  )
}
