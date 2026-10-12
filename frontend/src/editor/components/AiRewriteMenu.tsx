import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, LoaderCircle, RotateCcw, Sparkles } from 'lucide-react'
import { aiService, AI_ACTIONS, type AiAction } from '@/services/aiService'

interface AiRewriteMenuProps {
  /** Texto plano atual do campo alvo. */
  getText: () => string
  /** Aplica o texto reescrito no campo alvo. */
  onApply: (rewritten: string) => void
  /** Desabilita a abertura do menu (ex.: bloco sem texto). */
  disabled?: boolean
}

/**
 * Menu de reescrita por IA reutilizável (S11+): reescreve o texto por tom
 * e guarda a versão anterior para "desfazer reescrita" local.
 */
export function AiRewriteMenu({ getText, onApply, disabled }: AiRewriteMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [undoText, setUndoText] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen])

  const handleRewrite = useCallback(
    async (action: AiAction) => {
      const plain = getText().trim()
      if (!plain || isLoading) return

      setIsOpen(false)
      setError(null)
      setIsLoading(true)
      try {
        const rewritten = await aiService.rewrite(plain.slice(0, 2000), action)
        setUndoText(plain)
        onApply(rewritten)
      } catch (err) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'A IA não respondeu agora. Tenta de novo.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [getText, isLoading, onApply],
  )

  const handleUndo = useCallback(() => {
    if (undoText === null) return
    onApply(undoText)
    setUndoText(null)
  }, [onApply, undoText])

  return (
    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev)
            setError(null)
          }}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Reescrever texto com IA"
          title="Reescrever com IA"
          disabled={disabled || isLoading || !getText().trim()}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            isOpen
              ? 'border-primary bg-primary/10 text-primary shadow-2xs'
              : 'border-border bg-surface text-text hover:border-primary/40'
          }`}
        >
          {isLoading ? (
            <LoaderCircle size={13} className="animate-spin text-primary" />
          ) : (
            <Sparkles size={13} className="text-primary" />
          )}
          <span>{isLoading ? 'reescrevendo...' : 'IA'}</span>
          <ChevronDown
            size={11}
            className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-label="Ações de reescrita com IA"
            className="absolute left-0 top-full z-[100] mt-2 w-44 rounded-2xl border border-border bg-surface p-1.5 shadow-2xl backdrop-blur-md"
          >
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-light/70">
              deixar o texto
            </p>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                onClick={() => void handleRewrite(action.id)}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-text transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {(error || undoText !== null) && (
        <div className="flex flex-wrap items-center gap-2" role="status">
          {error && (
            <span className="rounded-lg border border-[#be123c]/30 bg-[#ffe4ec] px-2 py-0.5 text-xs text-[#881337]">
              {error}
            </span>
          )}
          {undoText !== null && (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:text-primary"
            >
              <RotateCcw size={11} />
              desfazer reescrita
            </button>
          )}
        </div>
      )}
    </div>
  )
}
