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
  tag: string
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
    tag: 'Vinil & Música Sincronizada',
    title: 'Para o amor da minha vida',
    subtitle: 'Nossa Canção Especial • 03:45',
    recipient: 'Beatriz',
    message:
      'Desde a primeira vez em que ouvimos essa música juntos, soube que você seria meu lar. Obrigado por cada riso e por colorir os meus dias com tanta luz.',
    extraType: 'music',
    audioTitle: 'Aliança & Poesia',
    audioArtist: 'Nossa Trilha Sonora',
  },
  {
    id: 'timeline',
    tabLabel: 'Linha do Tempo & Fotos',
    icon: CalendarHeart,
    tag: 'Linha do Tempo & Memórias',
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
    tag: 'Segredo Interativo & Surpresa',
    title: 'Um Recado Misterioso',
    subtitle: 'Raspe para Revelar',
    recipient: 'Juliana',
    message:
      'Nem todas as surpresas cabem em palavras simples. Raspe a placa abaixo para descobrir o nosso próximo destino...',
    extraType: 'scratch',
    scratchSecret: 'Passagens compradas: Vamos viajar para Paris!',
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
        {/* Cabeçalho da Seção */}
        <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100/80 dark:bg-pink-950/40 text-primary font-bold text-xs uppercase tracking-wider mb-4 border border-pink-200/60 dark:border-pink-900/30">
              Exemplos Reais
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-rose-950 dark:text-rose-100 mb-4">
              Veja o que você pode <span className="text-gradient">criar</span>
            </h2>
            <p className="text-base sm:text-lg text-rose-900/70 dark:text-rose-300/70 max-w-2xl mx-auto">
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
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                      : 'bg-white/80 dark:bg-zinc-900/70 text-rose-950 dark:text-rose-200 border border-pink-200/60 dark:border-pink-900/40 hover:bg-white hover:border-primary/30 shadow-xs'
                  }`}
                >
                  <Icon size={16} />
                  <span>{ex.tabLabel}</span>
                </button>
              )
            })}
          </div>
        </SectionReveal>

        {/* Grade de Apresentação: Preview Interativo + Benefícios */}
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
                  className="rounded-3xl border-2 border-pink-200/80 dark:border-pink-900/50 bg-gradient-to-b from-white via-rose-50/50 to-white dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900 p-6 sm:p-8 shadow-2xl shadow-pink-500/10 text-rose-950 dark:text-rose-100"
                >
                  {/* Topo da Carta com Selo de Cera 3D */}
                  <div className="flex items-center justify-between pb-5 mb-5 border-b border-pink-100 dark:border-pink-900/40">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 shadow-md flex items-center justify-center text-white ring-4 ring-pink-400/15 border border-pink-300/50">
                        <Heart size={16} className="fill-white" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-primary">
                          {currentExample.tag}
                        </span>
                        <span className="text-xs text-rose-900/60 dark:text-rose-300/60">
                          Para: {currentExample.recipient}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-pink-100 dark:bg-pink-950/60 px-3 py-1 text-[11px] font-bold text-primary border border-pink-200/60 dark:border-pink-900/40">
                      Preview Real
                    </span>
                  </div>

                  {/* Título & Mensagem */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-rose-950 dark:text-rose-100 mb-3">
                    {currentExample.title}
                  </h3>
                  <p className="text-sm sm:text-base text-rose-900/80 dark:text-rose-200/80 leading-relaxed italic mb-6 font-serif">
                    "{currentExample.message}"
                  </p>

                  {/* Bloco Dinâmico Interativo Conforme o Tipo */}
                  {currentExample.extraType === 'music' && (
                    <div className="rounded-2xl border border-pink-200/70 dark:border-pink-900/40 bg-white/90 dark:bg-zinc-800/80 p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        {/* Vinil Giratório */}
                        <motion.div
                          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                          className="relative h-14 w-14 shrink-0 rounded-full bg-zinc-900 p-1 shadow-md flex items-center justify-center border-2 border-zinc-800"
                        >
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                            ♥
                          </div>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-rose-950 dark:text-rose-100 truncate">
                            {currentExample.audioTitle}
                          </span>
                          <span className="block text-[11px] text-rose-900/60 dark:text-rose-300/60 truncate">
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
                                className="h-4 w-1 rounded-full bg-primary origin-bottom"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Botão Play/Pause */}
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition-all cursor-pointer shrink-0"
                          aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {currentExample.extraType === 'timeline' && (
                    <div className="rounded-2xl border border-pink-200/70 dark:border-pink-900/40 bg-white/90 dark:bg-zinc-800/80 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-pink-100 text-primary font-bold text-xs flex items-center justify-center">
                          1
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold">14 de Fevereiro • Primeiro Encontro</span>
                          <span className="text-[11px] text-rose-900/60 dark:text-rose-300/60">
                            Aquele café que durou quatro horas sem sentirmos o tempo passar.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-pink-100/60 dark:border-pink-900/20">
                        <div className="h-7 w-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">
                          2
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold">Hoje & Sempre • Nosso Amor</span>
                          <span className="text-[11px] text-rose-900/60 dark:text-rose-300/60">
                            A certeza de que escolher você foi a melhor decisão da minha vida.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentExample.extraType === 'scratch' && (
                    <div className="rounded-2xl border border-pink-200/70 dark:border-pink-900/40 bg-white/90 dark:bg-zinc-800/80 p-4 text-center">
                      <AnimatePresence mode="wait">
                        {!isScratched ? (
                          <motion.button
                            key="cover"
                            type="button"
                            onClick={() => setIsScratched(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-pink-200 via-rose-200 to-pink-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 border border-dashed border-primary/40 text-rose-950 dark:text-rose-100 font-bold text-sm flex items-center justify-center gap-2 shadow-inner cursor-pointer"
                          >
                            <Sparkles size={16} className="text-primary animate-spin" />
                            <span>Toque para raspar o segredo</span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="revealed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-3 px-4 rounded-xl bg-pink-100/80 dark:bg-pink-950/60 border border-pink-300/60 text-primary font-bold text-sm"
                          >
                            <p className="mb-1">🎉 Surpresa Revelada!</p>
                            <p className="text-xs font-semibold text-rose-950 dark:text-rose-100">
                              {currentExample.scratchSecret}
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsScratched(false)}
                              className="mt-2 text-[11px] underline text-primary/80 hover:text-primary flex items-center justify-center gap-1 mx-auto"
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

          {/* Coluna de Benefícios & Recursos (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-pink-200/60 dark:border-pink-900/40 shadow-xs">
                <div className="p-2.5 rounded-xl bg-pink-100/80 dark:bg-pink-950/50 text-primary shrink-0">
                  <Music2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 dark:text-rose-100 text-sm sm:text-base mb-0.5">
                    Trilha Sonora Personalizada
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-900/70 dark:text-rose-300/70 leading-relaxed">
                    Escolha a música marcante do casal que começa a tocar assim que a carta é aberta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-pink-200/60 dark:border-pink-900/40 shadow-xs">
                <div className="p-2.5 rounded-xl bg-pink-100/80 dark:bg-pink-950/50 text-primary shrink-0">
                  <QrCode size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 dark:text-rose-100 text-sm sm:text-base mb-0.5">
                    QR Code de Alta Resolução
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-900/70 dark:text-rose-300/70 leading-relaxed">
                    Baixe em PNG para imprimir e colar no presente ou enviar por mensagem instantânea.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-pink-200/60 dark:border-pink-900/40 shadow-xs">
                <div className="p-2.5 rounded-xl bg-pink-100/80 dark:bg-pink-950/50 text-primary shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 dark:text-rose-100 text-sm sm:text-base mb-0.5">
                    Acesso Eterno sem Instalar App
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-900/70 dark:text-rose-300/70 leading-relaxed">
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
