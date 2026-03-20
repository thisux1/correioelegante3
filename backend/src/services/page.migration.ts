import {
  BLOCK_TYPE_VALUES,
  BLOCK_VERSION,
  PAGE_VERSION,
  type SupportedBlockType,
} from './page.constants';

type UnknownRecord = Record<string, unknown>;

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
  return typeof value === 'string' ? value : '';
}

function asOptionalText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
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
      return {
        images: asStringArray(props.images),
        transition,
      };
    }
    case 'music':
      return {
        src: asText(props.src),
        title: asOptionalText(props.title),
        artist: asOptionalText(props.artist),
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
    theme: asOptionalText(inputRecord.theme),
    version: PAGE_VERSION,
  };
}
