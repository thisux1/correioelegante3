import { CRUSH_SECRETO_COPY } from './crushSecreto';
import type { CopyBank } from './resolve';

/**
 * templateFamily → copy bank. Families share banks until each gets its own
 * curated file (S8).
 */
const BANKS: Record<string, CopyBank> = {
  'crush_secreto/misterio-leve': CRUSH_SECRETO_COPY,
};

export function getCopyBank(templateFamily: string): CopyBank {
  return BANKS[templateFamily] ?? CRUSH_SECRETO_COPY;
}
