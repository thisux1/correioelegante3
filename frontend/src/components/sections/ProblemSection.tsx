import { MessageSquareOff, Flower2, HeartHandshake } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { motion } from 'framer-motion'

const highlights = [
  {
    icon: MessageSquareOff,
    title: 'Mensagens esquecidas no chat',
    description: 'Palavras sinceras acabam perdidas no mar de conversas do dia a dia. Uma carta merece um lugar exclusivo e especial.',
  },
  {
    icon: Flower2,
    title: 'Flores murcham, papel se perde',
    description: 'Presentes tradicionais são passageiros. Uma carta digital interativa fica guardada para sempre para ser revivida.',
  },
  {
    icon: HeartHandshake,
    title: 'A emoção de um gesto único',
    description: 'Música, fotos e um lacre de cera que revelam seu carinho com a sensibilidade e o encanto que quem você ama merece.',
  },
]

export function ProblemSection() {
  return (
    <ScrollSection id="problem-section" className="section-spacing">
      <Container size="default">
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
              Mais do que palavras, <span className="text-[#e11d48]">um momento inesquecível</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-2xl mx-auto">
              Transforme seus sentimentos em uma experiência visual e sonora que toca fundo no coração.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, index) => {
            const Icon = item.icon
            return (
              <SectionReveal key={index} delay={index * 0.12} scrollRange={[0.04, 0.16, 0.88, 1.0]}>
                <CardTilt3D intensity={12}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="h-full"
                  >
                    <Card
                      glass
                      className="h-full flex flex-col justify-between p-8 rounded-3xl border-2 border-pink-200/90 bg-white/95 shadow-xl shadow-rose-500/5 hover:shadow-2xl hover:shadow-rose-500/15 transition-all duration-300"
                      data-no-ink="true"
                    >
                      <div>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-300/70 flex items-center justify-center shadow-xs mb-6">
                          <Icon className="w-7 h-7 text-[#e11d48]" />
                        </div>

                        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#4c0519] mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[#701a35] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-pink-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#e11d48]" />
                        <span className="text-xs font-bold text-[#be123c]">Feito com afeto digital</span>
                      </div>
                    </Card>
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
