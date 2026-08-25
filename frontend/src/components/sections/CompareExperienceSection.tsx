import { motion } from 'framer-motion'
import { X, Check, ArrowRight, Heart, Sparkles, MessageSquare, MailOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Button } from '@/components/ui/Button'
import { SectionReveal } from '@/components/animations/SectionReveal'

export function CompareExperienceSection() {
  return (
    <ScrollSection id="compare-section" className="section-spacing">
      <Container size="default">
        {/* Cabeçalho Editorial — Sem Badges */}
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#4c0519] mb-4 tracking-tight leading-[1.15]">
              A diferença entre um recado comum e uma <span className="text-[#e11d48] italic font-serif">lembrança eterna</span>
            </h2>
            <p className="text-base sm:text-xl text-[#701a35] font-medium leading-relaxed">
              Momentos que definem uma vida merecem um espaço nobre, longe do ruído de conversas cotidianas.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LADO ESQUERDO: A Mensagem Comum no Chat */}
          <SectionReveal delay={0.1} scrollRange={[0.03, 0.14, 0.88, 1.0]}>
            <div className="h-full rounded-3xl border-2 border-slate-200 bg-slate-50/90 p-7 sm:p-9 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-200">
                  <div className="w-11 h-11 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg sm:text-xl">Mensagem em Aplicativo de Chat</h3>
                    <p className="text-xs text-slate-500 font-medium">O formato rápido e passageiro</p>
                  </div>
                </div>

                {/* Mockup de Mensagem Fria */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs mb-7 space-y-2">
                  <div className="flex items-end justify-end">
                    <div className="bg-[#dcf8c6] text-slate-800 text-sm p-3.5 rounded-2xl rounded-br-2xs max-w-[88%] shadow-2xs">
                      <p className="font-sans">parabens meu amor! te amo muito viu</p>
                      <span className="text-[10px] text-slate-400 block text-right mt-1">11:42</span>
                    </div>
                  </div>
                  <div className="text-center py-2">
                    <span className="text-xs text-slate-400 italic">
                      Perdida entre notificações de grupos, reuniões e extratos bancários
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={13} />
                    </div>
                    <span>Desaparece da tela em poucas horas na lista interminável de conversas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={13} />
                    </div>
                    <span>Sem trilha sonora, sem envelope tátil e sem surpresa na revelação</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={13} />
                    </div>
                    <span>Não comunica o tempo, a dedicação e o sentimento investidos</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-400">
                Uma mensagem descartável que se apaga no tempo
              </div>
            </div>
          </SectionReveal>

          {/* LADO DIREITO: O Correio Elegante */}
          <SectionReveal delay={0.2} scrollRange={[0.03, 0.14, 0.88, 1.0]}>
            <motion.div
              whileHover={{ y: -4 }}
              className="h-full rounded-3xl border-2 border-pink-300/90 bg-white p-7 sm:p-9 flex flex-col justify-between shadow-2xl shadow-rose-500/12 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-pink-200/80">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#be123c] text-white flex items-center justify-center shadow-md ring-4 ring-rose-200">
                    <MailOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#4c0519] text-lg sm:text-xl">Um Correio Elegante</h3>
                    <p className="text-xs text-[#e11d48] font-bold">A arte de presentear com sentimentos</p>
                  </div>
                </div>

                {/* Mockup da Carta com Selo */}
                <div className="bg-[#fff7f9] rounded-2xl p-5 border-2 border-pink-200 shadow-xs mb-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-xs">
                        <Heart size={14} className="fill-white" />
                      </div>
                      <span className="font-serif italic font-bold text-sm sm:text-base text-[#4c0519]">
                        "Nossa História em Cada Detalhe..."
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#be123c] bg-rose-100 px-2.5 py-1 rounded-lg">
                      Link & QR Code
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#701a35] leading-relaxed font-medium">
                    Selo de cera 3D artesanal • Vinil com a música de vocês • Linha do tempo com fotos • Raspadinha interativa
                  </p>
                </div>

                <ul className="space-y-4 text-sm text-[#4c0519]">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold stroke-[3]" />
                    </div>
                    <span className="font-semibold">Link permanente e QR Code exclusivo para imprimir em cartões ou presentes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold stroke-[3]" />
                    </div>
                    <span className="font-semibold">A trilha sonora toca no instante em que o destinatário quebra o lacre de cera</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold stroke-[3]" />
                    </div>
                    <span className="font-semibold">Cria uma memória emocionante que pode ser revisitada por toda a vida</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-pink-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#be123c]">
                  <Sparkles size={15} />
                  <span>Guardado com amor para sempre</span>
                </div>
                <Link to="/create">
                  <Button size="sm" className="bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs sm:text-sm rounded-xl px-5 py-2.5 shadow-lg shadow-rose-500/20">
                    Criar minha carta
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
