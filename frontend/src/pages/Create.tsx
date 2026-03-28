import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, FilePlus2, Shapes } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { Container } from '@/components/layout/Container'
import { templates } from '@/editor/templates'
import { resolveEditorAccessForUser } from '@/config/featureFlags'
import { useAuthStore } from '@/store/authStore'

const categoryLabel = {
  romantic: 'Romantico',
  friendship: 'Amizade',
  secret: 'Secreto',
  classic: 'Classico',
  poetic: 'Poetico',
}

export function Create() {
  const navigate = useNavigate()
  const location = useLocation()
  const userId = useAuthStore((state) => state.user?.id)

  const editorDecision = resolveEditorAccessForUser(userId)
  const canUseEditor = editorDecision.enabled

  const blockedNotice = useMemo(() => {
    const state = location.state as { editorBlockedReason?: string; rolloutPercent?: number } | null
    if (!state?.editorBlockedReason) {
      return null
    }

    if (state.editorBlockedReason === 'global-disabled') {
      return 'O editor modular esta temporariamente indisponivel. Voce pode continuar usando o fluxo estavel em /create.'
    }

    return `Seu acesso ao editor modular ainda nao foi liberado neste rollout (${state.rolloutPercent ?? 0}%).`
  }, [location.state])

  const templateCards = useMemo(() => templates, [])

  return (
    <div className="min-h-screen pt-28 pb-16">
        <Container size="default">
          {blockedNotice ? (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
              {blockedNotice}
            </div>
          ) : null}

          <ScrollReveal animateOnMount>
          <div className="mb-12 text-center"> 
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
                disabled={!canUseEditor}
                className="group text-left disabled:cursor-not-allowed disabled:opacity-70"
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
                  {canUseEditor ? (
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Criar agora
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  ) : (
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-light">
                      Em rollout controlado
                    </div>
                  )}
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
                disabled={!canUseEditor}
                className="group text-left disabled:cursor-not-allowed disabled:opacity-70"
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
                    {canUseEditor ? (
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Usar template
                        <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    ) : (
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-light">
                        Acesso parcial por usuario
                      </div>
                    )}
                  </div>
                </Card>
              </motion.button>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </div>
  )
}
