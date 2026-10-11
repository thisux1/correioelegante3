import { ANONIMO_COPY } from './anonimo';
import { CARTA_AMOR_COPY } from './cartaAmor';
import { CONVITE_DATE_COPY } from './conviteDate';
import { CRUSH_SECRETO_COPY } from './crushSecreto';
import { DATA_ESPECIAL_COPY } from './dataEspecial';
import { DESCULPAS_COPY } from './desculpas';
import { PEDIDO_NAMORO_COPY } from './pedidoNamoro';
import { SO_PORQUE_SIM_COPY } from './soPorqueSim';
import type { CopyBank } from './resolve';

/**
 * templateFamily → copy bank. Families share banks until each gets its own
 * curated file (S8).
 */
const BANKS: Record<string, CopyBank> = {
  'crush_secreto/misterio-leve': CRUSH_SECRETO_COPY,
  'carta_amor/declaracao-direta': CARTA_AMOR_COPY,
  'anonimo/alguem-te-ve': ANONIMO_COPY,
  'convite_date/porta-aberta': CONVITE_DATE_COPY,
  'desculpas/carta-sincera': DESCULPAS_COPY,
  'data_especial/dia-nosso': DATA_ESPECIAL_COPY,
  'pedido_namoro/grande-pergunta': PEDIDO_NAMORO_COPY,
  'so_porque_sim/terca-feira-boa': SO_PORQUE_SIM_COPY,
};

export function getCopyBank(templateFamily: string): CopyBank {
  return BANKS[templateFamily] ?? CRUSH_SECRETO_COPY;
}
