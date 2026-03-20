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
  version: number
  updatedAt: string
  createdAt: string
}

export interface PageSummary extends PageContract {
  createdAt: string
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

function mapBackendPage(page: BackendPage): PageSummary {
  const migrated = migratePage(page.content)
  return {
    id: page.id,
    blocks: migrated.blocks,
    theme: migrated.theme,
    status: page.status,
    visibility: page.visibility,
    publishedAt: page.publishedAt,
    version: page.version,
    updatedAt: page.updatedAt,
    createdAt: page.createdAt,
  }
}

export const pageService = {
  async savePage(input: SavePageInput): Promise<SavePageResult> {
    const payload = {
      content: {
        blocks: input.content.blocks,
        theme: resolveThemeId(input.content.theme),
        version: input.content.version,
      },
      status: input.status,
      visibility: input.visibility,
      publishedAt: input.publishedAt ?? null,
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
}
