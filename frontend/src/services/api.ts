import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize error responses so err.response.data.error is always a string
function normalizeErrorData(error: unknown): void {
  if (axios.isAxiosError(error) && error.response?.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = error.response.data as any
    // If 'error' field is an object (e.g. {code, message}), extract message
    if (d.error && typeof d.error === 'object') {
      d.error = d.error.message || JSON.stringify(d.error)
    }
    // Vercel serverless format: { code, message } without 'error' key
    if (!d.error && typeof d.message === 'string') {
      d.error = d.message
    }
    // Ensure error is always a string
    if (d.error && typeof d.error !== 'string') {
      d.error = 'Erro inesperado no servidor'
    }
  }
}

// Shared promise to prevent concurrent token refresh race conditions
let refreshPromise: Promise<string> | null = null

// Handle 401 + refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    normalizeErrorData(error)

    const originalRequest = error.config

    // Auth routes return 401 for invalid credentials — don't treat them as expired sessions
    const isAuthRoute = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'].some(
      (path) => originalRequest.url?.includes(path)
    )

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true

      try {
        // All concurrent 401s share the same refresh call
        if (!refreshPromise) {
          refreshPromise = axios
            .post('/api/auth/refresh', {}, { withCredentials: true })
            .then(({ data }) => data.accessToken as string)
            .finally(() => { refreshPromise = null })
        }

        const accessToken = await refreshPromise
        const { user } = useAuthStore.getState()
        if (user) {
          useAuthStore.getState().setAuth(user, accessToken)
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/session-expired'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
