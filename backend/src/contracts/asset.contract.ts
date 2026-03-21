import { z } from 'zod';

export const ASSET_KIND_VALUES = ['image', 'audio', 'video'] as const;
export const PROCESSING_STATUS_VALUES = ['pending', 'processing', 'ready', 'failed'] as const;
export const MODERATION_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

export type AssetKind = (typeof ASSET_KIND_VALUES)[number];

interface AssetLimitRule {
  maxSizeBytes: number;
  maxDurationMs?: number;
  mimeTypes: readonly string[];
  extensions: readonly string[];
}

const MB = 1024 * 1024;

function parseBytesEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseDurationEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export const mediaPolicyByKind: Record<AssetKind, AssetLimitRule> = {
  image: {
    maxSizeBytes: parseBytesEnv('MEDIA_IMAGE_MAX_SIZE_BYTES', 8 * MB),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
  },
  audio: {
    maxSizeBytes: parseBytesEnv('MEDIA_AUDIO_MAX_SIZE_BYTES', 15 * MB),
    maxDurationMs: parseDurationEnv('MEDIA_AUDIO_MAX_DURATION_MS', 120_000),
    mimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav'],
    extensions: ['mp3', 'm4a', 'aac', 'ogg', 'wav'],
  },
  video: {
    maxSizeBytes: parseBytesEnv('MEDIA_VIDEO_MAX_SIZE_BYTES', 25 * MB),
    maxDurationMs: parseDurationEnv('MEDIA_VIDEO_MAX_DURATION_MS', 30_000),
    mimeTypes: ['video/mp4', 'video/webm'],
    extensions: ['mp4', 'webm'],
  },
};

export const assetKindSchema = z.enum(ASSET_KIND_VALUES);

function getFileExtension(fileName: string): string {
  const normalized = fileName.trim().toLowerCase();
  const lastDot = normalized.lastIndexOf('.');
  if (lastDot < 0 || lastDot === normalized.length - 1) {
    return '';
  }
  return normalized.slice(lastDot + 1);
}

export function validateMimeAndExtension(params: {
  kind: AssetKind;
  mimeType: string;
  fileName: string;
}): { extension: string } {
  const policy = mediaPolicyByKind[params.kind];
  const normalizedMime = params.mimeType.trim().toLowerCase();
  const extension = getFileExtension(params.fileName);

  if (!policy.mimeTypes.includes(normalizedMime) || !extension || !policy.extensions.includes(extension)) {
    throw new Error('MEDIA_UNSUPPORTED_TYPE');
  }

  return { extension };
}

export function validateSizeLimit(kind: AssetKind, sizeBytes: number): void {
  const policy = mediaPolicyByKind[kind];
  if (sizeBytes > policy.maxSizeBytes) {
    throw new Error('MEDIA_FILE_TOO_LARGE');
  }
}

export function validateDurationLimit(kind: AssetKind, durationMs?: number | null): void {
  if (durationMs == null) {
    return;
  }

  const policy = mediaPolicyByKind[kind];
  if (!policy.maxDurationMs) {
    return;
  }

  if (durationMs > policy.maxDurationMs) {
    throw new Error('MEDIA_DURATION_EXCEEDED');
  }
}
