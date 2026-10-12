import api from './api'

export const AI_ACTIONS = [
  { id: 'carinhoso', label: 'mais carinho' },
  { id: 'curto', label: 'mais curto' },
  { id: 'engracado', label: 'mais leve' },
  { id: 'poetico', label: 'mais poético' },
] as const

export type AiAction = (typeof AI_ACTIONS)[number]['id']

interface RewriteResponse {
  text: string
}

export const aiService = {
  async rewrite(text: string, action: AiAction): Promise<string> {
    const response = await api.post<RewriteResponse>('/ai/rewrite', { text, action })
    return response.data.text
  },
}
