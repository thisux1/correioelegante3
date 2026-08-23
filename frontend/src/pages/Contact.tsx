import { useState, type FormEvent } from 'react'
import {
  Mail,
  HelpCircle,
  ChevronDown,
  Copy,
  Check,
  Send,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  FileQuestion,
  LifeBuoy,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { LegalPageSkeleton } from '@/components/ui/LegalPageSkeleton'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { contactService, type SupportTicketResponse } from '@/services/contactService'
import { TicketsInboxModal } from '@/components/support/TicketsInboxModal'
import { useAuthStore } from '@/store/authStore'

export interface ContactProps {
  isLoading?: boolean
}

const faqs = [
  {
    question: 'Como envio a carta para o meu destinatário?',
    answer:
      'Após criar e publicar sua carta, você recebe um link exclusivo e um QR Code pronto para compartilhar no WhatsApp, redes sociais ou até imprimir em um cartão físico.',
  },
  {
    question: 'Paguei pelo PIX ou Cartão, quando a carta é liberada?',
    answer:
      'A confirmação dos pagamentos via PIX e Cartão de Crédito é processada automaticamente em tempo real. Em poucos segundos após o pagamento, a carta é liberada e seu link fica pronto para envio.',
  },
  {
    question: 'Posso editar a carta depois de já ter publicado?',
    answer:
      'Sim! Basta acessar "Minhas Cartas" no menu superior e clicar em "Editar". Qualquer alteração em textos, fotos ou músicas é sincronizada instantaneamente no mesmo link.',
  },
  {
    question: 'Por quanto tempo a carta permanece online?',
    answer:
      'As cartas publicadas permanecem ativas por tempo indeterminado nos servidores em nuvem, para que suas memórias fiquem guardadas com segurança.',
  },
  {
    question: 'Como funciona a assinatura do Plano Ilimitado?',
    answer:
      'O Plano Ilimitado (R$ 15,00/mês) libera a criação e publicação de quantas cartas você desejar durante 30 dias corridos, sem cobrança avulsa por carta.',
  },
]

export function Contact({ isLoading }: ContactProps = {}) {
  const { user } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [subject, setSubject] = useState('duvida_geral')
  const [orderRef, setOrderRef] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdTicket, setCreatedTicket] = useState<SupportTicketResponse | null>(null)
  const [error, setError] = useState('')

  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedProtocol, setCopiedProtocol] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [isDevInfoOpen, setIsDevInfoOpen] = useState(false)
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false)

  if (isLoading) {
    return <LegalPageSkeleton />
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText('contato@correioelegante.studio').then(() => {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2500)
    })
  }

  function handleCopyProtocol(protocol: string) {
    navigator.clipboard.writeText(protocol).then(() => {
      setCopiedProtocol(true)
      setTimeout(() => setCopiedProtocol(false), 2500)
    })
  }

  async function handleSubmitTicket(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (message.trim().length < 10) {
      setError('A mensagem deve conter no mínimo 10 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      const subjectLabels: Record<string, string> = {
        duvida_geral: 'Dúvida sobre criação de carta',
        pagamento_pix: 'Problema com Pagamento / PIX',
        link_qrcode: 'Dúvida sobre Link ou QR Code',
        plano_ilimitado: 'Assinatura / Plano Ilimitado',
        sugestao: 'Sugestão de melhoria ou feedback',
        outro: 'Outro assunto',
      }

      const ticket = await contactService.createTicket({
        name: name.trim(),
        email: email.trim(),
        subject: subjectLabels[subject] || subject,
        orderRef: orderRef.trim() || undefined,
        message: message.trim(),
      })

      setCreatedTicket(ticket)
      setName('')
      setOrderRef('')
      setMessage('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || 'Erro ao registrar chamado. Tente novamente ou envie um e-mail direto para contato@correioelegante.studio.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 relative overflow-hidden">
      <Container size="narrow">
        {/* Cabeçalho */}
        <ScrollReveal animateOnMount>
          <header className="text-center mb-10 sm:mb-14 space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] tracking-tight">
              Central de Atendimento & Ajuda
            </h1>
            <p className="text-[#701a35]/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Precisa de ajuda com sua carta, pagamento ou tem alguma dúvida? Abra um chamado de suporte ou envie um e-mail.
            </p>
          </header>
        </ScrollReveal>

        {/* Banner de Acesso Rápido para Administradores */}
        {(user?.isAdmin || user?.email?.toLowerCase().endsWith('@correioelegante.studio')) ? (
          <ScrollReveal direction="up" delay={0.03} animateOnMount>
            <div className="mb-8 rounded-3xl border-2 border-[#e11d48]/30 bg-gradient-to-r from-rose-100/60 via-rose-50 to-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#e11d48] text-white flex items-center justify-center shrink-0 shadow-md">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-[#4c0519]">
                    Painel do Administrador
                  </h2>
                  <p className="text-xs text-[#701a35]/80">
                    Você está autenticado com privilégios de suporte ({user?.email}).
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsTicketsModalOpen(true)}
                className="w-full sm:w-auto font-bold shadow-md shadow-rose-500/20 shrink-0"
              >
                <LifeBuoy size={16} className="mr-2" />
                Abrir Central de Chamados
              </Button>
            </div>
          </ScrollReveal>
        ) : null}

        {/* Formulário de Abertura de Chamado (Funcional) */}
        <ScrollReveal direction="up" delay={0.06} animateOnMount>
          <div className="bg-white rounded-3xl border-2 border-rose-200/80 p-6 sm:p-10 shadow-lg shadow-rose-950/5 mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48] flex items-center justify-center shrink-0">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-[#4c0519]">
                  Abrir Chamado de Suporte
                </h2>
                <p className="text-xs sm:text-sm text-[#701a35]/80">
                  Preencha os dados e nosso sistema gerará um número de protocolo imediato.
                </p>
              </div>
            </div>

            {createdTicket ? (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-emerald-950">
                    Chamado Registrado com Sucesso!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-1 max-w-md mx-auto">
                    Seu chamado foi gravado em nosso sistema. Guarde o protocolo abaixo para acompanhamento:
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-emerald-200 shadow-xs mx-auto">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-800 px-2">
                    {createdTicket.protocol}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyProtocol(createdTicket.protocol)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    {copiedProtocol ? (
                      <>
                        <Check size={14} className="text-emerald-700" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold"
                    onClick={() => setCreatedTicket(null)}
                  >
                    Abrir outro chamado
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Seu Nome *"
                    type="text"
                    placeholder="Ex: Maria da Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Seu E-mail de Contato *"
                    type="email"
                    placeholder="Ex: maria@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text">
                      Motivo do Chamado *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface text-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="duvida_geral">Dúvida sobre criação de carta</option>
                      <option value="pagamento_pix">Problema com Pagamento / PIX</option>
                      <option value="link_qrcode">Dúvida sobre Link ou QR Code</option>
                      <option value="plano_ilimitado">Assinatura / Plano Ilimitado</option>
                      <option value="sugestao">Sugestão de melhoria ou feedback</option>
                      <option value="outro">Outro assunto</option>
                    </select>
                  </div>

                  <Input
                    label="Link ou Código da Carta (Opcional)"
                    type="text"
                    placeholder="Ex: link da carta ou ID do pedido"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">
                    Descreva sua solicitação *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explique o que aconteceu ou a sua dúvida para que possamos te ajudar com rapidez..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-border bg-surface text-text text-sm font-medium placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[110px]"
                    required
                  />
                </div>

                {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto font-bold shadow-md shadow-rose-500/20"
                    disabled={isSubmitting}
                  >
                    <Send size={16} className="mr-2" />
                    {isSubmitting ? 'Registrando chamado...' : 'Enviar Chamado de Suporte'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ScrollReveal>

        {/* Card de E-mail Direto */}
        <ScrollReveal direction="up" delay={0.12} animateOnMount>
          <Card className="bg-white border-2 border-rose-200/80 p-6 sm:p-7 rounded-3xl shadow-md shadow-rose-950/5 text-center mb-12 sm:mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#4c0519]">
                    Prefere e-mail direto?
                  </h3>
                  <p className="text-xs text-[#701a35]/80">
                    Você também pode nos escrever diretamente para nosso endereço oficial:
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#e11d48] bg-rose-50/60 px-3 py-2 rounded-xl border border-rose-200/60">
                  contato@correioelegante.studio
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-[#4c0519] hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Dúvidas Frequentes (FAQ) */}
        <ScrollReveal direction="up" delay={0.16} animateOnMount>
          <section className="mb-14 sm:mb-18 space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <FileQuestion className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#4c0519]">
                  Dúvidas Frequentes
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#701a35]/80">
                Respostas rápidas para as principais perguntas sobre o funcionamento das cartas.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border-2 border-rose-200/70 bg-white transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left font-display text-sm sm:text-base font-bold text-[#4c0519] hover:text-[#e11d48] transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle size={18} className="shrink-0 text-primary" />
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={18} className="text-text-muted shrink-0" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24 }}
                        >
                          <div className="border-t border-rose-100 p-4 sm:p-5 pt-3 text-xs sm:text-sm leading-relaxed text-[#701a35]/90 bg-rose-50/20">
                            {faq.answer}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* Informações Técnicas & Criação (Discreto, separado no rodapé) */}
        <div className="border-t border-rose-200/60 pt-8 mt-12">
          <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setIsDevInfoOpen(!isDevInfoOpen)}
              className="flex w-full items-center justify-between text-xs font-semibold text-text-light hover:text-text cursor-pointer"
              aria-expanded={isDevInfoOpen}
            >
              <span>Créditos & Conexões do Desenvolvedor</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isDevInfoOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isDevInfoOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-3 space-y-3"
                >
                  <p className="text-xs text-text-light leading-relaxed">
                    Plataforma idealizada e desenvolvida por Thiago com React 19, TypeScript e Node.js.
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <a
                      href="https://github.com/thisux1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:text-primary transition-colors"
                    >
                      <Github size={14} />
                      GitHub (@thisux1)
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                    <span>•</span>
                    <a
                      href="https://linkedin.com/in/thisux"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:text-[#0A66C2] transition-colors"
                    >
                      <Linkedin size={14} />
                      LinkedIn
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal da Central de Chamados & Respostas via Resend */}
        <TicketsInboxModal
          isOpen={isTicketsModalOpen}
          onClose={() => setIsTicketsModalOpen(false)}
        />
      </Container>
    </div>
  )
}
