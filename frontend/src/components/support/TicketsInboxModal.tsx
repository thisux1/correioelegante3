import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import {
  contactService,
  type SupportTicketResponse,
} from '@/services/contactService'

export interface TicketsInboxModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TicketsInboxModal({ isOpen, onClose }: TicketsInboxModalProps) {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponse | null>(null)

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Reply form state
  const [replyText, setReplyText] = useState('')
  const [replyStatus, setReplyStatus] = useState<string>('keep')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')
  const [replyError, setReplyError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTickets()
    } else {
      setSelectedTicket(null)
      setReplyText('')
      setReplyStatus('keep')
      setReplySuccess('')
      setReplyError('')
    }
  }, [isOpen, filterStatus])

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
          ? `Resposta enviada com sucesso para ${selectedTicket.email} via Resend!`
          : 'Resposta gravada no chamado com sucesso!'
      )
      setReplyText('')
      setSelectedTicket(res.ticket)
      // Atualiza na lista local
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
    } catch {
      // ignore
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-800 shrink-0">
            <CheckCircle2 size={11} />
            Resolvido
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-sky-800 shrink-0">
            <Clock size={11} />
            Em Atendimento
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-gray-700 shrink-0">
            Fechado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-amber-800 shrink-0">
            Aberto
          </span>
        )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Central de Chamados & Atendimento"
      className="max-w-4xl w-full p-0 overflow-hidden rounded-3xl"
    >
      <div className="flex flex-col h-[85vh] sm:h-[80vh] w-full bg-white overflow-hidden">
        {/* Barra superior de cabeçalho */}
        <div className="p-3.5 sm:p-4 border-b border-rose-100 bg-rose-50/40 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <LifeBuoy size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-[#4c0519] text-sm sm:text-base truncate">
                  Central de Atendimento
                </h3>
                <p className="text-[10px] sm:text-xs text-[#701a35]/70 truncate">
                  Gestão de chamados e respostas por e-mail
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchTickets}
              className="p-1.5 sm:p-2 rounded-xl border border-rose-200 bg-white text-text-light hover:text-primary transition-colors cursor-pointer shrink-0"
              title="Atualizar chamados"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar protocolo, email, nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-rose-200 bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-rose-100/50 rounded-xl border border-rose-200/60 self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('open')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === 'open' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                }`}
              >
                Abertos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('in_progress')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === 'in_progress' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                }`}
              >
                Em Atendimento
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('resolved')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === 'resolved' ? 'bg-primary text-white shadow-2xs' : 'text-text-light hover:text-text'
                }`}
              >
                Resolvidos
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal responsivo */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden relative">
          {/* Coluna da Lista de Chamados */}
          <div
            className={`md:col-span-5 border-r border-rose-100 flex flex-col h-full overflow-hidden ${
              selectedTicket ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {isLoading && tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-light">
                  Carregando chamados...
                </div>
              ) : error ? (
                <div className="p-3">
                  <InlineAlert tone="danger">{error}</InlineAlert>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-light space-y-1">
                  <p className="font-semibold text-text">Nenhum chamado encontrado.</p>
                  <p className="text-[11px]">Novas solicitações aparecerão aqui automaticamente.</p>
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
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-100/70 border border-rose-300 shadow-xs'
                          : 'hover:bg-rose-50/60 border border-rose-100/40 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-mono text-xs font-bold text-primary">
                          {t.protocol}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <h4 className="font-display text-xs sm:text-sm font-bold text-[#4c0519] truncate">
                        {t.subject}
                      </h4>
                      <p className="text-[11px] text-[#701a35]/80 truncate mt-0.5">
                        {t.name} ({t.email})
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 pt-1 border-t border-rose-100/40">
                        <span>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                        {t.replies && t.replies.length > 0 ? (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <MessageSquare size={10} />
                            {t.replies.length} {t.replies.length === 1 ? 'resposta' : 'respostas'}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">Aguardando resposta</span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Coluna de Detalhe e Resposta */}
          <div
            className={`md:col-span-7 flex flex-col h-full bg-white overflow-hidden ${
              selectedTicket ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedTicket ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header do Chamado Selecionado */}
                <div className="p-3.5 sm:p-4 border-b border-rose-100 bg-rose-50/20 flex items-start justify-between gap-2.5 shrink-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(null)}
                        className="md:hidden inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-text hover:bg-rose-50 cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span>Voltar</span>
                      </button>
                      <span className="font-mono text-xs font-extrabold text-primary bg-rose-100 px-2 py-0.5 rounded-md">
                        {selectedTicket.protocol}
                      </span>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-[#4c0519] break-words">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#701a35]/80 break-words">
                      De: <strong>{selectedTicket.name}</strong> &lt;{selectedTicket.email}&gt;
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <label className="text-[10px] font-bold text-[#701a35]/70 uppercase">
                      Alterar Status:
                    </label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs font-semibold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-rose-200 bg-white text-[#4c0519] cursor-pointer"
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Atendimento</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                </div>

                {/* Conteúdo com scroll: Mensagem e Histórico de Respostas */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
                  {/* Mensagem do Usuário */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#701a35]/70 font-semibold">
                      <span>Mensagem do Solicitante</span>
                      <span className="font-mono">
                        {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4c0519] leading-relaxed whitespace-pre-wrap break-words">
                      {selectedTicket.message}
                    </p>
                    {selectedTicket.orderRef ? (
                      <div className="pt-2 border-t border-rose-100 text-xs font-mono text-primary font-semibold break-words">
                        Ref / ID da carta: {selectedTicket.orderRef}
                      </div>
                    ) : null}
                  </div>

                  {/* Histórico de Respostas */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#701a35]/70">
                        Histórico de Respostas Enviadas:
                      </h4>
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 sm:p-4 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Mail size={12} />
                              Resposta enviada ao cliente
                            </span>
                            <span className="font-mono text-[10px]">
                              {new Date(reply.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap break-words">
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

                {/* Caixa de Resposta (Fixa na base) */}
                <div className="p-3 sm:p-4 border-t border-rose-100 bg-white space-y-2.5 shrink-0">
                  <label className="text-[11px] sm:text-xs font-bold text-[#4c0519] block break-words">
                    Escrever Resposta para <strong>{selectedTicket.email}</strong>:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Digite sua resposta oficial aqui..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl border border-rose-200 bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    {/* Seletor Manual de Status no envio */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-text-muted shrink-0">
                        Status após envio:
                      </label>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-rose-200 bg-rose-50/40 text-[#4c0519]"
                      >
                        <option value="keep">Manter status atual</option>
                        <option value="in_progress">Em Atendimento</option>
                        <option value="resolved">Resolvido</option>
                        <option value="closed">Fechado</option>
                        <option value="open">Aberto</option>
                      </select>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyText.trim()}
                      className="font-bold shadow-xs w-full sm:w-auto"
                    >
                      <Send size={13} className="mr-1.5" />
                      {isSendingReply ? 'Enviando resposta...' : 'Enviar Resposta'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center text-text-light">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-primary flex items-center justify-center mb-3">
                  <Mail size={22} />
                </div>
                <h4 className="font-display text-sm sm:text-base font-bold text-[#4c0519] mb-1">
                  Nenhum chamado selecionado
                </h4>
                <p className="text-xs text-[#701a35]/70 max-w-xs">
                  Selecione um chamado na lista ao lado para ler os detalhes e responder ao cliente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
