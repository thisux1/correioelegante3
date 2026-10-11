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
  'youtube',
  'photoBook',
  'bouquet',
  'hints',
  'intimacyGate',
  'ticketRsvp',
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

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const DOWNGRADE: Partial<Record<ModuleType, DowngradeRule>> = {
  togetherCounter: {
    to: 'timer',
    adapt: (p) => ({ targetDate: asText(p.targetDate), label: asText(p.label) }),
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
};

/**
 * Real persisted types whose spec-side props shape differs from the block
 * contract — families emit spec ergonomics (items, answer), persisted blocks
 * expect their own shape (hints[], answers[]). Adapters run after copy-slot
 * resolution, so `intro`/`title` arrive as final text.
 */
const SPEC_PROPS_ADAPTER: Partial<
  Record<ModuleType, (props: Record<string, unknown>) => Record<string, unknown>>
> = {
  hints: (p) => ({
    title: asText(p.intro) || undefined,
    hints: asStrings(p.items).map((text, index) => ({ id: `hint-${index}`, text })),
  }),
  intimacyGate: (p) => ({
    title: asText(p.intro) || undefined,
    question: asText(p.question),
    answers: asStrings([p.answer]).concat(asStrings(p.answers)),
    hint: asText(p.hint) || undefined,
    successMessage: asText(p.successMessage) || undefined,
  }),
  /**
   * ticketRsvp (S14): spec emite {title, evento}; persistido ganha
   * allowText:true. responseToken NUNCA entra no content — o backend injeta
   * na leitura pública (HMAC por pageId+blockId, ver page.service).
   */
  ticketRsvp: (p) => {
    const evento = asRecord(p.evento);
    const data = asText(evento.data) || undefined;
    const lugar = asText(evento.lugar) || undefined;
    const descricao = asText(evento.descricao) || undefined;
    return {
      title: asText(p.title) || undefined,
      ...(data || lugar || descricao ? { evento: { data, lugar, descricao } } : {}),
      allowText: true,
    };
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
    const adapt = SPEC_PROPS_ADAPTER[module.type];
    return {
      type: module.type as SupportedBlockType,
      props: adapt ? adapt(module.props) : module.props,
    };
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
  sectionId: string,
  notes: string[],
): PersistedBlock {
  const now = Date.now();
  const { type, props } = resolveTypeAndProps(module, notes);
  return {
    id: newBlockId(),
    type,
    version: BLOCK_VERSION,
    props,
    sectionId,
    rect: module.rect,
    meta: { createdAt: now, updatedAt: now },
  };
}

/**
 * PageSpec → persisted page content. Sections persist as first-class content;
 * blocks carry sectionId + rect so the grid editor can place them. Modules
 * with rect sort row-major inside their section so stack renderers keep a
 * sensible reading order.
 */
export function compilePageSpec(spec: PageSpec): CompileResult {
  const notes: string[] = [];

  const blocks = spec.sections.flatMap((section) =>
    orderModules(section.modules).map((m) => toBlock(m, section.id, notes)),
  );

  const sections = spec.sections.map((section) => ({
    id: section.id,
    layout: section.layout,
    ...(section.grid ? { grid: section.grid } : {}),
    ...(section.theme ? { theme: section.theme } : {}),
  }));

  // Persisted theme ids resolve against the frontend catalog; the
  // spec's richer theme (palette/typography/motion) survives in spec.theme
  // and lands as real themes with the "romantic OS" tokens (§15.10).
  return {
    content: {
      blocks,
      sections,
      theme: normalizeThemeId('romantic-sunset'),
      version: PAGE_VERSION,
    },
    notes,
  };
}
