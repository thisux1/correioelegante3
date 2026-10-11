import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  type CreativeBrief,
} from '../contracts/generation.contract';
import type { BriefFeature } from '../generate/engine/features';
import {
  selectModules,
  type ModuleContext,
} from '../generate/engine/scoring';
import {
  CARTA_AMOR_COPY,
  CARTA_AMOR_SLOT_LIMITS,
  type CartaAmorCopySlot,
} from '../generate/copy/cartaAmor';
import { cartaAmorFamily } from '../generate/templates/families/cartaAmor';

// ─── Cobertura de slots ──────────────────────────────────────────────────────
//
// A família marca props assim: { messageSnippet: 'copySlot:envelope.teaser' }.
// Os ctx abaixo cobrem os ramos condicionais de props(): remetente nomeado,
// remetente oculto (hideSender) e brief com/sem musicaDedicatoria — o marker
// 'copySlot:music.titulo' só aparece quando a dedicatória não veio no brief.

const ALL_FEATURES = new Set<BriefFeature>([
  'anon',
  'hasFotos',
  'hasMemorias',
  'hasMusica',
  'hasEvento',
  'hasIntimidade',
  'hasApelidos',
]);

function makeRichBrief(overrides: Record<string, unknown> = {}): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'carta_amor',
    nomes: { remetente: 'Theo', destinatario: 'Fernanda' },
    apelidos: ['Nanda', 'Fê', 'Fernandinha'],
    tom: 'vulneravel',
    coresFavoritas: ['#e11d48', '#fff5f7'],
    memorias: [
      {
        titulo: 'a tarde do fone dividido',
        lugar: 'praça central',
        data: '2025-03-14',
        descricao: 'você dividiu o fone comigo e o mundo encolheu',
      },
      {
        titulo: 'o sorvete que virou tradição',
        lugar: 'sorveteria da esquina',
        data: '2025-06-02',
      },
    ],
    perguntasIntimidade: [
      {
        pergunta: 'O que tinha na xícara no nosso primeiro encontro?',
        resposta: 'cappuccino',
        dica: 'era quente e tinha desenho em cima',
      },
    ],
    evento: { data: '2026-02-14', lugar: 'praça central' },
    midias: {
      fotos: [
        'https://example.com/foto-1.jpg',
        'https://example.com/foto-2.jpg',
        'https://example.com/foto-3.jpg',
      ],
      musicaUrl: 'https://example.com/musica.mp3',
      musicaDedicatoria: 'a que tocava quando a gente se conheceu',
    },
    ...overrides,
  });
}

const MINIMAL_BRIEF = creativeBriefSchema.parse({
  momento: 'carta_amor',
  nomes: { destinatario: 'Fernanda' },
});

const CONTEXTS: ModuleContext[] = [
  // remetente declarado + dedicatória → music.title vira o literal do brief
  { brief: makeRichBrief(), features: ALL_FEATURES, hideSender: false },
  // sem dedicatória → music.title cai em 'copySlot:music.titulo'
  {
    brief: makeRichBrief({
      midias: {
        fotos: ['https://example.com/foto-1.jpg'],
        musicaUrl: 'https://example.com/musica.mp3',
      },
    }),
    features: ALL_FEATURES,
    hideSender: false,
  },
  // remetente oculto → senderName/sealInitial/coverSubtitle mudam de ramo
  { brief: makeRichBrief(), features: ALL_FEATURES, hideSender: true },
];

function collectCopySlotKeys(): Set<string> {
  const keys = new Set<string>();
  for (const ctx of CONTEXTS) {
    for (const arcSlot of cartaAmorFamily.arc) {
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

// ─── Guardrails de conteúdo ──────────────────────────────────────────────────

// Regra dura do produto: zero emoji. Cobre pictogramas, dingbats/símbolos,
// keycaps, variation selectors e ZWJ.
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

// Emoticons ASCII também são proibidos: :) :( :D ;) =) <3 e variações
// (olhos primeiro, mais reversas com parênteses tipo "(: ").
const EMOTICON_RE =
  /(<3|[:;=8xX][-o']?[)D(dPp/\\|]|[)(/\\|][-o']?[:;=8xX]|;-?\))/;

// Abreviações de SMS vetadas pelo guia de voz (+ clássicas da época).
const SMS_RE =
  /\b(vc|pq|pqp|tb|tbm|blz|msm|nd|hj|qdo|qnd|s2|mto|mta|aki|axo|naum|dps|bjs?)\b/i;

// Marcador de gênero com parênteses — vetado, escreva neutro.
const GENDER_MARKER_RE = /\(\s*[ao]\s*(?:\/\s*[ao]\s*)?\)/i;

// A carta é declarada: nada de mecânica de adivinhação de remetente.
const MYSTERY_RE = /mist[eé]rio|adivinh|quem escreveu|descobrir quem|descubra quem/i;

// Único placeholder documentado é {nome} (ver header do banco).
const PLACEHOLDER_RE = /\{([^}]*)\}/g;
const NOME_TESTE = 'Fernanda';

function interpolate(text: string): string {
  return text.replaceAll('{nome}', NOME_TESTE);
}

function slotEntries(): Array<[CartaAmorCopySlot, string[]]> {
  return Object.entries(CARTA_AMOR_COPY) as Array<
    [CartaAmorCopySlot, string[]]
  >;
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('banco de copy — carta_amor', () => {
  it('cobre exatamente os slots que a família emite', () => {
    const emitted = collectCopySlotKeys();
    const banked = new Set<string>(Object.keys(CARTA_AMOR_COPY));
    // família → banco: nenhum slot órfão; banco → família: nenhuma copy morta
    expect(emitted).toEqual(banked);
  });

  it('todo slot emitido tem 3+ variantes (banco mantém 4-6, sem repetição)', () => {
    const emitted = collectCopySlotKeys();
    for (const [slot, variants] of slotEntries()) {
      expect(variants.length, `slot "${slot}" com ${variants.length} variantes`)
        .toBeGreaterThanOrEqual(4);
      expect(variants.length).toBeLessThanOrEqual(6);
      expect(new Set(variants).size, `slot "${slot}" duplicado`).toBe(
        variants.length,
      );
    }
    for (const slot of emitted) {
      const variants = CARTA_AMOR_COPY[slot as CartaAmorCopySlot];
      expect(variants, `slot "${slot}" emitido mas ausente no banco`).toBeDefined();
      expect(variants.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('toda variante respeita o limite do slot (após interpolação)', () => {
    for (const [slot, variants] of slotEntries()) {
      const limit = CARTA_AMOR_SLOT_LIMITS[slot];
      for (const variant of variants) {
        const rendered = interpolate(variant);
        expect(
          rendered.length,
          `"${slot}" excede ${limit} chars (${rendered.length}): ${rendered.slice(0, 60)}…`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('zero emoji ou emoticon em qualquer variante', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        expect(EMOJI_RE.test(variant), `emoji em "${slot}": ${variant}`).toBe(false);
        expect(
          EMOTICON_RE.test(variant),
          `emoticon em "${slot}": ${variant}`,
        ).toBe(false);
      }
    }
  });

  it('zero abreviação de SMS e zero marcador de gênero "(a)"', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        expect(
          SMS_RE.test(variant),
          `abreviação de SMS em "${slot}": ${variant}`,
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
    for (const variant of CARTA_AMOR_COPY['carta.corpo']) {
      expect(variant.split('\n\n').length).toBeGreaterThanOrEqual(3);
    }
  });

  it('remetente declarado: nada de mecânica de adivinhação na carta/teaser/fecho', () => {
    const slotsVoltadosACarta: CartaAmorCopySlot[] = [
      'envelope.teaser',
      'carta.corpo',
      'fecho.assinatura',
    ];
    for (const slot of slotsVoltadosACarta) {
      for (const variant of CARTA_AMOR_COPY[slot]) {
        expect(
          MYSTERY_RE.test(variant),
          `tom de mistério em "${slot}": ${variant.slice(0, 80)}…`,
        ).toBe(false);
      }
    }
  });

  it('banco e teste não usam `any`', () => {
    const noExplicitAny = /:\s*any\b|as\s+any\b|<\s*any\b/;
    for (const relPath of [
      'src/generate/copy/cartaAmor.ts',
      'src/generate/templates/families/cartaAmor.ts',
      'src/__tests__/generate.cartaAmor.test.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relPath), 'utf8');
      expect(noExplicitAny.test(source), `\`any\` em ${relPath}`).toBe(false);
    }
  });
});

describe('família — carta_amor/declaracao-direta', () => {
  it('brief mínimo rende ≥1 módulo em CADA slot do arco', () => {
    const ctx: ModuleContext = {
      brief: MINIMAL_BRIEF,
      features: new Set(),
      hideSender: false,
    };
    const slots = selectModules(cartaAmorFamily, ctx, new Set(), []);
    const byId = new Map(slots.map((s) => [s.slot.id, s.modules]));

    for (const arcSlot of cartaAmorFamily.arc) {
      const modules = byId.get(arcSlot.id);
      expect(
        modules,
        `slot "${arcSlot.id}" sem módulo no brief mínimo`,
      ).toBeDefined();
      expect(modules!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('envelope esconde senderName quando hideSender=true', () => {
    const envelope = cartaAmorFamily.arc
      .find((s) => s.id === 'abertura')
      ?.candidates.find((c) => c.type === 'envelope');
    expect(envelope).toBeDefined();

    const declared = envelope!.props({
      brief: makeRichBrief(),
      features: ALL_FEATURES,
      hideSender: false,
    });
    expect(declared.senderName).toBe('Theo');

    const hidden = envelope!.props({
      brief: makeRichBrief(),
      features: ALL_FEATURES,
      hideSender: true,
    });
    expect(hidden.senderName).toBeUndefined();
    expect(JSON.stringify(hidden)).not.toContain('Theo');
    // selo cai na inicial do destinatário para não vazar o remetente
    expect(hidden.sealInitial).toBe('F');
  });

  it('theme usa tipografia manuscrita e motion sutil por padrão', () => {
    const theme = cartaAmorFamily.theme(MINIMAL_BRIEF);
    expect(theme.typography).toBe('manuscrita');
    expect(theme.motionIntensity).toBe('sutil');
    expect(theme.palette).toEqual(['#e11d48', '#fff5f7', '#4c0519']);
  });
});
