import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function FinalCTASection() {
  return (
    <ScrollSection id="cta-section">
      <Container size="narrow">
        <SectionReveal scrollRange={[0.02, 0.16, 0.9, 0.98]}>
          <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-tr from-primary to-secondary p-12 md:p-24 text-center rounded-3xl" data-cursor-light="true">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none" />

            <div className="relative z-10 text-white" data-no-ink="true">
              <Heart className="w-16 h-16 text-white/90 fill-white/20 mx-auto mb-6 animate-pulse" />
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Bora mandar aquele recado?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Leva menos de 5 minutos, prometo!
              </p>
              <MagneticButton>
                <Link to="/create">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="text-primary hover:bg-white/90 shadow-2xl text-lg px-10 py-5 h-auto border-none"
                  >
                    Criar minha carta
                    <Heart size={20} className="fill-current" />
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </Card>
        </SectionReveal>
      </Container>
    </ScrollSection>
  )
}
