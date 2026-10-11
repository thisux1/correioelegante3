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
 * the downgrade is explicit in decisions[]. Each adapter reshapes props so
 * the target block isn't empty (text sanitizer keeps only {text, align}).
 */
interface DowngradeRule {
  to: SupportedBlockType;
  adapt: (props: Record<string, unknown>) => Record<string, unknown>;
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const DOWNGRADE: Partial<Record<ModuleType, DowngradeRule>> = {
  youtube: {
    to: 'video',
    adapt: (p) => ({ src: asText(p.src) }),
  },
  photoBook: {
    to: 'gallery',
    adapt: (p) => ({ images: asStrings(p.images), transition: 'fade' }),
  },
  intimacyGate: {
    to: 'quiz',
    adapt: (p) => ({
      question: asText(p.question),
      yesButtonText: 'Acertei',
      noButtonText: 'Errei',
      successMessage: asText(p.hint) || 'Sabia que você ia lembrar.',
      isPlayfulNo: false,
    }),
  },
  togetherCounter: {
    to: 'timer',
    adapt: (p) => ({ targetDate: asText(p.targetDate), label: asText(p.label) }),
  },
  hints: {
    to: 'text',
    adapt: (p) => ({ text: asStrings(p.items).join(' • '), align: 'center' }),
  },
  memoryCard: {
    to: 'text',
    adapt: (p) => ({
      text: [asText(p.titulo), asText(p.descricao)].filter(Boolean).join('\n'),
      align: 'left',
    }),
  },
  hiddenNotes: {
    to: 'text',
    adapt: (p) => ({ text: asStrings(p.items).join('\n'), align: 'left' }),
  },
  bouquet: {
    to: 'text',
    adapt: (p) => ({ text: asText(p.descricao) || 'Um buquê pra você.', align: 'center' }),
  },
  ticketRsvp: {
    to: 'text',
    adapt: (p) => ({ text: asText(p.title), align: 'center' }),
  },
};

export interface CompileResult {
  content: PersistedPageContent;
  notes: string[];
}

function newBlockId(): string {
  return crypto.randomBytes(12).toString('hex');
}

function resolveTypeAndProps(
  module: SpecModule,
  notes: string[],
): { type: SupportedBlockType; props: Record<string, unknown> } {
  if (SUPPORTED.has(module.type)) {
    return { type: module.type as SupportedBlockType, props: module.props };
  }
  const rule = DOWNGRADE[module.type];
  const to = rule?.to ?? 'text';
  const props = rule ? rule.adapt(module.props) : module.props;
  notes.push(`compile:${module.type} → ${to} (tipo ainda não persistido)`);
  return { type: to, props };
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
  const { type, props } = resolveTypeAndProps(module, notes);
  return {
    id: newBlockId(),
    type,
    version: BLOCK_VERSION,
    props,
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

  // Persisted theme ids resolve against the frontend catalog; the
  // spec's richer theme (palette/typography/motion) survives in spec.theme
  // and lands as real themes with the "romantic OS" tokens (§15.10).
  return {
    content: {
      blocks,
      theme: normalizeThemeId('romantic-sunset'),
      version: PAGE_VERSION,
    },
    notes,
  };
}
