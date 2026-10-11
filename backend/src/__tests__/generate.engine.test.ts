import { describe, expect, it } from 'vitest';
import {
  creativeBriefSchema,
  pageSpecSchema,
} from '../contracts/generation.contract';
import { decide } from '../generate/engine';
import { compilePageSpec } from '../generate/compile';
import { resolveFamily } from '../generate/templates/registry';
import { migratePage } from '../services/page.migration';

const brief = (overrides: Record<string, unknown> = {}) =>
  creativeBriefSchema.parse({
    momento: 'crush_secreto',
    nomes: { remetente: 'Rafa', destinatario: 'Duda' },
    ...overrides,
  });

function blockProps(spec: ReturnType<typeof decide>): Array<Record<string, unknown>> {
  return spec.sections.flatMap((s) => s.modules.map((m) => m.props));
}

describe('engine — decide()', () => {
  it('emits a PageSpec that passes contract validation', () => {
    const spec = decide(brief());
    expect(() => pageSpecSchema.parse(spec)).not.toThrow();
    expect(spec.templateFamily).toBe('crush_secreto/misterio-leve');
    expect(spec.decisions.length).toBeGreaterThan(0);
  });

  it('anon brief never exposes the sender name in any module props', () => {
    const spec = decide(
      brief({ anonimoParaDestinatario: true, nomes: { remetente: 'Rafa', destinatario: 'Duda' } }),
    );
    const serialized = JSON.stringify(blockProps(spec));
    expect(serialized).not.toContain('Rafa');
    expect(spec.decisions.join(' ')).toContain('L0:anon');
  });

  it('desculpas forbids playful modules', () => {
    const spec = decide(brief({ momento: 'desculpas' }));
    const types = spec.sections.flatMap((s) => s.modules.map((m) => m.type));
    expect(types).not.toContain('quiz');
    expect(types).not.toContain('intimacyGate');
    expect(types).not.toContain('scratch');
  });

  it('restricao "sem fotos" removes photo-dependent modules', () => {
    const spec = decide(
      brief({
        restricoes: ['sem fotos'],
        midias: { fotos: ['a.jpg', 'b.jpg'] },
      }),
    );
    const types = spec.sections.flatMap((s) => s.modules.map((m) => m.type));
    expect(types).not.toContain('gallery');
    expect(types).not.toContain('polaroid');
  });

  it('intimidade answers surface an intimacyGate when provided', () => {
    const spec = decide(
      brief({
        perguntasIntimidade: [
          { pergunta: 'O que tinha na xícara?', resposta: 'cappuccino', dica: 'quente' },
        ],
      }),
    );
    const types = spec.sections.flatMap((s) => s.modules.map((m) => m.type));
    expect(types).toContain('intimacyGate');
  });

  it('hints só entra com apelidos — nunca um bloco vazio', () => {
    const without = decide(brief({}));
    expect(without.sections.flatMap((s) => s.modules.map((m) => m.type))).not.toContain('hints');

    const withApelidos = decide(brief({ apelidos: ['Duds'] }));
    const hintsModule = withApelidos.sections
      .flatMap((s) => s.modules)
      .find((m) => m.type === 'hints');
    expect(hintsModule).toBeDefined();
    expect(hintsModule!.props.items).toEqual(['Duds']);
  });

  it('resolveFamily falls back to crush_secreto for momentos without a family', () => {
    // All MOMENTO_VALUES have families post-S8 — the fallback only fires for
    // future momentos the enum gains before arcs land. Cast simulates that
    // (decide() can't reach it: the brief schema rejects unknown momentos).
    const { family, fallback } = resolveFamily('momento_futuro' as never);
    expect(fallback).toBe(true);
    expect(family.id).toBe('crush_secreto/misterio-leve');
  });
});

describe('compilePageSpec()', () => {
  it('compiles to persisted content that survives migratePage round-trip', () => {
    const spec = decide(
      brief({
        midias: { fotos: ['x.jpg'], musicaUrl: 'https://youtu.be/abc' },
        perguntasIntimidade: [{ pergunta: 'q?', resposta: 'a' }],
      }),
    );
    const { content, notes } = compilePageSpec(spec);
    const migrated = migratePage(content);

    expect(migrated.blocks.length).toBe(content.blocks.length);
    expect(migrated.version).toBe(1);
    for (const block of migrated.blocks) {
      expect(block.id).toBeTruthy();
      expect(block.meta.createdAt).toBeGreaterThan(0);
    }
    // intimacyGate is persisted now — compiles to the real block, spec props
    // adapted (answer singular → answers list).
    const gate = migrated.blocks.find((b) => b.type === 'intimacyGate');
    expect(gate).toBeDefined();
    expect(gate!.props.answers).toEqual(['a']);
    expect(notes.join(' ')).not.toContain('intimacyGate →');
  });

  it('orders rect modules row-major inside their section', () => {
    const spec = pageSpecSchema.parse({
      version: 1,
      templateFamily: 'test',
      theme: { palette: [], typography: 'pixel', motionIntensity: 'sutil' },
      sections: [
        {
          id: 's',
          layout: 'grid',
          modules: [
            { type: 'text', props: { text: 'b' }, rect: { col: 1, row: 2, w: 6, h: 1 } },
            { type: 'text', props: { text: 'a' }, rect: { col: 1, row: 1, w: 6, h: 1 } },
          ],
        },
      ],
    });
    const { content } = compilePageSpec(spec);
    expect(content.blocks[0].props.text).toBe('a');
    expect(content.blocks[1].props.text).toBe('b');
  });
});
