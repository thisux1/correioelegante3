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

describe('S10 new block types', () => {
  it('preserves youtube block props', () => {
    const result = migratePage({
      blocks: [
        {
          id: 'y1',
          type: 'youtube',
          version: 1,
          props: { url: 'https://youtu.be/abc12345678', title: 'Nossa música' },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
    });
    const block = result.blocks[0];
    expect(block.type).toBe('youtube');
    expect(block.props.url).toBe('https://youtu.be/abc12345678');
    expect(block.props.title).toBe('Nossa música');
  });

  it('bounds photoBook pages and drops entries without src', () => {
    const result = migratePage({
      blocks: [
        {
          id: 'pb1',
          type: 'photoBook',
          version: 1,
          props: {
            pages: [
              { src: 'https://x/1.jpg', caption: 'um' },
              { caption: 'sem src — cai fora' },
              ...Array.from({ length: 30 }, (_, i) => ({ src: `https://x/${i}.jpg` })),
            ],
            coverTitle: 'Livro',
          },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
    });
    const pages = (result.blocks[0].props.pages as unknown[]);
    expect(pages.length).toBeLessThanOrEqual(24);
    expect(pages.length).toBeGreaterThan(0);
  });

  it('filters bouquet flowers to valid species and clamps list', () => {
    const result = migratePage({
      blocks: [
        {
          id: 'b1',
          type: 'bouquet',
          version: 1,
          props: {
            seed: 42,
            flowers: [
              { species: 'rosa', color: '#e11d48' },
              { species: 'orquidea' },
              'lixo',
            ],
            wrap: 'juta',
          },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
    });
    const { props } = result.blocks[0];
    expect(props.seed).toBe(42);
    expect(props.flowers).toEqual([{ species: 'rosa', color: '#e11d48' }]);
    expect(props.wrap).toBe('juta');
  });

  it('hints keeps only items with text and bounds the list', () => {
    const result = migratePage({
      blocks: [
        {
          id: 'h1',
          type: 'hints',
          version: 1,
          props: {
            title: 'Dicas',
            hints: [
              { id: 'a', text: 'primeira' },
              { text: '' },
              'não-objeto',
              ...Array.from({ length: 15 }, (_, i) => ({ text: `d${i}` })),
            ],
          },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
    });
    const hints = result.blocks[0].props.hints as Array<{ text: string }>;
    expect(hints.length).toBeLessThanOrEqual(12);
    expect(hints[0].text).toBe('primeira');
    expect(hints.every((h) => h.text.length > 0)).toBe(true);
  });

  it('intimacyGate keeps question + bounded answers + optional fields', () => {
    const result = migratePage({
      blocks: [
        {
          id: 'g1',
          type: 'intimacyGate',
          version: 1,
          props: {
            question: 'O que tinha na xícara?',
            answers: ['cappuccino', '', 42, 'café'],
            title: 'só vocês sabem',
            hint: 'quente',
            successMessage: 'lembrou!',
            allowSkip: true,
          },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
    });
    const { props } = result.blocks[0];
    expect(props.question).toBe('O que tinha na xícara?');
    expect(props.answers).toEqual(['cappuccino', 'café']);
    expect(props.title).toBe('só vocês sabem');
    expect(props.allowSkip).toBeUndefined();
  });

  it('ticketRsvp normalizes title/evento and defaults allowText to true', () => {
    const result = migratePage({
      blocks: [
        {
          id: 'r1',
          type: 'ticketRsvp',
          version: 1,
          props: {
            title: 'te convido:',
            evento: { data: '14/03', lugar: 'praça', extra: 'lixo' },
          },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
    });
    const { props } = result.blocks[0];
    expect(props.title).toBe('te convido:');
    expect(props.evento).toEqual({ data: '14/03', lugar: 'praça', descricao: undefined });
    expect(props.allowText).toBe(true);
  });
});

describe('sanitizePageContent — ticketRsvp', () => {
  it('bounds strings, keeps allowText and never persists responseToken', () => {
    const saved = sanitizePageContent({
      blocks: [
        {
          id: 'r1',
          type: 'ticketRsvp',
          version: 1,
          props: {
            title: `  ${'x'.repeat(200)}  `,
            evento: { data: '14/03', lugar: 'praça', descricao: 'sorvete', extra: 'lixo' },
            allowText: false,
            responseToken: 'forjado-pelo-cliente',
            lixo: 'fora',
          },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
      sections: [{ id: 'main', layout: 'stack' }],
      version: 1,
    });

    const { props } = saved.blocks[0];
    expect(props.title).toBe('x'.repeat(160));
    expect(props.evento).toEqual({ data: '14/03', lugar: 'praça', descricao: 'sorvete' });
    expect(props.allowText).toBe(false);
    expect(props.responseToken).toBeUndefined();
    expect(props.lixo).toBeUndefined();
  });

  it('ticketRsvp without evento persists title + allowText default', () => {
    const saved = sanitizePageContent({
      blocks: [
        {
          id: 'r2',
          type: 'ticketRsvp',
          version: 1,
          props: { title: 'topa?' },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      ],
      version: 1,
    });

    const { props } = saved.blocks[0];
    expect(props.title).toBe('topa?');
    expect(props.evento).toBeUndefined();
    expect(props.allowText).toBe(true);
  });
});
