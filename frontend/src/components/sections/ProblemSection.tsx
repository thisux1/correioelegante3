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
    description: 'Palavras sinceras acabam perdidas no mar de notificações do dia a dia. Uma carta merece um lugar especial.',
    badge: 'O Problema',
  },
  {
    icon: Flower2,
    title: 'Flores murcham, papel se perde',
    description: 'Presentes tradicionais são passageiros. Uma carta digital interativa fica guardada para sempre no coração.',
    badge: 'A Lembrança',
  },
  {
    icon: HeartHandshake,
    title: 'A emoção de um gesto único',
    description: 'Música, fotos e um lacre de cera que revelam seu carinho com a sensibilidade e o encanto que quem você ama merece.',
    badge: 'A Experiência',
  },
]

export function ProblemSection() {
  return (
    <ScrollSection id="problem-section" className="section-spacing">
      <Container size="default">
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100/80 dark:bg-pink-950/40 text-primary font-bold text-xs uppercase tracking-wider mb-4 border border-pink-200/60 dark:border-pink-900/30">
              Por que Correio Elegante?
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-rose-950 dark:text-rose-100 mb-4">
              Mais do que palavras, <span className="text-gradient">um momento inesquecível</span>
            </h2>
            <p className="text-base sm:text-lg text-rose-900/70 dark:text-rose-300/70 max-w-2xl mx-auto">
              Transforme seus sentimentos em uma experiência visual e sonora que toca fundo na alma.
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
                      className="h-full flex flex-col justify-between p-8 rounded-3xl border border-pink-200/70 dark:border-pink-900/40 bg-gradient-to-b from-white/95 via-rose-50/60 to-white/95 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-900/90 shadow-xl shadow-pink-500/5 hover:shadow-2xl hover:shadow-pink-500/15 transition-all duration-300"
                      data-no-ink="true"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950/50 dark:to-rose-900/30 border border-pink-200/60 dark:border-pink-800/40 flex items-center justify-center shadow-xs">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary/80 bg-pink-100/60 dark:bg-pink-950/40 px-2.5 py-1 rounded-lg border border-pink-200/40">
                            {item.badge}
                          </span>
                        </div>

                        <h3 className="font-display text-xl sm:text-2xl font-bold text-rose-950 dark:text-rose-100 mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-rose-900/75 dark:text-rose-300/75 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-pink-100/70 dark:border-pink-900/30 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/40" />
                        <span className="text-xs font-semibold text-primary">Feito com afeto digital</span>
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
