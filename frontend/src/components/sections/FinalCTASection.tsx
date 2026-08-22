import { Link } from 'react-router-dom'
import { Heart, Sparkles, ArrowRight } from 'lucide-react'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function FinalCTASection() {
  return (
    <ScrollSection id="cta-section" className="section-spacing">
      <Container size="narrow">
        <SectionReveal scrollRange={[0.02, 0.16, 0.9, 0.98]}>
          <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600 p-10 sm:p-16 md:p-20 text-center rounded-3xl" data-cursor-light="true">
            {/* Elementos decorativos de fundo */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-white" data-no-ink="true">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/20 backdrop-blur-md mb-6 border border-white/30 shadow-md">
                <Heart className="w-8 h-8 text-white fill-white/30 animate-pulse" />
              </div>

              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-sm">
                Pronto para surpreender quem você ama?
              </h2>

              <p className="text-base sm:text-xl text-white/90 mb-10 max-w-xl mx-auto leading-relaxed font-sans">
                Crie sua carta agora mesmo em menos de 3 minutos e veja o sorriso nascer.
              </p>

              <MagneticButton>
                <Link to="/create">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-primary hover:bg-pink-50 shadow-2xl font-bold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto rounded-2xl border-none transition-all hover:scale-105"
                  >
                    <Sparkles size={18} className="fill-primary" />
                    <span>Escrever minha carta</span>
                    <ArrowRight size={18} />
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
