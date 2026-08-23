import { useState } from 'react'
import {
  Mail,
  HelpCircle,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Github,
  Linkedin,
  FileQuestion,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LegalPageSkeleton } from '@/components/ui/LegalPageSkeleton'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

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
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [isDevInfoOpen, setIsDevInfoOpen] = useState(false)

  if (isLoading) {
    return <LegalPageSkeleton />
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText('contato@correioelegante.studio').then(() => {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2500)
    })
  }

  return (
    <div className="min-h-screen pt-28 pb-16 relative overflow-hidden">
      <Container size="narrow">
        {/* Cabeçalho */}
        <ScrollReveal animateOnMount>
          <header className="text-center mb-10 sm:mb-14 space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] tracking-tight">
              Contato & Dúvidas
            </h1>
            <p className="text-[#701a35]/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Tem alguma dúvida sobre suas cartas, pagamentos ou quer enviar uma sugestão? Fale diretamente conosco.
            </p>
          </header>
        </ScrollReveal>

        {/* Card Principal de Contato por E-mail (Direto e Minimalista) */}
        <ScrollReveal direction="up" delay={0.08} animateOnMount>
          <Card className="bg-white border-2 border-rose-200/80 p-6 sm:p-8 rounded-3xl shadow-lg shadow-rose-950/5 text-center mb-12 sm:mb-16">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7" />
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4c0519] mb-2">
              Envie um E-mail Direto
            </h2>
            <p className="text-xs sm:text-sm text-[#701a35]/80 max-w-md mx-auto mb-6 leading-relaxed">
              Para dúvidas sobre pagamentos, suporte com cartas ou sugestões, mande uma mensagem para nosso e-mail oficial:
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-2 bg-rose-50/50 rounded-2xl border border-rose-200/60 mb-6">
              <span className="font-mono text-sm sm:text-base font-bold text-[#e11d48] px-3">
                contato@correioelegante.studio
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-[#4c0519] hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
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

            <div>
              <a
                href="mailto:contato@correioelegante.studio?subject=Contato%20-%20Correio%20Elegante"
                className="inline-flex items-center justify-center gap-2"
              >
                <Button size="sm" className="font-semibold shadow-xs">
                  <Mail size={15} />
                  Abrir no meu aplicativo de e-mail
                </Button>
              </a>
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
      </Container>
    </div>
  )
}
