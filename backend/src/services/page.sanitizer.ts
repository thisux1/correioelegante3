import { AppError } from '../utils/AppError';
import {
  MAX_PAGE_BYTES,
  MAX_TEXT_CHARS,
  type SupportedBlockType,
} from './page.constants';
import {
  migratePage,
  normalizeThemeId,
  type PersistedBlock,
  type PersistedPageContent,
} from './page.migration';

type UnknownRecord = Record<string, unknown>;

const BLOCKED_PROTOCOLS = new Set(['javascript:', 'data:', 'file:']);

function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

function ensureSafeUrl(raw: string, fieldLabel: string): string {
  const value = raw.trim();
  if (!value) {
    return '';
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new AppError(`${fieldLabel} invalida`, 400, 'INVALID_MEDIA_URL');
  }

  const protocol = parsed.protocol.toLowerCase();
  if (BLOCKED_PROTOCOLS.has(protocol)) {
    throw new AppError(`${fieldLabel} usa protocolo bloqueado`, 400, 'INVALID_MEDIA_URL');
  }

  const canUseHttpInDev = process.env.NODE_ENV !== 'production';
  const allowedProtocols = canUseHttpInDev
    ? new Set(['https:', 'http:'])
    : new Set(['https:']);

  if (!allowedProtocols.has(protocol)) {
    throw new AppError(`${fieldLabel} deve usar URL segura`, 400, 'INVALID_MEDIA_URL');
  }

  return parsed.toString();
}

function sanitizePropsByType(type: SupportedBlockType, props: UnknownRecord): UnknownRecord {
  switch (type) {
    case 'text': {
      const alignValue = props.align;
      const align = alignValue === 'center' || alignValue === 'right' ? alignValue : 'left';
      return {
        text: sanitizeText(typeof props.text === 'string' ? props.text : ''),
        align,
      };
    }
    case 'image': {
      const src = typeof props.src === 'string'
        ? ensureSafeUrl(props.src, 'URL da imagem')
        : '';
      const assetId = typeof props.assetId === 'string' && /^[a-f\d]{24}$/i.test(props.assetId)
        ? props.assetId
        : undefined;
      const alt = typeof props.alt === 'string' ? sanitizeText(props.alt) : undefined;
      return {
        assetId,
        src,
        alt,
      };
    }
    case 'timer': {
      const label = typeof props.label === 'string' ? sanitizeText(props.label) : undefined;
      return {
        targetDate: typeof props.targetDate === 'string' ? props.targetDate : '',
        label,
      };
    }
    case 'gallery': {
      const images = Array.isArray(props.images)
        ? props.images
          .filter((item): item is string => typeof item === 'string')
          .map((url) => ensureSafeUrl(url, 'URL da galeria'))
          .slice(0, 10)
        : [];
      const items = Array.isArray(props.items)
        ? props.items
          .reduce<Array<{ src: string; assetId?: string }>>((accumulator, item) => {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
              return accumulator;
            }

            const itemRecord = item as UnknownRecord;
            if (typeof itemRecord.src !== 'string') {
              return accumulator;
            }

            const src = ensureSafeUrl(itemRecord.src, 'URL da galeria');
            accumulator.push({
              src,
              assetId: typeof itemRecord.assetId === 'string' && /^[a-f\d]{24}$/i.test(itemRecord.assetId)
                ? itemRecord.assetId
                : undefined,
            });

            return accumulator;
          }, [])
          .slice(0, 10)
        : images.map((src) => ({ src }));
      return {
        images: items.map((item) => item.src),
        items,
        transition: props.transition === 'slide' ? 'slide' : 'fade',
      };
    }
    case 'music': {
      const src = typeof props.src === 'string'
        ? ensureSafeUrl(props.src, 'URL da musica')
        : '';
      const assetId = typeof props.assetId === 'string' && /^[a-f\d]{24}$/i.test(props.assetId)
        ? props.assetId
        : undefined;
      const coverSrc = typeof props.coverSrc === 'string'
        ? ensureSafeUrl(props.coverSrc, 'URL da capa')
        : '';
      const coverAssetId = typeof props.coverAssetId === 'string' && /^[a-f\d]{24}$/i.test(props.coverAssetId)
        ? props.coverAssetId
        : undefined;
      const tracks = Array.isArray(props.tracks)
        ? props.tracks
          .reduce<Array<{
            src: string;
            assetId?: string;
            title?: string;
            artist?: string;
            coverSrc?: string;
            coverAssetId?: string;
          }>>((accumulator, item) => {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
              return accumulator;
            }

            const track = item as UnknownRecord;
            if (typeof track.src !== 'string') {
              return accumulator;
            }

            accumulator.push({
              src: ensureSafeUrl(track.src, 'URL da musica'),
              assetId: typeof track.assetId === 'string' && /^[a-f\d]{24}$/i.test(track.assetId)
                ? track.assetId
                : undefined,
              title: typeof track.title === 'string' ? sanitizeText(track.title) : undefined,
              artist: typeof track.artist === 'string' ? sanitizeText(track.artist) : undefined,
              coverSrc: typeof track.coverSrc === 'string' ? ensureSafeUrl(track.coverSrc, 'URL da capa') : undefined,
              coverAssetId: typeof track.coverAssetId === 'string' && /^[a-f\d]{24}$/i.test(track.coverAssetId)
                ? track.coverAssetId
                : undefined,
            });

            return accumulator;
          }, [])
          .slice(0, 30)
        : [];
      const title = typeof props.title === 'string' ? sanitizeText(props.title) : undefined;
      const artist = typeof props.artist === 'string' ? sanitizeText(props.artist) : undefined;
      return {
        assetId,
        src,
        coverSrc,
        coverAssetId,
        tracks,
        title,
        artist,
      };
    }
    case 'video': {
      const src = typeof props.src === 'string'
        ? ensureSafeUrl(props.src, 'URL do video')
        : '';
      const assetId = typeof props.assetId === 'string' && /^[a-f\d]{24}$/i.test(props.assetId)
        ? props.assetId
        : undefined;
      return {
        assetId,
        src,
      };
    }
    default:
      return { ...props };
  }
}

function sanitizeBlock(block: PersistedBlock): PersistedBlock {
  return {
    ...block,
    props: sanitizePropsByType(block.type, block.props),
  };
}

export function sanitizePageContent(input: unknown): PersistedPageContent {
  const migrated = migratePage(input);
  const sanitized: PersistedPageContent = {
    ...migrated,
    blocks: migrated.blocks.map(sanitizeBlock),
    theme: normalizeThemeId(migrated.theme),
  };

  const bytes = Buffer.byteLength(JSON.stringify(sanitized), 'utf8');
  if (bytes > MAX_PAGE_BYTES) {
    throw new AppError(`Pagina excede o limite de ${MAX_PAGE_BYTES} bytes`, 400, 'PAGE_TOO_LARGE');
  }

  return sanitized;
}
