import api from './api'
import { useAuthStore } from '@/store/authStore'
import { trackEditorEvent } from './telemetry'
import { resolveEditorMediaUploadAccessForUser } from '@/config/featureFlags'
import { isAxiosError } from 'axios'

export type AssetKind = 'image' | 'audio' | 'video'
export type AssetProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed'
export type AssetModerationStatus = 'pending' | 'approved' | 'rejected'

export interface AssetSummary {
  id: string
  kind: AssetKind
  source: string
  storageKey: string
  publicUrl: string | null
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  durationMs: number | null
  processingStatus: AssetProcessingStatus
  moderationStatus: AssetModerationStatus
  createdAt: string
  updatedAt: string
}

interface UploadUrlPayload {
  asset: AssetSummary
  upload: {
    uploadUrl: string
    publicUrl: string
    storageKey: string
    method: 'POST' | 'PUT'
    headers: Record<string, string>
    formFields?: Record<string, string>
    expiresAt: string
  }
}

interface UploadFileFlowParams {
  file: File
  kind: AssetKind
}

function ensureMediaUploadEnabled() {
  const userId = useAuthStore.getState().user?.id ?? null
  const decision = resolveEditorMediaUploadAccessForUser(userId)
  if (!decision.enabled) {
    throw new Error('EDITOR_MEDIA_UPLOAD_FEATURE_DISABLED')
  }
}

async function uploadFileToProvider(file: File, payload: UploadUrlPayload['upload']): Promise<void> {
  if (payload.method === 'POST') {
    const form = new FormData()

    if (payload.formFields) {
      for (const [key, value] of Object.entries(payload.formFields)) {
        form.append(key, value)
      }
    }

    form.append('file', file)

    const response = await fetch(payload.uploadUrl, {
      method: 'POST',
      body: form,
    })

    if (!response.ok) {
      const responseText = await response.text().catch(() => '')
      throw new Error(`MEDIA_PROVIDER_UPLOAD_FAILED:${response.status}:${responseText.slice(0, 200)}`)
    }

    return
  }

  const response = await fetch(payload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      ...payload.headers,
    },
    body: file,
  })

  if (!response.ok) {
    const responseText = await response.text().catch(() => '')
    throw new Error(`MEDIA_PROVIDER_UPLOAD_FAILED:${response.status}:${responseText.slice(0, 200)}`)
  }
}

export const assetService = {
  async uploadFileFlow(params: UploadFileFlowParams): Promise<AssetSummary> {
    ensureMediaUploadEnabled()

    trackEditorEvent({
      event: 'asset_upload_start',
      status: params.kind,
      detail: `${params.file.type}|${params.file.size}`,
    })

    try {
      const { data: uploadPayload } = await api.post<UploadUrlPayload>('/assets/upload-url', {
        kind: params.kind,
        fileName: params.file.name,
        mimeType: params.file.type,
        sizeBytes: params.file.size,
      })

      await uploadFileToProvider(params.file, uploadPayload.upload)

      const { data: completePayload } = await api.post<{ asset: AssetSummary }>('/assets/complete', {
        assetId: uploadPayload.asset.id,
      })

      trackEditorEvent({
        event: 'asset_upload_success',
        status: completePayload.asset.processingStatus,
        detail: completePayload.asset.kind,
      })

      return completePayload.asset
    } catch (error) {
      const backendMessage = isAxiosError<{ error?: string; code?: string }>(error)
        ? error.response?.data?.error ?? error.response?.data?.code
        : undefined
      const detail = backendMessage ?? (error instanceof Error ? error.message : 'unknown_error')
      trackEditorEvent({
        event: 'asset_upload_error',
        status: params.kind,
        detail,
      })
      throw new Error(detail)
    }
  },

  list(kind?: AssetKind) {
    return api.get<{ assets: AssetSummary[] }>('/assets', { params: kind ? { kind } : undefined })
  },

  getById(id: string) {
    return api.get<{ asset: AssetSummary }>(`/assets/${id}`)
  },

  delete(id: string) {
    return api.delete<{ message: string }>(`/assets/${id}`)
  },
}
