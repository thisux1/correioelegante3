import { describe, expect, it } from 'vitest';
import { migratePage } from '../services/page.migration';
import { sanitizePageContent } from '../services/page.sanitizer';
import { compilePageSpec } from '../generate/compile';
import { decide } from '../generate/engine';
import { creativeBriefSchema } from '../contracts/generation.contract';

const legacyBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 'blk-1',
  type: 'text',
  version: 1,
  props: { text: 'oi', align: 'left' },
  meta: { createdAt: 1, updatedAt: 1 },
  ...overrides,
});

describe('page.migration — sections & placement', () => {
  it('materializes an implicit stack section for legacy flat blocks', () => {
    const migrated = migratePage({
      blocks: [legacyBlock(), legacyBlock({ id: 'blk-2' })],
      theme: 'romantic-sunset',
      version: 1,
    });

    expect(migrated.sections).toEqual([{ id: 'main', layout: 'stack' }]);
    expect(migrated.blocks.every((b) => b.sectionId === 'main')).toBe(true);
  });

  it('keeps explicit sections with layout, grid and theme', () => {
    const migrated = migratePage({
      blocks: [legacyBlock({ sectionId: 'g' })],
      sections: [
        {
          id: 'g',
          layout: 'grid',
          grid: { cols: 8 },
          theme: { accent: '#e11d48' },
        },
      ],
      version: 1,
    });

    expect(migrated.sections[0]).toMatchObject({
      id: 'g',
      layout: 'grid',
      grid: { cols: 8 },
    });
    expect(migrated.blocks[0].sectionId).toBe('g');
  });

  it('rehomes blocks whose sectionId points to an unknown section', () => {
    const migrated = migratePage({
      blocks: [legacyBlock({ sectionId: 'fantasma' })],
      sections: [{ id: 'real', layout: 'stack' }],
      version: 1,
    });

    expect(migrated.blocks[0].sectionId).toBe('real');
  });

  it('dedupes section ids and falls back unknown layouts to stack', () => {
    const migrated = migratePage({
      blocks: [legacyBlock()],
      sections: [
        { id: 'a', layout: 'grid' },
        { id: 'a', layout: 'freezone' },
        { id: 'b', layout: 'nao-existe' },
      ],
      version: 1,
    });

    // Duplicate ids are renamed (not dropped) so no section content is lost.
    expect(migrated.sections.map((s) => s.id)).toEqual(['a', 'section-1', 'b']);
    expect(migrated.sections[0].layout).toBe('grid');
    expect(migrated.sections[2].layout).toBe('stack');
  });

  it('preserves a valid rect and drops invalid placements', () => {
    const migrated = migratePage({
      blocks: [
        legacyBlock({ rect: { col: 2, row: 3, w: 4, h: 2 } }),
        legacyBlock({ id: 'blk-2', rect: { col: 0, row: 1, w: 4, h: 2 } }),
        legacyBlock({ id: 'blk-3', rect: { col: 2, row: 3, w: 4 } }),
        legacyBlock({ id: 'blk-4', rect: 'largo' }),
      ],
      version: 1,
    });

    expect(migrated.blocks[0].rect).toEqual({ col: 2, row: 3, w: 4, h: 2 });
    expect(migrated.blocks[1].rect).toBeUndefined();
    expect(migrated.blocks[2].rect).toBeUndefined();
    expect(migrated.blocks[3].rect).toBeUndefined();
  });

  it('caps sections at the maximum and survives non-array input', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ id: `s${i}`, layout: 'stack' }));
    const migrated = migratePage({ blocks: [legacyBlock()], sections: many, version: 1 });
    expect(migrated.sections.length).toBe(12);

    const weird = migratePage({ blocks: [], sections: 'nope', version: 1 });
    expect(weird.sections).toEqual([]);
  });

  it('round-trips sections, sectionId and rect through the save sanitizer', () => {
    const saved = sanitizePageContent({
      blocks: [
        legacyBlock({
          sectionId: 'story',
          rect: { col: 1, row: 1, w: 6, h: 3 },
          props: { text: 'linha 1\n\nlinha 2', align: 'left' },
        }),
      ],
      sections: [{ id: 'story', layout: 'grid', grid: { cols: 12 } }],
      theme: 'romantic-sunset',
      version: 1,
    });

    expect(saved.sections).toEqual([{ id: 'story', layout: 'grid', grid: { cols: 12 } }]);
    expect(saved.blocks[0].sectionId).toBe('story');
    expect(saved.blocks[0].rect).toEqual({ col: 1, row: 1, w: 6, h: 3 });
  });
});

describe('compilePageSpec — sections & placement output', () => {
  const spec = decide(
    creativeBriefSchema.parse({
      momento: 'crush_secreto',
      nomes: { remetente: 'Rafa', destinatario: 'Duda' },
    }),
  );

  it('emits persisted sections matching the spec', () => {
    const { content } = compilePageSpec(spec);
    expect(content.sections.length).toBe(spec.sections.length);
    expect(content.sections.map((s) => s.id)).toEqual(
      spec.sections.map((s) => s.id),
    );
  });

  it('tags every block with its owning sectionId', () => {
    const { content } = compilePageSpec(spec);
    const sectionIds = new Set(content.sections.map((s) => s.id));
    expect(content.blocks.length).toBeGreaterThan(0);
    for (const block of content.blocks) {
      expect(block.sectionId).toBeDefined();
      expect(sectionIds.has(block.sectionId as string)).toBe(true);
    }
  });

  it('compiled content survives migratePage unchanged in placement', () => {
    const { content } = compilePageSpec(spec);
    const migrated = migratePage(content);
    expect(migrated.sections.map((s) => s.id)).toEqual(
      content.sections.map((s) => s.id),
    );
    expect(
      migrated.blocks.map((b) => ({ id: b.id, sectionId: b.sectionId })),
    ).toEqual(
      content.blocks.map((b) => ({ id: b.id, sectionId: b.sectionId })),
    );
  });
});
