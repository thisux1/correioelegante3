import { UserCheck } from 'lucide-react'
import { ErrorLayout } from '@/components/layout/ErrorLayout'

export function ErrorSession() {
  const customIcon = (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-pink-100/70 border-2 border-pink-200 text-[#e11d48] shadow-inner">
      <UserCheck className="w-12 h-12 text-[#e11d48]" strokeWidth={1.75} />
    </div>
  )

  return (
    <ErrorLayout
      icon={customIcon}
      badge="Sessão"
      title="Sessão Finalizada"
      description="Sua sessão expirou por segurança. Faça login novamente para continuar gerenciando e criando suas cartas com tranquilidade."
      buttonLabel="Entrar na Minha Conta"
      to="/auth"
      secondaryButtonLabel="Voltar para o Início"
      secondaryTo="/"
    />
  )
}
