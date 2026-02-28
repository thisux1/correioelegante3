import { MailOpen, Ghost } from 'lucide-react'
import { ErrorLayout } from '@/components/layout/ErrorLayout'

export function Error404() {
    const customIcon = (
        <div className="relative">
            <MailOpen className="w-24 h-24 text-text/50" strokeWidth={1.5} />
            <Ghost className="w-10 h-10 text-primary absolute -bottom-2 -right-2 transform rotate-12" strokeWidth={2} />
        </div>
    )

    return (
        <ErrorLayout
            icon={customIcon}
            title="404"
            description="Essa carta não foi encontrada. Talvez o correio tenha se perdido no caminho..."
            buttonLabel="Voltar para a caixa de entrada"
            to="/"
        />
    )
}
