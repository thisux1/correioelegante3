import api from './api'
import { migratePage } from '@/editor/migration'
import { resolveThemeId } from '@/editor/themes'
import type {
  PageContent,
  PageStatus,
  PageVisibility,
  PageContract,
} from '@/editor/types'

interface BackendPage {
  id: string
  content: unknown
  status: PageStatus
  visibility: PageVisibility
  publishedAt: string | null
  paymentStatus?: 'pending' | 'paid' | string
  version: number
  updatedAt: string
  createdAt: string
  viewCount?: number
}

export interface PageSummary extends PageContract {
  createdAt: string
  paymentStatus?: 'pending' | 'paid' | string
  viewCount?: number
}

export interface SavePageInput {
  pageId?: string
  content: PageContent
  status?: PageStatus
  visibility?: PageVisibility
  publishedAt?: string | null
  version?: number
}

export interface SavePageResult {
  page: PageSummary
}

export type RsvpChoice = 'yes' | 'no' | 'other_day'

export interface SubmitRsvpInput {
  blockId: string
  choice: RsvpChoice
  text?: string
  respondentName?: string
  token: string
}

export interface RsvpResponse {
  id: string
  choice: RsvpChoice
  createdAt: string
}

/** Resposta vista pelo dono da página (GET /pages/:id/responses). */
export interface PageResponseEntry {
  blockId: string
  choice: RsvpChoice
  text: string | null
  respondentName: string | null
  createdAt: string
}

export type ReportReason =
  | 'assedio'
  | 'conteudo_improprio'
  | 'impersonacao'
  | 'spam'
  | 'outro'

export interface ReportPageInput {
  reason: ReportReason
  details?: string
}

function mapBackendPage(page: BackendPage): PageSummary {
  const migrated = migratePage(page.content)
  return {
    id: page.id,
    blocks: migrated.blocks,
    sections: migrated.sections,
    theme: migrated.theme,
    status: page.status,
    visibility: page.visibility,
    publishedAt: page.publishedAt,
    paymentStatus: page.paymentStatus,
    version: page.version,
    updatedAt: page.updatedAt,
    createdAt: page.createdAt,
    viewCount: page.viewCount ?? 0,
  }
}

export const pageService = {
  async savePage(input: SavePageInput): Promise<SavePageResult> {
    const publishedAt =
      input.status === 'published'
        ? (input.publishedAt || new Date().toISOString())
        : (input.status === 'draft' || input.status === 'archived' ? null : (input.publishedAt ?? null))

    const payload = {
      content: {
        blocks: input.content.blocks,
        sections: input.content.sections,
        theme: resolveThemeId(input.content.theme),
        version: input.content.version,
      },
      status: input.status,
      visibility: input.visibility,
      publishedAt,
      version: input.version,
    }


    if (!input.pageId) {
      const response = await api.post<{ page: BackendPage }>('/pages', payload)
      return { page: mapBackendPage(response.data.page) }
    }

    const response = await api.put<{ page: BackendPage }>(`/pages/${input.pageId}`, payload, {
      headers: input.version ? { 'If-Match': String(input.version) } : undefined,
    })
    return { page: mapBackendPage(response.data.page) }
  },

  async loadPage(pageId: string): Promise<PageSummary> {
    const response = await api.get<{ page: BackendPage }>(`/pages/${pageId}`)
    return mapBackendPage(response.data.page)
  },

  async listPages(): Promise<PageSummary[]> {
    const response = await api.get<{ pages: BackendPage[] }>('/pages')
    return response.data.pages.map(mapBackendPage)
  },

  async deletePage(pageId: string): Promise<void> {
    await api.delete(`/pages/${pageId}`)
  },

  /**
   * Resposta pública ao convite (ticketRsvp). Endpoint aberto — a identidade
   * da destinatária é o `token` assinado injetado pelo backend na leitura,
   * então nenhum auth header é necessário (o interceptor convive bem sem).
   * Erros esperados: 403 token inválido, 409 já respondeu, 404 página/bloco.
   */
  async submitRsvpResponse(pageId: string, payload: SubmitRsvpInput): Promise<RsvpResponse> {
    const response = await api.post<{ response: RsvpResponse }>(
      `/pages/${pageId}/responses`,
      payload,
    )
    return response.data.response
  },

  /**
   * Denúncia pública pela destinatária (S9) — sem auth; a página só pode ser
   * denunciada se estiver publicamente acessível (mesma régua da leitura).
   */
  async reportPage(pageId: string, input: ReportPageInput): Promise<void> {
    await api.post(`/pages/${pageId}/report`, input)
  },

  /** Lista respostas RSVP de uma página — somente o dono (backend: 404 p/ outros). */
  async getPageResponses(pageId: string): Promise<PageResponseEntry[]> {
    const response = await api.get<{ responses: PageResponseEntry[] }>(
      `/pages/${pageId}/responses`,
    )
    return response.data.responses
  },
}
