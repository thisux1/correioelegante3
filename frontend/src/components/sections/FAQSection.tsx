import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'

const faqs = [
    {
        question: 'Como funciona o pagamento?',
        answer: 'O pagamento é realizado via Pix, no valor único de R$4,00. É totalmente seguro e a confirmação é imediata para liberar seu QR Code.',
    },
    {
        question: 'Posso personalizar a mensagem?',
        answer: 'Sim! Você tem total liberdade para escrever seu texto, escolher o tema visual e visualizar como ficará antes de finalizar o pedido.',
    },
    {
        question: 'O QR Code expira?',
        answer: 'Não. Uma vez gerado, seu QR Code é vitalício. A mensagem ficará guardada em nossos servidores para ser relida sempre que quiser.',
    },
    {
        question: 'Preciso criar uma conta?',
        answer: 'Sim, pedimos um cadastro rápido (nome e e-mail) apenas para garantir que você possa acessar e gerenciar o histórico das suas mensagens enviadas.',
    },
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <ScrollSection id="faq">
            <div className="max-w-3xl mx-auto px-6">
                <SectionReveal scrollRange={[0.0, 0.10, 0.88, 1.0]}>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                            <HelpCircle size={24} />
                        </div>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
                            Perguntas <span className="text-gradient">Frequentes</span>
                        </h2>
                        <p className="text-text-light text-lg">
                            Tire suas dúvidas sobre o funcionamento do Correio Elegante.
                        </p>
                    </div>
                </SectionReveal>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <SectionReveal key={index} delay={index * 0.1} scrollRange={[0.02, 0.15, 0.88, 1.0]}>
                            <div className="border border-gray-100/50 rounded-2xl overflow-hidden bg-white/40 hover:bg-white/60 transition-colors backdrop-blur-sm">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                                >
                                    <span className="font-bold text-text text-lg">{faq.question}</span>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="text-primary w-5 h-5" />
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
                                            <div className="px-6 pb-5 text-text-light leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </SectionReveal>
                    ))}
                </div>
            </div>
        </ScrollSection>
    )
}
