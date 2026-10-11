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

export interface PersistedRect {
  col: number;
  row: number;
  w: number;
  h: number;
}

export type PersistedSectionLayout =
  | 'stack'
  | 'columns'
  | 'overlap'
  | 'grid'
  | 'freezone'
  | 'fullbleed';

export interface PersistedSection {
  id: string;
  layout: PersistedSectionLayout;
  grid?: { cols: number };
  theme?: UnknownRecord;
}

export interface PersistedBlock {
  id: string;
  type: SupportedBlockType;
  version: number;
  props: UnknownRecord;
  sectionId?: string;
  rect?: PersistedRect;
  meta: {
    createdAt: number;
    updatedAt: number;
  };
}

export interface PersistedPageContent {
  blocks: PersistedBlock[];
  sections: PersistedSection[];
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
      const align =
        alignValue === 'center' || alignValue === 'right' || alignValue === 'justify'
          ? alignValue
          : 'left';
      const categoryValue = props.category;
      const category =
        categoryValue === 'title' || categoryValue === 'body' ||
        categoryValue === 'quote' || categoryValue === 'signature'
          ? categoryValue
          : undefined;
      return {
        text: asText(props.text),
        category,
        fontFamily: asOptionalText(props.fontFamily),
        fontSize: asOptionalText(props.fontSize),
        color: asOptionalText(props.color),
        align,
        letterSpacing: asOptionalText(props.letterSpacing),
        lineHeight: asOptionalText(props.lineHeight),
        bold: props.bold === true ? true : undefined,
        italic: props.italic === true ? true : undefined,
        underline: props.underline === true ? true : undefined,
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
      const legacySyncedLyrics = asOptionalText(props.syncedLyrics);
      const legacyPlainLyrics = asOptionalText(props.plainLyrics);
      const playerStyle = props.playerStyle === 'vinyl' ? 'vinyl' : 'minimal';
      const showLyrics = typeof props.showLyrics === 'boolean' ? props.showLyrics : true;
      const tracks = Array.isArray(props.tracks)
        ? props.tracks.reduce<Array<{
          src: string;
          assetId?: string;
          title?: string;
          artist?: string;
          coverSrc?: string;
          coverAssetId?: string;
          syncedLyrics?: string;
          plainLyrics?: string;
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
            syncedLyrics: asOptionalText(record.syncedLyrics),
            plainLyrics: asOptionalText(record.plainLyrics),
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
              syncedLyrics: legacySyncedLyrics,
              plainLyrics: legacyPlainLyrics,
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
        playerStyle,
        syncedLyrics: legacySyncedLyrics ?? mirrorTrack?.syncedLyrics,
        plainLyrics: legacyPlainLyrics ?? mirrorTrack?.plainLyrics,
        showLyrics,
      };
      }
    case 'video':
      return {
        assetId: asOptionalText(props.assetId),
        src: asText(props.src),
      };
    case 'youtube':
      return {
        url: asText(props.url).slice(0, 500),
        title: asOptionalText(props.title),
        caption: asOptionalText(props.caption),
      };
    case 'photoBook': {
      const pages = (Array.isArray(props.pages) ? props.pages : [])
        .reduce<Array<{ id: string; src: string; assetId?: string; caption?: string }>>(
          (accumulator, item, index) => {
            const record = asRecord(item);
            const src = asText(record.src);
            if (!src) {
              return accumulator;
            }
            accumulator.push({
              id: asOptionalText(record.id) ?? `page-${index}`,
              src,
              assetId: asOptionalObjectId(record.assetId),
              caption: asOptionalText(record.caption),
            });
            return accumulator;
          },
          [],
        )
        .slice(0, 24);
      return {
        pages,
        coverTitle: asOptionalText(props.coverTitle),
        coverSubtitle: asOptionalText(props.coverSubtitle),
      };
    }
    case 'bouquet': {
      const validSpecies = new Set(['rosa', 'girassol', 'tulipa', 'margarida', 'cravo', 'lavanda']);
      const flowers = (Array.isArray(props.flowers) ? props.flowers : [])
        .reduce<Array<{ species: string; color?: string }>>((accumulator, item) => {
          const record = asRecord(item);
          const species = asText(record.species);
          if (!validSpecies.has(species)) {
            return accumulator;
          }
          const color = asOptionalText(record.color);
          accumulator.push(color ? { species, color } : { species });
          return accumulator;
        }, [])
        .slice(0, 24);
      return {
        seed:
          typeof props.seed === 'number' && Number.isFinite(props.seed)
            ? Math.trunc(props.seed)
            : 1,
        flowers,
        wrap: props.wrap === 'juta' || props.wrap === 'celofane' ? props.wrap : 'papel',
        ribbonColor: asOptionalText(props.ribbonColor),
        message: asOptionalText(props.message),
      };
    }
    case 'hints': {
      const hints = (Array.isArray(props.hints) ? props.hints : [])
        .reduce<Array<{ id: string; text: string }>>((accumulator, item, index) => {
          const record = asRecord(item);
          const text = asText(record.text);
          if (!text) {
            return accumulator;
          }
          accumulator.push({
            id: asOptionalText(record.id) ?? `hint-${index}`,
            text,
          });
          return accumulator;
        }, [])
        .slice(0, 12);
      return {
        title: asOptionalText(props.title),
        hints,
      };
    }
    case 'intimacyGate': {
      const answers = asStringArray(props.answers)
        .map((answer) => asText(answer))
        .filter((answer) => answer.length > 0)
        .slice(0, 8);
      return {
        question: asText(props.question).slice(0, 300),
        answers,
        hint: asOptionalText(props.hint),
        successMessage: asOptionalText(props.successMessage),
      };
    }
    default:
      return { ...props };
  }
}

const SECTION_LAYOUT_VALUES: readonly PersistedSectionLayout[] = [
  'stack',
  'columns',
  'overlap',
  'grid',
  'freezone',
  'fullbleed',
];

const IMPLICIT_SECTION_ID = 'main';
const MAX_SECTIONS = 12;
const GRID_COL_BOUNDS = { min: 1, max: 24 } as const;
const GRID_ROW_MIN = 1;
const GRID_W_BOUNDS = { min: 1, max: 24 } as const;
const GRID_H_BOUNDS = { min: 1, max: 40 } as const;

function asIntInRange(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined;
  }
  return value >= min && value <= max ? value : undefined;
}

function asRect(value: unknown): PersistedRect | undefined {
  const record = asRecord(value);
  const col = asIntInRange(record.col, GRID_COL_BOUNDS.min, GRID_COL_BOUNDS.max);
  const row = record.row;
  const w = asIntInRange(record.w, GRID_W_BOUNDS.min, GRID_W_BOUNDS.max);
  const h = asIntInRange(record.h, GRID_H_BOUNDS.min, GRID_H_BOUNDS.max);

  if (col === undefined || w === undefined || h === undefined) {
    return undefined;
  }
  if (typeof row !== 'number' || !Number.isInteger(row) || row < GRID_ROW_MIN) {
    return undefined;
  }

  return { col, row, w, h };
}

function asSectionLayout(value: unknown): PersistedSectionLayout {
  if (typeof value === 'string' && SECTION_LAYOUT_VALUES.includes(value as PersistedSectionLayout)) {
    return value as PersistedSectionLayout;
  }
  return 'stack';
}

function migrateSections(value: unknown): PersistedSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const sections: PersistedSection[] = [];

  for (const [index, item] of value.slice(0, MAX_SECTIONS).entries()) {
    const record = asRecord(item);
    const rawId = asText(record.id);
    const id = rawId && !seen.has(rawId) ? rawId : `section-${index}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const section: PersistedSection = { id, layout: asSectionLayout(record.layout) };
    const grid = asRecord(record.grid);
    const cols = asIntInRange(grid.cols, 1, 24);
    if (cols !== undefined) {
      section.grid = { cols };
    }
    if (record.theme && typeof record.theme === 'object' && !Array.isArray(record.theme)) {
      section.theme = record.theme as UnknownRecord;
    }
    sections.push(section);
  }

  return sections;
}

function asSectionId(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 80
    ? value
    : undefined;
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
    sectionId: asSectionId(inputRecord.sectionId),
    rect: asRect(inputRecord.rect),
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

  const blocks = maybeBlocks.map((block, index) => sanitizeBlock(block, index));

  // Legacy pages carried a flat blocks list; they materialize as a single
  // implicit "stack" section so every block lands in a known section.
  const sections = migrateSections(inputRecord.sections);
  if (sections.length === 0 && blocks.length > 0) {
    sections.push({ id: IMPLICIT_SECTION_ID, layout: 'stack' });
  }

  const knownSectionIds = new Set(sections.map((s) => s.id));
  const fallbackSectionId = sections[0]?.id;
  for (const block of blocks) {
    if (!block.sectionId || !knownSectionIds.has(block.sectionId)) {
      block.sectionId = fallbackSectionId;
    }
  }

  return {
    blocks,
    sections,
    theme: normalizeThemeId(asOptionalText(inputRecord.theme)),
    version: PAGE_VERSION,
  };
}
