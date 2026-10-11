import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  type CreativeBrief,
  type ModuleType,
} from '../contracts/generation.contract';
import {
  extractFeatures,
  type BriefFeature,
} from '../generate/engine/features';
import {
  selectModules,
  type ModuleContext,
} from '../generate/engine/scoring';
import {
  PEDIDO_NAMORO_COPY,
  PEDIDO_NAMORO_SLOT_LIMITS,
  type PedidoNamoroCopySlot,
} from '../generate/copy/pedidoNamoro';
import { pedidoNamoroFamily } from '../generate/templates/families/pedidoNamoro';

// ─── Fixture de briefs ───────────────────────────────────────────────────────
//
// Importamos a família e o banco diretamente — o registro no registry e o
// roteamento de `decide()` são responsabilidade do orquestrador, então aqui
// a engine é exercitada via `selectModules` com contextos montados à mão.

function makeBrief(overrides: Record<string, unknown> = {}): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'pedido_namoro',
    nomes: { remetente: 'Theo', destinatario: 'Fernanda' },
    ...overrides,
  });
}

const FULL_BRIEF = makeBrief({
  apelidos: ['Nanda'],
  coresFavoritas: ['#f43f5e'],
  memorias: [
    {
      titulo: 'o dia da feira',
      lugar: 'praça central',
      data: '2025-03-14',
      descricao: 'chuva, pastel e a primeira mão dada',
    },
    { titulo: 'a madrugada do portão', data: '2025-06-01' },
  ],
  perguntasIntimidade: [
    {
      pergunta: 'qual foi o primeiro filme que a gente viu junto?',
      resposta: 'o da sessão da tarde',
      dica: 'a gente riu alto demais',
    },
  ],
  evento: { data: '2026-02-14', lugar: 'praça central' },
  midias: {
    fotos: [
      'https://example.com/f1.jpg',
      'https://example.com/f2.jpg',
      'https://example.com/f3.jpg',
    ],
    musicaUrl: 'https://example.com/musica.mp3',
    musicaDedicatoria: 'a que virou nossa sem a gente combinar',
  },
});

const MINIMAL_BRIEF = makeBrief();

function ctxFor(
  brief: CreativeBrief,
  features?: Set<BriefFeature>,
): ModuleContext {
  const resolved = features ?? extractFeatures(brief);
  return { brief, features: resolved, hideSender: resolved.has('anon') };
}

const NO_FORBIDDEN = () => new Set<ModuleType>();

interface SelectionEntry {
  slotId: string;
  types: ModuleType[];
  props: Array<Record<string, unknown>>;
}

function runSelect(ctx: ModuleContext, forbidden = NO_FORBIDDEN()): SelectionEntry[] {
  return selectModules(pedidoNamoroFamily, ctx, forbidden, []).map(
    ({ slot, modules }) => ({
      slotId: slot.id,
      types: modules.map((m) => m.type),
      props: modules.map((m) => m.props),
    }),
  );
}

function slotOf(selection: SelectionEntry[], id: string): SelectionEntry {
  const found = selection.find((entry) => entry.slotId === id);
  expect(found, `slot "${id}" não emitiu módulo`).toBeDefined();
  return found!;
}

// ─── Cobertura de slots ──────────────────────────────────────────────────────
//
// A família marca props de duas formas:
//   { messageSnippet: 'copySlot:envelope.teaser' }  → chave no valor
//   { copySlot: 'hints.intro' }                     → chave na prop literal
// Os ctxs abaixo cobrem os ramos condicionais de props(): remetente nomeado
// e remetente oculto (anon — envelope deixa de emitir senderName).

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, out);
  }
  return out;
}

function collectCopySlotKeys(ctxs: ModuleContext[]): Set<string> {
  const keys = new Set<string>();
  for (const ctx of ctxs) {
    for (const arcSlot of pedidoNamoroFamily.arc) {
      for (const candidate of arcSlot.candidates) {
        const props = candidate.props(ctx);
        for (const [propName, value] of Object.entries(props)) {
          if (propName === 'copySlot' && typeof value === 'string') {
            keys.add(value);
          }
        }
        for (const str of collectStrings(props)) {
          if (str.startsWith('copySlot:')) {
            keys.add(str.slice('copySlot:'.length));
          }
        }
      }
    }
  }
  return keys;
}

const MAXIMAL_CONTEXTS: ModuleContext[] = [
  ctxFor(FULL_BRIEF),
  ctxFor(makeBrief({ ...FULL_BRIEF, anonimoParaDestinatario: true })),
];

function slotEntries(): Array<[PedidoNamoroCopySlot, string[]]> {
  return Object.entries(PEDIDO_NAMORO_COPY) as Array<
    [PedidoNamoroCopySlot, string[]]
  >;
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

// Emoticons ASCII clássicos — proibidos igual emoji (voice-guide).
const EMOTICON_RE = /(:-?\))|(:-?\()|(;-?\))|(=-?\))|(<3)|(:-?D)/i;

// Abreviações de SMS proibidas pelo guia de voz.
const SMS_RE = /\b(vc|pq|tb|tbm|blz|msm|nd|hj|qdo|s2)\b/i;

// Marcador de gênero com parênteses: lindo(a), nervoso(a), sozinho(a).
const GENDER_MARK_RE = /\([oa]s?\)/;

// Meloso genérico proibido: mozão, bb, princesa, etc.
const MUSH_RE =
  /\b(moz[aã]o|bb|princesa|meu anjo|amor da minha vida|luz dos meus olhos|alma g[eê]mea|xuxu|gatinh[oa]|nen[ée]m)\b/i;

// Único placeholder documentado é {nome} (ver header do banco).
const PLACEHOLDER_RE = /\{([^}]*)\}/g;
const NOME_TESTE = 'Fernanda';

function interpolate(text: string): string {
  return text.replaceAll('{nome}', NOME_TESTE);
}

// ─── Testes: família × banco ─────────────────────────────────────────────────

describe('pedido_namoro — banco de copy', () => {
  it('cobre exatamente os slots que a família emite', () => {
    const emitted = collectCopySlotKeys(MAXIMAL_CONTEXTS);
    const banked = new Set<string>(Object.keys(PEDIDO_NAMORO_COPY));
    // família → banco: nenhum slot órfão; banco → família: nenhuma copy morta
    expect(emitted).toEqual(banked);
  });

  it('todo slot emitido existe no banco com 3+ variantes dentro do limite', () => {
    for (const slot of collectCopySlotKeys(MAXIMAL_CONTEXTS)) {
      const variants = PEDIDO_NAMORO_COPY[slot as PedidoNamoroCopySlot];
      expect(variants, `slot "${slot}" sem variantes no banco`).toBeDefined();
      expect(
        variants.length,
        `slot "${slot}" deve ter 3+ variantes, tem ${variants.length}`,
      ).toBeGreaterThanOrEqual(3);
      const limit = PEDIDO_NAMORO_SLOT_LIMITS[slot as PedidoNamoroCopySlot];
      expect(limit, `slot "${slot}" sem limite registrado`).toBeDefined();
      for (const variant of variants) {
        const rendered = interpolate(variant);
        expect(
          rendered.length,
          `"${slot}" excede ${limit} chars (${rendered.length})`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('variantes são únicas dentro de cada slot', () => {
    for (const [slot, variants] of slotEntries()) {
      expect(
        new Set(variants).size,
        `slot "${slot}" tem variante duplicada`,
      ).toBe(variants.length);
    }
  });

  it('zero emoji, emoticon, abreviação de SMS, (a) e meloso genérico', () => {
    for (const [slot, variants] of slotEntries()) {
      for (const variant of variants) {
        expect(EMOJI_RE.test(variant), `emoji em "${slot}": ${variant}`).toBe(false);
        expect(
          EMOTICON_RE.test(variant),
          `emoticon em "${slot}": ${variant}`,
        ).toBe(false);
        expect(
          SMS_RE.test(variant),
          `abreviação SMS em "${slot}": ${variant}`,
        ).toBe(false);
        expect(
          GENDER_MARK_RE.test(variant),
          `marcador (a)/(o) em "${slot}": ${variant}`,
        ).toBe(false);
        expect(
          MUSH_RE.test(variant),
          `meloso genérico em "${slot}": ${variant}`,
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

  it('quiz.pergunta é sempre o pedido — pergunta direta, maioria literal', () => {
    let literais = 0;
    for (const variant of PEDIDO_NAMORO_COPY['quiz.pergunta']) {
      const normalized = interpolate(variant).toLowerCase();
      // nenhuma variante pode ser lead-in vago — toda pergunta termina em "?"
      expect(
        /\?\s*$/.test(normalized),
        `variante do quiz não é pergunta direta: ${variant}`,
      ).toBe(true);
      if (/namora|namoro/.test(normalized)) literais += 1;
    }
    // a maioria nomeia o namoro explicitamente; o resto é paráfrase direta
    // ("topa oficializar isso aqui?", "me deixa te chamar de meu bem...")
    expect(literais).toBeGreaterThanOrEqual(3);
  });

  it('carta.corpo tem estrutura de carta (3+ parágrafos) e carrega o pedido', () => {
    for (const variant of PEDIDO_NAMORO_COPY['carta.corpo']) {
      expect(variant.split('\n\n').length).toBeGreaterThanOrEqual(3);
      expect(/namorar comigo/i.test(variant)).toBe(true);
    }
  });

  it('banco, família e teste não usam `any`', () => {
    const noExplicitAny = /:\s*any\b|as\s+any\b|<\s*any\b/;
    for (const relPath of [
      'src/generate/copy/pedidoNamoro.ts',
      'src/generate/templates/families/pedidoNamoro.ts',
      'src/__tests__/generate.pedidoNamoro.test.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relPath), 'utf8');
      expect(noExplicitAny.test(source), `\`any\` em ${relPath}`).toBe(false);
    }
  });
});

// ─── Testes: arco × scoring ──────────────────────────────────────────────────

describe('pedido_namoro — arco', () => {
  it('brief mínimo emite ≥1 módulo em TODOS os slots do arco', () => {
    const selection = runSelect(ctxFor(MINIMAL_BRIEF));
    expect(selection).toHaveLength(pedidoNamoroFamily.arc.length);
    for (const arcSlot of pedidoNamoroFamily.arc) {
      const entry = slotOf(selection, arcSlot.id);
      expect(
        entry.types.length,
        `slot "${arcSlot.id}" ficou vazio no brief mínimo`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('brief mínimo compõe o arco completo: envelope → narrativa → quiz → carta → buquê', () => {
    const selection = runSelect(ctxFor(MINIMAL_BRIEF));
    expect(slotOf(selection, 'abertura').types).toEqual(['envelope']);
    expect(slotOf(selection, 'narrativa').types).toEqual(['text']);
    expect(slotOf(selection, 'memorias').types).toEqual(['text']);
    expect(slotOf(selection, 'pergunta').types).toEqual(['quiz']);
    expect(slotOf(selection, 'carta').types).toEqual(['text']);
    expect(slotOf(selection, 'celebracao').types).toEqual(['bouquet']);
  });

  it('o slot pergunta SEMPRE emite um quiz quando jogos são permitidos', () => {
    const briefs: CreativeBrief[] = [
      MINIMAL_BRIEF,
      FULL_BRIEF,
      makeBrief({ midias: { fotos: ['https://example.com/f.jpg'] } }),
      makeBrief({
        perguntasIntimidade: [{ pergunta: 'q?', resposta: 'a' }],
      }),
      makeBrief({ evento: { data: '2026-02-14' } }),
    ];
    for (const b of briefs) {
      const pergunta = slotOf(runSelect(ctxFor(b)), 'pergunta');
      expect(pergunta.types).toContain('quiz');
      const quiz = pergunta.props[pergunta.types.indexOf('quiz')];
      expect(quiz.question).toBe('copySlot:quiz.pergunta');
      expect(quiz.isPlayfulNo).toBe(true);
    }
  });

  it('sem jogos permitidos a pergunta sobrevive: gate com intimidade, texto sem', () => {
    const noJogos = new Set<ModuleType>(['quiz', 'intimacyGate', 'scratch']);

    const comIntimidade = runSelect(
      ctxFor(
        makeBrief({
          perguntasIntimidade: [{ pergunta: 'q?', resposta: 'a' }],
        }),
      ),
      new Set<ModuleType>(['quiz', 'scratch']),
    );
    expect(slotOf(comIntimidade, 'pergunta').types).toEqual(['intimacyGate']);

    const semNada = runSelect(ctxFor(MINIMAL_BRIEF), noJogos);
    expect(slotOf(semNada, 'pergunta').types).toEqual(['text']);
  });

  it('memorias: timeline só com hasMemorias, fotos só com hasFotos', () => {
    const PHOTO_TYPES: ModuleType[] = ['gallery', 'photoBook', 'polaroid'];

    const semMidia = slotOf(runSelect(ctxFor(MINIMAL_BRIEF)), 'memorias');
    expect(semMidia.types).toEqual(['text']);

    const soMemorias = runSelect(
      ctxFor(makeBrief({ memorias: [{ titulo: 'o dia da feira' }] })),
    );
    const slotMemorias = slotOf(soMemorias, 'memorias');
    expect(slotMemorias.types).toContain('timeline');
    for (const type of PHOTO_TYPES) {
      expect(slotMemorias.types).not.toContain(type);
    }
    expect(slotMemorias.types).not.toContain('music');

    const soFotos = runSelect(
      ctxFor(makeBrief({ midias: { fotos: ['https://example.com/f.jpg'] } })),
    );
    const slotFotos = slotOf(soFotos, 'memorias');
    expect(slotFotos.types).not.toContain('timeline');
    expect(slotFotos.types).not.toContain('music');
    expect(
      slotFotos.types.some((t) => PHOTO_TYPES.includes(t)),
      'memorias com fotos deve emitir gallery/photoBook/polaroid',
    ).toBe(true);

    const soMusica = runSelect(
      ctxFor(
        makeBrief({ midias: { musicaUrl: 'https://example.com/m.mp3' } }),
      ),
    );
    const slotMusica = slotOf(soMusica, 'memorias');
    expect(slotMusica.types).toContain('music');
    expect(slotMusica.types).not.toContain('timeline');
  });

  it('timeline mapeia brief.memorias para items persistidos', () => {
    const selection = runSelect(ctxFor(FULL_BRIEF));
    const memorias = slotOf(selection, 'memorias');
    const timeline = memorias.props[memorias.types.indexOf('timeline')];
    const items = timeline.items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: 'memoria-0',
      date: '2025-03-14',
      title: 'o dia da feira',
    });
    expect(items[0].description).toContain('praça central');
    expect(items[1].date).toBe('2025-06-01');
  });

  it('celebracao ancora no buquê e soma RSVP quando há evento', () => {
    const semEvento = slotOf(runSelect(ctxFor(MINIMAL_BRIEF)), 'celebracao');
    expect(semEvento.types).toEqual(['bouquet']);
    expect(semEvento.props[0].ribbonColor).toBe('#e11d48');
    expect(semEvento.props[0].message).toBe('copySlot:bouquet.message');

    const comEvento = slotOf(runSelect(ctxFor(FULL_BRIEF)), 'celebracao');
    expect(comEvento.types[0]).toBe('bouquet');
    expect(comEvento.types).toContain('ticketRsvp');
    // ribbon personalizado vem de coresFavoritas[0]
    expect(comEvento.props[0].ribbonColor).toBe('#f43f5e');
  });

  it('envelope oculta o remetente no modo anônimo', () => {
    const anon = runSelect(ctxFor(makeBrief({ anonimoParaDestinatario: true })));
    const envelope = slotOf(anon, 'abertura').props[0];
    expect(envelope.senderName).toBeUndefined();
    expect(envelope.recipientName).toBe('Fernanda');
    expect(JSON.stringify(envelope)).not.toContain('Theo');
  });

  it('família declara tema cinematográfico retro-os', () => {
    const theme = pedidoNamoroFamily.theme(MINIMAL_BRIEF);
    expect(theme.typography).toBe('pixel');
    expect(theme.motionIntensity).toBe('cinematografico');
    expect(theme.atmosphere).toBe('retro-os');
    expect(theme.palette).toEqual(['#e11d48', '#fff5f7', '#4c0519']);
  });
});
