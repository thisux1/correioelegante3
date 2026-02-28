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
function normalizeErrorData(error: any): void {
  if (error?.response?.data) {
    const d = error.response.data
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

// Handle 401 + refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    normalizeErrorData(error)

    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().clearAuth()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
