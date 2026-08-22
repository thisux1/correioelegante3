import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music2,
  CalendarHeart,
  Sparkles,
  Heart,
  Play,
  Pause,
  RotateCcw,
  QrCode,
  Smartphone,
} from 'lucide-react'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { Container } from '@/components/layout/Container'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { CardTilt3D } from '@/components/animations/CardTilt3D'

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
    scratchSecret: 'Passagens reservadas: Nossa viagem dos sonhos!',
  },
]

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState<string>('vinil')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isScratched, setIsScratched] = useState(false)

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
                    setIsScratched(false)
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
            <CardTilt3D intensity={8}>
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

                  {currentExample.extraType === 'timeline' && (
                    <div className="rounded-2xl border-2 border-pink-200 bg-pink-50/50 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-pink-200 text-[#be123c] font-bold text-xs flex items-center justify-center">
                          1
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-[#4c0519]">14 de Fevereiro • Primeiro Encontro</span>
                          <span className="text-[11px] text-[#701a35]">
                            Aquele café que durou quatro horas sem sentirmos o tempo passar.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-pink-200">
                        <div className="h-7 w-7 rounded-full bg-[#e11d48] text-white font-bold text-xs flex items-center justify-center">
                          2
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-[#4c0519]">Hoje e Sempre • Nosso Amor</span>
                          <span className="text-[11px] text-[#701a35]">
                            A certeza de que escolher você foi a melhor decisão da minha vida.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentExample.extraType === 'scratch' && (
                    <div className="rounded-2xl border-2 border-pink-200 bg-pink-50/50 p-4 text-center">
                      <AnimatePresence mode="wait">
                        {!isScratched ? (
                          <motion.button
                            key="cover"
                            type="button"
                            onClick={() => setIsScratched(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-pink-200 via-rose-200 to-pink-200 border-2 border-dashed border-[#e11d48]/40 text-[#4c0519] font-bold text-sm flex items-center justify-center gap-2 shadow-inner cursor-pointer"
                          >
                            <Sparkles size={16} className="text-[#e11d48]" />
                            <span>Toque para raspar o segredo</span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="revealed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-3 px-4 rounded-xl bg-pink-100 border border-pink-300 text-[#be123c] font-bold text-sm"
                          >
                            <p className="mb-1 text-base">Surpresa Revelada!</p>
                            <p className="text-xs font-bold text-[#4c0519]">
                              {currentExample.scratchSecret}
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsScratched(false)}
                              className="mt-2 text-[11px] underline text-[#be123c] hover:text-[#e11d48] flex items-center justify-center gap-1 mx-auto"
                            >
                              <RotateCcw size={11} /> Raspar novamente
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardTilt3D>
          </div>

          {/* Coluna de Recursos (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border-2 border-pink-200 shadow-xs">
                <div className="p-2.5 rounded-xl bg-pink-100 text-[#e11d48] shrink-0 border border-pink-200">
                  <Music2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#4c0519] text-sm sm:text-base mb-0.5">
                    Trilha Sonora Personalizada
                  </h4>
                  <p className="text-xs sm:text-sm text-[#701a35] leading-relaxed">
                    Escolha a música marcante do casal que começa a tocar assim que a carta é aberta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border-2 border-pink-200 shadow-xs">
                <div className="p-2.5 rounded-xl bg-pink-100 text-[#e11d48] shrink-0 border border-pink-200">
                  <QrCode size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#4c0519] text-sm sm:text-base mb-0.5">
                    QR Code de Alta Resolução
                  </h4>
                  <p className="text-xs sm:text-sm text-[#701a35] leading-relaxed">
                    Baixe em PNG para imprimir e colar no presente ou enviar por mensagem instantânea.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border-2 border-pink-200 shadow-xs">
                <div className="p-2.5 rounded-xl bg-pink-100 text-[#e11d48] shrink-0 border border-pink-200">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#4c0519] text-sm sm:text-base mb-0.5">
                    Acesso Eterno sem Instalar Aplicativos
                  </h4>
                  <p className="text-xs sm:text-sm text-[#701a35] leading-relaxed">
                    Quem recebe abre direto no navegador do celular com animações fluidas e sem complicação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </ScrollSection>
  )
}
