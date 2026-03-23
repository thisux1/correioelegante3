import { create } from 'zustand'
import axios from 'axios'

const INIT_AUTH_TIMEOUT_MS = 3000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error('INIT_AUTH_TIMEOUT'))
    }, timeoutMs)

    promise
      .then((value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      })
      .catch((error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      })
  })
}

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    localStorage.setItem('@ce:session', JSON.stringify({ lastLogin: Date.now() }))
    set({ user, accessToken, isAuthenticated: true, isLoading: false })
  },

  clearAuth: () => {
    localStorage.removeItem('@ce:session')
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading }),

  initAuth: async () => {
    set({ isLoading: true })

    // Prevent Lighthouse / console 401 errors by not calling refresh
    // if we know the user is not logged in.
    if (!localStorage.getItem('@ce:session')) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      // Try to get a new access token from the refresh cookie
      const { data: refreshData } = await withTimeout(
        axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true, timeout: INIT_AUTH_TIMEOUT_MS }
        ),
        INIT_AUTH_TIMEOUT_MS
      )

      // Then fetch the user profile with the new token
      const { data: userData } = await withTimeout(
        axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${refreshData.accessToken}` },
          withCredentials: true,
          timeout: INIT_AUTH_TIMEOUT_MS,
        }),
        INIT_AUTH_TIMEOUT_MS
      )

      // Update the session timestamp to simulate activity or fresh token login validation refresh
      localStorage.setItem('@ce:session', JSON.stringify({ lastLogin: Date.now() }))

      set({
        user: userData.user,
        accessToken: refreshData.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      localStorage.removeItem('@ce:session')
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
