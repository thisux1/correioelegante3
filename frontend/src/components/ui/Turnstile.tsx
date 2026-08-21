import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          action?: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'flexible' | 'compact'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export interface TurnstileRef {
  reset: () => void
}

interface TurnstileProps {
  action?: string
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
  theme?: 'light' | 'dark' | 'auto'
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  { action = 'payment_checkout', onSuccess, onError, onExpire, className, theme = 'auto' },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onSuccess, onError, onExpire })

  // Mantém as referências dos callbacks sempre atualizadas sem disparar re-renders do widget
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onExpire }
  }, [onSuccess, onError, onExpire])

  const siteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAEXPctCvP81tBls0'

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current)
          } catch {
            // Ignora se o widget já não existir
          }
        }
      },
    }),
    []
  )

  useEffect(() => {
    let isMounted = true

    // Carrega o script oficial do Cloudflare Turnstile sob demanda
    let script = document.getElementById('cloudflare-turnstile-api') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'cloudflare-turnstile-api'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const renderWidget = () => {
      if (!isMounted || widgetIdRef.current || !containerRef.current || !window.turnstile) {
        return
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme,
          size: 'flexible',
          callback: (token: string) => {
            if (isMounted) {
              callbacksRef.current.onSuccess(token)
            }
          },
          'error-callback': () => {
            if (isMounted && callbacksRef.current.onError) {
              callbacksRef.current.onError()
            }
          },
          'expired-callback': () => {
            if (isMounted && callbacksRef.current.onExpire) {
              callbacksRef.current.onExpire()
            }
          },
        })
      } catch {
        // Trata tentativas concorrentes de renderização
      }
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      script.addEventListener('load', renderWidget)
    }

    // Polling de segurança caso o script já tenha carregado antes do listener
    const pollInterval = setInterval(() => {
      if (!isMounted) {
        clearInterval(pollInterval)
        return
      }
      if (window.turnstile && !widgetIdRef.current) {
        renderWidget()
        clearInterval(pollInterval)
      }
    }, 150)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
      if (script) {
        script.removeEventListener('load', renderWidget)
      }
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignora limpeza em caso de desmontagem
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, action, theme])

  return (
    <div
      ref={containerRef}
      className={className || 'flex items-center justify-center my-3 min-h-[65px]'}
      aria-label="Verificação de segurança Cloudflare Turnstile"
    />
  )
})
