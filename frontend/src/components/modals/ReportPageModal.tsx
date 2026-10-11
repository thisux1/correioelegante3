import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { pageService, type ReportReason } from '@/services/pageService'

const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'assedio', label: 'Assédio ou mensagem indesejada' },
  { value: 'conteudo_improprio', label: 'Conteúdo impróprio ou ofensivo' },
  { value: 'impersonacao', label: 'Alguém se passando por outra pessoa' },
  { value: 'spam', label: 'Spam ou golpe' },
  { value: 'outro', label: 'Outro motivo' },
]

interface ReportPageModalProps {
  isOpen: boolean
  onClose: () => void
  pageId: string
}

export function ReportPageModal({ isOpen, onClose, pageId }: ReportPageModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [liveMessage, setLiveMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending' || status === 'sent') return
    if (!reason) {
      setLiveMessage('Escolha um motivo antes de enviar.')
      return
    }

    setStatus('sending')
    setLiveMessage('Enviando denúncia…')
    try {
      await pageService.reportPage(pageId, {
        reason,
        details: details.trim() || undefined,
      })
      setStatus('sent')
      setLiveMessage('Denúncia registrada. Nossa equipe vai revisar esta página.')
    } catch {
      setStatus('error')
      setLiveMessage('Não foi possível enviar agora. Tente novamente em alguns minutos.')
    }
  }

  const handleClose = () => {
    onClose()
    if (status === 'sent') {
      setReason(null)
      setDetails('')
      setStatus('idle')
      setLiveMessage('')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Denunciar esta página">
      <p className="text-sm text-text-light -mt-3 mb-5">
        Conta pra gente o que aconteceu. A denúncia é anônima e revisamos cada caso.
      </p>

      {status === 'sent' ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="font-display text-lg font-bold text-text">Denúncia registrada</p>
          <p className="mt-1 text-sm text-text-light">
            Obrigado por avisar. Se a página violar nossas regras, ela sai do ar.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset>
            <legend className="sr-only">Motivo da denúncia</legend>
            <div className="space-y-2">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    reason === option.value
                      ? 'border-primary bg-primary/5 text-text'
                      : 'border-border bg-surface text-text-light hover:border-primary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    className="h-4 w-4 accent-[#e11d48]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="report-details" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-light">
              Detalhes (opcional)
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={600}
              rows={3}
              placeholder="Conte o contexto se quiser, sem pressão"
              className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-base text-text placeholder:text-text-light/60 focus:border-primary focus:outline-none"
            />
          </div>

          <p aria-live="polite" className="min-h-5 text-sm text-text-light">
            {liveMessage}
          </p>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar denúncia'}
          </button>
        </form>
      )}
    </Modal>
  )
}
