import { memo, useCallback, useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CalendarClock,
  CalendarDays,
  Check,
  CircleCheck,
  MailCheck,
  MapPin,
  RotateCcw,
  Send,
  Ticket,
  X,
} from 'lucide-react'
import type {
  BlockComponentProps,
  TicketRsvpBlockProps,
  TicketRsvpEvento,
} from '@/editor/types'
import { usePageRuntime } from '@/editor/context'
import { pageService, type RsvpChoice } from '@/services/pageService'

const DEFAULT_RSVP_PROPS: TicketRsvpBlockProps = {
  title: 'te convido:',
  allowText: true,
}

interface RsvpChoiceOption {
  value: RsvpChoice
  label: string
  icon: typeof Check
}

const RSVP_CHOICES: RsvpChoiceOption[] = [
  { value: 'yes', label: 'Aceito', icon: Check },
  { value: 'no', label: 'Não posso', icon: X },
  { value: 'other_day', label: 'Sugerir outro dia', icon: CalendarClock },
]

const RSVP_SENT_LINES: Record<RsvpChoice, string> = {
  yes: 'Você aceitou o convite.',
  no: 'Você avisou que não pode ir.',
  other_day: 'Você sugeriu outro dia.',
}

type RsvpStatus = 'idle' | 'sending' | 'sent' | 'already' | 'error'

interface HttpErrorShape {
  response?: {
    status?: number
    data?: { error?: string }
  }
}

function httpStatusOf(error: unknown): number | undefined {
  const response = (error as HttpErrorShape | null)?.response
  return typeof response?.status === 'number' ? response.status : undefined
}

function httpErrorMessage(error: unknown): string | undefined {
  const message = (error as HttpErrorShape | null)?.response?.data?.error
  return typeof message === 'string' && message.trim().length > 0 ? message : undefined
}

function TicketRsvpBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isRsvp = block.type === 'ticketRsvp'
  const props: TicketRsvpBlockProps = isRsvp ? block.props : DEFAULT_RSVP_PROPS

  const isEditMode = mode === 'edit'
  const shouldReduceMotion = useReducedMotion()
  const { pageId } = usePageRuntime()

  const messageInputId = useId()
  const nameInputId = useId()
  const titleInputId = useId()
  const dataInputId = useId()
  const lugarInputId = useId()
  const descricaoInputId = useId()

  const [choice, setChoice] = useState<RsvpChoice | null>(null)
  const [text, setText] = useState('')
  const [respondentName, setRespondentName] = useState('')
  const [status, setStatus] = useState<RsvpStatus>('idle')
  const [sentChoice, setSentChoice] = useState<RsvpChoice | null>(null)
  const [sentAsDemo, setSentAsDemo] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [liveMessage, setLiveMessage] = useState('')

  const updateProp = useCallback(
    <K extends keyof TicketRsvpBlockProps>(key: K, value: TicketRsvpBlockProps[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'ticketRsvp') {
          return currentBlock
        }
        return {
          ...currentBlock,
          props: {
            ...currentBlock.props,
            [key]: value,
          },
        }
      })
    },
    [onUpdate],
  )

  const updateEvento = useCallback(
    (key: keyof TicketRsvpEvento, value: string) => {
      const next: TicketRsvpEvento = {
        ...props.evento,
        [key]: value.trim().length > 0 ? value : undefined,
      }
      updateProp(
        'evento',
        next.data || next.lugar || next.descricao ? next : undefined,
      )
    },
    [props.evento, updateProp],
  )

  if (!isRsvp) {
    return null
  }

  const title = props.title?.trim() || 'te convido:'
  const evento = props.evento
  const hasEvento = Boolean(evento?.data || evento?.lugar || evento?.descricao)
  const allowText = props.allowText !== false
  // Sem pageId (editor/demo) ou sem token injetado, o submit é local.
  const canSubmitForReal = Boolean(pageId && props.responseToken)
  const isInteractive = status === 'idle' || status === 'error'

  const announceSent = (chosen: RsvpChoice, demo: boolean) => {
    const base = RSVP_SENT_LINES[chosen]
    setLiveMessage(
      demo
        ? `${base} Resposta de demonstração — nada foi enviado.`
        : `${base} Quem te convidou já foi avisado.`,
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isInteractive) {
      return
    }
    if (!choice) {
      const message = 'Escolha uma das respostas antes de confirmar.'
      setErrorMessage(message)
      setLiveMessage(message)
      return
    }

    setErrorMessage('')

    if (!canSubmitForReal) {
      // Modo demonstração: simula sucesso local sem chamar a API.
      setSentChoice(choice)
      setSentAsDemo(true)
      setStatus('sent')
      announceSent(choice, true)
      return
    }

    setStatus('sending')
    setLiveMessage('Enviando sua resposta…')

    try {
      await pageService.submitRsvpResponse(pageId as string, {
        blockId: block.id,
        choice,
        text: text.trim() || undefined,
        respondentName: respondentName.trim() || undefined,
        token: props.responseToken as string,
      })
      setSentChoice(choice)
      setSentAsDemo(false)
      setStatus('sent')
      announceSent(choice, false)
    } catch (error) {
      const statusCode = httpStatusOf(error)
      if (statusCode === 409) {
        setStatus('already')
        setLiveMessage('Esse convite já tem uma resposta registrada.')
        return
      }
      const serverMessage = httpErrorMessage(error)
      const message =
        statusCode === 403
          ? 'O link desta resposta não é válido.'
          : serverMessage || 'Não foi possível enviar sua resposta.'
      setStatus('error')
      setErrorMessage(message)
      setLiveMessage(`${message} Você pode tentar de novo.`)
    }
  }

  const handleDemoReset = () => {
    setChoice(null)
    setText('')
    setRespondentName('')
    setStatus('idle')
    setSentChoice(null)
    setSentAsDemo(false)
    setErrorMessage('')
    setLiveMessage('')
  }

  const statusLine =
    status === 'sent'
      ? sentAsDemo
        ? 'resposta registrada — demonstração'
        : 'resposta registrada'
      : status === 'already'
        ? 'convite já respondido'
        : status === 'sending'
          ? 'enviando resposta…'
          : status === 'error'
            ? 'falha no envio — tente de novo'
            : 'aguardando sua resposta'

  return (
    <div className="mx-auto w-full max-w-xl px-2 py-3" data-mode={mode}>
      <div className="os-window">
        <div className="os-titlebar">
          <Ticket size={13} aria-hidden="true" className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">convite.exe</span>
          <span className="os-caption-btn" aria-hidden="true">×</span>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {isEditMode ? (
            <input
              id={titleInputId}
              type="text"
              value={props.title ?? ''}
              onChange={(event) => updateProp('title', event.target.value)}
              onClick={(event) => event.stopPropagation()}
              placeholder="te convido:"
              aria-label="Título do convite"
              className="w-full border-b border-dashed border-transparent bg-transparent px-1 py-1 font-display text-xl font-bold tracking-tight text-[#4c0519] transition-colors placeholder:text-[#9f3a58]/50 hover:border-[#e11d48]/40 focus:border-[#e11d48] focus:outline-none sm:text-2xl"
            />
          ) : (
            <h3 className="font-display text-xl font-bold tracking-tight text-[#4c0519] sm:text-2xl">
              {title}
            </h3>
          )}

          {hasEvento && evento ? (
            <div className="os-sunken space-y-1.5 px-3.5 py-3 text-left">
              {evento.data ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-[#4c0519]">
                  <CalendarDays size={15} aria-hidden="true" className="shrink-0 text-[#be123c]" />
                  {evento.data}
                </p>
              ) : null}
              {evento.lugar ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-[#4c0519]">
                  <MapPin size={15} aria-hidden="true" className="shrink-0 text-[#be123c]" />
                  {evento.lugar}
                </p>
              ) : null}
              {evento.descricao ? (
                <p className="text-sm leading-relaxed text-[#701a35]">{evento.descricao}</p>
              ) : null}
            </div>
          ) : null}

          {/* Perfuração de ingresso separando convite da resposta */}
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-0 flex-1 border-t-2 border-dashed border-[#9f3a58]/45" />
            <Ticket size={14} className="shrink-0 text-[#9f3a58]" />
            <span className="h-0 flex-1 border-t-2 border-dashed border-[#9f3a58]/45" />
          </div>

          <AnimatePresence initial={false}>
            {status === 'sent' ? (
              <motion.div
                key="rsvp-sent"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="os-sunken space-y-2 px-4 py-4 text-center"
              >
                <CircleCheck size={22} aria-hidden="true" className="mx-auto text-[#e11d48]" />
                <p className="font-pixel-ui text-sm font-bold text-[#4c0519]">
                  resposta registrada
                </p>
                {sentChoice ? (
                  <p className="text-sm leading-relaxed text-[#701a35]">
                    {RSVP_SENT_LINES[sentChoice]}
                  </p>
                ) : null}
                {sentAsDemo ? (
                  <p className="text-xs leading-relaxed text-[#9f3a58]">
                    Demonstração — a resposta não foi enviada de verdade.
                  </p>
                ) : null}
                {sentAsDemo ? (
                  <button
                    type="button"
                    onClick={handleDemoReset}
                    className="inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold text-[#701a35] underline decoration-[#e11d48]/40 underline-offset-4 transition-colors hover:text-[#e11d48]"
                  >
                    <RotateCcw size={13} aria-hidden="true" /> Refazer simulação
                  </button>
                ) : null}
              </motion.div>
            ) : status === 'already' ? (
              <motion.div
                key="rsvp-already"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="os-sunken space-y-2 px-4 py-4 text-center"
              >
                <MailCheck size={22} aria-hidden="true" className="mx-auto text-[#be123c]" />
                <p className="font-pixel-ui text-sm font-bold text-[#4c0519]">
                  esse convite já tem resposta
                </p>
                <p className="text-sm leading-relaxed text-[#701a35]">
                  Se foi você quem respondeu, quem te convidou já sabe.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="rsvp-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
                aria-label="Responder ao convite"
              >
                <div
                  role="group"
                  aria-label="Escolha sua resposta"
                  className="flex flex-col gap-2.5 sm:flex-row"
                >
                  {RSVP_CHOICES.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setChoice(option.value)}
                        aria-pressed={choice === option.value}
                        disabled={status === 'sending'}
                        className="os-btn min-h-11 flex-1 px-3 py-2.5 text-[15px]"
                      >
                        <Icon size={16} aria-hidden="true" className="shrink-0" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>

                {allowText ? (
                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor={messageInputId}
                      className="block font-pixel-ui text-[13px] font-bold text-[#701a35]"
                    >
                      {choice === 'other_day'
                        ? 'QUE DIA FICA BOM PRA VOCÊ?'
                        : 'QUER DEIXAR UM RECADO?'}
                    </label>
                    <textarea
                      id={messageInputId}
                      rows={3}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      onClick={isEditMode ? (event) => event.stopPropagation() : undefined}
                      disabled={status === 'sending'}
                      placeholder={
                        choice === 'other_day'
                          ? 'conta que dia combina melhor…'
                          : 'escreva aqui, se quiser…'
                      }
                      className="os-input resize-none"
                    />
                  </div>
                ) : null}

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor={nameInputId}
                    className="block font-pixel-ui text-[13px] font-bold text-[#701a35]"
                  >
                    SEU NOME (OPCIONAL)
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    value={respondentName}
                    onChange={(event) => setRespondentName(event.target.value)}
                    onClick={isEditMode ? (event) => event.stopPropagation() : undefined}
                    disabled={status === 'sending'}
                    autoComplete="off"
                    placeholder="pra quem te convidou saber quem respondeu"
                    className="os-input"
                  />
                </div>

                {errorMessage ? (
                  <p className="text-sm font-medium leading-relaxed text-[#be123c]">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="os-btn os-btn-primary min-h-12 w-full px-4 py-3 text-base"
                >
                  <Send size={16} aria-hidden="true" />
                  {status === 'sending'
                    ? 'Enviando…'
                    : status === 'error'
                      ? 'Tentar novamente'
                      : 'Confirmar resposta'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="os-statusbar">
          <span className="os-sunken flex-1 px-2 py-1 font-pixel-ui text-[13px] text-[#701a35]">
            {statusLine}
          </span>
        </div>
      </div>

      {/* Anúncios para leitores de tela: validação, envio, sucesso e erro */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {/* Painel de edição abaixo do card — nunca colide com os BlockControls */}
      {isEditMode ? (
        <div className="mt-3 space-y-4 rounded-2xl border border-border bg-surface/70 p-4 text-left shadow-xs backdrop-blur-xs">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-light">
              Detalhes do evento
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor={dataInputId}
                  className="block text-[11px] font-bold uppercase tracking-wider text-text-light"
                >
                  Data
                </label>
                <input
                  id={dataInputId}
                  type="text"
                  value={evento?.data ?? ''}
                  onChange={(event) => updateEvento('data', event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  placeholder="sábado, 14 de março"
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text placeholder:text-text-light/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={lugarInputId}
                  className="block text-[11px] font-bold uppercase tracking-wider text-text-light"
                >
                  Lugar
                </label>
                <input
                  id={lugarInputId}
                  type="text"
                  value={evento?.lugar ?? ''}
                  onChange={(event) => updateEvento('lugar', event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  placeholder="sorveteria da praça"
                  className="min-h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text placeholder:text-text-light/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={descricaoInputId}
                className="block text-[11px] font-bold uppercase tracking-wider text-text-light"
              >
                Descrição (opcional)
              </label>
              <input
                id={descricaoInputId}
                type="text"
                value={evento?.descricao ?? ''}
                onChange={(event) => updateEvento('descricao', event.target.value)}
                onClick={(event) => event.stopPropagation()}
                placeholder="sorvete e passeio no fim de tarde"
                className="min-h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text placeholder:text-text-light/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <label className="inline-flex min-h-11 cursor-pointer select-none items-center gap-2 text-sm font-medium text-text-light hover:text-text">
            <input
              type="checkbox"
              checked={allowText}
              onChange={(event) => updateProp('allowText', event.target.checked)}
              onClick={(event) => event.stopPropagation()}
              className="h-4 w-4 rounded accent-primary"
              aria-label="Permitir recado junto da resposta"
            />
            <span>Deixar quem recebe escrever um recado</span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-text-light">
              O convite acima já funciona — teste como quem recebe.
            </p>
            {status !== 'idle' ? (
              <button
                type="button"
                onClick={handleDemoReset}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-primary/20 bg-surface px-4 text-xs font-bold text-primary shadow-xs transition-colors hover:bg-primary/10 active:scale-95"
              >
                <RotateCcw size={13} /> Reiniciar teste
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function areTicketRsvpPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block === next.block
}

export const TicketRsvpBlock = memo(TicketRsvpBlockComponent, areTicketRsvpPropsEqual)
