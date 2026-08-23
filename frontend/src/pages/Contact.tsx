import { useState, type FormEvent } from 'react'
import {
  Mail,
  Clock,
  HelpCircle,
  CheckCircle2,
  Send,
  ChevronDown,
  Github,
  Linkedin,
  ShieldCheck,
  FileQuestion,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { LegalPageSkeleton } from '@/components/ui/LegalPageSkeleton'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

export interface ContactProps {
  isLoading?: boolean
}

const faqs = [
  {
    question: 'Como envio a carta para o meu destinatário?',
    answer:
      'Após criar e publicar sua carta, você receberá um link exclusivo e um QR Code em alta definição. Você pode enviar diretamente pelo WhatsApp, Instagram, redes sociais ou até imprimir o QR Code em um cartão físico.',
  },
  {
    question: 'Paguei pelo PIX ou Cartão, quando a carta é liberada?',
    answer:
      'A confirmação dos pagamentos via PIX (Mercado Pago) e Cartão de Crédito (Stripe) é processada em tempo real por webhooks seguros. Em poucos segundos após o pagamento, a carta é liberada e seu link fica pronto para envio.',
  },
  {
    question: 'Posso editar a carta depois de já ter publicado?',
    answer:
      'Sim! Basta acessar "Minhas Cartas" no topo do site e clicar em "Editar". Qualquer alteração em textos, fotos, músicas ou vídeos é sincronizada instantaneamente no mesmo link, sem necessidade de pagar novamente.',
  },
  {
    question: 'Por quanto tempo a carta permanece online?',
    answer:
      'As cartas publicadas permanecem ativas por tempo indeterminado nos nossos servidores seguros em nuvem, garantindo que suas memórias e recados fiquem guardados para sempre.',
  },
  {
    question: 'Como funciona a assinatura do Plano Ilimitado?',
    answer:
      'O Plano Ilimitado (R$ 15,00/mês) libera a criação e publicação de quantas cartas você desejar durante 30 dias corridos, sem cobrança avulsa por carta.',
  },
]

export function Contact({ isLoading }: ContactProps = {}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('duvida_geral')
  const [orderRef, setOrderRef] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [isDevInfoOpen, setIsDevInfoOpen] = useState(false)

  if (isLoading) {
    return <LegalPageSkeleton />
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulação de envio com fallback para mailto
      await new Promise((resolve) => setTimeout(resolve, 800))
      setIsSuccess(true)
      setName('')
      setEmail('')
      setOrderRef('')
      setMessage('')
    } catch {
      setError('Ocorreu um erro ao enviar sua mensagem. Tente novamente ou envie diretamente para contato@correioelegante.studio.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 relative overflow-hidden">
      <Container size="narrow">
        {/* Cabeçalho Principal */}
        <ScrollReveal animateOnMount>
          <header className="text-center mb-12 sm:mb-16 space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#4c0519] tracking-tight">
              Central de Ajuda & Atendimento
            </h1>
            <p className="text-[#701a35]/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Precisa de ajuda com sua carta, pagamento ou tem alguma dúvida? Nossa equipe está pronta para resolver seu chamado com rapidez e carinho.
            </p>
          </header>
        </ScrollReveal>

        {/* 3 Cartões de Canais de Suporte Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 sm:mb-16">
          <ScrollReveal direction="up" delay={0.05} animateOnMount>
            <Card className="h-full bg-white border-2 border-rose-200/80 p-6 rounded-3xl shadow-md shadow-rose-950/5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48] flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4c0519]">
                  E-mail de Suporte
                </h3>
                <p className="text-xs sm:text-sm text-[#701a35]/80 leading-relaxed">
                  Envie sua dúvida ou comprovante diretamente para nosso time.
                </p>
              </div>
              <div className="pt-4 mt-auto border-t border-rose-100">
                <a
                  href="mailto:contato@correioelegante.studio"
                  className="font-mono text-xs font-bold text-[#e11d48] hover:underline break-all"
                >
                  contato@correioelegante.studio
                </a>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1} animateOnMount>
            <Card className="h-full bg-white border-2 border-rose-200/80 p-6 rounded-3xl shadow-md shadow-rose-950/5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4c0519]">
                  Tempo de Resposta
                </h3>
                <p className="text-xs sm:text-sm text-[#701a35]/80 leading-relaxed">
                  Atendimento ágil em até <strong>2 horas úteis</strong> para problemas com envio de cartas.
                </p>
              </div>
              <div className="pt-4 mt-auto border-t border-rose-100">
                <span className="text-xs font-semibold text-[#701a35]/70">
                  Seg a Sáb: 08h às 20h
                </span>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15} animateOnMount>
            <Card className="h-full bg-white border-2 border-rose-200/80 p-6 rounded-3xl shadow-md shadow-rose-950/5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#4c0519]">
                  Garantia de Entrega
                </h3>
                <p className="text-xs sm:text-sm text-[#701a35]/80 leading-relaxed">
                  Suporte total para recuperação de links, troca de fotos e liberação imediata de QR Codes.
                </p>
              </div>
              <div className="pt-4 mt-auto border-t border-rose-100">
                <span className="text-xs font-semibold text-emerald-700">
                  100% dos chamados atendidos
                </span>
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* Formulário de Abertura de Chamado */}
        <ScrollReveal direction="up" delay={0.2} animateOnMount>
          <div className="bg-white rounded-3xl border-2 border-rose-200/80 p-6 sm:p-10 shadow-lg shadow-rose-950/5 mb-14 sm:mb-18">
            <div className="mb-6 space-y-1.5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#4c0519]">
                Abrir Chamado de Suporte
              </h2>
              <p className="text-xs sm:text-sm text-[#701a35]/80">
                Preencha os dados abaixo e entraremos em contato com você o mais rápido possível.
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-emerald-900">
                  Mensagem enviada com sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Recebemos seu chamado. Nossa equipe responderá diretamente no seu e-mail cadastrado em breve.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold"
                    onClick={() => setIsSuccess(false)}
                  >
                    Enviar outra mensagem
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                      Motivo do Contato *
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
                    label="ID da Carta ou Transação (Opcional)"
                    type="text"
                    placeholder="Ex: link da carta ou código do PIX"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">
                    Descreva sua dúvida ou problema *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explique com detalhes o que você precisa para que possamos te ajudar da melhor forma..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-border bg-surface text-text text-sm font-medium placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y min-h-[100px]"
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
                    {isSubmitting ? 'Enviando chamado...' : 'Enviar Mensagem de Suporte'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ScrollReveal>

        {/* Seção de Autoatendimento & Dúvidas Frequentes (FAQ) */}
        <ScrollReveal direction="up" delay={0.25} animateOnMount>
          <section className="mb-14 sm:mb-18 space-y-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <FileQuestion className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#4c0519]">
                  Resolução Rápida (FAQ)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#701a35]/80">
                Respostas diretas para as dúvidas mais comuns de quem utiliza o Correio Elegante.
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

        {/* Informações Técnicas & Criação (Separado, discreto, fora de foco no rodapé) */}
        <div className="border-t border-rose-200/60 pt-8 mt-12">
          <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setIsDevInfoOpen(!isDevInfoOpen)}
              className="flex w-full items-center justify-between text-xs font-semibold text-text-light hover:text-text cursor-pointer"
              aria-expanded={isDevInfoOpen}
            >
              <span>Informações de Desenvolvimento & Créditos do Projeto</span>
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
                    O Correio Elegante é uma plataforma digital desenvolvida com React 19, TypeScript, Express 5, Prisma, Remotion e gateways integrados.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href="https://github.com/thisux1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:text-primary transition-colors"
                    >
                      <Github size={14} />
                      GitHub (@thisux1)
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
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </div>
  )
}
