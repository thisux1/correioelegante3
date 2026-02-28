import { Mail, Flame } from 'lucide-react'
import { ErrorLayout } from '@/components/layout/ErrorLayout'

interface Error500Props {
    onRetry?: () => void
}

export function Error500({ onRetry }: Error500Props) {
    const customIcon = (
        <div className="relative">
            <Mail className="w-24 h-24 text-text/50" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply rounded-md backdrop-blur-[2px]" />
            <Flame className="w-12 h-12 text-primary absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 animate-pulse" strokeWidth={1.5} />
        </div>
    )

    const handleRetry = () => {
        if (onRetry) {
            onRetry()
        } else {
            window.location.reload()
        }
    }

    return (
        <ErrorLayout
            icon={customIcon}
            title="500"
            description="Tivemos um problema ao abrir essa carta."
            buttonLabel="Tentar novamente"
            onClick={handleRetry}
        />
    )
}
