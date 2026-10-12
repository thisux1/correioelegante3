import { memo, useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mail, MailOpen, Plus, Trash2 } from 'lucide-react'
import type { BlockComponentProps, HiddenNoteItem } from '@/editor/types'
import { EDITOR_FIELD_BASE_CLASS, EditorInputSection } from '@/editor/components/EditorInputSection'
import { useRecipientState } from '@/editor/hooks/useRecipientState'

const MAX_NOTES = 8
const DEFAULT_TITLE = 'Bilhetes escondidos'

function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function asOpenedIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function HiddenNotesBlockComponent({ block, mode, onUpdate }: BlockComponentProps) {
  const isHiddenNotes = block.type === 'hiddenNotes'
  const isEditMode = mode === 'edit'
  const shouldReduceMotion = useReducedMotion() === true
  const props = isHiddenNotes ? block.props : { title: undefined, notes: [] as HiddenNoteItem[] }

  // Rascunho cru no editor; vazios nunca vazam pra quem recebe.
  const allNotes = useMemo(
    () => (Array.isArray(props.notes) ? props.notes.slice(0, MAX_NOTES) : []),
    [props.notes],
  )
  const publishedNotes = useMemo(
    () => allNotes.filter((note) => typeof note.text === 'string' && note.text.trim().length > 0),
    [allNotes],
  )
  const notes = isEditMode ? allNotes : publishedNotes

  const [openedIds, setOpenedIds] = useRecipientState(block.id, 'openedNotes', [] as string[], asOpenedIds)
  const [activeId, setActiveId] = useState<string | null>(null)

  const updateProp = useCallback(
    <K extends keyof typeof props>(key: K, value: (typeof props)[K]) => {
      onUpdate?.((currentBlock) => {
        if (currentBlock.type !== 'hiddenNotes') {
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

  const updateNotes = useCallback(
    (nextNotes: HiddenNoteItem[]) => {
      updateProp('notes', nextNotes.slice(0, MAX_NOTES))
    },
    [updateProp],
  )

  const handleAddNote = useCallback(() => {
    if (allNotes.length >= MAX_NOTES) {
      return
    }
    updateNotes([...allNotes, { id: generateNoteId(), text: '' }])
  }, [allNotes, updateNotes])

  const handleRemoveNote = useCallback(
    (index: number) => {
      updateNotes(allNotes.filter((_, i) => i !== index))
    },
    [allNotes, updateNotes],
  )

  const handleChangeNoteText = useCallback(
    (index: number, text: string) => {
      updateNotes(allNotes.map((note, i) => (i === index ? { ...note, text } : note)))
    },
    [allNotes, updateNotes],
  )

  const handleOpenNote = useCallback(
    (noteId: string) => {
      setActiveId((current) => (current === noteId ? null : noteId))
      setOpenedIds((current) => (current.includes(noteId) ? current : [...current, noteId]))
    },
    [setOpenedIds],
  )

  if (!isHiddenNotes) {
    return null
  }

  const title = props.title?.trim() ? props.title : DEFAULT_TITLE
  const openedSet = new Set(openedIds)
  const openedCount = notes.filter((note) => openedSet.has(note.id)).length
  const activeNote = notes.find((note) => note.id === activeId) ?? null

  if (isEditMode) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-surface/90 p-4 shadow-xs">
        <EditorInputSection
          title="Título"
          helperText="Na página publicada, cada bilhete fica escondido atrás de um lacre clicável."
        >
          <input
            type="text"
            value={props.title ?? ''}
            onChange={(event) => updateProp('title', event.target.value)}
            placeholder={DEFAULT_TITLE}
            className={EDITOR_FIELD_BASE_CLASS}
            aria-label="Título dos bilhetes escondidos"
          />
        </EditorInputSection>

        <EditorInputSection
          title={`Bilhetes (${allNotes.length}/${MAX_NOTES})`}
          helperText="Escreva mensagens curtas — quem recebe descobre uma de cada vez."
        >
          <div className="space-y-2">
            {allNotes.map((note, index) => (
              <div key={note.id} className="flex items-start gap-2">
                <textarea
                  value={note.text}
                  onChange={(event) => handleChangeNoteText(index, event.target.value)}
                  placeholder={`Bilhete ${index + 1}...`}
                  rows={2}
                  maxLength={500}
                  className={`${EDITOR_FIELD_BASE_CLASS} flex-1 resize-y`}
                  aria-label={`Texto do bilhete ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNote(index)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-light transition-colors hover:border-red-400 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                  aria-label={`Remover bilhete ${index + 1}`}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            ))}

            {allNotes.length < MAX_NOTES ? (
              <button
                type="button"
                onClick={handleAddNote}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-text-light transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
              >
                <Plus size={16} aria-hidden />
                Adicionar bilhete
              </button>
            ) : null}
          </div>
        </EditorInputSection>
      </div>
    )
  }

  if (notes.length === 0) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-2 py-4">
      <div className="space-y-1 text-center">
        <h3 className="font-cursive text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h3>
        <p className="text-xs text-text-light">
          {openedCount === notes.length
            ? 'Você encontrou todos os bilhetes.'
            : `${openedCount} de ${notes.length} ${notes.length === 1 ? 'bilhete encontrado' : 'bilhetes encontrados'}`}
        </p>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-3" role="list">
        {notes.map((note, index) => {
          const isOpened = openedSet.has(note.id)
          const isActive = activeId === note.id
          return (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => handleOpenNote(note.id)}
                aria-expanded={isActive}
                aria-label={isOpened ? `Bilhete ${index + 1} (já aberto)` : `Bilhete escondido ${index + 1}`}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:rotate-3 ${
                  isOpened
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-surface-raised text-text-light hover:border-primary/40 hover:text-primary'
                }`}
              >
                {isOpened ? <MailOpen size={20} aria-hidden /> : <Mail size={20} aria-hidden />}
              </button>
            </li>
          )
        })}
      </ul>

      <AnimatePresence>
        {activeNote ? (
          <motion.div
            key={activeNote.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center shadow-xs"
            role="status"
          >
            <p className="whitespace-pre-wrap font-cursive text-lg text-text">{activeNote.text}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function areHiddenNotesBlockPropsEqual(prev: BlockComponentProps, next: BlockComponentProps) {
  return prev.mode === next.mode && prev.block.meta.updatedAt === next.block.meta.updatedAt
}

export const HiddenNotesBlock = memo(HiddenNotesBlockComponent, areHiddenNotesBlockPropsEqual)
