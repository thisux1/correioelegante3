import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Box } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextSplit } from '@/components/animations/TextSplit'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { SiteAtmosphere } from '@/components/animations/SiteAtmosphere'
import { BackgroundField } from '@/components/animations/BackgroundField'

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20">
      <div className="max-w-5xl mx-auto text-center relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-24 h-24 mb-8 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl"
        >
          <Box className="w-12 h-12 text-primary" />
        </motion.div>

        <TextSplit
          text="React Auth Boilerplate"
          className="justify-center mb-6 gap-x-3 md:gap-x-4"
          charClassName="font-display text-5xl md:text-7xl font-bold text-text leading-tight drop-shadow-sm"
          animateOnMount
        />

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-text-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm"
        >
          Um template premium com autenticação JWT, integração Prisma/MongoDB, design system completo em Tailwind v4 e animações Framer Motion/GSAP.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton>
            <Link to="/auth">
              <Button size="lg" className="shadow-xl shadow-primary/20 hover:shadow-primary/30">
                Acessar Conta
                <ArrowRight size={18} />
              </Button>
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a href="https://github.com/thiagods" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80">
                Ver Documentação
              </Button>
            </a>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}

export function Home() {
  return (
    <div className="relative overflow-x-clip min-h-screen">
      <BackgroundField />
      <SiteAtmosphere />
      <HeroSection />
    </div>
  )
}
