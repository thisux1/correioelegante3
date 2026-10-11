import type {
  CreativeBrief,
  ModuleType,
  SpecModule,
} from '../../contracts/generation.contract';
import type { BriefFeature } from './features';

export interface ModuleContext {
  brief: CreativeBrief;
  features: Set<BriefFeature>;
  hideSender: boolean;
}

export interface ModuleCandidate {
  type: ModuleType;
  base: number;
  requiresAll?: BriefFeature[];
  requiresAny?: BriefFeature[];
  boosts?: Partial<Record<BriefFeature, number>>;
  props: (ctx: ModuleContext) => Record<string, unknown>;
}

export interface ArcSlot {
  id: string;
  /** how many top-scoring candidates to keep */
  pick: number;
  candidates: ModuleCandidate[];
}

export interface TemplateFamily {
  id: string;
  arc: ArcSlot[];
  theme: (brief: CreativeBrief) => {
    palette: string[];
    typography: 'serifada' | 'moderna' | 'manuscrita' | 'pixel';
    motionIntensity: 'sutil' | 'expressivo' | 'cinematografico';
    atmosphere?: string;
  };
}

function eligible(
  candidate: ModuleCandidate,
  features: Set<BriefFeature>,
  forbidden: Set<ModuleType>,
): boolean {
  if (forbidden.has(candidate.type)) return false;
  if (candidate.requiresAll?.some((f) => !features.has(f))) return false;
  if (
    candidate.requiresAny &&
    candidate.requiresAny.length > 0 &&
    !candidate.requiresAny.some((f) => features.has(f))
  ) {
    return false;
  }
  return true;
}

function score(candidate: ModuleCandidate, features: Set<BriefFeature>): number {
  let total = candidate.base;
  for (const [feature, boost] of Object.entries(candidate.boosts ?? {})) {
    if (features.has(feature as BriefFeature)) total += boost;
  }
  return total;
}

/**
 * L1v1 — authored scoring matrix. Picks the top `slot.pick` eligible
 * candidates per arc slot; ties resolve in declaration order.
 */
export function selectModules(
  family: TemplateFamily,
  ctx: ModuleContext,
  forbidden: Set<ModuleType>,
  notes: string[],
): Array<{ slot: ArcSlot; modules: SpecModule[] }> {
  const slots: Array<{ slot: ArcSlot; modules: SpecModule[] }> = [];

  for (const slot of family.arc) {
    const ranked = slot.candidates
      .filter((c) => eligible(c, ctx.features, forbidden))
      .map((c) => ({ c, score: score(c, ctx.features) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, slot.pick);

    if (ranked.length === 0) {
      notes.push(`L1:slot "${slot.id}" sem candidato elegível`);
      continue;
    }

    for (const { c, score: s } of ranked) {
      notes.push(`L1:slot "${slot.id}" → ${c.type} (score ${s})`);
    }

    slots.push({
      slot,
      modules: ranked.map(({ c }) => ({
        type: c.type,
        props: c.props(ctx),
      })),
    });
  }

  return slots;
}
