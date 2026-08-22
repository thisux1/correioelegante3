import { motion } from 'framer-motion'
import { X, Check, ArrowRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Button } from '@/components/ui/Button'
import { SectionReveal } from '@/components/animations/SectionReveal'

export function CompareExperienceSection() {
  return (
    <ScrollSection id="compare-section" className="section-spacing">
      <Container size="default">
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
              A diferença entre um recado comum e uma <span className="text-[#e11d48]">memória eterna</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-2xl mx-auto">
              Momentos importantes merecem mais do que uma mensagem perdida entre notificações do dia a dia.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Lado Esquerdo: A Mensagem Comum no Chat */}
          <SectionReveal delay={0.1} scrollRange={[0.03, 0.14, 0.88, 1.0]}>
            <div className="h-full rounded-3xl border-2 border-slate-200 bg-slate-50/80 p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                    <X size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Mensagem no WhatsApp</h3>
                    <p className="text-xs text-slate-500">O que todo mundo faz</p>
                  </div>
                </div>

                {/* Mockup de Mensagem fria */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-6 space-y-2">
                  <div className="flex items-end justify-end">
                    <div className="bg-[#dcf8c6] text-slate-800 text-sm p-3 rounded-2xl rounded-br-2xs max-w-[85%] shadow-2xs">
                      <p>parabens amor! te amo muito</p>
                      <span className="text-[10px] text-slate-400 block text-right mt-1">11:42</span>
                    </div>
                  </div>
                  <div className="text-center py-2">
                    <span className="text-[11px] text-slate-400 italic">Perdida entre grupos de trabalho e comprovantes bancários</span>
                  </div>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <X size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>Some na rolagem de conversas em poucas horas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>Sem música, sem surpresa, sem toque pessoal</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>Não transmite o tempo e o carinho dedicados</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-400">
                Esquecida com facilidade
              </div>
            </div>
          </SectionReveal>

          {/* Lado Direito: O Correio Elegante */}
          <SectionReveal delay={0.2} scrollRange={[0.03, 0.14, 0.88, 1.0]}>
            <motion.div
              whileHover={{ y: -4 }}
              className="h-full rounded-3xl border-2 border-pink-300 bg-white p-8 flex flex-col justify-between shadow-2xl shadow-rose-500/10"
            >
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-[#e11d48] text-white flex items-center justify-center font-bold shadow-xs">
                    <Heart size={20} className="fill-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#4c0519] text-lg">Um Correio Elegante</h3>
                    <p className="text-xs text-[#e11d48] font-bold">Uma experiência inesquecível</p>
                  </div>
                </div>

                {/* Mockup da Carta com Selo */}
                <div className="bg-[#fff8fa] rounded-2xl p-5 border-2 border-pink-200 shadow-inner mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e11d48] text-white flex items-center justify-center text-[10px]">
                        ♥
                      </div>
                      <span className="font-serif italic font-bold text-sm text-[#4c0519]">
                        "Nossa História em Cada Detalhe..."
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#be123c]">QR Code & Link</span>
                  </div>
                  <p className="text-xs text-[#701a35] leading-relaxed">
                    Selo de cera 3D • Vinil com a música do casal • Linha do tempo com fotos • Raspadinha de surpresa
                  </p>
                </div>

                <ul className="space-y-3.5 text-sm text-[#4c0519]">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#e11d48] shrink-0 mt-0.5" />
                    <span className="font-medium">Link permanente e QR Code para guardar ou imprimir em presentes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#e11d48] shrink-0 mt-0.5" />
                    <span className="font-medium">A trilha sonora toca no momento exato em que a carta é aberta</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#e11d48] shrink-0 mt-0.5" />
                    <span className="font-medium">Provoca lágrimas de emoção e fica registrado para sempre</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-pink-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#be123c]">Guardado no coração para sempre</span>
                <Link to="/create">
                  <Button size="sm" className="bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs rounded-xl shadow-md">
                    Criar agora
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </Container>
    </ScrollSection>
  )
}
