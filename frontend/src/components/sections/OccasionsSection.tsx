import { Heart, CalendarHeart, Gift, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { CardTilt3D } from '@/components/animations/CardTilt3D'

const occasions = [
  {
    icon: Heart,
    title: 'Pedidos de Namoro & Casamento',
    subtitle: 'Com pergunta interativa e chuva de corações',
    description:
      'Crie o cenário perfeito para fazer a pergunta mais importante da sua vida, com fotos de toda a trajetória até aqui.',
  },
  {
    icon: CalendarHeart,
    title: 'Aniversários de Relacionamento',
    subtitle: '1 mês, 1 ano, 10 anos ou bodas',
    description:
      'Uma linha do tempo detalhada celebrando cada marco, viagem, conquista e café compartilhado ao longo do tempo.',
  },
  {
    icon: Gift,
    title: 'Acompanhando Flores & Presentes',
    subtitle: 'O QR Code impresso no laço da fita',
    description:
      'Imprima o QR Code em papel especial para anexar ao buquê de flores, à caixa de bombom ou à jóia de presente.',
  },
  {
    icon: Compass,
    title: 'Relacionamentos à Distância',
    subtitle: 'Encurtando quilômetros em um clique',
    description:
      'Mesmo a milhares de quilômetros, faça a pessoa amada sentir seu abraço com sua voz, suas fotos e a música de vocês.',
  },
]

export function OccasionsSection() {
  return (
    <ScrollSection id="occasions" className="section-spacing">
      <Container size="default">
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
              Feito para os momentos que <span className="text-[#e11d48]">marcam uma vida</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-2xl mx-auto">
              Seja para celebrar anos juntos ou para fazer um pedido inesquecível, existe uma carta perfeita para a sua história.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.map((occ, index) => {
            const Icon = occ.icon
            return (
              <SectionReveal key={index} delay={index * 0.1} scrollRange={[0.03, 0.14, 0.88, 1.0]}>
                <CardTilt3D intensity={8}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="h-full rounded-3xl border-2 border-pink-200 bg-white p-6 sm:p-7 shadow-lg shadow-rose-500/5 hover:shadow-xl hover:shadow-rose-500/15 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-[#e11d48] flex items-center justify-center border border-pink-300 shadow-xs mb-5">
                        <Icon size={22} />
                      </div>

                      <h3 className="font-display text-lg font-bold text-[#4c0519] mb-1 leading-snug">
                        {occ.title}
                      </h3>
                      <span className="block text-xs font-bold text-[#be123c] mb-3">
                        {occ.subtitle}
                      </span>
                      <p className="text-xs sm:text-sm text-[#701a35] leading-relaxed">
                        {occ.description}
                      </p>
                    </div>
                  </motion.div>
                </CardTilt3D>
              </SectionReveal>
            )
          })}
        </div>
      </Container>
    </ScrollSection>
  )
}
