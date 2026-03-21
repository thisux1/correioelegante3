import { memo, useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImageOff, ImagePlus } from 'lucide-react'
import type { BlockComponentProps } from '@/editor/types'
import { assetService } from '@/services/assetService'

type UploadState = 'idle' | 'sending' | 'processing' | 'ready' | 'error'

function ImageBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isImageBlock = block.type === 'image'

  const source = isImageBlock ? block.props.src.trim() : ''
  const alt = isImageBlock ? block.props.alt?.trim() || 'Imagem do bloco' : 'Imagem do bloco'
  const hasSource = source.length > 0
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const [draftSrc, setDraftSrc] = useState(source)
  const [isEditingUrl, setIsEditingUrl] = useState(() => source.length === 0)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [libraryCount, setLibraryCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const hasError = hasSource && failedSource === source

  useEffect(() => {
    setDraftSrc(source)
  }, [source])

  useEffect(() => {
    if (!hasSource) {
      setIsEditingUrl(true)
    }
  }, [hasSource])

  const openUrlEditor = useCallback(() => {
    setDraftSrc(source)
    setIsEditingUrl(true)
  }, [source])

  const commitSource = useCallback(() => {
    if (!isImageBlock) {
      return
    }

    const normalizedSource = draftSrc.trim()
    setDraftSrc(normalizedSource)
    setFailedSource(null)

    if (!onUpdate || normalizedSource === source) {
      setIsEditingUrl(false)
      return
    }

    onUpdate((currentBlock) => {
      if (currentBlock.type !== 'image') {
        return currentBlock
      }

      return {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          src: normalizedSource,
        },
      }
    })

    setIsEditingUrl(false)
  }, [draftSrc, isImageBlock, onUpdate, source])

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelection = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    if (!isImageBlock) {
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadError(null)
    setUploadState('sending')

    try {
      const asset = await assetService.uploadFileFlow({ file, kind: 'image' })
      setUploadState('processing')

      const { data } = await assetService.list('image')
      setLibraryCount(data.assets.length)

      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'image') {
          return currentBlock
        }

        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            src: asset.publicUrl ?? currentBlock.props.src,
          },
        }
      })

      setUploadState('ready')
      setIsEditingUrl(false)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Falha no upload da imagem. Verifique a configuracao de midia no backend.'
      setUploadError(message)
      setUploadState('error')
    } finally {
      event.target.value = ''
    }
  }, [isImageBlock, onUpdate])

  if (!isImageBlock) {
    return null
  }

  const renderPlaceholder = (
    variant: 'empty' | 'error',
    options?: {
      interactive?: boolean
      onClick?: () => void
    },
  ) => {
    const isInteractive = options?.interactive === true

    if (variant === 'error') {
      const content = (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-red-500">
          <ImageOff size={32} />
          <p className="text-sm font-medium">Nao foi possivel carregar a imagem</p>
          {isInteractive ? <p className="text-xs text-red-400">Clique para trocar a URL</p> : null}
        </div>
      )

      if (!isInteractive) {
        return content
      }

      return (
        <button
          type="button"
          onClick={options?.onClick}
          className="block w-full text-left"
          aria-label="Trocar URL da imagem"
        >
          {content}
        </button>
      )
    }

    const content = (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/30 bg-white/75 p-6 text-text-light transition-colors">
        <ImagePlus size={32} />
        <p className="text-sm font-medium">Adicione uma imagem</p>
        {isInteractive ? <p className="text-xs">Clique para inserir a URL</p> : null}
      </div>
    )

    if (!isInteractive) {
      return content
    }

    return (
      <button
        type="button"
        onClick={options?.onClick}
        className="block w-full text-left"
        aria-label="Adicionar imagem"
      >
        {content}
      </button>
    )
  }

  const previewImage =
    hasSource && !hasError ? (
      <img
        src={source}
        alt={alt}
        onLoad={() => {
          setFailedSource((current) => (current === source ? null : current))
        }}
        onError={() => setFailedSource(source)}
        className="h-[320px] w-full rounded-xl border border-primary/15 bg-white object-cover"
      />
    ) : mode === 'edit'
      ? renderPlaceholder(hasSource ? 'error' : 'empty', {
          interactive: true,
          onClick: openUrlEditor,
        })
      : renderPlaceholder(hasSource ? 'error' : 'empty')

  if (mode === 'preview') {
    return previewImage
  }

  return (
    <div className="space-y-3">
      {previewImage}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelection}
        />
        <button
          type="button"
          onClick={triggerFilePicker}
          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Upload de imagem
        </button>
        <button
          type="button"
          onClick={openUrlEditor}
          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {hasSource ? 'Trocar imagem' : 'Adicionar imagem'}
        </button>
      </div>

      {(uploadState !== 'idle' || uploadError || libraryCount !== null) && (
        <div className="rounded-xl border border-primary/20 bg-white/70 px-3 py-2 text-xs text-text-light">
          {uploadState === 'sending' ? 'Enviando imagem...' : null}
          {uploadState === 'processing' ? 'Processando imagem...' : null}
          {uploadState === 'ready' ? 'Imagem pronta para uso.' : null}
          {uploadState === 'error' ? `Erro no upload: ${uploadError ?? 'tente novamente.'}` : null}
          {libraryCount !== null ? ` Biblioteca: ${libraryCount} asset(s).` : null}
        </div>
      )}

      {isEditingUrl && (
        <div className="space-y-2 rounded-xl border border-primary/20 bg-white/75 p-3">
          <label className="block text-xs font-medium text-text-light">URL da imagem</label>
          <input
            value={draftSrc}
            onChange={(event) => setDraftSrc(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitSource()
              }
            }}
            placeholder="https://..."
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary/50"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={commitSource}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Salvar URL
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftSrc(source)
                setIsEditingUrl(false)
              }}
              className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-medium text-text-light transition-colors hover:bg-primary/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function areImageBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const ImageBlock = memo(ImageBlockComponent, areImageBlockPropsEqual)
