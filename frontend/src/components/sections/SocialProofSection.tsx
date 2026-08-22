import { Star, Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { motion } from 'framer-motion'

const stats = [
  { value: '12.000+', label: 'Cartas Entregues' },
  { value: '99.8%', label: 'Satisfação e Emoção' },
  { value: '4.9 de 5', label: 'Avaliação Média' },
]

const testimonials = [
  {
    quote:
      'Minha noiva chorou de emoção quando escaneou o QR Code preso nas flores e começou a tocar a nossa música. Foi o presente mais marcante que já entreguei.',
    author: 'Lucas Mendes',
    occasion: 'Noivado e Pedido',
  },
  {
    quote:
      'A ideia da raspadinha com a surpresa da nossa viagem foi genial. A página abre super rápida no celular, sem precisar baixar aplicativo nenhum.',
    author: 'Ana Paula Ferreira',
    occasion: 'Aniversário de Namoro',
  },
  {
    quote:
      'Muito além de uma mensagem comum de WhatsApp. O lacre de cera que quebra ao clicar e o toca-discos deram um ar elegante e memorável.',
    author: 'Rafael Santos',
    occasion: 'Declaração Especial',
  },
]

export function SocialProofSection() {
  return (
    <ScrollSection id="social-proof" className="section-spacing">
      <Container size="default">
        {/* Métricas e Números */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 md:gap-24 mb-20">
          {stats.map((stat, index) => (
            <SectionReveal key={index} delay={index * 0.08} scrollRange={[0.0, 0.12, 0.88, 1.0]}>
              <div className="text-center p-4">
                <span className="block font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#e11d48] mb-1 drop-shadow-xs">
                  {stat.value}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#701a35]">
                  {stat.label}
                </span>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Título de Depoimentos sem badges */}
        <SectionReveal scrollRange={[0.0, 0.1, 0.88, 1.0]}>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
              Quem enviou, <span className="text-[#e11d48]">se apaixonou</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-xl mx-auto">
              Veja como pequenos gestos digitais criaram memórias inesquecíveis.
            </p>
          </div>
        </SectionReveal>

        {/* Cards de Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <SectionReveal key={index} delay={index * 0.12} scrollRange={[0.04, 0.16, 0.88, 1.0]}>
              <CardTilt3D intensity={12}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="h-full"
                >
                  <Card
                    glass
                    className="h-full flex flex-col justify-between p-8 rounded-3xl border-2 border-pink-200 bg-white shadow-xl shadow-rose-500/5 hover:shadow-2xl hover:shadow-rose-500/15 transition-all duration-300"
                    data-no-ink="true"
                  >
                    <div>
                      {/* Estrelas de Avaliação */}
                      <div className="flex items-center gap-1 mb-4 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <p className="text-sm sm:text-base text-[#4c0519] italic leading-relaxed mb-6 font-serif">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-pink-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white font-bold text-sm flex items-center justify-center shadow-xs border border-pink-200">
                          {t.author[0]}
                        </div>
                        <div>
                          <span className="block font-bold text-sm text-[#4c0519]">
                            {t.author}
                          </span>
                          <span className="block text-[11px] font-medium text-[#701a35]">
                            {t.occasion}
                          </span>
                        </div>
                      </div>

                      <Heart size={16} className="text-[#e11d48] fill-[#e11d48]/20" />
                    </div>
                  </Card>
                </motion.div>
              </CardTilt3D>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </ScrollSection>
  )
}
