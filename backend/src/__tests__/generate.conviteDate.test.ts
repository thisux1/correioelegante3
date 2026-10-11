import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  type CreativeBrief,
  type ModuleType,
} from '../contracts/generation.contract';
import { extractFeatures } from '../generate/engine/features';
import {
  selectModules,
  type ModuleContext,
} from '../generate/engine/scoring';
import {
  CONVITE_DATE_COPY,
  CONVITE_DATE_SLOT_LIMITS,
  type ConviteDateCopySlot,
} from '../generate/copy/conviteDate';
import { conviteDateFamily } from '../generate/templates/families/conviteDate';

// ─── Cobertura de slots ──────────────────────────────────────────────────────
//
// A família marca props com 'copySlot:<chave>' no valor. Os três ctx abaixo
// cobrem os ramos condicionais de props() e requiresAll: brief completo com
// evento (hasEvento ligado), brief sem evento (fallback de texto) e remetente
// oculto (anon → senderName some do envelope).

function makeBrief(overrides: Record<string, unknown> = {}): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'convite_date',
    nomes: { remetente: 'Enzo', destinatario: 'Isabela' },
    evento: {
      data: '2026-03-14',
      lugar: 'sorveteria da praça',
      descricao: 'sorvete e passeio no fim de tarde',
    },
    ...overrides,
  });
}

const BRIEF_COM_EVENTO = makeBrief();
const BRIEF_SEM_EVENTO = makeBrief({ evento: undefined });
const BRIEF_ANON = makeBrief({ anonimoParaDestinatario: true });

const CONTEXTS: ModuleContext[] = [
  // maximal — hasEvento ligado → ticketRsvp + timer emitem seus slots
  {
    brief: BRIEF_COM_EVENTO,
    features: extractFeatures(BRIEF_COM_EVENTO),
    hideSender: false,
  },
  // sem evento — convite cai no texto 'copySlot:convite.detalhes'
  {
    brief: BRIEF_SEM_EVENTO,
    features: extractFeatures(BRIEF_SEM_EVENTO),
    hideSender: false,
  },
  // anônimo — envelope sem remetente
  {
    brief: BRIEF_ANON,
    features: extractFeatures(BRIEF_ANON),
    hideSender: true,
  },
];

function collectCopySlotKeys(): Set<string> {
  const keys = new Set<string>();
  for (const ctx of CONTEXTS) {
    for (const arcSlot of conviteDateFamily.arc) {
      for (const candidate of arcSlot.candidates) {
        for (const [propName, value] of Object.entries(candidate.props(ctx))) {
          if (propName === 'copySlot' && typeof value === 'string') {
            keys.add(value);
          } else if (typeof value === 'string' && value.startsWith('copySlot:')) {
            keys.add(value.slice('copySlot:'.length));
          }
        }
      }
    }
  }
  return keys;
}

function select(brief: CreativeBrief, hideSender = false) {
  const notes: string[] = [];
  const forbidden = new Set<ModuleType>();
  return selectModules(
    conviteDateFamily,
    { brief, features: extractFeatures(brief), hideSender },
    forbidden,
    notes,
  );
}

// ─── Guardrails de conteúdo ──────────────────────────────────────────────────

// Regra dura do produto: zero emoji/emoticon. Cobre blocos de pictogramas,
// dingbats/símbolos, keycaps, variation selectors e ZWJ.
const EMOJI_RE = new RegExp(
  [
    '\\u{1F000}-\\u{1FAFF}',
    '\\u{2300}-\\u{23FF}',
    '\\u{2600}-\\u{27BF}',
    '\\u{2B00}-\\u{2BFF}',
    '\\u{FE0E}-\\u{FE0F}',
    '\\u{20E3}',
    '\\u{3030}',
    '\\u{303D}',
    '\\u{3297}',
    '\\u{3299}',
    '\\u{200D}',
  ].join('|'),
  'u',
);

// Emoticons ASCII clássicos — também proibidos pela regra dura.
const EMOTICON_RE = /<3|[:;=8][-o*']?[)([\]DPp/\\]|;[-o*']?[)([\]DPp]/;

// Abreviações de SMS proibidas pelo guia de voz (vc, pq, tb/tbm, ...).
const SMS_ABREV_RE =
  /\b(vc|pq|tb|tbm|blz|msm|nd|hj|qdo|qnd|s2|dps|mt|mto|oq|kd|aki|axo)\b/i;

// Meloso genérico proibido + marcador de gênero com parênteses.
const MELOSO_RE =
  /\b(meu anjo|princesa|amor da minha vida|luz dos meus olhos|alma g[eê]mea|moz[aã]o|xuxu|gatinh[oa]|nen[eé]m|bb)\b/i;
const GENERO_PAREN_RE = /\(\s*[ao]\s*\)/;

// Único placeholder documentado é {nome} (ver header do banco).
const PLACEHOLDER_RE = /\{([^}]*)\}/g;
const NOME_TESTE = 'Isabela';

function interpolate(text: string): string {
  return text.replaceAll('{nome}', NOME_TESTE);
}

function slotEntries(): Array<[ConviteDateCopySlot, string[]]> {
  return Object.entries(CONVITE_DATE_COPY) as Array<
    [ConviteDateCopySlot, string[]]
  >;
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('banco de copy — convite_date', () => {
  it('cobre exatamente os slots que a família emite', () => {
    const emitted = collectCopySlotKeys();
    const banked = new Set<string>(Object.keys(CONVITE_DATE_COPY));
    // família → banco: nenhum slot órfão; banco → família: nenhuma copy morta
    expect(emitted).toEqual(banked);
  });

  it('todo slot emitido tem pelo menos 3 variantes, sem repetição', () => {
    const emitted = collectCopySlotKeys();
    for (const slot of emitted) {
      const variants = CONVITE_DATE_COPY[slot as ConviteDateCopySlot];
      expect(variants, `slot "${slot}" não existe no banco`).toBeDefined();
      expect(
        variants.length,
        `slot "${slot}" deve ter ≥3 variantes, tem ${variants.length}`,
      ).toBeGreaterThanOrEqual(3);
      expect(variants.length).toBeLessThanOrEqual(6);
      expect(
        new Set(variants).size,
        `slot "${slot}" tem variante duplicada`,
      ).toBe(variants.length);
    }
  });

  it('toda variante respeita o limite de caracteres do slot (após interpolação)', () => {
    for (const [slot, variants] of slotEntries()) {
      const limit = CONVITE_DATE_SLOT_LIMITS[slot];
      for (const variant of variants) {
        const rendered = interpolate(variant);
        expect(
          rendered.length,
          `"${slot}" excede ${limit} chars (${rendered.length}): ${rendered.slice(0, 60)}…`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('zero emoji, emoticon ou abreviação de SMS em qualquer variante', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        expect(EMOJI_RE.test(variant), `emoji em "${slot}": ${variant}`).toBe(
          false,
        );
        expect(
          EMOTICON_RE.test(variant),
          `emoticon em "${slot}": ${variant}`,
        ).toBe(false);
        expect(
          SMS_ABREV_RE.test(variant),
          `abreviação de SMS em "${slot}": ${variant}`,
        ).toBe(false);
      }
    }
  });

  it('zero meloso genérico e zero marcador de gênero "(a)"', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        expect(
          MELOSO_RE.test(variant),
          `meloso genérico em "${slot}": ${variant}`,
        ).toBe(false);
        expect(
          GENERO_PAREN_RE.test(variant),
          `marcador "(a)"/"(o)" em "${slot}": ${variant}`,
        ).toBe(false);
      }
    }
  });

  it('só usa placeholders documentados ({nome})', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        const placeholders = [...variant.matchAll(PLACEHOLDER_RE)].map(
          (m) => m[1],
        );
        for (const placeholder of placeholders) {
          expect(
            placeholder,
            `placeholder {${placeholder}} não documentado em "${slot}"`,
          ).toBe('nome');
        }
      }
    }
  });

  it('banco, família e teste não usam `any`', () => {
    // vitest roda com cwd na raiz do backend (npm test --prefix backend)
    const noExplicitAny = /:\s*any\b|as\s+any\b|<\s*any\b/;
    for (const relPath of [
      'src/generate/copy/conviteDate.ts',
      'src/generate/templates/families/conviteDate.ts',
      'src/__tests__/generate.conviteDate.test.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relPath), 'utf8');
      expect(noExplicitAny.test(source), `\`any\` em ${relPath}`).toBe(false);
    }
  });
});

describe('família — convite_date', () => {
  it('brief mínimo (sem evento) ainda gera ≥1 módulo por slot do arco', () => {
    const minimal = creativeBriefSchema.parse({
      momento: 'convite_date',
      nomes: { destinatario: 'Isabela' },
    });
    const slots = select(minimal);
    const bySlot = new Map(slots.map((s) => [s.slot.id, s.modules]));
    for (const arcSlot of conviteDateFamily.arc) {
      expect(
        bySlot.get(arcSlot.id)?.length ?? 0,
        `slot "${arcSlot.id}" ficou vazio sem evento`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('sem evento, o slot convite cai no texto fallback', () => {
    const slots = select(BRIEF_SEM_EVENTO);
    const convite = slots.find((s) => s.slot.id === 'convite');
    expect(convite).toBeDefined();
    expect(convite!.modules.map((m) => m.type)).toEqual(['text']);
    expect(convite!.modules[0].props.text).toBe('copySlot:convite.detalhes');
  });

  it('com evento, o slot convite emite ticketRsvp e timer com o evento do brief', () => {
    const slots = select(BRIEF_COM_EVENTO);
    const convite = slots.find((s) => s.slot.id === 'convite');
    expect(convite).toBeDefined();
    const types = convite!.modules.map((m) => m.type);
    expect(types).toContain('ticketRsvp');
    expect(types).toContain('timer');

    const rsvp = convite!.modules.find((m) => m.type === 'ticketRsvp');
    expect(rsvp!.props.title).toBe('copySlot:rsvp.titulo');
    expect(rsvp!.props.evento).toEqual(BRIEF_COM_EVENTO.evento);

    const timer = convite!.modules.find((m) => m.type === 'timer');
    expect(timer!.props.targetDate).toBe('2026-03-14');
    expect(timer!.props.label).toBe('copySlot:timer.label');
  });

  it('remetente oculto (anon) nunca vaza senderName no envelope', () => {
    const slots = select(BRIEF_ANON, true);
    const abertura = slots.find((s) => s.slot.id === 'abertura');
    const envelope = abertura!.modules.find((m) => m.type === 'envelope');
    expect(envelope).toBeDefined();
    expect(envelope!.props.senderName).toBeUndefined();
    expect(JSON.stringify(envelope!.props)).not.toContain('Enzo');
  });

  it('tema segue o spec do momento: pixel, expressivo, retro-os', () => {
    const theme = conviteDateFamily.theme(BRIEF_COM_EVENTO);
    expect(theme.typography).toBe('pixel');
    expect(theme.motionIntensity).toBe('expressivo');
    expect(theme.atmosphere).toBe('retro-os');
    expect(theme.palette).toEqual(['#e11d48', '#fff5f7', '#4c0519']);

    const themed = conviteDateFamily.theme(
      makeBrief({ coresFavoritas: ['#be123c', '#fecdd3'] }),
    );
    expect(themed.palette).toEqual(['#be123c', '#fecdd3']);
  });
});
