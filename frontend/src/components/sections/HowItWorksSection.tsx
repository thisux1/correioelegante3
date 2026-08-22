import { motion } from 'framer-motion'
import { Pencil, Music, Sparkles, Send, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { CardTilt3D } from '@/components/animations/CardTilt3D'

const steps = [
  {
    number: '01',
    icon: Pencil,
    title: 'Escreva & Personalize',
    desc: 'Escolha um modelo romântico, adicione suas fotos, polaroids e escreva sua dedicatória.',
  },
  {
    number: '02',
    icon: Music,
    title: 'Trilha & Segredos',
    desc: 'Adicione a música do casal e crie raspadinhas interativas com surpresas e datas.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Sele com Cera 3D',
    desc: 'Finalize sua carta com lacre de cera digital personalizado e confirmação rápida via Pix.',
  },
  {
    number: '04',
    icon: Send,
    title: 'Entregue & Emocione',
    desc: 'Compartilhe por link no WhatsApp ou imprima o QR Code para anexar a flores e bombons.',
  },
]

export function HowItWorksSection() {
  return (
    <ScrollSection id="how-it-works" className="section-spacing">
      <Container size="default" className="relative z-10">
        <SectionReveal scrollRange={[0.0, 0.1, 0.88, 1.0]}>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-[#be123c] font-bold text-xs uppercase tracking-wider mb-4 border border-pink-300/80 shadow-xs">
              Passo a Passo
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
              Como funciona o <span className="text-[#e11d48]">Correio Elegante</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-xl mx-auto">
              Em menos de 3 minutos sua carta está pronta para tocar o coração de quem você ama.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <SectionReveal key={index} delay={index * 0.1} scrollRange={[0.03, 0.16, 0.88, 1.0]}>
                <CardTilt3D intensity={10}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="h-full rounded-3xl border-2 border-pink-200 bg-white p-6 sm:p-7 shadow-lg shadow-rose-500/5 hover:shadow-xl hover:shadow-rose-500/15 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Topo com Número e Ícone */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-[#e11d48] flex items-center justify-center border border-pink-300 shadow-xs">
                          <Icon size={22} />
                        </div>
                        <span className="font-display text-2xl font-extrabold text-[#be123c]/40">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#701a35] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-pink-100 flex items-center gap-1.5 text-[11px] font-bold text-[#be123c]">
                      <span>Etapa {index + 1} de 4</span>
                    </div>
                  </motion.div>
                </CardTilt3D>
              </SectionReveal>
            )
          })}
        </div>

        {/* CTA rápido */}
        <SectionReveal delay={0.4} scrollRange={[0.04, 0.18, 0.88, 1.0]}>
          <div className="mt-14 text-center">
            <Link to="/create">
              <Button size="lg" className="shadow-xl shadow-rose-500/30 hover:shadow-rose-500/40 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold px-8 py-4 text-base rounded-2xl">
                Começar a escrever agora
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </SectionReveal>
      </Container>
    </ScrollSection>
  )
}
