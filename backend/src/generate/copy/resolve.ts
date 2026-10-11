import type { PageSpec } from '../../contracts/generation.contract';

export type CopyBank = Record<string, string[]>;

const SLOT_PREFIX = 'copySlot:';

/** Deterministic variant pick: same slot + same seed → same variant. */
function pickVariant(slot: string, variants: string[], seed: number): string {
  let hash = seed;
  for (const char of slot) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return variants[hash % variants.length];
}

function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

function resolveValue(
  value: unknown,
  bank: CopyBank,
  seed: number,
  vars: Record<string, string>,
  missing: string[],
): unknown {
  if (typeof value === 'string') {
    if (value.startsWith(SLOT_PREFIX)) {
      const slot = value.slice(SLOT_PREFIX.length);
      const variants = bank[slot];
      if (!variants || variants.length === 0) {
        missing.push(slot);
        return ''; // never leak the marker into UI
      }
      return interpolate(pickVariant(slot, variants, seed), vars);
    }
    return interpolate(value, vars);
  }
  if (Array.isArray(value)) {
    return value.map((v) => resolveValue(v, bank, seed, vars, missing));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        resolveValue(v, bank, seed, vars, missing),
      ]),
    );
  }
  return value;
}

export interface CopyResolution {
  spec: PageSpec;
  missingSlots: string[];
}

/**
 * Replaces `copySlot:<key>` prop values with seeded picks from the curated
 * copy bank and interpolates `{nome}`-style variables. Runs between decide()
 * and compilePageSpec() so persisted content never carries markers.
 */
export function resolveCopySlots(
  spec: PageSpec,
  bank: CopyBank,
  vars: Record<string, string>,
): CopyResolution {
  const missing: string[] = [];
  const seed = spec.seed ?? 1;

  const resolved: PageSpec = {
    ...spec,
    sections: spec.sections.map((section) => ({
      ...section,
      modules: section.modules.map((module) => ({
        ...module,
        props: resolveValue(module.props, bank, seed, vars, missing) as Record<
          string,
          unknown
        >,
      })),
    })),
  };

  return { spec: resolved, missingSlots: missing };
}
