import { AlertTriangle, ArrowRight, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { ReviewIssue } from '@/editor/utils/reviewBlocks'

interface PublishReviewModalProps {
  isOpen: boolean
  issues: ReviewIssue[]
  publishing?: boolean
  onClose: () => void
  /** Pula direto para o bloco no canvas. */
  onGoToBlock: (blockId: string) => void
  /** Publica mesmo com pontos pendentes. */
  onPublishAnyway: () => void
}

export function PublishReviewModal({
  isOpen,
  issues,
  publishing = false,
  onClose,
  onGoToBlock,
  onPublishAnyway,
}: PublishReviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        issues.length > 0
          ? `Antes de publicar — ${issues.length} ${issues.length === 1 ? 'ponto' : 'pontos'} pra revisar`
          : 'Tudo certo para publicar'
      }
    >
      {issues.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-text-light">
            Encontrei blocos que vão aparecer vazios ou incompletos para quem recebe.
            Você pode ajustar agora ou publicar mesmo assim.
          </p>
          <ul className="space-y-2" role="list">
            {issues.map((issue) => (
              <li key={`${issue.blockId}-${issue.problem}`}>
                <button
                  type="button"
                  onClick={() => onGoToBlock(issue.blockId)}
                  className="group flex w-full min-h-[44px] items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <AlertTriangle
                    size={16}
                    className="shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm">
                    <span className="font-semibold text-text">{issue.blockLabel}</span>
                    <span className="text-text-light"> — {issue.problem}</span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-primary/5"
            >
              Voltar e revisar
            </button>
            <button
              type="button"
              onClick={onPublishAnyway}
              disabled={publishing}
              className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {publishing ? 'Publicando...' : 'Publicar mesmo assim'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-sm text-text-light">
            <Check size={16} className="text-emerald-600" aria-hidden="true" />
            Nenhum bloco incompleto. A página está pronta para ser enviada.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-primary/5"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={onPublishAnyway}
              disabled={publishing}
              className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {publishing ? 'Publicando...' : 'Publicar agora'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
