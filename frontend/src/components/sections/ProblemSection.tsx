import { useRef } from 'react'
import { Frown, Sparkles, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ScrollSection } from '@/components/layout/ScrollSection'
import { CardTilt3D } from '@/components/animations/CardTilt3D'
import { SectionReveal } from '@/components/animations/SectionReveal'
import { motion, useScroll, useTransform } from 'framer-motion'

const problems = [
    { icon: Frown, title: 'Presentes Genéricos', description: 'Chocolates e flores são bonitos, mas muitas vezes não transmitem o verdadeiro sentimento.', fromX: -100 },
    { icon: Sparkles, title: 'Falta de Criatividade', description: 'Quer surpreender alguém especial, mas não sabe como sair do óbvio e fazer diferente.', fromY: 100 },
    { icon: Clock, title: 'Mensagens Esquecidas', description: 'Cartões de papel se perdem ou rasgam. O digital dura para sempre e pode ser revisto.', fromX: 100 },
]

function ProblemCard({ problem, index }: { problem: typeof problems[number]; index: number }) {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end 0.1'],
    })

    // Opacity appears early, slide starts a bit later
    const opacityStart = 0.03 + index * 0.02
    const opacityEnd = opacityStart + 0.10
    const slideStart = 0.08 + index * 0.04
    const slideEnd = slideStart + 0.15

    const opacity = useTransform(scrollYProgress, [opacityStart, opacityEnd, 0.85, 1.0], [0, 1, 1, 0])
    const x = useTransform(scrollYProgress, [slideStart, slideEnd, 0.85, 1.0], [problem.fromX || 0, 0, 0, -(problem.fromX || 0)])
    const y = useTransform(scrollYProgress, [slideStart, slideEnd, 0.85, 1.0], [problem.fromY || 0, 0, 0, -(problem.fromY || 0)])

    return (
        <motion.div ref={ref} style={{ opacity, x, y }}>
            <CardTilt3D intensity={10}>
                <Card glass hover className="h-full text-center border-white/40 bg-white/10 backdrop-blur-sm" data-no-ink="true">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                        <problem.icon className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-text mb-3">
                        {problem.title}
                    </h3>
                    <p className="text-text-light leading-relaxed">
                        {problem.description}
                    </p>
                </Card>
            </CardTilt3D>
        </motion.div>
    )
}

export function ProblemSection() {
    return (
        <ScrollSection id="problem-section">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header visible earlier */}
                <SectionReveal scrollRange={[0.0, 0.08, 0.85, 1.0]}>
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
                            O que falta nos <span className="text-gradient">Presentes</span> de hoje?
                        </h2>
                        <p className="text-text-light text-lg max-w-xl mx-auto">
                            Identificamos os problemas mais comuns na hora de presentear quem a gente ama.
                        </p>
                    </div>
                </SectionReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((problem, index) => (
                        <ProblemCard key={index} problem={problem} index={index} />
                    ))}
                </div>
            </div>
        </ScrollSection>
    )
}
