import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './app/providers'
import { AppRouter } from './app/router'
import { SmoothScroll } from './components/layout/SmoothScroll'
import './index.css'

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <SmoothScroll>
        <AppRouter />
      </SmoothScroll>
    </Providers>
  </StrictMode>,
)
