import type { Momento } from '../../contracts/generation.contract';
import type { TemplateFamily } from '../engine/scoring';
import { crushSecretoFamily } from './families/crushSecreto';

/**
 * momento → templateFamily. New moments register their family here as arcs
 * are authored (Fatia 4 / S8). Until then they fall back to crush_secreto's
 * arc shape — marked in decisions so the fallback is visible.
 */
const FAMILIES: Partial<Record<Momento, TemplateFamily>> = {
  crush_secreto: crushSecretoFamily,
  anonimo: crushSecretoFamily,
};

export function resolveFamily(momento: Momento): {
  family: TemplateFamily;
  fallback: boolean;
} {
  const family = FAMILIES[momento];
  if (family) return { family, fallback: false };
  return { family: crushSecretoFamily, fallback: true };
}
