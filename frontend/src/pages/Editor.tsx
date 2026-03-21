import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { ArrowLeft } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { EditorToolbar } from '@/editor/components/EditorToolbar'
import { EditorCanvas } from '@/editor/components/EditorCanvas'
import { PageRenderer } from '@/editor/components/PageRenderer'
import { useEditorStore } from '@/editor/store/editorStore'
import {
  AUTOSAVE_DEBOUNCE_MS,
  PAGE_VERSION,
  type Block,
  type PageStatus,
  type PageVisibility,
} from '@/editor/types'
import { buildThemeStyle, resolveThemeId } from '@/editor/themes'
import {
  resolveDraftPrecedence,
} from '@/editor/draftPrecedence'
import { cloneTemplateBlocks, getTemplateById } from '@/editor/templates'
import { pageService, type PageSummary } from '@/services/pageService'
import { trackEditorEvent } from '@/services/telemetry'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface LocalDraftSnapshot {
  pageId: string
  updatedAt: string
  page: {
    id: string
    blocks: PageSummary['blocks']
    theme?: string
    status: PageStatus
    visibility: PageVisibility
    publishedAt: string | null
    version: number
    updatedAt: string
  }
}

interface DraftConflictState {
  localSnapshot: LocalDraftSnapshot
  backendPage: PageSummary
}

interface TemplateConflictState {
  templateName: string
  blocks: Block[]
  theme?: string
}

function toDraftSnapshot(page: PageSummary): LocalDraftSnapshot {
  return {
    pageId: page.id,
    updatedAt: page.updatedAt,
    page: {
      id: page.id,
      blocks: page.blocks,
      theme: page.theme,
      status: page.status,
      visibility: page.visibility,
      publishedAt: page.publishedAt,
      version: page.version,
      updatedAt: page.updatedAt,
    },
  }
}

function toPageSignature(input: {
  blocks: PageSummary['blocks']
  theme?: string
  status: PageStatus
  visibility: PageVisibility
}) {
  return JSON.stringify({
    blocks: input.blocks,
    theme: resolveThemeId(input.theme),
    status: input.status,
    visibility: input.visibility,
  })
}

export function Editor() {
  const navigate = useNavigate()
  const params = useParams<{ pageId?: string }>()
  const [searchParams] = useSearchParams()
  const pageIdFromRoute = params.pageId
  const templateIdFromQuery = searchParams.get('template')?.trim() || null

  const mode = useEditorStore((state) => state.mode)
  const blocks = useEditorStore((state) => state.blocks)
  const theme = useEditorStore((state) => state.theme)
  const setMode = useEditorStore((state) => state.setMode)
  const setPage = useEditorStore((state) => state.setPage)
  const setDraftContext = useEditorStore((state) => state.setDraftContext)

  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [currentPageId, setCurrentPageId] = useState<string | undefined>(pageIdFromRoute)
  const [pageVersion, setPageVersion] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<PageStatus>('draft')
  const [visibility, setVisibility] = useState<PageVisibility>('public')
  const [lastSyncedSignature, setLastSyncedSignature] = useState('')
  const [draftConflict, setDraftConflict] = useState<DraftConflictState | null>(null)
  const [templateConflict, setTemplateConflict] = useState<TemplateConflictState | null>(null)
  const handledTemplateKeyRef = useRef<string>('')

  useEffect(() => {
    trackEditorEvent({
      event: 'editor_open',
      pageId: pageIdFromRoute,
      status: pageIdFromRoute ? 'existing' : 'new',
    })
  }, [pageIdFromRoute])

  const pageMetaRef = useRef({
    status,
    visibility,
    pageVersion,
  })

  useEffect(() => {
    pageMetaRef.current = {
      status,
      visibility,
      pageVersion,
    }
  }, [pageVersion, status, visibility])

  const hasPageId = Boolean(currentPageId)
  const currentSignature = useMemo(
    () => toPageSignature({ blocks, theme, status, visibility }),
    [blocks, status, theme, visibility],
  )
  const editorThemeStyle = useMemo(() => buildThemeStyle(theme), [theme])

  const handleLoadServerVersion = useCallback(async () => {
    if (!currentPageId) {
      return
    }

    const startedAt = Date.now()
    try {
      const page = await pageService.loadPage(currentPageId)
      setPage({ blocks: page.blocks, theme: page.theme })
      setPageVersion(page.version)
      setStatus(page.status)
      setVisibility(page.visibility)
      setDraftContext(page.id, page.updatedAt)
      setLastSyncedSignature(toPageSignature(page))
      setSaveState('idle')
      setFeedback('Versao do servidor carregada com sucesso.')
      trackEditorEvent({
        event: 'load_success',
        pageId: page.id,
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      trackEditorEvent({
        event: 'load_error',
        pageId: currentPageId,
        durationMs: Date.now() - startedAt,
        detail: isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined,
      })
      throw error
    }
  }, [currentPageId, setDraftContext, setPage])

  const applyBackendPage = useCallback((backendPage: PageSummary) => {
    setPage({ blocks: backendPage.blocks, theme: backendPage.theme })
    setCurrentPageId(backendPage.id)
    setPageVersion(backendPage.version)
    setStatus(backendPage.status)
    setVisibility(backendPage.visibility)
    setDraftContext(backendPage.id, backendPage.updatedAt)
    setLastSyncedSignature(toPageSignature(backendPage))
  }, [setDraftContext, setPage])

  const applyLocalDraft = useCallback((localSnapshot: LocalDraftSnapshot) => {
    setPage({ blocks: localSnapshot.page.blocks, theme: localSnapshot.page.theme })
    setCurrentPageId(localSnapshot.pageId)
    setDraftContext(localSnapshot.pageId, localSnapshot.updatedAt)
    setStatus(localSnapshot.page.status)
    setVisibility(localSnapshot.page.visibility)
    setPageVersion(localSnapshot.page.version)
    setLastSyncedSignature(toPageSignature(localSnapshot.page))
    setFeedback('Rascunho local carregado para continuar a edicao.')
  }, [setDraftContext, setPage])

  const applyTemplate = useCallback((templateBlocks: Block[], templateName: string, templateTheme?: string) => {
    setPage({ blocks: templateBlocks, theme: templateTheme })
    setCurrentPageId(undefined)
    setPageVersion(undefined)
    setStatus('draft')
    setVisibility('public')
    setDraftContext(null)
    setLastSyncedSignature('')
    setSaveState('idle')
    setMode('edit')
    setFeedback(`Template "${templateName}" aplicado. Personalize e salve quando quiser.`)
  }, [setDraftContext, setMode, setPage])

  const savePage = useCallback(async () => {
    const startedAt = Date.now()
    trackEditorEvent({ event: 'save_start', pageId: currentPageId })
    try {
      setSaveState('saving')
      setFeedback(null)

      const result = await pageService.savePage({
        pageId: currentPageId,
        content: {
          blocks,
          theme,
          version: PAGE_VERSION,
        },
        status,
        visibility,
        version: pageVersion,
      })

      setCurrentPageId(result.page.id)
      setPageVersion(result.page.version)
      setStatus(result.page.status)
      setVisibility(result.page.visibility)
      setDraftContext(result.page.id, result.page.updatedAt)
      setLastSyncedSignature(currentSignature)
      setSaveState('saved')
      setFeedback('Pagina salva com sucesso.')
      trackEditorEvent({
        event: 'save_success',
        pageId: result.page.id,
        durationMs: Date.now() - startedAt,
      })

      if (result.page.status === 'published') {
        trackEditorEvent({
          event: 'publish_success',
          pageId: result.page.id,
          durationMs: Date.now() - startedAt,
        })
      }

      if (!currentPageId) {
        navigate(`/editor/${result.page.id}`, { replace: true })
      }
    } catch (error) {
      const isFeatureDisabled =
        isAxiosError<{ code?: string; error?: string; reason?: string; rolloutPercent?: number }>(error)
        && error.response?.data?.code === 'EDITOR_MODULAR_FEATURE_DISABLED'

      if (isFeatureDisabled) {
        navigate('/create', {
          replace: true,
          state: {
            editorBlockedReason: error.response?.data?.reason,
            rolloutPercent: error.response?.data?.rolloutPercent,
          },
        })
        return
      }

      if (isAxiosError<{ error?: string; code?: string }>(error) && error.response?.status === 409) {
        setSaveState('error')
        setFeedback(
          error.response.data?.error
          ?? 'A pagina foi atualizada em outro lugar. Recarregue a versao do servidor para continuar.',
        )
        trackEditorEvent({
          event: 'save_error',
          pageId: currentPageId,
          durationMs: Date.now() - startedAt,
          detail: error.response.data?.error,
        })
        return
      }

      setSaveState('error')
      setFeedback(
        isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error ?? 'Falha ao salvar pagina. Tente novamente.'
          : 'Falha ao salvar pagina. Tente novamente.',
      )

      trackEditorEvent({
        event: 'save_error',
        pageId: currentPageId,
        durationMs: Date.now() - startedAt,
        detail: isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined,
      })

      if (status === 'published') {
        trackEditorEvent({
          event: 'publish_error',
          pageId: currentPageId,
          durationMs: Date.now() - startedAt,
          detail: isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined,
        })
      }
    }
  }, [
    blocks,
    currentPageId,
    currentSignature,
    navigate,
    pageVersion,
    setDraftContext,
    status,
    theme,
    visibility,
  ])

  useEffect(() => {
    if (!feedback) {
      return
    }

    const timeoutId = setTimeout(() => {
      setFeedback(null)
    }, 4000)

    return () => clearTimeout(timeoutId)
  }, [feedback])

  useEffect(() => {
    const templateKey = `${pageIdFromRoute ?? 'new'}:${templateIdFromQuery ?? ''}`
    if (handledTemplateKeyRef.current === templateKey) {
      return
    }

    handledTemplateKeyRef.current = templateKey

    if (pageIdFromRoute || !templateIdFromQuery) {
      return
    }

    const template = getTemplateById(templateIdFromQuery)
    if (!template) {
      setFeedback('Template nao encontrado. O editor foi aberto sem modelo.')
      return
    }

    const clonedBlocks = cloneTemplateBlocks(template.blocks)
    if (blocks.length > 0) {
      setTemplateConflict({
        templateName: template.name,
        blocks: clonedBlocks,
        theme: template.theme,
      })
      return
    }

    applyTemplate(clonedBlocks, template.name, template.theme)
  }, [
    applyTemplate,
    blocks.length,
    pageIdFromRoute,
    templateIdFromQuery,
  ])

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!pageIdFromRoute) {
        setCurrentPageId(undefined)
        setPageVersion(undefined)
        return
      }

      setIsLoadingPage(true)
      const startedAt = Date.now()
      try {
        const backendPage = await pageService.loadPage(pageIdFromRoute)
        if (!active) {
          return
        }

        const editorState = useEditorStore.getState()
        const localBlocks = editorState.blocks
        const localStatus = pageMetaRef.current.status
        const localVisibility = pageMetaRef.current.visibility
        const localVersion = pageMetaRef.current.pageVersion
        const localDraftPageId = editorState.draftPageId
        const localDraftUpdatedAt = editorState.draftUpdatedAt
        const localTheme = editorState.theme

        const localSnapshot: LocalDraftSnapshot | null =
          localDraftPageId === pageIdFromRoute && localDraftUpdatedAt
            ? {
                pageId: pageIdFromRoute,
                updatedAt: localDraftUpdatedAt,
                page: {
                  id: pageIdFromRoute,
                  blocks: localBlocks,
                  theme: localTheme,
                  status: localStatus,
                  visibility: localVisibility,
                  publishedAt: null,
                  version: localVersion ?? PAGE_VERSION,
                  updatedAt: localDraftUpdatedAt,
                },
              }
            : null

        const backendSnapshot = toDraftSnapshot(backendPage)
        const precedence = resolveDraftPrecedence({
          pageId: pageIdFromRoute,
          localDraft: localSnapshot,
          backendPage: backendSnapshot,
        })

        const shouldUseLocal =
          precedence.decision === 'use-local'

        if (shouldUseLocal && localSnapshot) {
          applyLocalDraft(localSnapshot)
          return
        }

        if (precedence.decision === 'ask-user' && localSnapshot) {
          setDraftConflict({ localSnapshot, backendPage })
          return
        }

        applyBackendPage(backendPage)
        trackEditorEvent({
          event: 'load_success',
          pageId: backendPage.id,
          durationMs: Date.now() - startedAt,
        })
      } catch (error) {
        if (!active) {
          return
        }

        const isFeatureDisabled =
          isAxiosError<{ code?: string; reason?: string; rolloutPercent?: number }>(error)
          && error.response?.data?.code === 'EDITOR_MODULAR_FEATURE_DISABLED'

        if (isFeatureDisabled) {
          navigate('/create', {
            replace: true,
            state: {
              editorBlockedReason: error.response?.data?.reason,
              rolloutPercent: error.response?.data?.rolloutPercent,
            },
          })
          return
        }

        setFeedback(
          isAxiosError<{ error?: string }>(error)
            ? error.response?.data?.error ?? 'Nao foi possivel carregar a pagina.'
            : 'Nao foi possivel carregar a pagina.',
        )

        trackEditorEvent({
          event: 'load_error',
          pageId: pageIdFromRoute,
          durationMs: Date.now() - startedAt,
          detail: isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined,
        })
      } finally {
        if (active) {
          setIsLoadingPage(false)
        }
      }
    }

    run()

    return () => {
      active = false
    }
  }, [
    pageIdFromRoute,
    navigate,
    applyBackendPage,
    applyLocalDraft,
  ])

  useEffect(() => {
    if (!hasPageId || pageVersion === undefined || typeof window === 'undefined') {
      return
    }

    if (currentSignature === lastSyncedSignature) {
      return
    }

    if (saveState === 'saving' || isLoadingPage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void savePage()
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    currentSignature,
    hasPageId,
    isLoadingPage,
    lastSyncedSignature,
    pageVersion,
    savePage,
    saveState,
  ])

  const feedbackClassName = useMemo(() => {
    if (saveState === 'error') {
      return 'border-red-200 bg-red-50 text-red-600'
    }

    if (saveState === 'saved') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }

    return 'border-primary/20 bg-white/80 text-text'
  }, [saveState])

  return (
    <div className="min-h-screen px-4 pb-24 pt-28 md:px-6 md:pb-12" style={editorThemeStyle}>
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-text md:text-4xl">Editor modular</h1>
          <p className="mt-1 text-sm text-text-light">Arraste blocos, reorganize e visualize o resultado em tempo real.</p>
        </div>

        {feedback ? (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassName}`} role="status">
            {feedback}
            {saveState === 'error' && hasPageId ? (
              <button
                type="button"
                onClick={() => {
                  void handleLoadServerVersion()
                }}
                className="ml-3 rounded-md border border-current/30 px-2 py-1 text-xs font-medium"
              >
                Recarregar servidor
              </button>
            ) : null}
          </div>
        ) : null}

        {mode === 'edit' ? (
          <EditorToolbar
            onSave={() => {
              void savePage()
            }}
            isSaving={saveState === 'saving'}
            hasPageId={hasPageId}
            selectedThemeId={theme}
          />
        ) : (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-white/85 px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-primary/10"
            >
              <ArrowLeft size={16} />
              Voltar ao editor
            </button>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isLoadingPage ? (
            <motion.section
              key="loading-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-primary/20 bg-white/80 p-8 text-center"
            >
              <p className="text-sm text-text-light">Carregando pagina...</p>
            </motion.section>
          ) : mode === 'edit' ? (
            <motion.section
              key="editor-mode"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <EditorCanvas />
            </motion.section>
          ) : (
            <motion.section
              key="preview-mode"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-primary/20 bg-white/80 p-4 shadow-sm md:p-6"
            >
              <PageRenderer blocks={blocks} theme={theme} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={Boolean(templateConflict)}
        onClose={() => {
          setTemplateConflict(null)
          setFeedback('Template ignorado para preservar o rascunho atual.')
        }}
        title="Aplicar template"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            Ja existe conteudo no editor. Deseja substituir os blocos atuais pelo template {templateConflict ? `"${templateConflict.templateName}"` : ''}?
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setTemplateConflict(null)
                setFeedback('Template ignorado para preservar o rascunho atual.')
              }}
              className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-medium text-text-light transition-colors hover:bg-primary/5"
            >
              Manter rascunho atual
            </button>
            <button
              type="button"
              onClick={() => {
                if (!templateConflict) {
                  return
                }

                applyTemplate(templateConflict.blocks, templateConflict.templateName, templateConflict.theme)
                setTemplateConflict(null)
              }}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Substituir pelo template
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(draftConflict)}
        onClose={() => {
          if (!draftConflict) {
            return
          }

          applyBackendPage(draftConflict.backendPage)
          setDraftConflict(null)
          setFeedback('Versao salva carregada com sucesso.')
        }}
        title="Rascunho local encontrado"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            Encontramos um rascunho local mais recente para esta pagina. Deseja continuar com o rascunho local ou usar a versao salva no servidor?
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (!draftConflict) {
                  return
                }

                applyBackendPage(draftConflict.backendPage)
                setDraftConflict(null)
                setFeedback('Versao salva carregada com sucesso.')
              }}
              className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-medium text-text-light transition-colors hover:bg-primary/5"
            >
              Usar versao salva
            </button>
            <button
              type="button"
              onClick={() => {
                if (!draftConflict) {
                  return
                }

                applyLocalDraft(draftConflict.localSnapshot)
                setDraftConflict(null)
              }}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Continuar rascunho local
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
