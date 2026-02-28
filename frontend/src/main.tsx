import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Providers } from './app/providers'
import { AppRouter } from './app/router'
import { SmoothScroll } from './components/layout/SmoothScroll'
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

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault())

const faviconCleanup = setupAnimatedFavicon()
// HMR: dispose previous favicon animation when module hot-reloads
if (import.meta.hot) {
  import.meta.hot.dispose(faviconCleanup)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <SmoothScroll>
        <AppRouter />
      </SmoothScroll>
    </Providers>
    <SpeedInsights />
  </StrictMode>,
)
