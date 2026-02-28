import { motion } from 'framer-motion'
import { CheckCircle, Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { ScrollSection } from '@/components/layout/ScrollSection'

const benefits = [
    'Mensagens 100% personalizadas',
    'QR Code de alta qualidade para impressão',
    'Experiência digital interativa e imersiva',
    'Pagamento instantâneo via Pix',
    'Pronto em menos de 5 minutos',
]

export function ProductPreviewSection() {
    return (
        <ScrollSection id="product-preview">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">

                {/* Left: Product Mockup */}
                <div className="order-2 lg:order-1">
                    <SectionReveal scrollRange={[0.0, 0.12, 0.88, 1.0]}>
                        <CardTilt3D>
                            <motion.div
                                className="relative max-w-sm mx-auto perspective-1000"
                                whileHover={{ rotateY: 5 }}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />

                                {/* The Card Mockup */}
                                <Card glass className="relative z-10 border-2 border-white/50 bg-white/60 p-8 shadow-2xl backdrop-blur-xl" data-no-ink="true">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <Heart className="w-6 h-6 text-primary fill-primary" />
                                        </div>
                                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                                            Correio Elegante
                                        </span>
                                        <p className="font-display text-2xl text-text leading-relaxed mb-6 italic">
                                            "Você faz meus dias mais felizes apenas por existir. Te amo!"
                                        </p>
                                        <div className="pt-6 border-t border-gray-100">
                                            <p className="text-sm font-bold text-text-light">De: Seu Admirador</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </CardTilt3D>
                    </SectionReveal>
                </div>

                {/* Right: Benefits Content */}
                <div className="order-1 lg:order-2">
                    <SectionReveal delay={0.2} scrollRange={[0.0, 0.12, 0.88, 1.0]}>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-6">
                            Por que escolher o <span className="text-gradient">Correio Elegante?</span>
                        </h2>
                        <p className="text-text-light text-lg mb-8 leading-relaxed">
                            Mais do que uma mensagem, entregamos uma experiência. Cuidamos de cada detalhe para que seu gesto de carinho seja inesquecível.
                        </p>

                        <ul className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3 text-text">
                                    <ScrollReveal delay={index * 0.08} direction="right" scrollRange={[0.05, 0.20, 0.88, 1.0]}>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                            <span className="font-medium">{benefit}</span>
                                        </div>
                                    </ScrollReveal>
                                </li>
                            ))}
                        </ul>
                    </SectionReveal>
                </div>

            </div>
        </ScrollSection>
    )
}
