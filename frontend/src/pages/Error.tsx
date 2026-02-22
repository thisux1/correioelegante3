import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

export function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
      <ScrollReveal>
        <Card glass className="text-center max-w-md w-full py-16 px-8">
          <div className="text-7xl mb-6">💔</div>
          <h1 className="font-display text-4xl font-bold text-text mb-3">
            404
          </h1>
          <p className="text-text-light text-lg mb-8">
            Essa página não foi encontrada. Talvez o correio tenha se perdido no caminho...
          </p>
          <Link to="/">
            <Button size="lg">
              <ArrowLeft size={18} />
              Voltar ao Início
            </Button>
          </Link>
        </Card>
      </ScrollReveal>
    </div>
  )
}
