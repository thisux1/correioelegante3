import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/store/authStore'

const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Create = lazy(() => import('@/pages/Create').then(m => ({ default: m.Create })))
const Auth = lazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })))
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })))
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })))
const Payment = lazy(() => import('@/pages/Payment').then(m => ({ default: m.Payment })))
const Card = lazy(() => import('@/pages/Card').then(m => ({ default: m.Card })))
const Error404 = lazy(() => import('@/pages/Error404').then(m => ({ default: m.Error404 })))
const Error500 = lazy(() => import('@/pages/Error500').then(m => ({ default: m.Error500 })))
const ErrorSession = lazy(() => import('@/pages/ErrorSession').then(m => ({ default: m.ErrorSession })))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  return <>{children}</>
}

// Blocks access to /auth while session is being restored or if already logged in
function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/profile" replace />

  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/card/:id" element={<Card />} />
              <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/payment/:messageId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/500" element={<Error500 />} />
              <Route path="/session-expired" element={<ErrorSession />} />
              <Route path="*" element={<Error404 />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
