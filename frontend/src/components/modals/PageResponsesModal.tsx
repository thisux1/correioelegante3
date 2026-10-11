import { useEffect, useState } from 'react'
import { Check, CalendarX2, CalendarClock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { pageService, type PageResponseEntry, type RsvpChoice } from '@/services/pageService'

const CHOICE_LABEL: Record<RsvpChoice, string> = {
  yes: 'Aceitou o convite',
  no: 'Não pode ir',
  other_day: 'Sugeriu outro dia',
}

const CHOICE_ICON: Record<RsvpChoice, typeof Check> = {
  yes: Check,
  no: CalendarX2,
  other_day: CalendarClock,
}

interface PageResponsesModalProps {
  isOpen: boolean
  onClose: () => void
  pageId: string
  pageTitle: string
}

export function PageResponsesModal({ isOpen, onClose, pageId, pageTitle }: PageResponsesModalProps) {
  const [result, setResult] = useState<{
    pageId: string
    data?: PageResponseEntry[]
    error?: boolean
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    pageService
      .getPageResponses(pageId)
      .then((data) => {
        if (!cancelled) setResult({ pageId, data })
      })
      .catch(() => {
        if (!cancelled) setResult({ pageId, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, pageId])

  const loading = !result || result.pageId !== pageId
  const failed = !loading && Boolean(result?.error)
  const responses = !loading && !failed ? (result?.data ?? null) : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Respostas — ${pageTitle}`}>
      {responses === null && !failed && (
        <p className="text-sm text-text-light">Carregando respostas…</p>
      )}

      {failed && (
        <p className="text-sm text-text-light">
          Não foi possível carregar as respostas agora. Tente de novo em alguns minutos.
        </p>
      )}

      {responses !== null && responses.length === 0 && (
        <p className="text-sm text-text-light">
          Nenhuma resposta ainda. Quando a pessoa responder pelo link, aparece aqui
          e você também recebe um e-mail.
        </p>
      )}

      {responses !== null && responses.length > 0 && (
        <ul className="space-y-3">
          {responses.map((entry, index) => {
            const Icon = CHOICE_ICON[entry.choice] ?? Check
            return (
              <li
                key={`${entry.blockId}-${index}`}
                className="rounded-2xl border-2 border-border bg-surface p-4"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text">
                      {CHOICE_LABEL[entry.choice] ?? entry.choice}
                    </p>
                    <p className="text-xs text-text-light">
                      {entry.respondentName?.trim() || 'Sem nome informado'}
                      {' · '}
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {entry.text?.trim() && (
                  <p className="mt-3 rounded-xl bg-black/[0.03] px-4 py-3 text-sm italic text-text">
                    “{entry.text}”
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
