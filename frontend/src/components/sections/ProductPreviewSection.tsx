import { CheckCircle } from 'lucide-react'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { CardDeck } from '@/components/animations/CardDeck'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'

const benefits = [
  'Mensagem 100% personalizada com fotos, vinil e cartas',
  'QR Code de alta resolução para imprimir ou anexar a presentes',
  'Acesso ilimitado e eterno para a pessoa amada rever quando quiser',
  'Confirmação instantânea via Pix e Cartão',
  'Pronto e publicado em menos de 3 minutos',
]

export function ProductPreviewSection() {
  return (
    <ScrollSection id="product-preview" className="section-spacing">
      <Container size="default" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Leque de Cartas Interativo (Card Deck) */}
        <div className="order-2 lg:order-1">
          <SectionReveal scrollRange={[0.0, 0.12, 0.88, 1.0]}>
            <CardDeck />
          </SectionReveal>
        </div>

        {/* Lista de Benefícios */}
        <div className="order-1 lg:order-2">
          <SectionReveal delay={0.2} scrollRange={[0.0, 0.12, 0.88, 1.0]}>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-6">
              O que você <span className="text-gradient">ganha</span>
            </h2>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-text">
                  <ScrollReveal delay={index * 0.08} direction="right" scrollRange={[0.05, 0.2, 0.88, 1.0]}>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </Container>
    </ScrollSection>
  )
}
