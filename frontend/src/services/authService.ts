import api from './api'

export interface RegisterData {
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

interface User {
  id: string
  email: string
}

interface AuthResponse {
  user: User
  accessToken: string
}

interface MeResponse {
  user: User & { createdAt: string }
}

export const authService = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  refresh: () => api.post<{ accessToken: string }>('/auth/refresh'),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  me: () => api.get<MeResponse>('/auth/me'),
  changePassword: (data: ChangePasswordData) => api.put<{ message: string }>('/auth/password', data),
  deleteAccount: () => api.delete<{ message: string }>('/auth/account'),
}
