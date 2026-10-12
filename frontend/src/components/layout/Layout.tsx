import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { SmoothScroll } from './SmoothScroll'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault()
          const main = document.getElementById('conteudo')
          main?.focus()
          main?.scrollIntoView()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-[#4c0519] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl focus:outline-none"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1 relative outline-none">
        <SmoothScroll>
          <Outlet />
        </SmoothScroll>
      </main>
      <Footer />
    </div>
  )
}
