import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'

const faqs = [
  {
    question: 'Como a pessoa que eu amo vai abrir a carta?',
    answer:
      'Você pode enviar o link exclusivo diretamente pelo WhatsApp, Instagram ou imprimir o QR Code de alta resolução em um cartão físico, flores ou presentes. Ao clicar no link ou escanear a câmera do celular, a carta abre instantaneamente com todas as animações, música e fotos.',
  },
  {
    question: 'A pessoa precisa baixar algum aplicativo ou criar conta para ler?',
    answer:
      'Não! A pessoa presenteada não precisa instalar nada nem criar conta. A carta funciona diretamente no navegador de qualquer celular ou computador com carregamento instantâneo.',
  },
  {
    question: 'A carta tem prazo de validade ou expira depois de um tempo?',
    answer:
      'Não expira. Sua carta digital fica guardada para sempre em nossos servidores. Vocês poderão revisitar essa memória romântica em qualquer data especial ao longo dos anos.',
  },
  {
    question: 'Como funciona o pagamento e a liberação?',
    answer:
      'O pagamento é feito com rapidez e segurança via Pix ou Cartão. A confirmação ocorre em segundos, liberando na hora o seu link público, o QR Code em alta resolução e o acesso permanente.',
  },
  {
    question: 'Posso editar a carta depois de pronta?',
    answer:
      'Sim! Enquanto estiver rascunhando ou mesmo após publicar, você pode acessar seu painel de cartas no perfil para fazer ajustes no texto, fotos ou trilha sonora.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <ScrollSection id="faq" className="section-spacing">
      <Container size="narrow">
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-100 text-[#e11d48] mb-4 border border-pink-300 shadow-xs">
              <HelpCircle size={24} />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-3 tracking-tight">
              Dúvidas <span className="text-[#e11d48]">Frequentes</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-md mx-auto">
              Tudo o que você precisa saber para criar sua surpresa com tranquilidade.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <SectionReveal key={index} delay={index * 0.08} scrollRange={[0.02, 0.14, 0.88, 1.0]}>
              <div className="border-2 border-pink-200 rounded-3xl overflow-hidden bg-white hover:border-pink-300 transition-all shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-[#4c0519] text-base sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-[#e11d48]"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 text-sm sm:text-base text-[#701a35] leading-relaxed border-t border-pink-100 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </ScrollSection>
  )
}
