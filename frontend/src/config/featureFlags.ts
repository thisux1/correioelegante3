const isProduction = import.meta.env.PROD

function parseBooleanEnv(value: unknown, fallback: boolean): boolean {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  return fallback
}

function parsePercentEnv(value: unknown, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.min(100, Math.max(0, Math.floor(parsed)))
}

function hashToBucket(input: string): number {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0
  }
  return hash % 100
}

export interface EditorFlagDecision {
  enabled: boolean
  reason: 'dev-default' | 'global-disabled' | 'missing-user' | 'rollout-match' | 'rollout-miss'
  rolloutPercent: number
  bucket: number | null
}

export const featureFlags = {
  editor_modular_enabled: parseBooleanEnv(import.meta.env.VITE_EDITOR_MODULAR_ENABLED, !isProduction),
  editor_modular_rollout_percent: parsePercentEnv(import.meta.env.VITE_EDITOR_MODULAR_ROLLOUT_PERCENT, !isProduction ? 100 : 0),
  editor_media_upload_enabled: parseBooleanEnv(import.meta.env.VITE_EDITOR_MEDIA_UPLOAD_ENABLED, !isProduction),
  editor_media_upload_rollout_percent: parsePercentEnv(import.meta.env.VITE_EDITOR_MEDIA_UPLOAD_ROLLOUT_PERCENT, !isProduction ? 100 : 0),
}

export function resolveEditorAccessForUser(userId?: string | null): EditorFlagDecision {
  if (!featureFlags.editor_modular_enabled) {
    return {
      enabled: false,
      reason: 'global-disabled',
      rolloutPercent: featureFlags.editor_modular_rollout_percent,
      bucket: null,
    }
  }

  if (!isProduction) {
    return {
      enabled: true,
      reason: 'dev-default',
      rolloutPercent: featureFlags.editor_modular_rollout_percent,
      bucket: null,
    }
  }

  if (!userId) {
    return {
      enabled: false,
      reason: 'missing-user',
      rolloutPercent: featureFlags.editor_modular_rollout_percent,
      bucket: null,
    }
  }

  const bucket = hashToBucket(userId)
  const enabled = bucket < featureFlags.editor_modular_rollout_percent

  return {
    enabled,
    reason: enabled ? 'rollout-match' : 'rollout-miss',
    rolloutPercent: featureFlags.editor_modular_rollout_percent,
    bucket,
  }
}

export function resolveEditorMediaUploadAccessForUser(userId?: string | null): EditorFlagDecision {
  if (!featureFlags.editor_media_upload_enabled) {
    return {
      enabled: false,
      reason: 'global-disabled',
      rolloutPercent: featureFlags.editor_media_upload_rollout_percent,
      bucket: null,
    }
  }

  if (!isProduction) {
    return {
      enabled: true,
      reason: 'dev-default',
      rolloutPercent: featureFlags.editor_media_upload_rollout_percent,
      bucket: null,
    }
  }

  if (!userId) {
    return {
      enabled: false,
      reason: 'missing-user',
      rolloutPercent: featureFlags.editor_media_upload_rollout_percent,
      bucket: null,
    }
  }

  const bucket = hashToBucket(userId)
  const enabled = bucket < featureFlags.editor_media_upload_rollout_percent

  return {
    enabled,
    reason: enabled ? 'rollout-match' : 'rollout-miss',
    rolloutPercent: featureFlags.editor_media_upload_rollout_percent,
    bucket,
  }
}
