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
    title: 'Para o amor da minha vida',
    subtitle: 'Nossa Canção Especial',
    recipient: 'Beatriz',
    message:
      'Desde a primeira vez em que ouvimos essa música juntos, soube que você seria meu lar. Obrigado por cada riso e por colorir os meus dias com tanta luz.',
    extraType: 'music',
    audioTitle: 'Aliança e Poesia',
    audioArtist: 'Trilha Sonora do Casal',
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
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#4c0519] mb-4 tracking-tight">
              Veja o que você pode <span className="text-[#e11d48]">criar</span>
            </h2>
            <p className="text-base sm:text-lg text-[#701a35] font-medium max-w-2xl mx-auto">
              Cada carta é uma obra de arte digital única, com elementos interativos que surpreendem em cada detalhe.
            </p>
          </div>
        </SectionReveal>

        {/* Abas de Navegação dos Exemplos */}
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
                  className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#e11d48] text-white shadow-lg shadow-rose-500/30 scale-105'
                      : 'bg-white text-[#4c0519] border-2 border-pink-200 hover:bg-rose-50 hover:border-pink-300 shadow-xs'
                  }`}
                >
                  <Icon size={16} />
                  <span>{ex.tabLabel}</span>
                </button>
              )
            })}
          </div>
        </SectionReveal>

        {/* Grade de Apresentação: Preview Interativo + Recursos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Card Interativo de Preview (7 colunas) */}
          <div className="lg:col-span-7">
            <CardTilt3D intensity={6}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExample.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="rounded-3xl border-2 border-pink-300/80 bg-white p-6 sm:p-8 shadow-2xl shadow-rose-500/10 text-[#4c0519]"
                >
                  {/* Topo da Carta com Selo de Cera 3D */}
                  <div className="flex items-center justify-between pb-5 mb-5 border-b border-pink-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 shadow-md flex items-center justify-center text-white ring-4 ring-pink-400/15 border border-pink-300/50">
                        <Heart size={16} className="fill-white" />
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-[#4c0519]">
                          {currentExample.subtitle}
                        </span>
                        <span className="text-xs text-[#701a35]">
                          Destinatário: {currentExample.recipient}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Título & Mensagem */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#4c0519] mb-3">
                    {currentExample.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#701a35] leading-relaxed italic mb-6 font-serif">
                    "{currentExample.message}"
                  </p>

                  {/* Bloco Dinâmico Interativo Conforme o Tipo */}
                  {currentExample.extraType === 'music' && (
                    <div className="rounded-2xl border-2 border-pink-200 bg-pink-50/50 p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        {/* Vinil Giratório */}
                        <motion.div
                          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                          className="relative h-14 w-14 shrink-0 rounded-full bg-[#881337] p-1 shadow-md flex items-center justify-center border-2 border-pink-300"
                        >
                          <div className="h-6 w-6 rounded-full bg-[#e11d48] flex items-center justify-center text-white text-[10px]">
                            <Heart size={10} className="fill-white" />
                          </div>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-[#4c0519] truncate">
                            {currentExample.audioTitle}
                          </span>
                          <span className="block text-[11px] text-[#701a35] truncate">
                            {currentExample.audioArtist}
                          </span>

                          {/* Equalizador animado */}
                          <div className="flex items-center gap-1 mt-2">
                            {[0.4, 0.8, 0.5, 1, 0.7, 0.3, 0.9, 0.6].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={
                                  isPlaying
                                    ? { scaleY: [0.3, h, 0.3] }
                                    : { scaleY: 0.3 }
                                }
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                className="h-4 w-1 rounded-full bg-[#e11d48] origin-bottom"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Botão Play/Pause */}
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="h-10 w-10 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
                          aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Linha do Tempo Fiel ao Produto Real */}
                  {currentExample.extraType === 'timeline' && (
                    <div className="relative rounded-2xl border-2 border-pink-200/90 bg-[#fff9fa] p-5 sm:p-6 shadow-sm overflow-hidden">
                      {/* Linha vertical central luminosa */}
                      <div className="absolute left-6 sm:left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#e11d48] via-rose-300 to-[#e11d48]/40" />

                      <div className="space-y-6 relative z-10">
                        {/* Marco 1 */}
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center shrink-0">
                            <div className="h-7 w-7 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md ring-4 ring-rose-300/40">
                              <Heart size={13} className="fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 rounded-xl bg-white p-4 border border-pink-200/80 shadow-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#be123c] bg-rose-50 px-2 py-0.5 rounded-md">
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
                            <div className="h-7 w-7 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md ring-4 ring-rose-300/40">
                              <Heart size={13} className="fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 rounded-xl bg-white p-4 border border-pink-200/80 shadow-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#be123c] bg-rose-50 px-2 py-0.5 rounded-md">
                                <MapPin size={11} /> 12 de Junho de 2024
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#4c0519]">Nossa Viagem Inesquecível</h4>
                            <p className="text-xs text-[#701a35] mt-1 leading-relaxed">
                              Ver o pôr do sol na praia de mãos dadas e perceber que nenhum outro lugar no mundo se compara a estar com você.
                            </p>
                          </div>
                        </div>

                        {/* Marco 3 */}
                        <div className="flex items-start gap-4">
                          <div className="relative flex items-center justify-center shrink-0">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#f43f5e] to-[#be123c] text-white flex items-center justify-center shadow-md ring-4 ring-rose-400/50 animate-pulse">
                              <Sparkles size={13} />
                            </div>
                          </div>
                          <div className="flex-1 rounded-xl bg-gradient-to-br from-[#fff0f4] to-white p-4 border border-rose-300 shadow-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e11d48] bg-rose-100 px-2 py-0.5 rounded-md">
                                <Calendar size={11} /> Hoje e Sempre
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#4c0519]">Construindo Nossa Vida</h4>
                            <p className="text-xs text-[#701a35] mt-1 leading-relaxed">
                              A certeza diária de que escolher você foi a melhor e mais linda decisão da minha vida inteira.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raspadinha de Segredo Real com Canvas */}
                  {currentExample.extraType === 'scratch' && (
                    <div>
                      <InteractiveScratchCanvas
                        coverText={'Raspe suavemente com o dedo ou mouse\npara descobrir a surpresa...'}
                        secretSubtitle="Destino Secreto"
                        secretText={currentExample.scratchSecret || 'Passagens reservadas: Nossa viagem dos sonhos a Gramado!'}
                        height={130}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardTilt3D>
          </div>

          {/* Coluna de Explicações & Recursos (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border-2 border-pink-200/80 shadow-md">
              <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2 flex items-center gap-2">
                <Music2 size={20} className="text-[#e11d48]" />
                Cartas com Trilha Sonora
              </h3>
              <p className="text-sm text-[#701a35] leading-relaxed">
                Adicione a música que marcou a história de vocês com vinil interativo e reprodução ao vivo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-2 border-pink-200/80 shadow-md">
              <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2 flex items-center gap-2">
                <CalendarHeart size={20} className="text-[#e11d48]" />
                Linha do Tempo Visual
              </h3>
              <p className="text-sm text-[#701a35] leading-relaxed">
                Reviva cada marco especial com datas, fotos estilo Polaroid e relatos inesquecíveis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-2 border-pink-200/80 shadow-md">
              <h3 className="font-display text-xl font-bold text-[#4c0519] mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-[#e11d48]" />
                Raspadinhas de Segredo
              </h3>
              <p className="text-sm text-[#701a35] leading-relaxed">
                Surpreenda com declarações misteriosas ou presentes que só aparecem ao raspar o papel digital.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/create">
                <Button size="lg" className="w-full shadow-xl shadow-rose-500/30 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold py-4 text-base rounded-2xl">
                  <span>Criar minha carta agora</span>
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
