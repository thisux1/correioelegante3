import { create } from 'zustand'
import axios from 'axios'

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

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  initAuth: async () => {
    try {
      // Try to get a new access token from the refresh cookie
      const { data: refreshData } = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      )
      // Then fetch the user profile with the new token
      const { data: userData } = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        withCredentials: true,
      })
      set({
        user: userData.user,
        accessToken: refreshData.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
