import { createContext, useContext } from 'react'

/**
 * Contexto de runtime da página renderizada — informação que existe apenas
 * quando a página pública está sendo visualizada de verdade (PageCard).
 * No editor, na demo e em qualquer render sem `pageId`, blocos interativos
 * (ex.: ticketRsvp) entram em modo demonstração: simulam localmente e nunca
 * batem na API.
 */
export interface PageRuntimeContext {
  pageId?: string
}

const PageRuntime = createContext<PageRuntimeContext>({})

export const PageRuntimeProvider = PageRuntime.Provider

export function usePageRuntime(): PageRuntimeContext {
  return useContext(PageRuntime)
}
