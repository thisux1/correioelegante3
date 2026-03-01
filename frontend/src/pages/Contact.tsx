import { Heart, Mail, MapPin, School } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

export function Contact() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal animateOnMount>
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
              Fale <span className="text-gradient">Conosco</span>
            </h1>
            <p className="text-text-light text-lg">
              Tem dúvidas? Entre em contato com nossa equipe
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal direction="left" animateOnMount>
            <Card glass hover className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <School className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-text mb-1">
                    Projeto Escolar
                  </h2>
                  <p className="text-sm text-text-light leading-relaxed">
                    Este é um projeto de arrecadação de fundos escolar.
                    Parte do dinheiro arrecadado é destinado a melhorias na escola.
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="right" animateOnMount>
            <Card glass hover className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-text mb-1">
                    Email
                  </h2>
                  <p className="text-sm text-text-light">
                    contato@correioelegante.com
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.1} animateOnMount>
            <Card glass hover className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-text mb-1">
                    Localização
                  </h2>
                  <p className="text-sm text-text-light">
                   Etec Dr. Celso Giglio — Osasco
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1} animateOnMount>
            <Card glass hover className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-text mb-1">
                    Sobre
                  </h2>
                  <p className="text-sm text-text-light leading-relaxed">
                    O Correio Elegante é uma junção da tradição, tecnologia e carinho
                    para aproximar pessoas de forma especial.
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
