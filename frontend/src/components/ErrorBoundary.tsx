import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Error500 } from '@/pages/Error500'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to the console for development and traceability
        // In production, you would send this to Sentry or another error reporting service
        console.error('Uncaught error bound by ErrorBoundary:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <Error500 />
        }

        return this.props.children
    }
}
