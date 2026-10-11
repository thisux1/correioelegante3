import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  pageSpecSchema,
  MOMENTO_VALUES,
  PAGE_SPEC_VERSION,
} from '../contracts/generation.contract';

const minimalBrief = {
  momento: 'crush_secreto',
  nomes: { destinatario: 'Duda' },
};

const validSpec = {
  version: PAGE_SPEC_VERSION,
  templateFamily: 'crush_secreto/misterio-leve',
  theme: {
    palette: ['#e11d48', '#fff5f7'],
    typography: 'pixel',
    motionIntensity: 'expressivo',
  },
  sections: [
    {
      id: 'abertura',
      layout: 'stack',
      modules: [
        { type: 'envelope', props: { sealed: true } },
        { type: 'text', props: { text: 'oi' }, rect: { col: 1, row: 1, w: 12, h: 2 } },
      ],
    },
  ],
  decisions: ['L0:anonimo=false → remetente pode aparecer'],
};

describe('creativeBriefSchema', () => {
  it('parses a minimal brief and applies defaults', () => {
    const brief = creativeBriefSchema.parse(minimalBrief);
    expect(brief.momento).toBe('crush_secreto');
    expect(brief.apelidos).toEqual([]);
    expect(brief.anonimoParaDestinatario).toBe(false);
    expect(brief.memorias).toEqual([]);
    expect(brief.midias.fotos).toEqual([]);
  });

  it('accepts every declared momento', () => {
    for (const momento of MOMENTO_VALUES) {
      expect(() =>
        creativeBriefSchema.parse({ ...minimalBrief, momento }),
      ).not.toThrow();
    }
  });

  it('rejects unknown momento and invalid hex color', () => {
    expect(() =>
      creativeBriefSchema.parse({ ...minimalBrief, momento: 'casamento' }),
    ).toThrow();
    expect(() =>
      creativeBriefSchema.parse({
        ...minimalBrief,
        coresFavoritas: ['rosa'],
      }),
    ).toThrow();
  });

  it('keeps optional research-driven fields optional', () => {
    const brief = creativeBriefSchema.parse({
      ...minimalBrief,
      memorias: [{ titulo: 'Primeiro café', lugar: 'Bem-Te-Vi' }],
      perguntasIntimidade: [
        { pergunta: 'O que tinha na xícara?', resposta: 'cappuccino' },
      ],
    });
    expect(brief.memorias).toHaveLength(1);
    expect(brief.perguntasIntimidade[0].resposta).toBe('cappuccino');
  });
});

describe('pageSpecSchema', () => {
  it('parses a valid spec', () => {
    const spec = pageSpecSchema.parse(validSpec);
    expect(spec.sections).toHaveLength(1);
    expect(spec.sections[0].modules[1].rect?.w).toBe(12);
    expect(spec.theme.typography).toBe('pixel');
  });

  it('rejects wrong version, empty sections, and out-of-bounds rect', () => {
    expect(() =>
      pageSpecSchema.parse({ ...validSpec, version: 2 }),
    ).toThrow();
    expect(() =>
      pageSpecSchema.parse({ ...validSpec, sections: [] }),
    ).toThrow();
    expect(() =>
      pageSpecSchema.parse({
        ...validSpec,
        sections: [
          {
            id: 's',
            modules: [
              { type: 'text', rect: { col: 0, row: 1, w: 30, h: 1 } },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects unknown module types so the compiler sees only known types', () => {
    expect(() =>
      pageSpecSchema.parse({
        ...validSpec,
        sections: [{ id: 's', modules: [{ type: 'hologram' }] }],
      }),
    ).toThrow();
  });
});
