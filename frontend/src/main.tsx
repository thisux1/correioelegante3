import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'
import { BootLoadingGate } from './components/layout/BootLoadingGate'
import './index.css'
import heart1 from './assets/heart1.svg'
import heart2 from './assets/heart2.svg'
import heart3 from './assets/heart3.svg'
import heart5 from './assets/heart5.svg'

const HEARTBEAT_FRAMES = [heart1, heart2, heart3]
const INACTIVE_HEART_FRAME = heart5
const HEARTBEAT_INTERVAL_MS = 260
function setupAnimatedFavicon() {
  let favicon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement | null
  if (!favicon) {
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.type = 'image/svg+xml'
    document.head.appendChild(favicon)
  }
  const faviconLink = favicon

  let frameIndex = 0
  let animationId: number | null = null

  const setFavicon = (href: string) => {
    faviconLink.href = href
  }

  const stopAnimation = () => {
    if (animationId !== null) {
      window.clearInterval(animationId)
      animationId = null
    }
  }

  const startAnimation = () => {
    stopAnimation()
    frameIndex = 0
    setFavicon(HEARTBEAT_FRAMES[frameIndex])
    animationId = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % HEARTBEAT_FRAMES.length
      setFavicon(HEARTBEAT_FRAMES[frameIndex])
    }, HEARTBEAT_INTERVAL_MS)
  }

  const syncFaviconState = () => {
    const isActive = document.visibilityState === 'visible' && document.hasFocus()
    if (!isActive) {
      stopAnimation()
      setFavicon(INACTIVE_HEART_FRAME)
      return
    }
    startAnimation()
  }

  document.addEventListener('visibilitychange', syncFaviconState)
  window.addEventListener('focus', syncFaviconState)
  window.addEventListener('blur', syncFaviconState)
  syncFaviconState()

  return function cleanup() {
    stopAnimation()
    document.removeEventListener('visibilitychange', syncFaviconState)
    window.removeEventListener('focus', syncFaviconState)
    window.removeEventListener('blur', syncFaviconState)
  }
}

const faviconCleanup = setupAnimatedFavicon()
// HMR: dispose previous favicon animation when module hot-reloads
if (import.meta.hot) {
  import.meta.hot.dispose(faviconCleanup)
}

function setupChunkLoadRecovery() {
  const triggerReload = () => {
    const storageKey = 'last_chunk_reload_ts'
    const lastReload = sessionStorage.getItem(storageKey)
    const now = Date.now()

    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem(storageKey, String(now))
      window.location.reload()
    }
  }

  // Vite native event for dynamic import preload failures
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    triggerReload()
  })

  // Global unhandled promise rejection handler for chunk/network eviction
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    const msg = error?.message || String(error || '')
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Loading chunk') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Failed to load module script')
    ) {
      event.preventDefault()
      triggerReload()
    }
  })
}

function setupSpeedInsights() {
  if (!import.meta.env.PROD) return

  const inject = () => {
    void import('@vercel/speed-insights')
      .then(({ injectSpeedInsights }) => {
        injectSpeedInsights()
      })
      .catch(() => undefined)
  }

  const win = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: IdleRequestCallback) => number
  }

  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(() => {
      inject()
    })
    return
  }

  globalThis.setTimeout(inject, 1200)
}

setupChunkLoadRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BootLoadingGate />
  </StrictMode>,
)

setupSpeedInsights()

// Report Web Vitals to console in development
if (import.meta.env.DEV) {
  onCLS(console.log)
  onINP(console.log)
  onLCP(console.log)
  onFCP(console.log)
  onTTFB(console.log)
}
