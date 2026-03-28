import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ImagePlus, LoaderCircle, RotateCcw, Trash2, Upload } from 'lucide-react'
import { assetService, type AssetKind, type AssetSummary } from '@/services/assetService'
import { EDITOR_FIELD_BASE_CLASS, EDITOR_FIELD_LABEL_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'

export type MediaUploadState = 'idle' | 'sending' | 'processing' | 'ready' | 'error'

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
  multiple?: boolean
  onStatusChange?: (status: { state: MediaUploadState; error?: string | null }) => void
}

interface UploadStatus {
  state: MediaUploadState
  error: string | null
}

function deriveSectionState(uploadState: MediaUploadState) {
  if (uploadState === 'error') {
    return 'error'
  }
  if (uploadState === 'ready') {
    return 'success'
  }
  if (uploadState === 'sending' || uploadState === 'processing') {
    return 'loading'
  }
  return 'idle'
}

function useMediaDragState() {
  const [isDragActive, setIsDragActive] = useState(false)
  const [, setDragDepth] = useState(0)

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setDragDepth((current) => current + 1)
    setIsDragActive(true)
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setDragDepth((current) => {
      const nextDepth = Math.max(0, current - 1)
      setIsDragActive(nextDepth > 0)
      return nextDepth
    })
  }, [])

  const resetDragState = useCallback(() => {
    setDragDepth(0)
    setIsDragActive(false)
  }, [])

  return {
    isDragActive,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    resetDragState,
  }
}

function useMediaUploadQueue(params: {
  kind: AssetKind
  multiple: boolean
  normalizedSrc: string
  onChange: (nextValue: MediaFieldValue) => void
  onStatusChange?: (status: { state: MediaUploadState; error?: string | null }) => void
}) {
  const { kind, multiple, normalizedSrc, onChange, onStatusChange } = params
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ state: 'idle', error: null })
  const [libraryCount, setLibraryCount] = useState<number | null>(null)
  const [currentAsset, setCurrentAsset] = useState<AssetSummary | null>(null)
  const pollingTimeoutRef = useRef<number | null>(null)
  const pollingInFlightRef = useRef(false)

  const setState = useCallback((nextState: MediaUploadState, nextError: string | null = null) => {
    setUploadStatus({ state: nextState, error: nextError })
  }, [])

  useEffect(() => {
    onStatusChange?.({ state: uploadStatus.state, error: uploadStatus.error })
  }, [onStatusChange, uploadStatus])

  useEffect(() => {
    if (!currentAsset || (currentAsset.processingStatus !== 'pending' && currentAsset.processingStatus !== 'processing')) {
      return
    }

    let cancelled = false

    const clearTimer = () => {
      if (pollingTimeoutRef.current !== null) {
        window.clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
    }

    const pollAsset = () => {
      if (cancelled) {
        return
      }

      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        pollingTimeoutRef.current = window.setTimeout(pollAsset, 5000)
        return
      }

      if (pollingInFlightRef.current) {
        pollingTimeoutRef.current = window.setTimeout(pollAsset, 3000)
        return
      }

      pollingInFlightRef.current = true
      let shouldScheduleNextPoll = true
      assetService.getById(currentAsset.id)
        .then(({ data }) => {
          if (cancelled) {
            return
          }

          setCurrentAsset(data.asset)
          if (data.asset.publicUrl) {
            onChange({
              src: data.asset.publicUrl,
              assetId: data.asset.id,
            })
          }

          if (data.asset.processingStatus === 'failed') {
            setState('error', data.asset.errorMessage ?? 'Falha ao processar arquivo enviado.')
            shouldScheduleNextPoll = false
            return
          }

          if (data.asset.processingStatus === 'ready') {
            setState('ready')
            shouldScheduleNextPoll = false
            return
          }

          setState('processing')
        })
        .catch(() => undefined)
        .finally(() => {
          pollingInFlightRef.current = false
          if (!cancelled && shouldScheduleNextPoll) {
            pollingTimeoutRef.current = window.setTimeout(pollAsset, 3000)
          }
        })
    }

    pollAsset()

    return () => {
      cancelled = true
      clearTimer()
      pollingInFlightRef.current = false
    }
  }, [currentAsset, onChange, setState])

  const handleFilesUpload = useCallback(async (files: File[]) => {
    const queue = multiple ? files : files.slice(0, 1)
    if (queue.length === 0) {
      return
    }

    setState('sending')

    try {
      const firstAsset = await assetService.uploadFileFlow({ file: queue[0], kind })
      setState('processing')
      setCurrentAsset(firstAsset)
      onChange({
        src: firstAsset.publicUrl ?? normalizedSrc,
        assetId: firstAsset.id,
      })

      const { data } = await assetService.list(kind)
      setLibraryCount(data.assets.length)
      const refreshedAsset = data.assets.find((item) => item.id === firstAsset.id) ?? firstAsset
      setCurrentAsset(refreshedAsset)
      if (refreshedAsset.processingStatus === 'failed') {
        setState('error', refreshedAsset.errorMessage ?? 'Nao foi possivel processar este arquivo.')
        return
      }

      if (refreshedAsset.processingStatus === 'ready') {
        setState('ready')
        return
      }

      setState('processing')
    } catch (error) {
      setState('error', toFriendlyUploadErrorMessage(error))
    }
  }, [kind, multiple, normalizedSrc, onChange, setState])

  const handleUploadInput = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    await handleFilesUpload(selected)
    event.target.value = ''
  }, [handleFilesUpload])

  const handleReprocessAsset = useCallback(async () => {
    if (!currentAsset) {
      return
    }

    const { data } = await assetService.reprocess(currentAsset.id)
    setCurrentAsset(data.asset)
    setState('processing')
  }, [currentAsset, setState])

  return {
    uploadState: uploadStatus.state,
    uploadError: uploadStatus.error,
    libraryCount,
    currentAsset,
    handleFilesUpload,
    handleUploadInput,
    handleReprocessAsset,
  }
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

function toFriendlyUploadErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Falha no upload.'
  if (raw.includes('EDITOR_MEDIA_UPLOAD_FEATURE_DISABLED')) {
    return 'Upload indisponivel no momento. Use o campo de URL.'
  }
  if (raw.includes('MEDIA_UNSUPPORTED_TYPE')) {
    return 'Formato nao suportado. Escolha outro arquivo.'
  }
  if (raw.includes('MEDIA_FILE_TOO_LARGE')) {
    return 'Arquivo muito grande. Envie um arquivo menor.'
  }
  if (raw.includes('MEDIA_PROVIDER_UPLOAD_FAILED') || raw.includes('MEDIA_PROVIDER_MISCONFIGURED')) {
    return 'Upload indisponivel no momento. Tente novamente.'
  }
  if (raw.includes('MEDIA_PROCESSING_FAILED')) {
    return 'Nao foi possivel processar este arquivo. Tente outro.'
  }
  return raw
}

function getDefaultAccept(kind: AssetKind): string {
  if (kind === 'image') {
    return 'image/jpeg,image/png,image/webp,image/avif'
  }
  if (kind === 'video') {
    return 'video/mp4,video/webm'
  }
  return 'audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,audio/x-wav'
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
  multiple = false,
  onStatusChange,
}: MediaFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const normalizedSrc = value.src.trim()
  const hasValue = normalizedSrc.length > 0
  const [showManualUrl, setShowManualUrl] = useState(() => hasValue && !value.assetId)

  const {
    isDragActive,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    resetDragState,
  } = useMediaDragState()
  const {
    uploadState,
    uploadError,
    libraryCount,
    currentAsset,
    handleFilesUpload,
    handleUploadInput,
    handleReprocessAsset,
  } = useMediaUploadQueue({
    kind,
    multiple,
    normalizedSrc,
    onChange,
    onStatusChange,
  })

  const statusText = useMemo(() => {
    if (uploadState === 'sending') {
      return 'Enviando seu arquivo...'
    }
    if (uploadState === 'processing') {
      return 'Quase la: estamos processando o arquivo.'
    }
    if (uploadState === 'ready') {
      return 'Pronto! O arquivo ja pode ser usado.'
    }
    if (uploadState === 'error') {
      return uploadError ?? 'Nao conseguimos enviar. Tente novamente ou use a URL manual.'
    }
    return null
  }, [uploadError, uploadState])

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    resetDragState()
    const dropped = Array.from(event.dataTransfer.files ?? [])
    await handleFilesUpload(dropped)
  }

  const sectionState = deriveSectionState(uploadState)

  const resolvedHelperText = helperText
    ?? 'Primeiro use upload/arraste e solte. Se precisar, use URL manual logo abaixo.'

  const shouldShowUploadedPreview = !multiple && uploadState === 'ready' && Boolean(currentAsset) && hasValue

  return (
    <EditorInputSection
      title={label}
      helperText={resolvedHelperText}
      state={sectionState}
      stateText={statusText}
      actions={hasValue && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          aria-label={`Remover item de ${label}`}
        >
          <Trash2 size={14} />
          Remover item
        </button>
      ) : null}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept ?? getDefaultAccept(kind)}
        multiple={multiple}
        className="hidden"
        onChange={handleUploadInput}
      />

      {shouldShowUploadedPreview ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: [0.19, 1, 0.22, 1] }}
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 transition-all duration-300"
          aria-label={`Upload confirmado para ${label}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {kind === 'image' ? (
                <img src={normalizedSrc} alt="Preview do arquivo enviado" className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">Upload concluido</p>
                <p className="text-xs text-text-light">Arquivo enviado com sucesso. Voce pode trocar quando quiser.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl border border-primary/30 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`Trocar arquivo de ${label}`}
            >
              <Upload size={14} />
              Trocar arquivo
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: [0.19, 1, 0.22, 1] }}
          className={`space-y-2 rounded-xl border border-dashed p-3 transition-colors ${isDragActive ? 'border-primary/55 bg-primary/10' : 'border-primary/25 bg-white/85'}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label={`Area de upload para ${label}`}
        >
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-5 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`Upload de arquivo para ${label}`}
            >
              <Upload size={18} />
              {kind === 'image' ? 'Upload de imagem' : kind === 'video' ? 'Upload de video' : 'Upload de audio'}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {uploadState === 'sending' || uploadState === 'processing' || uploadState === 'error' || uploadState === 'ready' ? (
              <motion.p
                key={`drop-status-${uploadState}`}
                initial={{ opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.99 }}
                transition={{ duration: 0.14, ease: [0.19, 1, 0.22, 1] }}
                className={`text-center text-xs ${uploadState === 'error' ? 'text-red-600' : uploadState === 'ready' ? 'text-emerald-700' : 'text-text-light'}`}
                role={uploadState === 'error' ? 'alert' : 'status'}
              >
                <span className="inline-flex items-center gap-1.5">
                  {uploadState === 'error' ? <RotateCcw size={12} aria-hidden="true" /> : uploadState === 'ready' ? <CheckCircle2 size={12} aria-hidden="true" /> : <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />}
                  {statusText}
                </span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="pt-2">
        <AnimatePresence initial={false}>
          {showManualUrl ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <label className={EDITOR_FIELD_LABEL_CLASS}>URL manual</label>
                <button
                  type="button"
                  onClick={() => setShowManualUrl(false)}
                  className="text-[11px] font-medium text-text-light transition-colors hover:text-text"
                >
                  Ocultar
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
                className={EDITOR_FIELD_BASE_CLASS}
                aria-label={`Colar URL para ${label}`}
              />
            </motion.div>
          ) : (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualUrl(true)}
              className="text-[11px] font-medium tracking-wide text-primary/70 transition-colors hover:text-primary hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              + Usar URL manual (para fontes externas)
            </motion.button>
          )}
        </AnimatePresence>
      </div>

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
              ?? (isValidUrl(normalizedSrc) ? 'Midia pronta para visualizacao.' : 'Sem midia valida. Envie arquivo ou cole URL segura.')}
          </p>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {(libraryCount !== null || currentAsset) ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.19, 1, 0.22, 1] }}
            className="rounded-lg border border-primary/20 bg-white/75 px-3 py-2 text-xs text-text-light"
          >
            {currentAsset ? (
              <p className="mt-1 inline-flex items-center gap-1">
                {currentAsset.processingStatus === 'ready' ? <CheckCircle2 size={12} /> : <LoaderCircle size={12} className="animate-spin" />}
                Asset {currentAsset.id.slice(-6)} | status: {currentAsset.processingStatus}
                {currentAsset.processingStatus === 'failed' ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleReprocessAsset()
                    }}
                    className="ml-1 inline-flex min-h-11 items-center gap-1 rounded border border-amber-300 px-2 py-1 text-amber-700 hover:bg-amber-50"
                  >
                    <RotateCcw size={10} />
                    Reprocessar
                  </button>
                ) : null}
              </p>
            ) : null}
            {libraryCount !== null ? <p className="mt-1">Biblioteca: {libraryCount} arquivo(s).</p> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </EditorInputSection>
  )
}
