import { describe, expect, it } from 'vitest';
import { creativeBriefSchema } from '../contracts/generation.contract';
import { ANONIMO_COPY, ANONIMO_SLOT_LIMITS } from '../generate/copy/anonimo';
import { extractFeatures } from '../generate/engine/features';
import { applyHardRules } from '../generate/engine/rules';
import { selectModules, type ModuleContext } from '../generate/engine/scoring';
import { anonimoFamily } from '../generate/templates/families/anonimo';

const SLOT_PREFIX = 'copySlot:';
/** Reserva de ~12 chars para `{nome}` ao medir limites no texto final. */
const NOME_PAD = 'X'.repeat(12);

const maximalBrief = () =>
  creativeBriefSchema.parse({
    momento: 'anonimo',
    nomes: { remetente: 'Rafa', destinatario: 'Duda' },
    apelidos: ['Duds', 'Du', 'Dudinha'],
    tom: 'misterioso',
    coresFavoritas: ['#be123c'],
    interesses: ['música', 'fotografia'],
    memorias: [
      {
        titulo: 'a feira de ciências',
        lugar: 'ginásio',
        data: 'junho de 2024',
        descricao: 'a barraca 7 que deu tudo certo',
      },
    ],
    perguntasIntimidade: [
      { pergunta: 'O que tinha na xícara?', resposta: 'cappuccino', dica: 'quente' },
    ],
    evento: { data: 'sábado', lugar: 'pátio', descricao: 'depois da aula' },
    midias: {
      fotos: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
      musicaUrl: 'https://youtu.be/abc',
      musicaDedicatoria: 'a música do intervalo',
    },
  });

/** Ctxs máximos: hideSender true E false, com e sem remetente no brief. */
const EVERY_PROPS_CTX: ModuleContext[] = (() => {
  const full = maximalBrief();
  const noSender = creativeBriefSchema.parse({
    ...maximalBrief(),
    nomes: { destinatario: 'Duda' },
  });
  return [
    { brief: full, features: extractFeatures(full), hideSender: true },
    { brief: full, features: extractFeatures(full), hideSender: false },
    { brief: noSender, features: extractFeatures(noSender), hideSender: false },
  ];
})();

function allCandidateProps(ctx: ModuleContext): Array<Record<string, unknown>> {
  return anonimoFamily.arc.flatMap((slot) =>
    slot.candidates.map((candidate) => candidate.props(ctx)),
  );
}

function collectCopySlots(value: unknown, found: Set<string>): void {
  if (typeof value === 'string') {
    if (value.startsWith(SLOT_PREFIX)) {
      found.add(value.slice(SLOT_PREFIX.length));
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectCopySlots(v, found));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectCopySlots(v, found));
  }
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
}

describe('anonimo family — copy bank coverage', () => {
  it('resolve family id no namespace anonimo/', () => {
    expect(anonimoFamily.id).toMatch(/^anonimo\/.+/);
  });

  it('todo copySlot:* emitido por qualquer candidato existe no banco, com ≥3 variantes dentro do limite', () => {
    const slots = new Set<string>();
    for (const ctx of EVERY_PROPS_CTX) {
      for (const props of allCandidateProps(ctx)) {
        collectCopySlots(props, slots);
      }
    }

    expect(slots.size).toBeGreaterThan(0);
    for (const key of slots) {
      const variants = ANONIMO_COPY[key as keyof typeof ANONIMO_COPY];
      expect(variants, `banco sem a chave "${key}"`).toBeDefined();
      expect(
        variants.length,
        `slot "${key}" precisa de ≥3 variantes`,
      ).toBeGreaterThanOrEqual(3);

      const limit = ANONIMO_SLOT_LIMITS[key as keyof typeof ANONIMO_SLOT_LIMITS];
      expect(limit, `sem limite registrado para "${key}"`).toBeGreaterThan(0);
      for (const variant of variants) {
        const interpolated = variant.replaceAll('{nome}', NOME_PAD);
        expect(
          interpolated.length,
          `variante de "${key}" passa de ${limit} chars: "${interpolated}"`,
        ).toBeLessThanOrEqual(limit);
      }
    }
  });
});

describe('anonimo copy — guia de voz', () => {
  const FORBIDDEN: Array<{ name: string; re: RegExp }> = [
    {
      name: 'emoji',
      re: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]|\uFE0F/u,
    },
    {
      name: 'emoticon',
      re: /(<3|:-?[)D(P]|;-?\)|[=:]\)|\(=|\bxd\b|T_T|\^\^)/i,
    },
    {
      name: 'abreviação de SMS',
      re: /\b(vc|pq|tb|tbm|blz|msm|nd|hj|qdo|s2|qnd|kd|mto|td|pfv?|dps)\b/i,
    },
    { name: 'marcador de gênero com parênteses', re: /\((a|o|as|os|e|es)\)/i },
    {
      name: 'meloso genérico',
      re: /(meu anjo|princesa|amor da minha vida|luz dos meus olhos|alma g[êe]mea|moz[ãa]o|xuxu|nen[ée]m|gatinh[oa]|\bbb\b)/i,
    },
  ];

  const RETRO_2000S = /\b(scraps?|depoimentos?|orkut|msn|fotolog|lan house|add)\b/gi;

  it('nenhuma variante tem emoji, emoticon, SMS-abbrev, (a) ou meloso genérico', () => {
    for (const [key, variants] of Object.entries(ANONIMO_COPY)) {
      for (const variant of variants) {
        for (const { name, re } of FORBIDDEN) {
          expect(re.test(variant), `"${key}" contém ${name}: "${variant}"`).toBe(
            false,
          );
        }
      }
    }
  });

  it('no máximo uma referência anos-2000 por peça', () => {
    for (const [key, variants] of Object.entries(ANONIMO_COPY)) {
      for (const variant of variants) {
        const refs = variant.match(RETRO_2000S) ?? [];
        expect(
          refs.length,
          `"${key}" empilha referências 2000s: "${variant}"`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('anonimo family — arc integrity', () => {
  it('brief mínimo ainda produz ≥1 módulo em todo slot do arco', () => {
    const brief = creativeBriefSchema.parse({
      momento: 'anonimo',
      nomes: { destinatario: 'Duda' },
    });
    const features = extractFeatures(brief);
    const { forbidden, hideSender } = applyHardRules(brief, features);
    expect(hideSender).toBe(true);

    const notes: string[] = [];
    const slots = selectModules(
      anonimoFamily,
      { brief, features, hideSender },
      forbidden,
      notes,
    );

    expect(slots).toHaveLength(anonimoFamily.arc.length);
    for (const { slot, modules } of slots) {
      expect(
        modules.length,
        `slot "${slot.id}" ficou vazio com brief mínimo`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('hideSender=true: nenhum prop emitido contém o nome do remetente', () => {
    const brief = maximalBrief();
    const ctx: ModuleContext = {
      brief,
      features: extractFeatures(brief),
      hideSender: true,
    };
    const remetente = brief.nomes.remetente!;

    for (const props of allCandidateProps(ctx)) {
      const strings: string[] = [];
      collectStrings(props, strings);
      for (const s of strings) {
        expect(s, `prop vaza remetente em "${s}"`).not.toContain(remetente);
      }
    }
  });
});
