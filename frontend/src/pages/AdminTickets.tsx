import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LifeBuoy,
  Search,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  Inbox,
  Check,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import {
  contactService,
  type SupportTicketResponse,
} from '@/services/contactService'

export function AdminTickets() {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponse | null>(null)

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Reply state
  const [replyText, setReplyText] = useState('')
  const [replyStatus, setReplyStatus] = useState<string>('keep')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')
  const [replyError, setReplyError] = useState('')
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [filterStatus])

  async function fetchTickets() {
    setIsLoading(true)
    setError('')
    try {
      const data = await contactService.listTickets({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery.trim() || undefined,
      })
      setTickets(data.tickets)
      if (selectedTicket) {
        const updated = data.tickets.find((t) => t.id === selectedTicket.id)
        if (updated) setSelectedTicket(updated)
      } else if (data.tickets.length > 0 && window.innerWidth >= 768) {
        // Auto-select first ticket on desktop
        setSelectedTicket(data.tickets[0])
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao carregar chamados de suporte.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyText.trim()) return

    setIsSendingReply(true)
    setReplyError('')
    setReplySuccess('')

    try {
      const res = await contactService.replyToTicket(
        selectedTicket.id,
        replyText.trim(),
        replyStatus === 'keep' ? selectedTicket.status : replyStatus
      )
      setReplySuccess(
        res.emailSent
          ? `Resposta enviada por e-mail para ${selectedTicket.email} via Resend!`
          : 'Resposta registrada no chamado com sucesso!'
      )
      setReplyText('')
      setSelectedTicket(res.ticket)
      setTickets((prev) =>
        prev.map((t) => (t.id === res.ticket.id ? res.ticket : t))
      )
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setReplyError(axiosErr.response?.data?.error || 'Erro ao enviar resposta.')
    } finally {
      setIsSendingReply(false)
    }
  }

  async function handleStatusChange(status: string) {
    if (!selectedTicket) return
    try {
      const updated = await contactService.updateStatus(selectedTicket.id, status)
      setSelectedTicket(updated)
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )
      setStatusUpdateSuccess(true)
      setTimeout(() => setStatusUpdateSuccess(false), 2000)
    } catch {
      // ignore
    }
  }

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 text-emerald-800 px-2 py-0.5 text-xs font-bold shrink-0">
            <CheckCircle2 size={12} />
            Resolvido
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100/90 text-sky-800 px-2 py-0.5 text-xs font-bold shrink-0">
            <Clock size={12} />
            Em Atendimento
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-bold shrink-0">
            Fechado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-800 px-2 py-0.5 text-xs font-bold shrink-0">
            Aberto
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#fffafb]">
      <Container size="wide" className="px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Cabeçalho da Página */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-primary flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#4c0519] tracking-tight">
                  Central de Atendimento
                </h1>
                <p className="text-xs sm:text-sm text-[#701a35]/80">
                  Gerenciamento de solicitações e respostas diretas aos clientes via Resend
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
              disabled={isLoading}
              className="text-xs font-semibold bg-white border-rose-200 text-[#4c0519] hover:bg-rose-50"
            >
              <RefreshCw size={14} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </header>

        {/* Layout Master-Detail em Tela Cheia */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[76vh] min-h-[600px]">
          {/* Coluna Esquerda: Lista de Chamados */}
          <section
            aria-label="Lista de chamados"
            className={`md:col-span-5 lg:col-span-4 bg-white rounded-3xl border border-rose-200/90 shadow-sm flex flex-col h-full overflow-hidden ${
              selectedTicket ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Barra de Busca e Filtros */}
            <div className="p-3.5 border-b border-rose-100 bg-rose-50/20 space-y-2.5 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar protocolo, email, nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-rose-200 bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Abas de Filtro Minimalistas */}
              <div className="flex items-center gap-1 p-0.5 bg-rose-100/50 rounded-xl border border-rose-200/60 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                  }`}
                >
                  Todos ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('open')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === 'open' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                  }`}
                >
                  Abertos ({counts.open})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('in_progress')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === 'in_progress' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                  }`}
                >
                  Em Atendimento ({counts.in_progress})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('resolved')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === 'resolved' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                  }`}
                >
                  Resolvidos ({counts.resolved})
                </button>
              </div>
            </div>

            {/* Lista de Cards de Chamados */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {isLoading && tickets.length === 0 ? (
                <div className="p-12 text-center text-xs text-text-light space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                  <p>Carregando chamados...</p>
                </div>
              ) : error ? (
                <div className="p-3">
                  <InlineAlert tone="danger">{error}</InlineAlert>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center text-text-light space-y-2">
                  <Inbox className="w-8 h-8 mx-auto text-rose-300" />
                  <p className="font-semibold text-sm text-[#4c0519]">Nenhum chamado encontrado</p>
                  <p className="text-xs text-[#701a35]/70">Novos chamados abertos pelos clientes aparecerão aqui.</p>
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTicket(t)
                        setReplyStatus('keep')
                        setReplySuccess('')
                        setReplyError('')
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-rose-50/90 border-rose-300 shadow-sm ring-1 ring-primary/20'
                          : 'bg-white hover:bg-rose-50/40 border-rose-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-extrabold text-primary">
                          {t.protocol}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <h2 className="font-display text-sm font-bold text-[#4c0519] truncate">
                        {t.subject}
                      </h2>
                      <p className="text-xs text-[#701a35]/80 truncate mt-0.5">
                        {t.name} &bull; {t.email}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-text-muted mt-2.5 pt-2 border-t border-rose-100/40">
                        <span>{new Date(t.createdAt).toLocaleDateString('pt-BR')} às {new Date(t.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {t.replies && t.replies.length > 0 ? (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <MessageSquare size={11} />
                            {t.replies.length}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold">Pendente</span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </section>

          {/* Coluna Direita: Detalhes, Histórico e Resposta */}
          <section
            aria-label="Detalhes e resposta do chamado"
            className={`md:col-span-7 lg:col-span-8 bg-white rounded-3xl border border-rose-200/90 shadow-sm flex flex-col h-full overflow-hidden ${
              selectedTicket ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedTicket ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header do Detalhe */}
                <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(null)}
                        className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-xs font-bold text-text hover:bg-rose-50 cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        Voltar
                      </button>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-primary bg-rose-100/80 px-2.5 py-0.5 rounded-lg">
                        {selectedTicket.protocol}
                      </span>
                      {getStatusBadge(selectedTicket.status)}
                      {statusUpdateSuccess ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <Check size={12} /> Salvo
                        </span>
                      ) : null}
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-[#4c0519] break-words mt-1">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-xs text-[#701a35]/80 break-words">
                      Solicitante: <strong>{selectedTicket.name}</strong> &lt;{selectedTicket.email}&gt;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <label className="text-xs font-bold text-[#701a35]/80">
                      Status:
                    </label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#4c0519] cursor-pointer shadow-2xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Atendimento</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                </div>

                {/* Área com Scroll: Pergunta Original e Histórico de Respostas */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fffdfd]">
                  {/* Mensagem Inicial do Cliente */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#701a35]/70 font-semibold border-b border-rose-200/60 pb-2">
                      <span className="font-bold uppercase tracking-wider text-[#e11d48]">
                        Mensagem do Solicitante
                      </span>
                      <span className="font-mono text-[11px]">
                        {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-[#4c0519] leading-relaxed whitespace-pre-wrap break-words">
                      {selectedTicket.message}
                    </p>
                    {selectedTicket.orderRef ? (
                      <div className="pt-2 flex items-center gap-2 text-xs font-mono text-primary font-bold">
                        <span>Referência da Carta:</span>
                        <Link
                          to={`/card/${selectedTicket.orderRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline hover:text-primary-dark"
                        >
                          {selectedTicket.orderRef}
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  {/* Respostas Anteriores */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#701a35]/80">
                        Histórico de Respostas Enviadas:
                      </h3>
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold border-b border-emerald-200/60 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Mail size={13} />
                              Resposta enviada por e-mail (Resend)
                            </span>
                            <span className="font-mono text-[11px]">
                              {new Date(reply.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap break-words">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {replySuccess ? (
                    <InlineAlert tone="success">{replySuccess}</InlineAlert>
                  ) : null}
                  {replyError ? (
                    <InlineAlert tone="danger">{replyError}</InlineAlert>
                  ) : null}
                </div>

                {/* Caixa de Digitação de Resposta (Fixa na Base) */}
                <div className="p-4 sm:p-5 border-t border-rose-100 bg-white space-y-3 shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-[#4c0519] block">
                      Responder para: <strong className="text-primary">{selectedTicket.email}</strong>
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Digite sua resposta oficial aqui. O cliente receberá um e-mail formatado pelo domínio oficial..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 text-sm rounded-2xl border border-rose-200 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-text-muted"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-text-muted shrink-0">
                        Status após envio:
                      </label>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/40 text-[#4c0519] cursor-pointer"
                      >
                        <option value="keep">Manter status atual ({selectedTicket.status})</option>
                        <option value="in_progress">Marcar como Em Atendimento</option>
                        <option value="resolved">Marcar como Resolvido</option>
                        <option value="closed">Marcar como Fechado</option>
                        <option value="open">Marcar como Aberto</option>
                      </select>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyText.trim()}
                      className="font-bold shadow-sm w-full sm:w-auto px-5 py-2.5"
                    >
                      <Send size={14} className="mr-1.5" />
                      {isSendingReply ? 'Enviando...' : 'Enviar Resposta por E-mail'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-light space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-200 text-primary flex items-center justify-center shadow-xs">
                  <Mail size={24} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4c0519]">
                  Nenhum chamado selecionado
                </h3>
                <p className="text-xs sm:text-sm text-[#701a35]/70 max-w-sm">
                  Selecione um chamado na lista ao lado para visualizar a mensagem, o histórico e responder diretamente por e-mail.
                </p>
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  )
}
