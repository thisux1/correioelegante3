import { motion } from 'framer-motion'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'

const steps = [
    { number: 1, title: 'Inspiração', desc: 'Escreva sua mensagem e escolha um tema que combine.' },
    { number: 2, title: 'Do seu jeito', desc: 'Personalize cada detalhe e veja como ficou.' },
    { number: 3, title: 'Pix Seguro', desc: 'Pague apenas R$4,00 de forma rápida e segura.' },
    { number: 4, title: 'O Presente', desc: 'Receba um QR Code exclusivo para enviar.' },
    { number: 5, title: 'A Surpresa', desc: 'Quem recebe escaneia e se emociona com sua carta.' },
]

export function HowItWorksSection() {
    return (
        <ScrollSection id="how-it-works" className="section-spacing">
            <Container size="default" className="relative z-10">
                <SectionReveal scrollRange={[0.0, 0.10, 0.88, 1.0]}>
                    <div className="text-center mb-20">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
                            Como <span className="text-gradient">funciona</span>
                        </h2>
                    </div>
                </SectionReveal>

                <div className="relative">
                    <ScrollReveal scrollRange={[0.02, 0.15, 0.88, 1.0]}>
                        <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-primary/20 rounded-full" />
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                        {steps.map((step, index) => (
                            <ScrollReveal key={index} delay={index * 0.15} scrollRange={[0.03, 0.18, 0.85, 1.0]}>
                                <div className="relative flex flex-col items-center text-center group">
                                    {/* Step Number */}
                                    <motion.div
                                        whileHover={{ scale: 1.1, backgroundColor: '#fb6f92', color: '#fff' }}
                                        className="w-16 h-16 rounded-full bg-white/80 backdrop-blur border-4 border-primary text-primary font-display text-2xl font-bold flex items-center justify-center mb-6 relative z-10 shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
                                    >
                                        {step.number}
                                    </motion.div>
                                    <h3 className="font-display text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-text-light leading-relaxed max-w-[160px]">
                                        {step.desc}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </Container>
        </ScrollSection>
    )
}
