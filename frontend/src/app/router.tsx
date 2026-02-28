import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Create = lazy(() => import('@/pages/Create').then(m => ({ default: m.Create })))
const Auth = lazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })))
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })))
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })))
const Payment = lazy(() => import('@/pages/Payment').then(m => ({ default: m.Payment })))
const Card = lazy(() => import('@/pages/Card').then(m => ({ default: m.Card })))
const ErrorPage = lazy(() => import('@/pages/Error').then(m => ({ default: m.ErrorPage })))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment/:messageId" element={<Payment />} />
            <Route path="/card/:id" element={<Card />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
