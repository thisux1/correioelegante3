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
            // Ignora erro se widget já tiver sido desmontado
          }
        }
      },
    }),
    []
  )

  useEffect(() => {
    let isMounted = true

    // Carrega o script da Cloudflare Turnstile caso ainda não esteja presente
    if (!document.getElementById('cloudflare-turnstile-api')) {
      const script = document.createElement('script')
      script.id = 'cloudflare-turnstile-api'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const checkAndRender = () => {
      if (!isMounted) return
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme,
            size: 'flexible',
            callback: (token: string) => {
              if (isMounted) onSuccess(token)
            },
            'error-callback': () => {
              if (isMounted && onError) onError()
            },
            'expired-callback': () => {
              if (isMounted && onExpire) onExpire()
            },
          })
        } catch {
          // Trata falhas transitórias
        }
      }
    }

    const interval = setInterval(checkAndRender, 100)
    checkAndRender()

    return () => {
      isMounted = false
      clearInterval(interval)
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignora limpeza
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, action, theme, onSuccess, onError, onExpire])

  return (
    <div
      ref={containerRef}
      className={className || 'flex items-center justify-center my-3 min-h-[65px]'}
      aria-label="Verificação de segurança Cloudflare Turnstile"
    />
  )
})
