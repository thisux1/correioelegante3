import { motion } from 'framer-motion'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'

const steps = [
    { number: 1, title: 'Criação', desc: 'Escreva sua carta e escolha um tema.' },
    { number: 2, title: 'Personalização', desc: 'Veja a prévia e deixe do seu jeito.' },
    { number: 3, title: 'Pagamento', desc: 'Pague R$4,00 via Pix seguro.' },
    { number: 4, title: 'QR Code', desc: 'Receba seu código único para presentear.' },
    { number: 5, title: 'A Surpresa', desc: 'Seu amor escaneia e se emociona.' },
]

export function HowItWorksSection() {
    return (
        <ScrollSection id="how-it-works">
            <div className="max-w-6xl mx-auto relative z-10 px-6">
                <SectionReveal scrollRange={[0.0, 0.10, 0.88, 1.0]}>
                    <div className="text-center mb-20">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
                            Como <span className="text-gradient">Funciona</span>
                        </h2>
                        <p className="text-text-light text-lg max-w-xl mx-auto">
                            Simples, rápido e feito para encantar em cada detalhe.
                        </p>
                    </div>
                </SectionReveal>

                <div className="relative">
                    {/* Horizontal Line (Desktop) — with scroll-driven fade */}
                    <ScrollReveal scrollRange={[0.02, 0.15, 0.88, 1.0]}>
                        <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-primary/20 rounded-full" />
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                        {steps.map((step, index) => (
                            <ScrollReveal key={index} delay={index * 0.15} scrollRange={[0.03, 0.18, 0.85, 1.0]}>
                                <div className="relative flex flex-col items-center text-center group">
                                    {/* Step Number Circle */}
                                    <motion.div
                                        whileHover={{ scale: 1.1, backgroundColor: '#fb6f92', color: '#fff' }}
                                        className="w-16 h-16 rounded-full bg-white/80 backdrop-blur border-4 border-primary text-primary font-display text-2xl font-bold flex items-center justify-center mb-6 relative z-10 shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
                                    >
                                        {step.number}
                                    </motion.div>

                                    {/* Step Content */}
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
            </div>
        </ScrollSection>
    )
}
