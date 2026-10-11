import crypto from 'node:crypto';
import type {
  ModuleType,
  PageSpec,
  SpecModule,
} from '../contracts/generation.contract';
import { BLOCK_VERSION, PAGE_VERSION } from '../services/page.constants';
import type {
  PersistedBlock,
  PersistedPageContent,
} from '../services/page.migration';
import { normalizeThemeId } from '../services/page.migration';
import type { SupportedBlockType } from '../services/page.constants';

const SUPPORTED = new Set<string>([
  'text',
  'image',
  'timer',
  'gallery',
  'music',
  'video',
  'envelope',
  'scratch',
  'timeline',
  'quiz',
  'polaroid',
]);

/**
 * Planned block types that don't exist in the persisted schema yet get a
 * closest-fit downgrade instead of the migration's silent text fallback —
 * the downgrade is explicit in decisions[].
 */
const DOWNGRADE: Partial<Record<ModuleType, SupportedBlockType>> = {
  youtube: 'video',
  photoBook: 'gallery',
  intimacyGate: 'quiz',
  togetherCounter: 'timer',
  hints: 'text',
  memoryCard: 'text',
  hiddenNotes: 'text',
  bouquet: 'text',
  ticketRsvp: 'text',
};

export interface CompileResult {
  content: PersistedPageContent;
  notes: string[];
}

function newBlockId(): string {
  return crypto.randomBytes(12).toString('hex');
}

function resolveType(
  type: ModuleType,
  notes: string[],
): SupportedBlockType {
  if (SUPPORTED.has(type)) return type as SupportedBlockType;
  const downgraded = DOWNGRADE[type] ?? 'text';
  notes.push(`compile:${type} → ${downgraded} (tipo ainda não persistido)`);
  return downgraded;
}

function orderModules(modules: SpecModule[]): SpecModule[] {
  const withRect = modules.filter((m) => m.rect);
  if (withRect.length === 0) return modules;
  return [...modules].sort((a, b) => {
    if (!a.rect || !b.rect) return 0;
    return a.rect.row - b.rect.row || a.rect.col - b.rect.col;
  });
}

function toBlock(
  module: SpecModule,
  notes: string[],
): PersistedBlock {
  const now = Date.now();
  return {
    id: newBlockId(),
    type: resolveType(module.type, notes),
    version: BLOCK_VERSION,
    props: module.props,
    meta: { createdAt: now, updatedAt: now },
  };
}

/**
 * PageSpec → persisted page content. Sections flatten in declaration order;
 * modules with rect sort row-major inside their section. Section/grid info
 * is not persisted today — it lands with the schema migration (Fatia 3).
 */
export function compilePageSpec(spec: PageSpec): CompileResult {
  const notes: string[] = [];

  const blocks = spec.sections.flatMap((section) =>
    orderModules(section.modules).map((m) => toBlock(m, notes)),
  );

  return {
    content: {
      blocks,
      theme: normalizeThemeId(`generated-${spec.theme.typography}`),
      version: PAGE_VERSION,
    },
    notes,
  };
}
