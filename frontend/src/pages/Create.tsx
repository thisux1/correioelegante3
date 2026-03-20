import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, FilePlus2, Shapes, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { templates } from '@/editor/templates'

const categoryLabel = {
  romantic: 'Romantico',
  friendship: 'Amizade',
  secret: 'Secreto',
  classic: 'Classico',
  poetic: 'Poetico',
}

export function Create() {
  const navigate = useNavigate()

  const templateCards = useMemo(() => templates, [])

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="mx-auto w-full max-w-6xl">
        <ScrollReveal animateOnMount>
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-1.5 text-sm text-text-light backdrop-blur-sm">
              <Sparkles size={14} />
              Modelos prontos para editar
            </div>
            <h1 className="font-display text-4xl font-bold text-text md:text-5xl">
              Escolha um <span className="text-gradient">template</span> para comecar
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-light">
              Comece com um modelo pronto ou abra uma pagina em branco. Depois, personalize tudo no editor modular.
            </p>
          </div>
        </ScrollReveal>

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ScrollReveal animateOnMount>
            <motion.button
              type="button"
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/editor')}
              className="group text-left"
            >
              <Card glass className="relative h-full overflow-hidden border border-primary/15 p-0">
                <div className="h-44 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_60%),linear-gradient(140deg,rgba(255,255,255,0.8),rgba(255,232,232,0.65))] p-5">
                  <div className="flex h-full items-end rounded-2xl border border-dashed border-primary/25 bg-white/60 p-4">
                    <FilePlus2 className="text-primary" size={28} />
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="font-display text-2xl text-text">Em branco</h2>
                  <p className="mt-2 text-sm text-text-light">Comece do zero e monte cada bloco do seu jeito.</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Criar agora
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </motion.button>
          </ScrollReveal>

          {templateCards.map((template, index) => (
            <ScrollReveal key={template.id} animateOnMount delay={Math.min(index * 0.08, 0.24)}>
              <motion.button
                type="button"
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/editor?template=${template.id}`)}
                className="group text-left"
              >
                <Card glass className="h-full overflow-hidden border border-primary/10 p-0">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={template.thumbnail}
                      alt={`Preview do template ${template.name}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-medium text-text-light backdrop-blur-sm">
                      {categoryLabel[template.category]}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-2xl text-text">{template.name}</h2>
                      <Shapes size={16} className="text-primary/70" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-light">{template.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Usar template
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </motion.button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
