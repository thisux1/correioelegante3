import api from './api'
import type { Block, PageSection } from '@/editor/types'

export interface GeneratedPageContent {
  blocks: Block[]
  sections?: PageSection[]
  theme?: string
  version: number
}

export interface GenerateResponse {
  spec: {
    templateFamily: string
    decisions?: string[]
    [key: string]: unknown
  }
  content: GeneratedPageContent
  notes: string[]
}

export interface GenerateBriefInput {
  momento: string
  nomes: { remetente?: string; destinatario: string }
  apelidos?: string[]
  tom?: string
  interesses?: string[]
  contexto?: string
  memorias?: Array<{ titulo: string; lugar?: string; data?: string; descricao?: string }>
  perguntasIntimidade?: Array<{ pergunta: string; resposta: string; dica?: string }>
  evento?: { data?: string; lugar?: string; descricao?: string }
  midias?: { fotos?: string[]; musicaUrl?: string; musicaDedicatoria?: string }
  anonimoParaDestinatario?: boolean
  restricoes?: string[]
}

export const generateService = {
  async generate(brief: GenerateBriefInput): Promise<GenerateResponse> {
    const response = await api.post<GenerateResponse>('/generate', { brief })
    return response.data
  },
}
