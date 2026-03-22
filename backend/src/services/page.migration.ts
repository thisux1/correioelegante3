import {
  BLOCK_TYPE_VALUES,
  BLOCK_VERSION,
  PAGE_VERSION,
  type SupportedBlockType,
} from './page.constants';

type UnknownRecord = Record<string, unknown>;
type GalleryItem = { src: string; assetId?: string };

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const MAX_GALLERY_ITEMS = 10;

export interface PersistedBlock {
  id: string;
  type: SupportedBlockType;
  version: number;
  props: UnknownRecord;
  meta: {
    createdAt: number;
    updatedAt: number;
  };
}

export interface PersistedPageContent {
  blocks: PersistedBlock[];
  theme?: string;
  version: number;
}

const DEFAULT_THEME_ID = 'romantic-sunset';

const LEGACY_THEME_ALIASES: Record<string, string> = {
  classic: 'romantic-sunset',
  romantic: 'romantic-sunset',
  friendship: 'ocean-breeze',
  secret: 'midnight-ink',
  poetic: 'golden-letter',
};

const THEME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeThemeId(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULT_THEME_ID;
  }

  const normalized = value.trim();
  if (!normalized) {
    return DEFAULT_THEME_ID;
  }

  const alias = LEGACY_THEME_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  if (THEME_ID_PATTERN.test(normalized)) {
    return normalized;
  }

  return DEFAULT_THEME_ID;
}

function asRecord(value: unknown): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return value as UnknownRecord;
}

function asTimestamp(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  return fallback;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asOptionalText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asOptionalObjectId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  if (!OBJECT_ID_PATTERN.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function asGalleryItems(value: unknown): Array<{ src: string; assetId?: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<Array<{ src: string; assetId?: string }>>((accumulator, item) => {
    const record = asRecord(item);
    const src = asText(record.src);
    if (!src) {
      return accumulator;
    }

    accumulator.push({
      src,
      assetId: asOptionalObjectId(record.assetId),
    });

    return accumulator;
  }, []);
}

function asGalleryLegacyImages(value: unknown): string[] {
  return asStringArray(value)
    .map((item) => asText(item))
    .filter((item) => item.length > 0);
}

function dedupeGalleryItems(items: GalleryItem[]): GalleryItem[] {
  const seen = new Set<string>();
  const deduped: GalleryItem[] = [];

  for (const item of items) {
    if (seen.has(item.src)) {
      continue;
    }

    seen.add(item.src);
    deduped.push(item);

    if (deduped.length >= MAX_GALLERY_ITEMS) {
      break;
    }
  }

  return deduped;
}

function asBlockType(value: unknown): SupportedBlockType {
  if (typeof value === 'string' && (BLOCK_TYPE_VALUES as readonly string[]).includes(value)) {
    return value as SupportedBlockType;
  }

  return 'text';
}

function sanitizePropsByType(type: SupportedBlockType, props: UnknownRecord): UnknownRecord {
  switch (type) {
    case 'text': {
      const alignValue = props.align;
      const align = alignValue === 'center' || alignValue === 'right' ? alignValue : 'left';
      return {
        text: asText(props.text),
        align,
      };
    }
    case 'image':
      return {
        assetId: asOptionalText(props.assetId),
        src: asText(props.src),
        alt: asOptionalText(props.alt),
      };
    case 'timer':
      return {
        targetDate: asText(props.targetDate),
        label: asOptionalText(props.label),
      };
    case 'gallery': {
      const transition = props.transition === 'slide' ? 'slide' : 'fade';
      const normalizedItems = dedupeGalleryItems(asGalleryItems(props.items));
      const fallbackItems = dedupeGalleryItems(
        asGalleryLegacyImages(props.images).map((src) => ({ src })),
      );
      const mergedItems = normalizedItems.length > 0
        ? normalizedItems
        : fallbackItems;

      return {
        images: mergedItems.map((item) => item.src),
        items: mergedItems,
        transition,
      };
    }
    case 'music':
      {
      const legacySrc = asText(props.src);
      const legacyAssetId = asOptionalText(props.assetId);
      const legacyTitle = asOptionalText(props.title);
      const legacyArtist = asOptionalText(props.artist);
      const legacyCoverSrc = asOptionalText(props.coverSrc);
      const legacyCoverAssetId = asOptionalText(props.coverAssetId);
      const tracks = Array.isArray(props.tracks)
        ? props.tracks.reduce<Array<{
          src: string;
          assetId?: string;
          title?: string;
          artist?: string;
          coverSrc?: string;
          coverAssetId?: string;
        }>>((accumulator, track) => {
          const record = asRecord(track);
          const src = asText(record.src);
          if (!src) {
            return accumulator;
          }

          accumulator.push({
            src,
            assetId: asOptionalText(record.assetId),
            title: asOptionalText(record.title),
            artist: asOptionalText(record.artist),
            coverSrc: asOptionalText(record.coverSrc),
            coverAssetId: asOptionalText(record.coverAssetId),
          });
          return accumulator;
        }, []).slice(0, 30)
        : [];
      const normalizedTracks = tracks.length > 0
        ? tracks
        : (legacySrc
          ? [{
              src: legacySrc,
              assetId: legacyAssetId,
              title: legacyTitle,
              artist: legacyArtist,
              coverSrc: legacyCoverSrc,
              coverAssetId: legacyCoverAssetId,
            }]
          : []);
      const mirrorTrack = normalizedTracks[0];

      return {
        assetId: legacyAssetId ?? mirrorTrack?.assetId,
        src: legacySrc || mirrorTrack?.src || '',
        coverSrc: legacyCoverSrc ?? mirrorTrack?.coverSrc,
        coverAssetId: legacyCoverAssetId ?? mirrorTrack?.coverAssetId,
        tracks: normalizedTracks,
        title: legacyTitle ?? mirrorTrack?.title,
        artist: legacyArtist ?? mirrorTrack?.artist,
      };
      }
    case 'video':
      return {
        assetId: asOptionalText(props.assetId),
        src: asText(props.src),
      };
    default:
      return { ...props };
  }
}

function sanitizeBlock(input: unknown, index: number): PersistedBlock {
  const now = Date.now();
  const inputRecord = asRecord(input);
  const type = asBlockType(inputRecord.type);
  const props = sanitizePropsByType(type, asRecord(inputRecord.props));
  const meta = asRecord(inputRecord.meta);
  const fallbackId = `legacy-block-${index}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: typeof inputRecord.id === 'string' && inputRecord.id.trim().length > 0
      ? inputRecord.id
      : fallbackId,
    type,
    version: BLOCK_VERSION,
    props,
    meta: {
      createdAt: asTimestamp(meta.createdAt, now),
      updatedAt: asTimestamp(meta.updatedAt, now),
    },
  };
}

export function migratePage(input: unknown): PersistedPageContent {
  const inputRecord = asRecord(input);

  const maybeBlocks = Array.isArray(inputRecord.blocks)
    ? inputRecord.blocks
    : [];

  return {
    blocks: maybeBlocks.map((block, index) => sanitizeBlock(block, index)),
    theme: normalizeThemeId(asOptionalText(inputRecord.theme)),
    version: PAGE_VERSION,
  };
}
