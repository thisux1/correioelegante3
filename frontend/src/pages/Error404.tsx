import { MailQuestion } from 'lucide-react'
import { ErrorLayout } from '@/components/layout/ErrorLayout'

export function Error404() {
  const customIcon = (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-pink-100/70 border-2 border-pink-200 text-[#e11d48] shadow-inner">
      <MailQuestion className="w-12 h-12 text-[#e11d48]" strokeWidth={1.75} />
    </div>
  )

  return (
    <ErrorLayout
      icon={customIcon}
      badge="Erro 404"
      title="Carta não encontrada"
      description="Não conseguimos localizar esta página ou carta. Ela pode ter sido arquivada, ter expirado ou o link foi digitado de forma incompleta."
      buttonLabel="Voltar para o Início"
      to="/"
      secondaryButtonLabel="Escrever uma Carta"
      secondaryTo="/create"
    />
  )
}
