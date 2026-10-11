import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  type CreativeBrief,
  type ModuleType,
} from '../contracts/generation.contract';
import { extractFeatures } from '../generate/engine/features';
import { applyHardRules } from '../generate/engine/rules';
import { selectModules, type ModuleContext } from '../generate/engine/scoring';
import {
  DATA_ESPECIAL_COPY,
  DATA_ESPECIAL_SLOT_LIMITS,
  type DataEspecialCopySlot,
} from '../generate/copy/dataEspecial';
import { dataEspecialFamily } from '../generate/templates/families/dataEspecial';

// ─── Briefs & contextos ──────────────────────────────────────────────────────
//
// O slot coverage varre props() de TODOS os candidatos (elegíveis ou não),
// então os ctx precisam cobrir os ramos condicionais: remetente declarado,
// remetente oculto (anon → hideSender), com e sem evento/memórias/fotos, e
// música com e sem dedicatória (o fallback copySlot só aparece sem ela).

function makeBrief(overrides: Record<string, unknown> = {}): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'data_especial',
    nomes: { remetente: 'Theo', destinatario: 'Fernanda' },
    apelidos: ['Nanda'],
    memorias: [
      {
        titulo: 'o primeiro cinema',
        lugar: 'cinema do shopping',
        data: '14/02/2025',
        descricao: 'a gente perdeu o começo do filme e nem ligou',
      },
      { titulo: 'a viagem improvisada', descricao: 'sem reserva, sem roteiro' },
    ],
    evento: { data: '2026-02-14', lugar: 'praça central', descricao: 'piquenique' },
    midias: {
      fotos: [
        'https://example.com/f1.jpg',
        'https://example.com/f2.jpg',
        'https://example.com/f3.jpg',
      ],
      musicaUrl: 'https://example.com/musica.mp3',
      musicaDedicatoria: 'a que tocava quando a gente se conheceu',
    },
    ...overrides,
  });
}

/** Brief mínimo: só o obrigatório. Sem evento, memórias, fotos ou música. */
function makeMinimalBrief(): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'data_especial',
    nomes: { destinatario: 'Fernanda' },
  });
}

function ctx(brief: CreativeBrief, hideSender = false): ModuleContext {
  return { brief, features: extractFeatures(brief), hideSender };
}

const CONTEXTS: ModuleContext[] = [
  // brief maximal: evento + memórias + fotos + música com dedicatória
  ctx(makeBrief()),
  // maximal sem dedicatória → emite 'copySlot:music.titulo'
  ctx(
    makeBrief({
      midias: {
        fotos: ['https://example.com/f1.jpg'],
        musicaUrl: 'https://example.com/musica.mp3',
      },
    }),
  ),
  // sem evento/memórias/fotos/música → ramos incondicionais
  ctx(makeMinimalBrief()),
  // remetente oculto → senderName sai do envelope
  ctx(makeBrief({ anonimoParaDestinatario: true }), true),
];

// ─── Coleta de slots ─────────────────────────────────────────────────────────

function collectSlotsFromValue(value: unknown, keys: Set<string>): void {
  if (typeof value === 'string') {
    if (value.startsWith('copySlot:')) {
      keys.add(value.slice('copySlot:'.length));
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectSlotsFromValue(item, keys);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [propName, v] of Object.entries(value)) {
      if (propName === 'copySlot' && typeof v === 'string') {
        keys.add(v);
      } else {
        collectSlotsFromValue(v, keys);
      }
    }
  }
}

function collectCopySlotKeys(): Set<string> {
  const keys = new Set<string>();
  for (const context of CONTEXTS) {
    for (const arcSlot of dataEspecialFamily.arc) {
      for (const candidate of arcSlot.candidates) {
        collectSlotsFromValue(candidate.props(context), keys);
      }
    }
  }
  return keys;
}

// ─── Guardrails de conteúdo (voice-guide.md é lei) ───────────────────────────

// Regra dura do produto: zero emoji/emoticon. Cobre pictogramas, dingbats,
// keycaps, variation selectors, ZWJ e emoticons ASCII (:), <3, =) etc).
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
const EMOTICON_RE = /(<3|(?::|;|=)-?[)([\]DPp/\\|])/;
const SMS_ABBREV_RE =
  /\b(vc|pq|tb|tbm|blz|msm|nd|hj|qdo|qnd|s2|dps|tds?|mt|mto|aki|kd|cmg|pfv?|bb)\b/i;
const GENERO_PARENTESES_RE = /\(\s*[ao]\s*(?:[/,]\s*[ao]\s*)?\)/i;
const MELOSO_RE =
  /\b(meu anjo|princesa|amor da minha vida|luz dos meus olhos|alma gêmea|mozão|xuxu|gatinh[oa]|nen[ée]m?)\b/i;

// Único placeholder documentado é {nome} (ver header do banco).
const PLACEHOLDER_RE = /\{([^}]*)\}/g;
const NOME_TESTE = 'Fernanda';

function interpolate(text: string): string {
  return text.replaceAll('{nome}', NOME_TESTE);
}

function slotEntries(): Array<[DataEspecialCopySlot, string[]]> {
  return Object.entries(DATA_ESPECIAL_COPY) as Array<
    [DataEspecialCopySlot, string[]]
  >;
}

// ─── Engine helpers ──────────────────────────────────────────────────────────

function select(brief: CreativeBrief) {
  const features = extractFeatures(brief);
  const rules = applyHardRules(brief, features);
  const notes: string[] = [];
  const slots = selectModules(
    dataEspecialFamily,
    { brief, features, hideSender: rules.hideSender },
    rules.forbidden,
    notes,
  );
  return { slots, notes };
}

// Tipos proibidos neste momento: nada de mistério, RSVP ou downgrade de
// contador — data_especial é celebração com remetente declarado.
const BANNED_TYPES = new Set<ModuleType>([
  'youtube',
  'video',
  'image',
  'ticketRsvp',
  'memoryCard',
  'hiddenNotes',
  'togetherCounter',
  'scratch',
  'hints',
  'intimacyGate',
]);

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('família data_especial — cobertura de copy slots', () => {
  it('cobre exatamente os slots que a família emite', () => {
    const emitted = collectCopySlotKeys();
    const banked = new Set<string>(Object.keys(DATA_ESPECIAL_COPY));
    // família → banco: nenhum slot órfão; banco → família: nenhuma copy morta
    expect(emitted).toEqual(banked);
  });

  it('todo slot emitido existe no banco com ≥3 variantes dentro do limite', () => {
    const emitted = collectCopySlotKeys();
    for (const key of emitted) {
      const slot = key as DataEspecialCopySlot;
      const variants = DATA_ESPECIAL_COPY[slot];
      expect(variants, `slot "${key}" ausente no banco`).toBeDefined();
      expect(
        variants.length,
        `slot "${key}" deve ter ≥3 variantes, tem ${variants.length}`,
      ).toBeGreaterThanOrEqual(3);
      const limit = DATA_ESPECIAL_SLOT_LIMITS[slot];
      for (const variant of variants) {
        const rendered = interpolate(variant);
        expect(
          rendered.length,
          `"${key}" excede ${limit} chars (${rendered.length}): ${rendered.slice(0, 60)}…`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('variantes não se repetem dentro de um slot', () => {
    for (const [slot, variants] of slotEntries()) {
      expect(
        new Set(variants).size,
        `slot "${slot}" tem variante duplicada`,
      ).toBe(variants.length);
    }
  });

  it('zero emoji, emoticon, abreviação de SMS, "(a)" ou meloso genérico', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        expect(EMOJI_RE.test(variant), `emoji em "${slot}": ${variant}`).toBe(false);
        expect(EMOTICON_RE.test(variant), `emoticon em "${slot}": ${variant}`).toBe(false);
        expect(SMS_ABBREV_RE.test(variant), `abbrev SMS em "${slot}": ${variant}`).toBe(false);
        expect(GENERO_PARENTESES_RE.test(variant), `"(a)" em "${slot}": ${variant}`).toBe(false);
        expect(MELOSO_RE.test(variant), `meloso genérico em "${slot}": ${variant}`).toBe(false);
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
    for (const variant of DATA_ESPECIAL_COPY['carta.corpo']) {
      expect(variant.split('\n\n').length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('família data_especial — arco e seleção', () => {
  it('arco segue abertura → contagem → memorias → celebracao → carta', () => {
    expect(dataEspecialFamily.arc.map((s) => s.id)).toEqual([
      'abertura',
      'contagem',
      'memorias',
      'celebracao',
      'carta',
    ]);
  });

  it('nenhum candidato usa tipo proibido para o momento', () => {
    for (const slot of dataEspecialFamily.arc) {
      for (const candidate of slot.candidates) {
        expect(
          BANNED_TYPES.has(candidate.type),
          `candidato "${candidate.type}" banido em slot "${slot.id}"`,
        ).toBe(false);
      }
    }
  });

  it('brief mínimo rende ≥1 módulo por slot do arco', () => {
    const { slots, notes } = select(makeMinimalBrief());
    expect(slots.length).toBe(dataEspecialFamily.arc.length);
    for (const { slot, modules } of slots) {
      expect(
        modules.length,
        `slot "${slot.id}" vazio com brief mínimo`,
      ).toBeGreaterThanOrEqual(1);
    }
    expect(notes.join(' ')).not.toContain('sem candidato elegível');
  });

  it('contagem emite timer só com hasEvento; sem evento narra em texto', () => {
    const comEvento = select(makeBrief());
    const contagem = comEvento.slots.find((s) => s.slot.id === 'contagem');
    expect(contagem?.modules.map((m) => m.type)).toEqual(['timer']);
    expect(contagem?.modules[0].props.targetDate).toBe('2026-02-14');
    expect(contagem?.modules[0].props.label).toBe('copySlot:timer.label');

    const semEvento = select(makeMinimalBrief());
    const contagemSem = semEvento.slots.find((s) => s.slot.id === 'contagem');
    expect(contagemSem?.modules.map((m) => m.type)).toEqual(['text']);
    expect(contagemSem?.modules[0].props.text).toBe(
      'copySlot:contagem.narracao',
    );
  });

  it('memorias prefere timeline + photoBook com brief completo', () => {
    const { slots } = select(makeBrief());
    const memorias = slots.find((s) => s.slot.id === 'memorias');
    expect(memorias?.modules.map((m) => m.type)).toEqual([
      'timeline',
      'photoBook',
    ]);
    const timeline = memorias?.modules[0];
    expect(timeline?.props.items).toEqual([
      {
        id: 'mem-0',
        date: '14/02/2025',
        title: 'o primeiro cinema',
        description: 'a gente perdeu o começo do filme e nem ligou',
      },
      {
        id: 'mem-1',
        date: '',
        title: 'a viagem improvisada',
        description: 'sem reserva, sem roteiro',
      },
    ]);
  });

  it('celebracao é bouquet quando disponível', () => {
    const { slots } = select(makeBrief());
    const celebracao = slots.find((s) => s.slot.id === 'celebracao');
    expect(celebracao?.modules.map((m) => m.type)).toEqual(['bouquet']);
    expect(celebracao?.modules[0].props.message).toBe(
      'copySlot:bouquet.message',
    );
  });

  it('remetente oculto nunca vaza o nome nas props', () => {
    const { slots } = select(makeBrief({ anonimoParaDestinatario: true }));
    const serialized = JSON.stringify(
      slots.flatMap((s) => s.modules.map((m) => m.props)),
    );
    expect(serialized).not.toContain('Theo');
    const envelope = slots
      .flatMap((s) => s.modules)
      .find((m) => m.type === 'envelope');
    expect(envelope?.props.senderName).toBeUndefined();
    expect(envelope?.props.recipientName).toBe('Fernanda');
  });

  it('tema: pixel + cinematografico + retro-os, paleta do brief ou fallback', () => {
    const fallback = dataEspecialFamily.theme(makeMinimalBrief());
    expect(fallback.typography).toBe('pixel');
    expect(fallback.motionIntensity).toBe('cinematografico');
    expect(fallback.atmosphere).toBe('retro-os');
    expect(fallback.palette).toEqual(['#e11d48', '#fff5f7', '#4c0519']);

    const custom = dataEspecialFamily.theme(
      makeBrief({ coresFavoritas: ['#123456', '#abcdef'] }),
    );
    expect(custom.palette).toEqual(['#123456', '#abcdef']);
  });
});

describe('família data_especial — higiene do código', () => {
  it('banco, família e teste não usam tipo any', () => {
    // vitest roda com cwd na raiz do backend (npm test --prefix backend)
    // o pattern é escrito de forma que não casa com o próprio fonte
    const noExplicitAny = /:\s*any\b|as\s+any\b|<\s*any\b/;
    for (const relPath of [
      'src/generate/copy/dataEspecial.ts',
      'src/generate/templates/families/dataEspecial.ts',
      'src/__tests__/generate.dataEspecial.test.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relPath), 'utf8');
      expect(noExplicitAny.test(source), `tipo any em ${relPath}`).toBe(false);
    }
  });
});
