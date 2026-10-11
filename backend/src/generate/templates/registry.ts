import type { Momento } from '../../contracts/generation.contract';
import type { TemplateFamily } from '../engine/scoring';
import { anonimoFamily } from './families/anonimo';
import { cartaAmorFamily } from './families/cartaAmor';
import { conviteDateFamily } from './families/conviteDate';
import { crushSecretoFamily } from './families/crushSecreto';
import { dataEspecialFamily } from './families/dataEspecial';
import { desculpasFamily } from './families/desculpas';
import { pedidoNamoroFamily } from './families/pedidoNamoro';
import { soPorqueSimFamily } from './families/soPorqueSim';

/**
 * momento → templateFamily. New moments register their family here as arcs
 * are authored (Fatia 4 / S8). Until then they fall back to crush_secreto's
 * arc shape — marked in decisions so the fallback is visible.
 */
const FAMILIES: Partial<Record<Momento, TemplateFamily>> = {
  crush_secreto: crushSecretoFamily,
  carta_amor: cartaAmorFamily,
  anonimo: anonimoFamily,
  convite_date: conviteDateFamily,
  desculpas: desculpasFamily,
  data_especial: dataEspecialFamily,
  pedido_namoro: pedidoNamoroFamily,
  so_porque_sim: soPorqueSimFamily,
};

export function resolveFamily(momento: Momento): {
  family: TemplateFamily;
  fallback: boolean;
} {
  const family = FAMILIES[momento];
  if (family) return { family, fallback: false };
  return { family: crushSecretoFamily, fallback: true };
}
