import { Card } from '@/components/ui/Card'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { CardTilt3D } from '@/components/animations/CardTilt3D'

const stats = [
    { value: '500+', label: 'Mensagens Enviadas' },
    { value: '350+', label: 'Sorrisos Gerados' },
    { value: '98%', label: 'Satisfação' },
]

const testimonials = [
    {
        quote: "Minha namorada chorou de emoção quando escaneou o QR Code. Melhor presente que já dei!",
        author: "Lucas M.",
    },
    {
        quote: "Super criativo e fácil de usar. Fiz em 5 minutos e o resultado ficou lindo e elegante.",
        author: "Ana P.",
    },
    {
        quote: "O QR Code impresso ficou muito chique. Todo mundo quis saber como fiz essa surpresa.",
        author: "Rafael S.",
    },
]

export function SocialProofSection() {
    return (
        <ScrollSection id="social-proof">
            <div className="max-w-6xl mx-auto px-6">
                {/* Animated Stats */}
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 mb-20">
                    {stats.map((stat, index) => (
                        <ScrollReveal key={index} delay={index * 0.1} scrollRange={[0.0, 0.12, 0.88, 1.0]}>
                            <div className="text-center">
                                <span
                                    className="block font-display text-5xl md:text-6xl font-bold text-primary mb-2"
                                >
                                    {stat.value}
                                </span>
                                <span className="text-text-light font-medium">{stat.label}</span>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Section Title */}
                <SectionReveal scrollRange={[0.0, 0.10, 0.88, 1.0]}>
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
                            Quem já se <span className="text-gradient">Surpreendeu</span>
                        </h2>
                        <p className="text-text-light text-lg max-w-xl mx-auto">
                            Histórias reais de pessoas que usaram nossa plataforma para emocionar.
                        </p>
                    </div>
                </SectionReveal>

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <ScrollReveal key={index} delay={index * 0.15} scrollRange={[0.05, 0.18, 0.85, 1.0]}>
                            <CardTilt3D intensity={25}>
                                <Card glass className="h-full flex flex-col justify-between border-white/50 bg-white/40 backdrop-blur-sm" data-no-ink="true">
                                    <div className="mb-6 relative">
                                        <span className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif leading-none">"</span>
                                        <p className="text-text italic leading-relaxed relative z-10 pt-4">
                                            {testimonial.quote}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100/50">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {testimonial.author[0]}
                                        </div>
                                        <span className="font-bold text-text-light text-sm">{testimonial.author}</span>
                                    </div>
                                </Card>
                            </CardTilt3D>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </ScrollSection>
    )
}
