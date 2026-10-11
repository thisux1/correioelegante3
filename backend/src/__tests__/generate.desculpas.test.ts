import { describe, expect, it } from 'vitest';
import { creativeBriefSchema } from '../contracts/generation.contract';
import { extractFeatures, type BriefFeature } from '../generate/engine/features';
import {
  selectModules,
  type ModuleContext,
} from '../generate/engine/scoring';
import {
  DESCULPAS_COPY,
  DESCULPAS_SLOT_LIMITS,
} from '../generate/copy/desculpas';
import { desculpasFamily } from '../generate/templates/families/desculpas';

const COPY_SLOT_PREFIX = 'copySlot:';

/** Nome de ~14 chars — a folga que o guia pede pra interpolação de `{nome}`. */
const LONG_NAME = 'Maria Fernanda';

const brief = (overrides: Record<string, unknown> = {}) =>
  creativeBriefSchema.parse({
    momento: 'desculpas',
    nomes: { remetente: 'Rafa', destinatario: 'Duda' },
    ...overrides,
  });

const minimalBrief = creativeBriefSchema.parse({
  momento: 'desculpas',
  nomes: { destinatario: 'Duda' },
});

const richBrief = brief({
  apelidos: ['Duds'],
  tom: 'vulneravel',
  coresFavoritas: ['#701a35', '#fecdd3'],
  interesses: ['fotografia'],
  contexto: 'briguei feio e sumi por dias',
  memorias: [
    {
      titulo: 'Tarde no pátio',
      lugar: 'escola',
      data: '2024-05',
      descricao: 'rindo de nada até o sinal bater',
    },
  ],
  perguntasIntimidade: [{ pergunta: 'p?', resposta: 'r', dica: 'd' }],
  evento: { data: '2030-01-01', lugar: 'praça', descricao: 'encontro' },
  midias: {
    fotos: [
      'https://cdn.example.com/1.jpg',
      'https://cdn.example.com/2.jpg',
      'https://cdn.example.com/3.jpg',
      'https://cdn.example.com/4.jpg',
      'https://cdn.example.com/5.jpg',
      'https://cdn.example.com/6.jpg',
      'https://cdn.example.com/7.jpg',
      'https://cdn.example.com/8.jpg',
    ],
    musicaUrl: 'https://youtu.be/abc',
    musicaDedicatoria: 'a que a gente cantarolava',
  },
});

const richBriefSemDedicatoria = brief({
  midias: {
    fotos: ['https://cdn.example.com/1.jpg'],
    musicaUrl: 'https://youtu.be/abc',
  },
});

const ctxFor = (
  ctxBrief: typeof minimalBrief,
  hideSender = false,
): ModuleContext => ({
  brief: ctxBrief,
  features: extractFeatures(ctxBrief),
  hideSender,
});

/** Recolhe toda string `copySlot:*` em props, em qualquer profundidade. */
function collectCopySlots(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    if (value.startsWith(COPY_SLOT_PREFIX)) {
      found.add(value.slice(COPY_SLOT_PREFIX.length));
    }
    return found;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectCopySlots(item, found);
    return found;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectCopySlots(item, found);
  }
  return found;
}

const ALL_CONTEXTS: ModuleContext[] = [
  ctxFor(minimalBrief),
  ctxFor(richBrief),
  ctxFor(richBriefSemDedicatoria),
  ctxFor(richBrief, true), // remetente oculto
];

const PLAYFUL_TYPES = new Set([
  'quiz',
  'scratch',
  'hints',
  'intimacyGate',
  'hiddenNotes',
]);

describe('desculpas — banco de copy', () => {
  it('todo copySlot emitido por qualquer candidate existe no banco com ≥3 variantes dentro do limite', () => {
    const emitted = new Set<string>();
    for (const ctx of ALL_CONTEXTS) {
      for (const slot of desculpasFamily.arc) {
        for (const candidate of slot.candidates) {
          for (const key of collectCopySlots(candidate.props(ctx))) {
            emitted.add(key);
          }
        }
      }
    }

    expect(emitted.size).toBeGreaterThan(0);
    for (const key of emitted) {
      const variants = DESCULPAS_COPY[key as keyof typeof DESCULPAS_COPY];
      const limit = DESCULPAS_SLOT_LIMITS[key as keyof typeof DESCULPAS_SLOT_LIMITS];
      expect(variants, `slot "${key}" ausente no banco`).toBeDefined();
      expect(limit, `slot "${key}" sem limite`).toBeDefined();
      expect(variants.length, `slot "${key}" com menos de 3 variantes`).toBeGreaterThanOrEqual(3);
      for (const variant of variants) {
        const interpolated = variant.replaceAll('{nome}', LONG_NAME);
        expect(
          interpolated.length,
          `variante de "${key}" estoura ${limit} chars: "${variant}"`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('todo slot do banco é alcançável por algum ctx — nada de copy morta', () => {
    const emitted = new Set<string>();
    for (const ctx of ALL_CONTEXTS) {
      for (const slot of desculpasFamily.arc) {
        for (const candidate of slot.candidates) {
          for (const key of collectCopySlots(candidate.props(ctx))) {
            emitted.add(key);
          }
        }
      }
    }
    for (const key of Object.keys(DESCULPAS_COPY)) {
      expect(emitted.has(key), `slot "${key}" nunca é emitido`).toBe(true);
    }
  });

  it('nenhuma variante usa emoji, emoticon, abreviação de SMS ou marcador (a)', () => {
    const EMOJI =
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}]|❤|♥|✨|💌|\uFE0F/u;
    const EMOTICON = /(:-?[)D(Pp]|;-?[)D]|<3|=?\){2,}|=\))/;
    const SMS_ABBREV = /\b(vc|pq|tb|tbm|blz|msm|nd|hj|qdo|s2)\b/i;
    const GENDER_MARKER = /\((?:a|o)\)/i;

    for (const [key, variants] of Object.entries(DESCULPAS_COPY)) {
      for (const variant of variants) {
        expect(variant, `emoji/emoticon em "${key}"`).not.toMatch(EMOJI);
        expect(variant, `emoticon em "${key}"`).not.toMatch(EMOTICON);
        expect(variant, `abreviação SMS em "${key}"`).not.toMatch(SMS_ABBREV);
        expect(variant, `marcador (a) em "${key}"`).not.toMatch(GENDER_MARKER);
      }
    }
  });

  it('desculpa não vira cobrança: sem pedir perdão, sem pressa, sem meloso', () => {
    const PRESSAO =
      /\b(perdoa|perdoe|me perdoa|responde logo|me responde|última chance|agora vai|me dá uma chance)\b/i;
    const MELOSO =
      /\b(meu anjo|princesa|mozão|bb|xuxu|neném|alma gêmea|amor da minha vida|luz dos meus olhos|gatinho)\b/i;

    for (const [key, variants] of Object.entries(DESCULPAS_COPY)) {
      for (const variant of variants) {
        expect(variant, `pressão/cobrança em "${key}"`).not.toMatch(PRESSAO);
        expect(variant, `meloso genérico em "${key}"`).not.toMatch(MELOSO);
      }
    }
  });

  it('carta.corpo tem 3 a 4 parágrafos em cada variante', () => {
    for (const variant of DESCULPAS_COPY['carta.corpo']) {
      const paragraphs = variant.split('\n\n');
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(paragraphs.length).toBeLessThanOrEqual(4);
    }
  });
});

describe('desculpas — arco da família', () => {
  it('brief mínimo ainda preenche todo slot do arco com ≥1 módulo', () => {
    const notes: string[] = [];
    const slots = selectModules(
      desculpasFamily,
      { brief: minimalBrief, features: new Set<BriefFeature>(), hideSender: false },
      new Set(),
      notes,
    );

    for (const arcSlot of desculpasFamily.arc) {
      const found = slots.find((s) => s.slot.id === arcSlot.id);
      expect(found, `slot "${arcSlot.id}" ficou vazio`).toBeDefined();
      expect(found!.modules.length).toBeGreaterThanOrEqual(1);
    }
    expect(slots.length).toBe(desculpasFamily.arc.length);
    expect(notes.join(' ')).not.toContain('sem candidato elegível');
  });

  it('nunca emite mecânica lúdica — nem declarada, nem com brief riquíssimo', () => {
    // O arco nem sequer declara esses tipos.
    const declaredTypes = desculpasFamily.arc.flatMap((slot) =>
      slot.candidates.map((candidate) => candidate.type),
    );
    for (const type of declaredTypes) {
      expect(PLAYFUL_TYPES.has(type)).toBe(false);
    }

    // E mesmo com todos os features ligados e zero forbidden do L0, nada lúdico sai.
    const slots = selectModules(
      desculpasFamily,
      ctxFor(richBrief),
      new Set(),
      [],
    );
    const emittedTypes = slots.flatMap((s) => s.modules.map((m) => m.type));
    for (const type of emittedTypes) {
      expect(PLAYFUL_TYPES.has(type)).toBe(false);
    }
  });

  it('memorias prefere mídia quando existe e cai pro texto quando não', () => {
    const withMedia = selectModules(desculpasFamily, ctxFor(richBrief), new Set(), []);
    const memorias = withMedia.find((s) => s.slot.id === 'memorias');
    expect(memorias!.modules[0].type).toBe('gallery');

    const minimal = selectModules(
      desculpasFamily,
      { brief: minimalBrief, features: new Set<BriefFeature>(), hideSender: false },
      new Set(),
      [],
    );
    const fallback = minimal.find((s) => s.slot.id === 'memorias');
    expect(fallback!.modules[0].type).toBe('text');
    expect(fallback!.modules[0].props.text).toBe('copySlot:memorias.legenda');
  });

  it('envelope esconde o remetente quando hideSender está ligado', () => {
    const envelope = desculpasFamily.arc[0].candidates[0];
    const visible = envelope.props(ctxFor(richBrief));
    expect(visible.senderName).toBe('Rafa');

    const hidden = envelope.props(ctxFor(richBrief, true));
    expect(hidden.senderName).toBeUndefined();
    expect(JSON.stringify(hidden)).not.toContain('Rafa');
  });

  it('tema trava tom sóbrio: serifada, sutil, paleta fechada', () => {
    const theme = desculpasFamily.theme(minimalBrief);
    expect(theme.typography).toBe('serifada');
    expect(theme.motionIntensity).toBe('sutil');
    expect(theme.atmosphere).toBe('carta-sincera');
    expect(theme.palette).toEqual(['#881337', '#fff5f7', '#4c0519']);

    const themed = desculpasFamily.theme(richBrief);
    expect(themed.palette).toEqual(richBrief.coresFavoritas.slice(0, 4));
    expect(themed.motionIntensity).toBe('sutil');
  });
});
