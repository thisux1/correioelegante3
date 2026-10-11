import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  type CreativeBrief,
} from '../contracts/generation.contract';
import type { BriefFeature } from '../generate/engine/features';
import type { ModuleContext } from '../generate/engine/scoring';
import {
  CRUSH_SECRETO_COPY,
  CRUSH_SECRETO_SLOT_LIMITS,
  type CrushSecretoCopySlot,
} from '../generate/copy/crushSecreto';
import { crushSecretoFamily } from '../generate/templates/families/crushSecreto';

// ─── Cobertura de slots ──────────────────────────────────────────────────────
//
// A família marca props de duas formas:
//   { messageSnippet: 'copySlot:envelope.teaser' }  → chave no valor
//   { copySlot: 'hints.intro' }                     → chave na prop literal
// Os três ctx abaixo cobrem os ramos condicionais de props(): remetente
// nomeado, remetente oculto (anon) e ausência de remetente (fallback).

const ALL_FEATURES = new Set<BriefFeature>([
  'anon',
  'hasFotos',
  'hasMemorias',
  'hasMusica',
  'hasEvento',
  'hasIntimidade',
]);

function makeBrief(overrides: Record<string, unknown> = {}): CreativeBrief {
  return creativeBriefSchema.parse({
    momento: 'crush_secreto',
    nomes: { remetente: 'Theo', destinatario: 'Fernanda' },
    apelidos: ['Nanda', 'Fê'],
    perguntasIntimidade: [
      {
        pergunta: 'Qual o nome do meu primeiro cachorro?',
        resposta: 'Totó',
        dica: 'era de pelúcia',
      },
    ],
    evento: { data: '2026-02-14', lugar: 'praça central' },
    midias: {
      fotos: ['https://example.com/foto.jpg'],
      musicaUrl: 'https://example.com/musica.mp3',
      musicaDedicatoria: 'a que tocava na lan house',
    },
    ...overrides,
  });
}

const CONTEXTS: ModuleContext[] = [
  // remetente nomeado → secretText vira o nome (não cobre slot)
  { brief: makeBrief(), features: ALL_FEATURES, hideSender: false },
  // anônimo → secretText = 'copySlot:scratch.secret.anon'
  {
    brief: makeBrief({ anonimoParaDestinatario: true }),
    features: ALL_FEATURES,
    hideSender: true,
  },
  // sem remetente → secretText = 'copySlot:scratch.secret.fallback'
  {
    brief: makeBrief({ nomes: { destinatario: 'Fernanda' } }),
    features: ALL_FEATURES,
    hideSender: false,
  },
];

function collectCopySlotKeys(): Set<string> {
  const keys = new Set<string>();
  for (const ctx of CONTEXTS) {
    for (const arcSlot of crushSecretoFamily.arc) {
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

// Único placeholder documentado é {nome} (ver header do banco).
const PLACEHOLDER_RE = /\{([^}]*)\}/g;
const NOME_TESTE = 'Fernanda';

function interpolate(text: string): string {
  return text.replaceAll('{nome}', NOME_TESTE);
}

function slotEntries(): Array<[CrushSecretoCopySlot, string[]]> {
  return Object.entries(CRUSH_SECRETO_COPY) as Array<
    [CrushSecretoCopySlot, string[]]
  >;
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('banco de copy — crush_secreto', () => {
  it('cobre exatamente os slots que a família emite', () => {
    const emitted = collectCopySlotKeys();
    const banked = new Set<string>(Object.keys(CRUSH_SECRETO_COPY));
    // família → banco: nenhum slot órfão; banco → família: nenhuma copy morta
    expect(emitted).toEqual(banked);
  });

  it('todo slot tem entre 4 e 6 variantes, sem repetição', () => {
    for (const [slot, variants] of slotEntries()) {
      expect(
        variants.length,
        `slot "${slot}" deve ter 4-6 variantes, tem ${variants.length}`,
      ).toBeGreaterThanOrEqual(4);
      expect(variants.length).toBeLessThanOrEqual(6);
      expect(
        new Set(variants).size,
        `slot "${slot}" tem variante duplicada`,
      ).toBe(variants.length);
    }
  });

  it('toda variante respeita o limite de caracteres do slot (após interpolação)', () => {
    for (const [slot, variants] of slotEntries()) {
      const limit = CRUSH_SECRETO_SLOT_LIMITS[slot];
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
        expect(EMOJI_RE.test(variant), `emoji em "${slot}": ${variant}`).toBe(
          false,
        );
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
    for (const variant of CRUSH_SECRETO_COPY['carta.corpo']) {
      expect(variant.split('\n\n').length).toBeGreaterThanOrEqual(3);
    }
  });

  it('banco e teste não usam `any`', () => {
    // vitest roda com cwd na raiz do backend (npm test --prefix backend)
    // o pattern é escrito de forma que não casa com o próprio fonte
    const noExplicitAny = /:\s*any\b|as\s+any\b|<\s*any\b/;
    for (const relPath of [
      'src/generate/copy/crushSecreto.ts',
      'src/__tests__/copy.crushSecreto.test.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relPath), 'utf8');
      expect(noExplicitAny.test(source), `\`any\` em ${relPath}`).toBe(false);
    }
  });
});
