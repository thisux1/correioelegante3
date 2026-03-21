import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { CheckCircle2, ImagePlus, LoaderCircle, RotateCcw, Trash2, Upload } from 'lucide-react'
import { assetService, type AssetKind, type AssetSummary } from '@/services/assetService'

type UploadState = 'idle' | 'sending' | 'processing' | 'ready' | 'error'

interface MediaFieldValue {
  src: string
  assetId?: string
}

interface MediaFieldProps {
  kind: AssetKind
  label: string
  value: MediaFieldValue
  placeholder?: string
  onChange: (nextValue: MediaFieldValue) => void
  onRemove?: () => void
  accept?: string
  helperText?: string
}

function isValidUrl(value: string): boolean {
  const normalized = value.trim()
  if (!normalized) {
    return false
  }

  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function MediaField({
  kind,
  label,
  value,
  placeholder = 'https://...',
  onChange,
  onRemove,
  accept,
  helperText,
}: MediaFieldProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [libraryCount, setLibraryCount] = useState<number | null>(null)
  const [currentAsset, setCurrentAsset] = useState<AssetSummary | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const normalizedSrc = value.src.trim()
  const hasValue = normalizedSrc.length > 0

  const statusText = useMemo(() => {
    if (uploadState === 'sending') {
      return 'Enviando arquivo...'
    }
    if (uploadState === 'processing') {
      return 'Processando arquivo...'
    }
    if (uploadState === 'ready') {
      return 'Arquivo pronto para uso.'
    }
    if (uploadState === 'error') {
      return `Erro no upload: ${uploadError ?? 'tente novamente.'}`
    }
    return null
  }, [uploadError, uploadState])

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadError(null)
    setUploadState('sending')

    try {
      const asset = await assetService.uploadFileFlow({ file, kind })
      setUploadState('processing')
      setCurrentAsset(asset)
      onChange({
        src: asset.publicUrl ?? normalizedSrc,
        assetId: asset.id,
      })

      const { data } = await assetService.list(kind)
      setLibraryCount(data.assets.length)
      const refreshedAsset = data.assets.find((item) => item.id === asset.id) ?? asset
      setCurrentAsset(refreshedAsset)
      setUploadState('ready')
    } catch (error) {
      setUploadState('error')
      setUploadError(error instanceof Error ? error.message : 'Falha no upload.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-primary/15 bg-white/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-text-light">{label}</label>
        {hasValue && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-md border border-primary/25 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
          >
            <Trash2 size={12} />
            Remover
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept ?? (kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,audio/x-wav')}
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Upload size={13} />
          Upload
        </button>
      </div>

      <input
        type="url"
        value={value.src}
        onChange={(event) => {
          onChange({
            src: event.target.value,
            assetId: undefined,
          })
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30"
      />

      {kind === 'image' ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/10 bg-white/70 p-2">
          {isValidUrl(normalizedSrc) ? (
            <img src={normalizedSrc} alt="Preview da midia" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ImagePlus size={15} className="text-text/60" />
            </div>
          )}
          <p className="text-[11px] text-text-light">
            {helperText
              ?? (isValidUrl(normalizedSrc) ? 'Midia valida pronta para preview.' : 'Sem midia valida. Use upload ou URL HTTPS.')}
          </p>
        </div>
      ) : null}

      {(statusText || libraryCount !== null || currentAsset) ? (
        <div className="rounded-lg border border-primary/20 bg-white/75 px-3 py-2 text-xs text-text-light">
          {statusText ? <p>{statusText}</p> : null}
          {currentAsset ? (
            <p className="mt-1 inline-flex items-center gap-1">
              {currentAsset.processingStatus === 'ready' ? <CheckCircle2 size={12} /> : <LoaderCircle size={12} className="animate-spin" />}
              Asset {currentAsset.id.slice(-6)} | status: {currentAsset.processingStatus}
              {currentAsset.processingStatus === 'failed' ? (
                <button
                  type="button"
                  onClick={async () => {
                    const { data } = await assetService.reprocess(currentAsset.id)
                    setCurrentAsset(data.asset)
                    setUploadState('processing')
                  }}
                  className="ml-1 inline-flex items-center gap-1 rounded border border-amber-300 px-1.5 py-0.5 text-amber-700 hover:bg-amber-50"
                >
                  <RotateCcw size={10} />
                  Reprocessar
                </button>
              ) : null}
            </p>
          ) : null}
          {libraryCount !== null ? <p className="mt-1">Biblioteca: {libraryCount} asset(s).</p> : null}
        </div>
      ) : null}
    </div>
  )
}
