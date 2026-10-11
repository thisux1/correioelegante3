import {
  PAGE_SPEC_VERSION,
  pageSpecSchema,
  type CreativeBrief,
  type PageSpec,
} from '../../contracts/generation.contract';
import { resolveFamily } from '../templates/registry';
import { extractFeatures } from './features';
import { applyHardRules } from './rules';
import { selectModules } from './scoring';

/**
 * Path A — deterministic generation: L0 hard rules + L1v1 authored scoring
 * + curated copy slots. Emits a PageSpec validated against the contract.
 */
export function decide(brief: CreativeBrief): PageSpec {
  const notes: string[] = [];

  const features = extractFeatures(brief);
  const rules = applyHardRules(brief, features);
  notes.push(...rules.notes);

  const { family, fallback } = resolveFamily(brief.momento);
  if (fallback) {
    notes.push(`L1:momento "${brief.momento}" sem família própria → ${family.id}`);
  } else {
    notes.push(`L1:momento "${brief.momento}" → família ${family.id}`);
  }

  const slots = selectModules(
    family,
    { brief, features, hideSender: rules.hideSender },
    rules.forbidden,
    notes,
  );

  const spec = {
    version: PAGE_SPEC_VERSION,
    templateFamily: family.id,
    theme: family.theme(brief),
    sections: slots.map(({ slot, modules }) => ({
      id: slot.id,
      layout: 'stack' as const,
      modules,
    })),
    decisions: notes,
    seed: 1,
  };

  // The engine is a producer like any other — its output must pass the same
  // contract validation the LLM path will face (§3.3).
  return pageSpecSchema.parse(spec);
}
