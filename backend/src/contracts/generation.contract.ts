import { z } from 'zod';

/**
 * Generation contracts — CreativeBrief (input intent) and PageSpec (intermediate
 * page representation compiled to PersistedBlock[] by compilePageSpec).
 *
 * Canonical schemas live backend-side (Zod v3), per repo convention. The
 * frontend consumes the compiled Block[] via API; it mirrors these shapes as
 * plain TS interfaces only if a consumer ever needs them (see §15.9 of
 * generative-editor-plan.md).
 */

// ─── CreativeBrief ────────────────────────────────────────────────────────────

export const MOMENTO_VALUES = [
  'crush_secreto',
  'carta_amor',
  'desculpas',
  'anonimo',
  'convite_date',
  'pedido_namoro',
  'data_especial',
  'so_porque_sim',
] as const;

export const TOM_VALUES = [
  'cinematico',
  'leve',
  'vulneravel',
  'misterioso',
  'celebratorio',
] as const;

export type Momento = (typeof MOMENTO_VALUES)[number];
export type Tom = (typeof TOM_VALUES)[number];

export const memoriaSchema = z.object({
  titulo: z.string().max(120),
  lugar: z.string().max(120).optional(),
  data: z.string().max(40).optional(),
  descricao: z.string().max(500).optional(),
});

export const intimidadeSchema = z.object({
  pergunta: z.string().max(300),
  resposta: z.string().max(300),
  dica: z.string().max(300).optional(),
});

export const creativeBriefSchema = z.object({
  version: z.literal(1).default(1),
  momento: z.enum(MOMENTO_VALUES, {
    errorMap: () => ({ message: 'Momento invalido.' }),
  }),
  nomes: z.object({
    remetente: z.string().max(80).optional(),
    destinatario: z.string().max(80),
  }),
  apelidos: z.array(z.string().max(60)).max(8).default([]),
  tom: z.enum(TOM_VALUES).optional(),
  coresFavoritas: z
    .array(z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser hex (#rrggbb).'))
    .max(6)
    .default([]),
  interesses: z.array(z.string().max(60)).max(12).default([]),
  contexto: z.string().max(4_000).optional(),
  memorias: z.array(memoriaSchema).max(10).default([]),
  perguntasIntimidade: z.array(intimidadeSchema).max(5).default([]),
  evento: z
    .object({
      data: z.string().max(40).optional(),
      lugar: z.string().max(120).optional(),
      descricao: z.string().max(300).optional(),
    })
    .optional(),
  midias: z
    .object({
      fotos: z.array(z.string().max(200)).max(12).default([]),
      musicaUrl: z.string().url().max(500).optional(),
      musicaDedicatoria: z.string().max(300).optional(),
    })
    .default({ fotos: [] }),
  anonimoParaDestinatario: z.boolean().default(false),
  restricoes: z.array(z.string().max(80)).max(10).default([]),
});

export type Memoria = z.infer<typeof memoriaSchema>;
export type PerguntaIntimidade = z.infer<typeof intimidadeSchema>;
export type CreativeBrief = z.infer<typeof creativeBriefSchema>;

// ─── PageSpec ─────────────────────────────────────────────────────────────────

export const PAGE_SPEC_VERSION = 1;

/** Block types a PageSpec module may reference: persisted types + planned ones. */
export const MODULE_TYPE_VALUES = [
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
  'bouquet',
  'photoBook',
  'ticketRsvp',
  'hints',
  'intimacyGate',
  'memoryCard',
  'hiddenNotes',
  'togetherCounter',
  'youtube',
] as const;

export type ModuleType = (typeof MODULE_TYPE_VALUES)[number];

export const SECTION_LAYOUT_VALUES = [
  'stack',
  'columns',
  'overlap',
  'grid',
  'freezone',
  'fullbleed',
] as const;

export type SectionLayout = (typeof SECTION_LAYOUT_VALUES)[number];

export const gridPlacementSchema = z.object({
  col: z.number().int().min(1).max(24),
  row: z.number().int().min(1),
  w: z.number().int().min(1).max(24),
  h: z.number().int().min(1).max(40),
});

export type GridPlacement = z.infer<typeof gridPlacementSchema>;

export const specModuleSchema = z.object({
  type: z.enum(MODULE_TYPE_VALUES),
  props: z.record(z.unknown()).default({}),
  rect: gridPlacementSchema.optional(),
});

export const specSectionSchema = z.object({
  id: z.string().max(80),
  layout: z.enum(SECTION_LAYOUT_VALUES).default('stack'),
  grid: z
    .object({
      cols: z.number().int().min(1).max(24).default(12),
    })
    .optional(),
  theme: z.record(z.unknown()).optional(),
  modules: z.array(specModuleSchema).default([]),
});

export const specThemeSchema = z.object({
  palette: z
    .array(z.string().regex(/^#[0-9a-fA-F]{6}$/))
    .max(8)
    .default([]),
  typography: z.enum(['serifada', 'moderna', 'manuscrita', 'pixel']).default('moderna'),
  motionIntensity: z
    .enum(['sutil', 'expressivo', 'cinematografico'])
    .default('expressivo'),
  atmosphere: z.string().max(120).optional(),
});

export const pageSpecSchema = z.object({
  version: z.literal(PAGE_SPEC_VERSION),
  templateFamily: z.string().max(80),
  theme: specThemeSchema,
  sections: z.array(specSectionSchema).min(1).max(12),
  decisions: z.array(z.string().max(200)).default([]),
  seed: z.number().int().nonnegative().optional(),
});

export type SpecModule = z.infer<typeof specModuleSchema>;
export type SpecSection = z.infer<typeof specSectionSchema>;
export type SpecTheme = z.infer<typeof specThemeSchema>;
export type PageSpec = z.infer<typeof pageSpecSchema>;
