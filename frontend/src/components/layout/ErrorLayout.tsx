import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

interface ErrorLayoutProps {
    icon: ReactNode
    title: string
    description: string
    buttonLabel: string
    onClick?: () => void
    to?: string
}

export function ErrorLayout({
    icon,
    title,
    description,
    buttonLabel,
    onClick,
    to,
}: ErrorLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
            <ScrollReveal>
                <Card glass className="text-center max-w-md w-full py-16 px-8">
                    <div className="flex justify-center mb-6">{icon}</div>
                    <h1 className="font-display text-4xl font-bold text-text mb-3">
                        {title}
                    </h1>
                    <p className="text-text-light text-lg mb-8">{description}</p>
                    {to ? (
                        <Link to={to}>
                            <Button size="lg" className="w-full sm:w-auto">
                                {buttonLabel}
                            </Button>
                        </Link>
                    ) : (
                        <Button size="lg" onClick={onClick} className="w-full sm:w-auto">
                            {buttonLabel}
                        </Button>
                    )}
                </Card>
            </ScrollReveal>
        </div>
    )
}
