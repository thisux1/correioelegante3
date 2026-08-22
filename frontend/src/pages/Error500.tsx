import { RefreshCw } from 'lucide-react'
import { ErrorLayout } from '@/components/layout/ErrorLayout'

interface Error500Props {
  onRetry?: () => void
}

export function Error500({ onRetry }: Error500Props) {
  const customIcon = (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-pink-100/70 border-2 border-pink-200 text-[#e11d48] shadow-inner">
      <RefreshCw className="w-12 h-12 text-[#e11d48]" strokeWidth={1.75} />
    </div>
  )

  const handleRetry = () => {
    if (onRetry) {
      try {
        onRetry()
      } catch {
        // ignore
      }
    }
    window.location.reload()
  }

  return (
    <ErrorLayout
      icon={customIcon}
      badge="Instabilidade Temporária"
      title="Tivemos um problema ao carregar"
      description="Houve uma breve oscilação na conexão ou no carregamento da página. Clique no botão abaixo para restaurar e recarregar seu conteúdo."
      buttonLabel="Recarregar Página"
      onClick={handleRetry}
      secondaryButtonLabel="Voltar para o Início"
      secondaryTo="/"
    />
  )
}
