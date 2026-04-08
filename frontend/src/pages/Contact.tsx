import { Github, Linkedin, Mail, ExternalLink, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

const contactLinks = [
  {
    title: 'LinkedIn',
    description: 'Conecte-se comigo profissionalmente e acompanhe minha trajetória.',
    icon: <Linkedin className="w-6 h-6" />,
    href: 'https://linkedin.com/in/thisux',
    color: 'text-[#0A66C2]',
    bg: 'bg-[#0A66C2]/10',
    border: 'group-hover:border-[#0A66C2]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(10,102,194,0.15)]',
  },
  {
    title: 'GitHub',
    description: 'Explore o código fonte deste e de outros projetos no meu perfil.',
    icon: <Github className="w-6 h-6" />,
    href: 'https://github.com/thisux1',
    color: 'text-text',
    bg: 'bg-text/10',
    border: 'group-hover:border-text/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(31,41,55,0.1)]',
  },
  {
    title: 'Email',
    description: 'Tem uma proposta, dúvida ou feedback? Me mande uma mensagem.',
    icon: <Mail className="w-6 h-6" />,
    href: 'mailto:[thisux94@gmail.com]',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'group-hover:border-primary/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(225,29,72,0.15)]',
  }
]

export function Contact() {
  return (
    <div className="min-h-screen pt-28 pb-16 relative overflow-hidden">
      <Container size="narrow">
        <ScrollReveal animateOnMount>
          <div className="text-center mb-16 space-y-6">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-text tracking-tight">
              Vamos <span className="text-gradient">Conversar?</span>
            </h1>
            <p className="text-text-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              O Correio Elegante foi desenvolvido inicialmente como um projeto de aprendizado e
              hoje é parte do meu portfólio. Fico feliz com seu interesse!
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactLinks.map((link, index) => (
            <ScrollReveal
              key={link.title}
              direction="up"
              delay={0.1 * index}
              animateOnMount
            >
              <motion.a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative block glass rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-border/50 ${link.border} ${link.glow} h-full`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${link.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110`}>
                      <div className={`${link.color} transition-transform duration-500 group-hover:rotate-12`}>
                        {link.icon}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-text-muted opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>

                  <div className="mt-auto">
                    <h2 className="font-display text-xl font-bold text-text mb-3">
                      {link.title}
                    </h2>
                    <p className="text-sm text-text-light leading-relaxed group-hover:text-text transition-colors duration-300">
                      {link.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up" delay={0.4} animateOnMount>
          <Card glass className="relative overflow-hidden group border-border/50 hover:border-primary/20 transition-colors duration-500">
            {/* Shimmer effect inside the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-display text-2xl font-bold text-text mb-2">
                  Aberto a Oportunidades
                </h3>
                <p className="text-text-light leading-relaxed">
                  Estou sempre em busca de novos desafios e projetos interessantes.
                  Se você procura um desenvolvedor apaixonado por criar experiências únicas e escaláveis,
                  estarei de portas abertas para novas conexões.
                </p>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </Container>
    </div>
  )
}
