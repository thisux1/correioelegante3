import { describe, expect, it, vi } from 'vitest'
import {
  MAX_GALLERY_IMAGES,
  normalizeGalleryItems,
  syncGalleryMedia,
  uploadGalleryFilesInBatch,
} from '@/editor/blocks/galleryItems'

describe('galleryItems helpers', () => {
  it('sincroniza items para images com normalizacao e dedupe', () => {
    const synced = syncGalleryMedia([
      { src: ' https://cdn/a.jpg ' },
      { src: '' },
      { src: 'https://cdn/a.jpg' },
      { src: 'https://cdn/b.jpg', assetId: 'asset-b' },
    ])

    expect(synced.items).toEqual([
      { src: 'https://cdn/a.jpg', assetId: undefined },
      { src: 'https://cdn/b.jpg', assetId: 'asset-b' },
    ])
    expect(synced.images).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg'])
  })

  it('respeita limite maximo de 10 itens', () => {
    const normalized = normalizeGalleryItems(
      Array.from({ length: MAX_GALLERY_IMAGES + 3 }, (_, index) => ({ src: `https://cdn/${index}.jpg` })),
    )

    expect(normalized).toHaveLength(MAX_GALLERY_IMAGES)
    expect(normalized[0]?.src).toBe('https://cdn/0.jpg')
    expect(normalized[9]?.src).toBe('https://cdn/9.jpg')
  })

  it('upload em lote retorna sucesso parcial e falha parcial', async () => {
    const files = [
      new File(['a'], 'ok-1.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'tipo-invalido.txt', { type: 'text/plain' }),
      new File(['c'], 'ok-2.png', { type: 'image/png' }),
    ]

    const uploader = vi.fn(async (file: File) => ({
      id: `asset-${file.name}`,
      kind: 'image' as const,
      source: 'upload',
      storageKey: `storage/${file.name}`,
      publicUrl: `https://cdn/${file.name}`,
      posterUrl: null,
      waveform: null,
      mimeType: file.type,
      sizeBytes: file.size,
      width: null,
      height: null,
      durationMs: null,
      processingStatus: 'ready' as const,
      errorCode: null,
      errorMessage: null,
      moderationStatus: 'approved' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    const result = await uploadGalleryFilesInBatch({
      files,
      availableSlots: 3,
      uploader,
    })

    expect(result.addedItems).toEqual([
      { src: 'https://cdn/ok-1.jpg', assetId: 'asset-ok-1.jpg' },
      { src: 'https://cdn/ok-2.png', assetId: 'asset-ok-2.png' },
    ])
    expect(result.failures).toHaveLength(1)
    expect(result.failures[0]?.reason).toContain('tipo de imagem nao suportado')
    expect(result.ignoredByLimit).toEqual([])
    expect(uploader).toHaveBeenCalledTimes(2)
  })

  it('ignora arquivos acima do limite de slots', async () => {
    const files = [
      new File(['a'], '1.jpg', { type: 'image/jpeg' }),
      new File(['b'], '2.jpg', { type: 'image/jpeg' }),
      new File(['c'], '3.jpg', { type: 'image/jpeg' }),
    ]

    const uploader = vi.fn(async (file: File) => ({
      id: `asset-${file.name}`,
      kind: 'image' as const,
      source: 'upload',
      storageKey: `storage/${file.name}`,
      publicUrl: `https://cdn/${file.name}`,
      posterUrl: null,
      waveform: null,
      mimeType: file.type,
      sizeBytes: file.size,
      width: null,
      height: null,
      durationMs: null,
      processingStatus: 'ready' as const,
      errorCode: null,
      errorMessage: null,
      moderationStatus: 'approved' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    const result = await uploadGalleryFilesInBatch({
      files,
      availableSlots: 1,
      uploader,
    })

    expect(result.addedItems).toEqual([{ src: 'https://cdn/1.jpg', assetId: 'asset-1.jpg' }])
    expect(result.ignoredByLimit).toEqual(['2.jpg', '3.jpg'])
    expect(uploader).toHaveBeenCalledTimes(1)
  })
})
