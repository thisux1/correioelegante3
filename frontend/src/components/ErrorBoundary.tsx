import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Error500 } from '@/pages/Error500'

interface Props {
  children?: ReactNode
  resetKey?: string
}

interface State {
  hasError: boolean
  error?: Error
}

function isChunkLoadError(error?: Error | null): boolean {
  if (!error) return false
  const msg = error.message || String(error)
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Loading chunk') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Failed to load module script')
  )
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error bound by ErrorBoundary:', error, errorInfo)

    // Se for erro de módulo/chunk descarregado da memória, tenta recarregar automaticamente
    if (isChunkLoadError(error)) {
      const storageKey = 'last_chunk_reload_ts'
      const lastReload = sessionStorage.getItem(storageKey)
      const now = Date.now()

      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(storageKey, String(now))
        window.location.reload()
      }
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: undefined })
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return <Error500 onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}
