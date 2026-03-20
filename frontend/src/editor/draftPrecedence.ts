import type { PageContract } from './types'

export type DraftDecision = 'use-local' | 'use-backend' | 'ask-user' | 'use-empty'

export interface DraftSnapshot {
  pageId: string
  updatedAt: string
  page: PageContract
}

export interface ResolveDraftPrecedenceInput {
  pageId?: string
  localDraft?: DraftSnapshot | null
  backendPage?: DraftSnapshot | null
}

export interface ResolveDraftPrecedenceResult {
  decision: DraftDecision
  reason: string
  localUpdatedAt?: string
  backendUpdatedAt?: string
}

export const LOCAL_DRAFT_PREFERENCE_PROMPT =
  'Foi encontrado um rascunho local mais recente. Deseja continuar o rascunho local ou usar a versao salva?'

export function resolveDraftPrecedence(
  input: ResolveDraftPrecedenceInput,
): ResolveDraftPrecedenceResult {
  const localDraft = input.localDraft ?? null
  const backendPage = input.backendPage ?? null

  if (!input.pageId) {
    if (localDraft) {
      return {
        decision: 'use-local',
        reason: 'Editor sem pageId prioriza rascunho local existente.',
        localUpdatedAt: localDraft.updatedAt,
      }
    }

    return {
      decision: 'use-empty',
      reason: 'Editor sem pageId e sem rascunho local inicia vazio.',
    }
  }

  if (!backendPage && localDraft) {
    return {
      decision: 'use-local',
      reason: 'Sem versao remota para o pageId, usa rascunho local.',
      localUpdatedAt: localDraft.updatedAt,
    }
  }

  if (!backendPage) {
    return {
      decision: 'use-empty',
      reason: 'Sem pageId valido no backend e sem rascunho local.',
    }
  }

  if (!localDraft) {
    return {
      decision: 'use-backend',
      reason: 'Sem rascunho local, usa versao salva no backend.',
      backendUpdatedAt: backendPage.updatedAt,
    }
  }

  const localUpdatedAt = new Date(localDraft.updatedAt).getTime()
  const backendUpdatedAt = new Date(backendPage.updatedAt).getTime()

  if (Number.isNaN(localUpdatedAt) || Number.isNaN(backendUpdatedAt)) {
    return {
      decision: 'use-backend',
      reason: 'Timestamp invalido detectado; backend vira fonte segura.',
      localUpdatedAt: localDraft.updatedAt,
      backendUpdatedAt: backendPage.updatedAt,
    }
  }

  if (localUpdatedAt > backendUpdatedAt) {
    return {
      decision: 'ask-user',
      reason: 'Rascunho local mais novo que o backend para o mesmo pageId.',
      localUpdatedAt: localDraft.updatedAt,
      backendUpdatedAt: backendPage.updatedAt,
    }
  }

  return {
    decision: 'use-backend',
    reason: 'Backend mais novo ou igual para o mesmo pageId.',
    localUpdatedAt: localDraft.updatedAt,
    backendUpdatedAt: backendPage.updatedAt,
  }
}
