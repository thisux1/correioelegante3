import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import { usePageRuntime } from '@/editor/context'

const PROGRESS_PREFIX = 'ce:progress:'

type ProgressMap = Record<string, unknown>

function readProgressMap(pageId: string): ProgressMap {
  try {
    const raw = window.localStorage.getItem(PROGRESS_PREFIX + pageId)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as ProgressMap)
      : {}
  } catch {
    return {}
  }
}

function writeProgressKey(pageId: string, key: string, value: unknown): void {
  try {
    const map = readProgressMap(pageId)
    map[key] = value
    window.localStorage.setItem(PROGRESS_PREFIX + pageId, JSON.stringify(map))
  } catch {
    // Storage indisponível (modo privado, quota): o progresso vive só em memória.
  }
}

/**
 * Igual a useState, mas quando a página pública real está aberta (há `pageId`
 * no PageRuntimeContext) o valor persiste em `localStorage` por página — o
 * destinatário que fecha e reabre o link continua de onde parou. Sem `pageId`
 * (editor, demo, LP) comporta-se como useState comum e nada é escrito.
 */
export function useRecipientState<T>(
  blockId: string,
  stateKey: string,
  initial: T | (() => T),
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const { pageId } = usePageRuntime()
  const storageKey = `${blockId}.${stateKey}`

  const [value, setValue] = useState<T>(() => {
    const base = typeof initial === 'function' ? (initial as () => T)() : initial
    if (!pageId) return base
    const stored = readProgressMap(pageId)[storageKey]
    if (stored === undefined) return base
    if (validate) return validate(stored) ? stored : base
    return typeof stored === typeof base ? (stored as T) : base
  })

  const set: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
        if (pageId) writeProgressKey(pageId, storageKey, resolved)
        return resolved
      })
    },
    [pageId, storageKey],
  )

  return [value, set]
}
