import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { SmoothScroll } from './SmoothScroll'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        <SmoothScroll>
          <Outlet />
        </SmoothScroll>
      </main>
      <Footer />
    </div>
  )
}
