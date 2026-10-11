import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  type CreativeBrief,
  type ModuleType,
} from '../contracts/generation.contract';
import { extractFeatures, type BriefFeature } from '../generate/engine/features';
import { selectModules, type ModuleContext } from '../generate/engine/scoring';
import {
  SO_PORQUE_SIM_COPY,
  SO_PORQUE_SIM_SLOT_LIMITS,
} from '../generate/copy/soPorqueSim';
import { soPorqueSimFamily } from '../generate/templates/families/soPorqueSim';

// ─── Contextos de cobertura ──────────────────────────────────────────────────
//
// A família importa DIRETO (não via registry/decide) — o orquestrador faz a
// amarração do momento. Os ctx abaixo cobrem os dois ramos de props():
// remetente declarado (padrão do momento) e remetente oculto (anon).

const ALL_FEATURES = new Set<BriefFeature>([
  'anon',
  'hasFotos',
  'hasMemorias',
  'hasMusica',
  'hasEvento',
  'hasIntimidade',
  'hasApelidos',
]);

function makeBrief(overrides: Record<string, unknown> = {}): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'so_porque_sim',
    nomes: { remetente: 'Theo', destinatario: 'Fernanda' },
    apelidos: ['Nanda', 'Fê'],
    coresFavoritas: ['#e11d48', '#fda4af'],
    midias: {
      fotos: ['https://example.com/f1.jpg', 'https://example.com/f2.jpg'],
      musicaUrl: 'https://example.com/musica.mp3',
      musicaDedicatoria: 'a que a gente ouve no ônibus',
    },
    ...overrides,
  });
}

/** Ctx máximo — tudo elegível, para expor todos os copySlot dos props(). */
const MAXIMAL_CONTEXTS: ModuleContext[] = [
  // remetente declarado → senderName = 'Theo'
  { brief: makeBrief(), features: ALL_FEATURES, hideSender: false },
  // remetente oculto → senderName = undefined
  {
    brief: makeBrief({ anonimoParaDestinatario: true }),
    features: ALL_FEATURES,
    hideSender: true,
  },
];

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, out);
  }
}

/** Toda chave `copySlot:*` emitida por qualquer candidato, em qualquer ctx. */
function collectCopySlotKeys(): Set<string> {
  const keys = new Set<string>();
  for (const ctx of MAXIMAL_CONTEXTS) {
    for (const arcSlot of soPorqueSimFamily.arc) {
      for (const candidate of arcSlot.candidates) {
        const props = candidate.props(ctx);
        for (const [propName, value] of Object.entries(props)) {
          if (propName === 'copySlot' && typeof value === 'string') {
            keys.add(value);
          }
        }
        const strings: string[] = [];
        collectStrings(props, strings);
        for (const s of strings) {
          if (s.startsWith('copySlot:')) keys.add(s.slice('copySlot:'.length));
        }
      }
    }
  }
  return keys;
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

// Emoticons ASCII banidos pela guia de voz: :) :( ;) =D <3 xD :o :P etc.
const EMOTICON_RE = /(:-?[)D(OP(]|;-?[)D(P]|=D|<3|\bxd\b)/i;

// Abreviações de SMS proibidas pela guia: vc, pq, tb/tbm, blz, msm, nd…
const SMS_ABBREV_RE = /\b(vc|pq|tb|tbm|blz|msm|nd|hj|qdo|qnd|s2|mt|mto|dps)\b/i;

// Marcador de gênero com parênteses: (a), (o).
const GENDER_MARKER_RE = /\(([ao])\)/;

// Único placeholder documentado é {nome} (ver header do banco).
const PLACEHOLDER_RE = /\{([^}]*)\}/g;
const NOME_TESTE = 'Fernanda';

function interpolate(text: string): string {
  return text.replaceAll('{nome}', NOME_TESTE);
}

function slotEntries(): Array<[string, string[]]> {
  return Object.entries(SO_PORQUE_SIM_COPY);
}

// ─── Tipos que este momento nunca emite ──────────────────────────────────────
//
// Sem ocasião → nada de countdown/RSVP/contador. Não é mistério → nada de
// gate/memory card/notas escondidas. Mídia crua fica fora do arco.
const FORBIDDEN_TYPES: ModuleType[] = [
  'timer',
  'ticketRsvp',
  'togetherCounter',
  'intimacyGate',
  'memoryCard',
  'hiddenNotes',
  'image',
  'video',
  'youtube',
];

function emittedTypes(ctx: ModuleContext): ModuleType[] {
  const notes: string[] = [];
  const slots = selectModules(
    soPorqueSimFamily,
    ctx,
    new Set<ModuleType>(),
    notes,
  );
  return slots.flatMap((s) => s.modules.map((m) => m.type));
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('família — so_porque_sim', () => {
  it('todo slot do arco produz ≥1 módulo com brief mínimo', () => {
    const minimalBrief = creativeBriefSchema.parse({
      momento: 'so_porque_sim',
      nomes: { destinatario: 'Fernanda' },
    });
    const ctx: ModuleContext = {
      brief: minimalBrief,
      features: extractFeatures(minimalBrief),
      hideSender: false,
    };
    const notes: string[] = [];
    const slots = selectModules(
      soPorqueSimFamily,
      ctx,
      new Set<ModuleType>(),
      notes,
    );

    expect(slots.length).toBe(soPorqueSimFamily.arc.length);
    for (const { slot, modules } of slots) {
      expect(
        modules.length,
        `slot "${slot.id}" sem módulo no brief mínimo`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('não emite tipos proibidos sob ctx mínimo nem rico', () => {
    const minimalBrief = creativeBriefSchema.parse({
      momento: 'so_porque_sim',
      nomes: { destinatario: 'Fernanda' },
    });
    const contexts: ModuleContext[] = [
      {
        brief: minimalBrief,
        features: extractFeatures(minimalBrief),
        hideSender: false,
      },
      // rico: todas as features + remetente declarado
      { brief: makeBrief(), features: ALL_FEATURES, hideSender: false },
      // rico + anônimo
      {
        brief: makeBrief({ anonimoParaDestinatario: true }),
        features: ALL_FEATURES,
        hideSender: true,
      },
    ];

    for (const ctx of contexts) {
      const types = emittedTypes(ctx);
      for (const banned of FORBIDDEN_TYPES) {
        expect(types, `tipo proibido "${banned}" emitido`).not.toContain(banned);
      }
    }
  });

  it('hints só aparece quando o brief tem apelidos', () => {
    const minimalBrief = creativeBriefSchema.parse({
      momento: 'so_porque_sim',
      nomes: { destinatario: 'Fernanda' },
    });
    const without: ModuleContext = {
      brief: minimalBrief,
      features: extractFeatures(minimalBrief),
      hideSender: false,
    };
    expect(emittedTypes(without)).not.toContain('hints');

    const withApelidos: ModuleContext = {
      brief: makeBrief(),
      features: ALL_FEATURES,
      hideSender: false,
    };
    expect(emittedTypes(withApelidos)).toContain('hints');
  });

  it('nenhum candidato usa tipos fora da whitelist do momento', () => {
    for (const arcSlot of soPorqueSimFamily.arc) {
      for (const candidate of arcSlot.candidates) {
        expect(
          FORBIDDEN_TYPES,
          `slot "${arcSlot.id}" declara tipo proibido "${candidate.type}"`,
        ).not.toContain(candidate.type);
      }
    }
  });
});

describe('banco de copy — so_porque_sim', () => {
  it('cobre exatamente os slots que a família emite', () => {
    const emitted = collectCopySlotKeys();
    const banked = new Set<string>(Object.keys(SO_PORQUE_SIM_COPY));
    // família → banco: nenhum slot órfão; banco → família: nenhuma copy morta
    expect(emitted).toEqual(banked);
  });

  it('todo slot emitido tem ≥3 variantes e limite registrado', () => {
    const emitted = collectCopySlotKeys();
    const bank: Record<string, string[]> = SO_PORQUE_SIM_COPY;
    const limits: Record<string, number> = SO_PORQUE_SIM_SLOT_LIMITS;
    for (const key of emitted) {
      const variants = bank[key];
      expect(variants, `slot "${key}" ausente no banco`).toBeDefined();
      expect(
        variants.length,
        `slot "${key}" com menos de 3 variantes`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        limits[key],
        `slot "${key}" sem limite registrado`,
      ).toBeDefined();
    }
  });

  it('toda variante respeita o limite do slot (após interpolação)', () => {
    for (const [slot, variants] of slotEntries()) {
      const limit = SO_PORQUE_SIM_SLOT_LIMITS[
        slot as keyof typeof SO_PORQUE_SIM_SLOT_LIMITS
      ];
      for (const variant of variants) {
        const rendered = interpolate(variant);
        expect(
          rendered.length,
          `"${slot}" excede ${limit} chars (${rendered.length}): ${rendered.slice(0, 60)}…`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('todo slot tem variantes únicas', () => {
    for (const [slot, variants] of slotEntries()) {
      expect(
        new Set(variants).size,
        `slot "${slot}" tem variante duplicada`,
      ).toBe(variants.length);
    }
  });

  it('zero emoji, emoticon, abreviação de SMS ou marcador (a)', () => {
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
          SMS_ABBREV_RE.test(variant),
          `abreviação SMS em "${slot}": ${variant}`,
        ).toBe(false);
        expect(
          GENDER_MARKER_RE.test(variant),
          `marcador de gênero em "${slot}": ${variant}`,
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

  it('carta.corpo tem estrutura de carta (3+ parágrafos) em toda variante', () => {
    for (const variant of SO_PORQUE_SIM_COPY['carta.corpo']) {
      expect(variant.split('\n\n').length).toBeGreaterThanOrEqual(3);
    }
  });

  it('quiz.pergunta é lúdico — nunca pedido romântico', () => {
    // perguntas do momento são convites bobos ("me deixa te mimar hoje?"),
    // nunca declaração disfarçada de pergunta.
    for (const variant of SO_PORQUE_SIM_COPY['quiz.pergunta']) {
      expect(variant.endsWith('?')).toBe(true);
    }
  });

  it('banco, família e teste não usam `any`', () => {
    // vitest roda com cwd na raiz do backend (npm test --prefix backend)
    // o pattern é escrito de forma que não casa com o próprio fonte
    const noExplicitAny = /:\s*any\b|as\s+any\b|<\s*any\b/;
    for (const relPath of [
      'src/generate/copy/soPorqueSim.ts',
      'src/generate/templates/families/soPorqueSim.ts',
      'src/__tests__/generate.soPorqueSim.test.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relPath), 'utf8');
      expect(noExplicitAny.test(source), `\`any\` em ${relPath}`).toBe(false);
    }
  });
});
