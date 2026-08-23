import { useEffect, useState } from 'react'
import {
  LifeBuoy,
  Search,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ChevronRight,
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
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')
  const [replyError, setReplyError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTickets()
    } else {
      setSelectedTicket(null)
      setReplyText('')
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
        'resolved'
      )
      setReplySuccess(
        res.emailSent
          ? `Resposta enviada com sucesso para ${selectedTicket.email}!`
          : 'Resposta salva no chamado com sucesso!'
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
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
            <CheckCircle2 size={12} />
            Resolvido
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">
            <Clock size={12} />
            Em Atendimento
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
            Fechado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
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
      className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
    >
      <div className="flex flex-col h-[75vh]">
        {/* Barra superior de controle */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LifeBuoy size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#4c0519] text-base sm:text-lg">
                Chamados de Suporte
              </h3>
              <p className="text-[11px] text-[#701a35]/70">
                Gerencie mensagens e responda diretamente aos clientes via Resend.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-white rounded-xl border border-rose-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-primary text-white' : 'text-text-light hover:text-text'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('open')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'open' ? 'bg-primary text-white' : 'text-text-light hover:text-text'
                }`}
              >
                Abertos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('resolved')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'resolved' ? 'bg-primary text-white' : 'text-text-light hover:text-text'
                }`}
              >
                Resolvidos
              </button>
            </div>

            <button
              type="button"
              onClick={fetchTickets}
              className="p-2 rounded-xl border border-rose-200 bg-white text-text-light hover:text-primary transition-colors cursor-pointer"
              title="Atualizar chamados"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Conteúdo: Lista à esquerda e Detalhes/Resposta à direita */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Coluna da Lista de Chamados */}
          <div
            className={`md:col-span-5 border-r border-rose-100 flex flex-col h-full overflow-hidden ${
              selectedTicket ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Input de busca */}
            <div className="p-3 border-b border-rose-100 bg-white">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar protocolo, nome, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-rose-200 bg-rose-50/20 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Lista com scroll */}
            <div className="flex-1 overflow-y-auto divide-y divide-rose-50 p-2 space-y-1">
              {isLoading && tickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-light">
                  Carregando chamados...
                </div>
              ) : error ? (
                <div className="p-3">
                  <InlineAlert tone="danger">{error}</InlineAlert>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-light">
                  Nenhum chamado encontrado.
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-100/60 border border-rose-300/80 shadow-xs'
                          : 'hover:bg-rose-50/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
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
                      <div className="flex items-center justify-between text-[10px] text-text-muted mt-2">
                        <span>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                        {t.replies && t.replies.length > 0 ? (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <MessageSquare size={10} />
                            {t.replies.length} {t.replies.length === 1 ? 'resposta' : 'respostas'}
                          </span>
                        ) : null}
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
                <div className="p-4 border-b border-rose-100 bg-rose-50/20 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(null)}
                        className="md:hidden p-1 rounded-lg hover:bg-rose-100 text-text-light cursor-pointer"
                      >
                        <ChevronRight size={16} className="rotate-180" />
                      </button>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-primary bg-rose-100/80 px-2 py-0.5 rounded-md">
                        {selectedTicket.protocol}
                      </span>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h3 className="font-display text-base font-bold text-[#4c0519]">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-xs text-[#701a35]/80">
                      De: <strong>{selectedTicket.name}</strong> &lt;{selectedTicket.email}&gt;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-rose-200 bg-white text-[#4c0519] cursor-pointer"
                    >
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Atendimento</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                </div>

                {/* Conteúdo com scroll: Mensagem Original e Respostas */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Mensagem do Usuário */}
                  <div className="rounded-2xl border-2 border-rose-200/80 bg-rose-50/30 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#701a35]/70 font-semibold">
                      <span>Mensagem do Solicitante</span>
                      <span className="font-mono text-[11px]">
                        {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4c0519] leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                    {selectedTicket.orderRef ? (
                      <div className="pt-2 border-t border-rose-100 text-xs font-mono text-primary font-semibold">
                        Ref / ID da carta: {selectedTicket.orderRef}
                      </div>
                    ) : null}
                  </div>

                  {/* Histórico de Respostas */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#701a35]/70">
                        Histórico de Respostas Enviadas:
                      </h4>
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Mail size={13} />
                              Resposta enviada por e-mail (Resend)
                            </span>
                            <span className="font-mono text-[10px]">
                              {new Date(reply.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap">
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

                {/* Caixa de Resposta */}
                <div className="p-4 border-t border-rose-100 bg-white space-y-3">
                  <label className="text-xs font-bold text-[#4c0519] flex items-center justify-between">
                    <span>Escrever Resposta Oficial (será enviada via Resend para {selectedTicket.email}):</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Digite a resposta que o cliente receberá em seu e-mail formatado..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-rose-200 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">
                      O chamado será marcado como <strong>Resolvido</strong> ao responder.
                    </span>
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyText.trim()}
                      className="font-bold shadow-xs"
                    >
                      <Send size={14} className="mr-1.5" />
                      {isSendingReply ? 'Enviando e-mail...' : 'Responder por E-mail'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-light">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-primary flex items-center justify-center mb-3">
                  <Mail size={22} />
                </div>
                <h4 className="font-display text-base font-bold text-[#4c0519] mb-1">
                  Nenhum chamado selecionado
                </h4>
                <p className="text-xs text-[#701a35]/70 max-w-xs">
                  Selecione um chamado na lista ao lado para ler os detalhes e enviar a resposta oficial por e-mail.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
