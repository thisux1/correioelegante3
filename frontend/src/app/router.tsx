import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { registerNavigator } from '@/app/navigation'
import { Layout } from '@/components/layout/Layout'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/store/authStore'
import { resolveEditorAccessForUser } from '@/config/featureFlags'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
) {
  return lazy(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await factory()
      } catch (err: unknown) {
        const isLastAttempt = attempt === retries
        const errMsg = (err as Error)?.message || String(err || '')
        const isChunkError =
          errMsg.includes('Failed to fetch dynamically imported module') ||
          errMsg.includes('Importing a module script failed') ||
          errMsg.includes('Loading chunk') ||
          errMsg.includes('error loading dynamically imported module') ||
          errMsg.includes('Failed to load module script')

        if (isChunkError && isLastAttempt) {
          const storageKey = 'last_chunk_reload_ts'
          const lastReload = sessionStorage.getItem(storageKey)
          const now = Date.now()
          if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
            sessionStorage.setItem(storageKey, String(now))
            window.location.reload()
          }
        }
        if (isLastAttempt) {
          throw err
        }
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)))
      }
    }
    return factory()
  })
}

const Home = safeLazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Create = safeLazy(() => import('@/pages/Create').then(m => ({ default: m.Create })))
const Editor = safeLazy(() => import('@/pages/Editor').then(m => ({ default: m.Editor })))
const Auth = safeLazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })))
const ResetPassword = safeLazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const Profile = safeLazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })))
const Settings = safeLazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))
const Contact = safeLazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })))
const LegalTerms = safeLazy(() => import('@/pages/LegalTerms').then(m => ({ default: m.LegalTerms })))
const LegalPrivacy = safeLazy(() => import('@/pages/LegalPrivacy').then(m => ({ default: m.LegalPrivacy })))
const LegalCookies = safeLazy(() => import('@/pages/LegalCookies').then(m => ({ default: m.LegalCookies })))
const Payment = safeLazy(() => import('@/pages/Payment').then(m => ({ default: m.Payment })))
const PaymentSuccess = safeLazy(() => import('@/pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })))
const Pricing = safeLazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })))
const SubscriptionSuccess = safeLazy(() => import('@/pages/SubscriptionSuccess').then(m => ({ default: m.SubscriptionSuccess })))
const Card = safeLazy(() => import('@/pages/Card').then(m => ({ default: m.Card })))
const PageCard = safeLazy(() => import('@/pages/PageCard').then(m => ({ default: m.PageCard })))
const AdminPage = safeLazy(() => import('@/pages/admin/AdminPage').then(m => ({ default: m.AdminPage })))
const VerifyEmail = safeLazy(() => import('@/pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })))
const Error404 = safeLazy(() => import('@/pages/Error404').then(m => ({ default: m.Error404 })))
const Error500 = safeLazy(() => import('@/pages/Error500').then(m => ({ default: m.Error500 })))
const ErrorSession = safeLazy(() => import('@/pages/ErrorSession').then(m => ({ default: m.ErrorSession })))

import { Container } from '@/components/layout/Container'
import { EditorSkeleton } from '@/components/ui/EditorSkeleton'
import { CreatePageSkeleton } from '@/components/ui/CreatePageSkeleton'
import { PricingPageSkeleton } from '@/components/ui/PricingPageSkeleton'
import { PaymentPageSkeleton } from '@/components/ui/PaymentPageSkeleton'
import { AuthPageSkeleton } from '@/components/ui/AuthPageSkeleton'
import { ProfileCardSkeleton } from '@/components/ui/ProfileCardSkeleton'
import { PageCardSkeleton } from '@/components/ui/PageCardSkeleton'
import { LegalPageSkeleton } from '@/components/ui/LegalPageSkeleton'
import { SuccessPageSkeleton } from '@/components/ui/SuccessPageSkeleton'

export function PageLoader() {
  const location = useLocation()
  const path = location?.pathname || ''

  if (path.startsWith('/editor')) {
    return <EditorSkeleton />
  }

  if (path.startsWith('/create')) {
    return <CreatePageSkeleton />
  }

  if (path === '/planos/sucesso') {
    return <SuccessPageSkeleton />
  }

  if (path.startsWith('/planos') || path.startsWith('/pricing')) {
    return <PricingPageSkeleton />
  }

  if (path.includes('/payment') && path.endsWith('/success')) {
    return <SuccessPageSkeleton />
  }

  if (path.startsWith('/payment')) {
    return <PaymentPageSkeleton />
  }

  if (path.startsWith('/auth')) {
    return <AuthPageSkeleton />
  }

  if (path.startsWith('/admin')) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4">
        <Container size="default">
          <div className="mb-8 space-y-2">
            <div className="h-10 w-56 rounded-xl bg-primary/20 animate-pulse" />
            <div className="h-4 w-72 rounded-md bg-primary/10 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Carregando analytics...">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-primary/10 animate-pulse" />
            ))}
          </div>
        </Container>
      </div>
    )
  }

  if (path.startsWith('/profile')) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4">
        <Container size="default">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 rounded-xl bg-primary/20 animate-pulse" />
            <div className="h-4 w-72 rounded-md bg-primary/10 animate-pulse" />
          </div>
          <ProfileCardSkeleton count={3} />
        </Container>
      </div>
    )
  }

  if (path.startsWith('/card')) {
    return <PageCardSkeleton />
  }

  return <LegalPageSkeleton />
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

function EditorFeatureRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const decision = resolveEditorAccessForUser(user?.id)
  if (!decision.enabled) {
    return (
      <Navigate
        to="/create"
        replace
        state={{
          editorBlockedReason: decision.reason,
          rolloutPercent: decision.rolloutPercent,
        }}
      />
    )
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const isAdmin = Boolean(user?.isAdmin)
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

function RouterNavigationBridge() {
  const navigate = useNavigate()

  useEffect(() => {
    registerNavigator(navigate)
    return () => {
      registerNavigator(null)
    }
  }, [navigate])

  return null
}

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <ErrorBoundary resetKey={location.pathname + location.search}>
      {children}
    </ErrorBoundary>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouterNavigationBridge />
      <ScrollToTop />
      <RouteErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/planos" element={<Pricing />} />
              <Route path="/pricing" element={<Navigate to="/planos" replace />} />
              <Route path="/planos/sucesso" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
              <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/legal/terms" element={<LegalTerms />} />
              <Route path="/legal/privacy" element={<LegalPrivacy />} />
              <Route path="/legal/cookies" element={<LegalCookies />} />
              <Route path="/card/:id" element={<Card />} />
              <Route path="/card/page/:pageId" element={<PageCard />} />
              <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
              <Route path="/editor" element={<EditorFeatureRoute><Editor /></EditorFeatureRoute>} />
              <Route path="/editor/:pageId" element={<EditorFeatureRoute><Editor /></EditorFeatureRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/configuracoes" element={<Navigate to="/settings" replace />} />
              <Route path="/chamados" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/tickets" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/payment/page/:pageId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/payment/page/:pageId/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment/:messageId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/payment/:messageId/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/500" element={<Error500 />} />
              <Route path="/session-expired" element={<ErrorSession />} />
              <Route path="*" element={<Error404 />} />
            </Route>
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  )
}
