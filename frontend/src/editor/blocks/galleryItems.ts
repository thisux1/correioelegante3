import type { GalleryItem } from '@/editor/types'
import type { AssetSummary } from '@/services/assetService'

export const MAX_GALLERY_IMAGES = 10

export interface SyncedGalleryMedia {
  items: GalleryItem[]
  images: string[]
}

export interface GalleryBatchUploadFailure {
  fileName: string
  reason: string
}

export interface GalleryBatchUploadResult {
  addedItems: GalleryItem[]
  failures: GalleryBatchUploadFailure[]
  ignoredByLimit: string[]
}

export function normalizeGalleryItems(items: GalleryItem[]): GalleryItem[] {
  const uniqueItems: GalleryItem[] = []
  const seen = new Set<string>()

  for (const item of items) {
    const normalizedSrc = item.src.trim()
    if (!normalizedSrc || seen.has(normalizedSrc)) {
      continue
    }

    seen.add(normalizedSrc)
    uniqueItems.push({
      src: normalizedSrc,
      assetId: item.assetId,
    })

    if (uniqueItems.length >= MAX_GALLERY_IMAGES) {
      break
    }
  }

  return uniqueItems
}

export function syncGalleryMedia(items: GalleryItem[]): SyncedGalleryMedia {
  const normalizedItems = normalizeGalleryItems(items)
  return {
    items: normalizedItems,
    images: normalizedItems.map((item) => item.src),
  }
}

export function toFriendlyGalleryUploadError(reason: unknown, fileName: string): string {
  const fallback = `Arquivo ${fileName} falhou: erro inesperado no upload.`
  const raw = typeof reason === 'string'
    ? reason
    : reason instanceof Error
      ? reason.message
      : ''

  if (!raw) {
    return fallback
  }

  if (raw.includes('EDITOR_MEDIA_UPLOAD_FEATURE_DISABLED')) {
    return `Arquivo ${fileName} falhou: upload desabilitado para sua conta. Use URL manual.`
  }

  if (raw.includes('MEDIA_UNSUPPORTED_TYPE')) {
    return `Arquivo ${fileName} falhou: tipo de imagem nao suportado.`
  }

  if (raw.includes('MEDIA_FILE_TOO_LARGE')) {
    return `Arquivo ${fileName} falhou: arquivo excede o limite de tamanho.`
  }

  if (raw.includes('MEDIA_PROVIDER_UPLOAD_FAILED')) {
    return `Arquivo ${fileName} falhou: erro no provedor de midia.`
  }

  return `Arquivo ${fileName} falhou: ${raw}`
}

export async function uploadGalleryFilesInBatch(params: {
  files: File[]
  availableSlots: number
  uploader: (file: File) => Promise<AssetSummary>
}): Promise<GalleryBatchUploadResult> {
  if (params.files.length === 0) {
    return {
      addedItems: [],
      failures: [],
      ignoredByLimit: [],
    }
  }

  const allowedFiles = params.files.slice(0, Math.max(0, params.availableSlots))
  const ignoredByLimit = params.files.slice(allowedFiles.length).map((file) => file.name)
  const settled = await Promise.allSettled(allowedFiles.map(async (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('MEDIA_UNSUPPORTED_TYPE')
    }

    const asset = await params.uploader(file)
    const src = (asset.publicUrl ?? '').trim()
    if (!src) {
      throw new Error('MEDIA_PROVIDER_UPLOAD_FAILED')
    }

    return {
      src,
      assetId: asset.id,
      fileName: file.name,
    }
  }))

  const addedItems: GalleryItem[] = []
  const failures: GalleryBatchUploadFailure[] = []

  settled.forEach((entry, index) => {
    const fileName = allowedFiles[index]?.name ?? `arquivo-${index + 1}`
    if (entry.status === 'fulfilled') {
      addedItems.push({
        src: entry.value.src,
        assetId: entry.value.assetId,
      })
      return
    }

    failures.push({
      fileName,
      reason: toFriendlyGalleryUploadError(entry.reason, fileName),
    })
  })

  return {
    addedItems,
    failures,
    ignoredByLimit,
  }
}
