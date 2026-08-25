import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music2,
  CalendarHeart,
  Sparkles,
  Heart,
  Play,
  Pause,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { InteractiveScratchCanvas } from '@/components/ui/InteractiveScratchCanvas'
import { Button } from '@/components/ui/Button'

interface ExampleLetter {
  id: string
  tabLabel: string
  icon: typeof Music2
  title: string
  subtitle: string
  recipient: string
  message: string
  extraType: 'music' | 'timeline' | 'scratch'
  audioTitle?: string
  audioArtist?: string
  scratchSecret?: string
}

const examples: ExampleLetter[] = [
  {
    id: 'vinil',
    tabLabel: 'Carta com Trilha Sonora',
    icon: Music2,
    title: 'Para o Amor da Minha Vida',
    subtitle: 'Nossa Canção Especial',
    recipient: 'Beatriz',
    message:
      'Desde a primeira vez em que ouvimos essa música juntos, soube que você seria meu lar. Obrigado por cada riso e por colorir os meus dias com tanta ternura.',
    extraType: 'music',
    audioTitle: 'Aliança & Poesia',
    audioArtist: 'Trilha Sonora Sincronizada',
  },
  {
    id: 'timeline',
    tabLabel: 'Linha do Tempo e Fotos',
    icon: CalendarHeart,
    title: '3 Anos da Nossa História',
    subtitle: 'Nossos Melhores Capítulos',
    recipient: 'Matheus',
    message:
      'De um café despretensioso em uma tarde de chuva até construirmos nossos maiores sonhos. Cada dia ao seu lado é o meu capítulo favorito.',
    extraType: 'timeline',
  },
  {
    id: 'scratch',
    tabLabel: 'Raspadinha de Segredo',
    icon: Sparkles,
    title: 'Um Recado Misterioso',
    subtitle: 'Raspe para Revelar',
    recipient: 'Juliana',
    message:
      'Nem todas as surpresas cabem em palavras simples. Raspe a placa abaixo para descobrir o nosso próximo destino...',
    extraType: 'scratch',
    scratchSecret: 'Passagens reservadas: Nossa viagem dos sonhos a Gramado!',
  },
]

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState<string>('vinil')
  const [isPlaying, setIsPlaying] = useState(false)

  const currentExample = examples.find((e) => e.id === activeTab) || examples[0]

  return (
    <ScrollSection id="product-preview" className="section-spacing">
      <Container size="default">
        {/* Cabeçalho da Seção sem badges */}
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#4c0519] mb-4 tracking-tight leading-[1.15]">
              Recursos criados para <span className="text-[#e11d48] italic font-serif">emocionar</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium leading-relaxed">
              Cada homenagem é montada como uma peça de arte digital única, com elementos dinâmicos que surpreendem quem recebe.
            </p>
          </div>
        </SectionReveal>

        {/* Seletor de Formatos com Navegação Tátil */}
        <SectionReveal delay={0.1} scrollRange={[0.02, 0.12, 0.88, 1.0]}>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {examples.map((ex) => {
              const Icon = ex.icon
              const isActive = activeTab === ex.id

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(ex.id)
                    setIsPlaying(false)
                  }}
                  className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#e11d48] text-white shadow-xl shadow-rose-500/30 scale-105 ring-4 ring-rose-200'
                      : 'bg-white text-[#4c0519] border-2 border-pink-200 hover:bg-rose-50 hover:border-pink-300 shadow-xs'
                  }`}
                >
                  <Icon size={18} />
                  <span>{ex.tabLabel}</span>
                </button>
              )
            })}
          </div>
        </SectionReveal>

        {/* Grade Editorial: Preview Interativo + Detalhes de Cada Formato */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Card Interativo de Preview (7 colunas) */}
          <div className="lg:col-span-7">
            <CardTilt3D intensity={5}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExample.id}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl border-2 border-pink-300/80 bg-white p-6 sm:p-9 shadow-2xl shadow-rose-500/12 text-[#4c0519] relative overflow-hidden"
                >
                  {/* Topo da Carta com Lacre em Relevo */}
                  <div className="flex items-center justify-between pb-5 mb-5 border-b border-pink-100">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full wax-seal-3d shadow-md flex items-center justify-center text-white ring-4 ring-pink-400/20">
                        <Heart size={18} className="fill-white" />
                      </div>
                      <div>
                        <span className="block font-bold text-sm sm:text-base text-[#4c0519]">
                          {currentExample.subtitle}
                        </span>
                        <span className="text-xs font-semibold text-[#701a35]">
                          Destinatário: {currentExample.recipient}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Título & Mensagem com Tipografia Poética */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#4c0519] mb-3">
                    {currentExample.title}
                  </h3>
                  <p className="text-base sm:text-xl text-[#4c0519] leading-relaxed mb-6 font-serif italic font-medium">
                    "{currentExample.message}"
                  </p>

                  {/* 1. MÚSICA & VINIL */}
                  {currentExample.extraType === 'music' && (
                    <div className="rounded-3xl border-2 border-pink-200 bg-[#fff5f8] p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {/* Disco de Vinil com Ranhuras */}
                          <motion.div
                            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                            className="relative h-16 w-16 shrink-0 rounded-full vinyl-grooves p-1.5 flex items-center justify-center border-2 border-pink-300"
                          >
                            <div className="h-6 w-6 rounded-full bg-[#e11d48] flex items-center justify-center text-white">
                              <Heart size={10} className="fill-white" />
                            </div>
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-bold text-[#4c0519] truncate">
                              {currentExample.audioTitle}
                            </span>
                            <span className="block text-xs font-semibold text-[#701a35] truncate mt-0.5">
                              {currentExample.audioArtist}
                            </span>

                            {/* Equalizador de Ondas */}
                            <div className="flex items-center gap-1.5 mt-2.5">
                              {[0.35, 0.85, 0.5, 1, 0.7, 0.4, 0.9, 0.65].map((h, i) => (
                                <motion.div
                                  key={i}
                                  animate={isPlaying ? { scaleY: [0.25, h, 0.25] } : { scaleY: 0.25 }}
                                  transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.08 }}
                                  className="h-4 w-1.5 rounded-full bg-[#e11d48] origin-bottom"
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Botão Play / Pause */}
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                          aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                        >
                          {isPlaying ? (
                            <>
                              <Pause size={15} />
                              <span>Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play size={15} className="fill-white ml-0.5" />
                              <span>Ouvir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. LINHA DO TEMPO COM POLAROIDS */}
                  {currentExample.extraType === 'timeline' && (
                    <div className="relative rounded-3xl border-2 border-pink-200/90 bg-[#fff9fa] p-5 sm:p-6 shadow-sm overflow-hidden">
                      {/* Linha vertical central luminosa */}
                      <div className="absolute left-6 sm:left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#e11d48] via-rose-300 to-[#e11d48]/30" />

                      <div className="space-y-5 relative z-10">
                        {/* Marco 1 */}
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center shrink-0">
                            <div className="h-8 w-8 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md ring-4 ring-rose-200">
                              <Heart size={14} className="fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 rounded-2xl bg-white p-4 border border-pink-200/80 shadow-xs">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#be123c] bg-rose-50 px-2.5 py-0.5 rounded-lg">
                                <Calendar size={11} /> 14 de Fevereiro de 2023
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#4c0519]">O Primeiro Café</h4>
                            <p className="text-xs text-[#701a35] mt-1 leading-relaxed">
                              Aquele encontro despretensioso sob a chuva fina que durou quatro horas e mudou tudo para sempre.
                            </p>
                          </div>
                        </div>

                        {/* Marco 2 */}
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center shrink-0">
                            <div className="h-8 w-8 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md ring-4 ring-rose-200">
                              <MapPin size={14} />
                            </div>
                          </div>
                          <div className="flex-1 rounded-2xl bg-white p-4 border border-pink-200/80 shadow-xs">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#be123c] bg-rose-50 px-2.5 py-0.5 rounded-lg">
                                <Calendar size={11} /> 12 de Junho de 2024
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#4c0519]">Nossa Viagem Inesquecível</h4>
                            <p className="text-xs text-[#701a35] mt-1 leading-relaxed">
                              Ver o pôr do sol na praia de mãos dadas e perceber que nenhum outro lugar no mundo se compara a estar com você.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. RASPADINHA DE SEGREDO */}
                  {currentExample.extraType === 'scratch' && (
                    <div className="rounded-3xl border-2 border-pink-200 p-2 bg-[#fff5f8]">
                      <InteractiveScratchCanvas
                        coverText={'Raspe suavemente com o dedo ou mouse\npara revelar o recado secreto...'}
                        secretSubtitle="Destino & Surpresa Revelados"
                        secretText={currentExample.scratchSecret || 'Passagens reservadas: Nossa viagem dos sonhos a Gramado!'}
                        height={140}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardTilt3D>
          </div>

          {/* Coluna Editorial de Recursos (5 colunas) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-white border-2 border-pink-200/80 shadow-md transition-all hover:border-pink-300">
              <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2 flex items-center gap-2.5">
                <Music2 size={22} className="text-[#e11d48]" />
                Trilha Sonora Sincronizada
              </h3>
              <p className="text-sm text-[#701a35] leading-relaxed">
                A música que define a história de vocês começa a tocar suavemente no instante em que o lacre de cera é aberto.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-pink-200/80 shadow-md transition-all hover:border-pink-300">
              <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2 flex items-center gap-2.5">
                <CalendarHeart size={22} className="text-[#e11d48]" />
                Linha do Tempo Visual
              </h3>
              <p className="text-sm text-[#701a35] leading-relaxed">
                Organize datas marcantes, fotos e relatos para construir uma narrativa cronológica dos momentos mais belos do casal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-pink-200/80 shadow-md transition-all hover:border-pink-300">
              <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2 flex items-center gap-2.5">
                <Sparkles size={22} className="text-[#e11d48]" />
                Raspadinha Interativa
              </h3>
              <p className="text-sm text-[#701a35] leading-relaxed">
                Crie um momento de suspense onde o presente, a surpresa ou a declaração mais importante só se revelam ao raspar o cartão.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/create">
                <Button size="lg" className="w-full shadow-xl shadow-rose-500/30 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold py-4 text-base rounded-2xl">
                  <span>Montar minha carta personalizada</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </ScrollSection>
  )
}
