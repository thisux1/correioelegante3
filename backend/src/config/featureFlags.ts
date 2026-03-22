const isProduction = process.env.NODE_ENV === 'production';

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parsePercentEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.floor(parsed)));
}

function hashToBucket(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash % 100;
}

export interface EditorFlagDecision {
  enabled: boolean;
  reason: 'dev-default' | 'global-disabled' | 'missing-user' | 'rollout-match' | 'rollout-miss';
  rolloutPercent: number;
  bucket: number | null;
}

function resolveFlagAccessForUser(params: {
  enabled: boolean;
  rolloutPercent: number;
  userId?: string;
}): EditorFlagDecision {
  if (!params.enabled) {
    return {
      enabled: false,
      reason: 'global-disabled',
      rolloutPercent: params.rolloutPercent,
      bucket: null,
    };
  }

  if (!isProduction) {
    return {
      enabled: true,
      reason: 'dev-default',
      rolloutPercent: params.rolloutPercent,
      bucket: null,
    };
  }

  if (!params.userId) {
    return {
      enabled: false,
      reason: 'missing-user',
      rolloutPercent: params.rolloutPercent,
      bucket: null,
    };
  }

  const bucket = hashToBucket(params.userId);
  const enabled = bucket < params.rolloutPercent;

  return {
    enabled,
    reason: enabled ? 'rollout-match' : 'rollout-miss',
    rolloutPercent: params.rolloutPercent,
    bucket,
  };
}

export const featureFlags = {
  editor_modular_enabled: parseBooleanEnv(process.env.EDITOR_MODULAR_ENABLED, true),
  editor_modular_rollout_percent: parsePercentEnv(process.env.EDITOR_MODULAR_ROLLOUT_PERCENT, 100),
  editor_media_upload_enabled: parseBooleanEnv(process.env.EDITOR_MEDIA_UPLOAD_ENABLED, true),
  editor_media_upload_rollout_percent: parsePercentEnv(process.env.EDITOR_MEDIA_UPLOAD_ROLLOUT_PERCENT, 100),
};

export function resolveEditorAccessForUser(userId?: string): EditorFlagDecision {
  return resolveFlagAccessForUser({
    enabled: featureFlags.editor_modular_enabled,
    rolloutPercent: featureFlags.editor_modular_rollout_percent,
    userId,
  });
}

export function resolveEditorMediaUploadAccessForUser(userId?: string): EditorFlagDecision {
  return resolveFlagAccessForUser({
    enabled: featureFlags.editor_media_upload_enabled,
    rolloutPercent: featureFlags.editor_media_upload_rollout_percent,
    userId,
  });
}
