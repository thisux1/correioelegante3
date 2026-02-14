import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Send, CreditCard, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { TextSplit } from '@/components/animations/TextSplit'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ParallaxSection } from '@/components/animations/ParallaxSection'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { CardTilt3D } from '@/components/animations/CardTilt3D'

const features = [
  {
    icon: Heart,
    title: 'Mensagem com Amor',
    description: 'Escreva uma mensagem única e especial para quem você admira.',
  },
  {
    icon: CreditCard,
    title: 'Pagamento Fácil',
    description: 'Pague com Pix de forma rápida e segura via QR Code.',
  },
  {
    icon: Send,
    title: 'Entrega Digital',
    description: 'Compartilhe o QR Code e o destinatário acessa sua carta elegante.',
  },
]

export function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative pt-24 pb-16 px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles size={16} />
            Projeto Escolar — Correio Elegante Digital
          </motion.div>

          <TextSplit
            text="Diga o que sente com elegância"
            className="justify-center mb-6"
            charClassName="font-display text-5xl md:text-7xl font-bold text-text"
          />

          <ScrollReveal delay={0.3}>
            <p className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Envie mensagens carinhosas, pague com Pix e surpreenda alguém especial
              com um correio elegante digital. 💌
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton>
                <Link to="/create">
                  <Button size="lg">
                    Escreva Sua Mensagem
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Saiba Mais
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
                Como <span className="text-gradient">Funciona</span>
              </h2>
              <p className="text-text-light text-lg max-w-xl mx-auto">
                Três passos simples para enviar seu correio elegante
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.15}>
                <CardTilt3D>
                  <Card glass hover className="text-center h-full">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-text mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-text-light text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </CardTilt3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ParallaxSection speed={0.2}>
        <section className="py-24 px-6">
          <SectionReveal>
            <div className="max-w-4xl mx-auto">
              <Card glass className="text-center py-16 px-8">
                <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-6" />
                <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
                  Pronto para enviar seu correio?
                </h2>
                <p className="text-text-light text-lg mb-8 max-w-lg mx-auto">
                  Cada mensagem é única e chega de uma forma especial. Faça alguém sorrir hoje!
                </p>
                <MagneticButton>
                  <Link to="/create">
                    <Button size="lg">
                      Começar Agora
                      <Heart size={18} className="fill-current" />
                    </Button>
                  </Link>
                </MagneticButton>
              </Card>
            </div>
          </SectionReveal>
        </section>
      </ParallaxSection>
    </div>
  )
}
