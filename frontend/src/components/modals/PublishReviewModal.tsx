import { AlertTriangle, ArrowRight, Check, Eye } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { BlockReview } from '@/editor/utils/reviewBlocks'

interface PublishReviewModalProps {
  isOpen: boolean
  /** Matriz de completude — uma linha por parte da página, na ordem do destinatário. */
  reviews: BlockReview[]
  publishing?: boolean
  onClose: () => void
  /** Pula direto para o bloco no canvas. */
  onGoToBlock: (blockId: string) => void
  /** Abre a prévia no modo em que quem recebe vai ver. */
  onPreview: () => void
  /** Publica mesmo com pontos pendentes. */
  onPublishAnyway: () => void
}

export function PublishReviewModal({
  isOpen,
  reviews,
  publishing = false,
  onClose,
  onGoToBlock,
  onPreview,
  onPublishAnyway,
}: PublishReviewModalProps) {
  const pending = reviews.filter((r) => r.problem !== undefined)
  const ready = reviews.length - pending.length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        reviews.length === 0
          ? 'Testar a página'
          : pending.length > 0
            ? `Testar a página — ${ready} de ${reviews.length} ${reviews.length === 1 ? 'parte pronta' : 'partes prontas'}`
            : 'Tudo certo para publicar'
      }
    >
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-text-light">
            A página ainda está vazia. Adicione pelo menos uma parte antes de publicar.
          </p>
        ) : (
          <>
            <p className="text-sm text-text-light">
              {pending.length > 0
                ? 'É assim que quem recebe vai viver a página, parte por parte. Toque em uma parte para ajustar.'
                : 'É assim que quem recebe vai viver a página, parte por parte. Tudo completo — pode conferir a prévia ou publicar.'}
            </p>
            <ul className="space-y-2" role="list">
              {reviews.map((review, index) => (
                <li key={review.blockId}>
                  <button
                    type="button"
                    onClick={() => onGoToBlock(review.blockId)}
                    className="group flex w-full min-h-[44px] items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {review.problem ? (
                      <AlertTriangle
                        size={16}
                        className="shrink-0 text-amber-600"
                        aria-label="Parte incompleta"
                      />
                    ) : (
                      <Check
                        size={16}
                        className="shrink-0 text-emerald-600"
                        aria-label="Parte pronta"
                      />
                    )}
                    <span className="flex-1 text-sm">
                      <span className="font-semibold text-text">
                        {index + 1}. {review.blockLabel}
                      </span>
                      <span className="text-text-light"> — quem recebe {review.experience}</span>
                      {review.problem && (
                        <span className="mt-0.5 block text-amber-700">{review.problem}</span>
                      )}
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
          </>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-primary/5"
          >
            Voltar e revisar
          </button>
          <button
            type="button"
            onClick={onPreview}
            disabled={reviews.length === 0}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-primary/5 disabled:opacity-60"
          >
            <Eye size={16} aria-hidden="true" />
            Ver como quem recebe
          </button>
          <button
            type="button"
            onClick={onPublishAnyway}
            disabled={publishing || reviews.length === 0}
            className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {publishing
              ? 'Publicando...'
              : pending.length > 0
                ? 'Publicar mesmo assim'
                : 'Publicar agora'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
