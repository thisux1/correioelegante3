import { Mail, Clock } from 'lucide-react'
import { ErrorLayout } from '@/components/layout/ErrorLayout'

export function ErrorSession() {
    const customIcon = (
        <div className="relative">
            <Clock className="w-16 h-16 text-primary absolute -top-4 -left-4 -rotate-12" strokeWidth={2} />
            <Mail className="w-24 h-24 text-text/50" strokeWidth={1.5} />
        </div>
    )

    return (
        <ErrorLayout
            icon={customIcon}
            title="Sessão Expirada"
            description="Sua sessão expirou. Faça login novamente para continuar escrevendo sua mensagem."
            buttonLabel="Fazer login novamente"
            to="/auth"
        />
    )
}
