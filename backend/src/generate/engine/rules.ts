import type {
  CreativeBrief,
  ModuleType,
} from '../../contracts/generation.contract';
import type { BriefFeature } from './features';

export interface HardRuleOutcome {
  forbidden: Set<ModuleType>;
  hideSender: boolean;
  notes: string[];
}

/** Blocks that are inherently playful — banned for vulnerable moments. */
const PLAYFUL_MODULES: ModuleType[] = [
  'quiz',
  'intimacyGate',
  'scratch',
  'hiddenNotes',
];

const RESTRICAO_FORBIDDEN: Record<string, ModuleType[]> = {
  sem_quiz: ['quiz', 'intimacyGate'],
  sem_jogos: ['quiz', 'intimacyGate', 'scratch', 'hiddenNotes'],
  sem_brincadeiras: ['quiz', 'intimacyGate', 'scratch', 'hiddenNotes'],
  sem_timeline: ['timeline', 'memoryCard'],
  sem_historia: ['timeline', 'memoryCard'],
  nao_se_conhecem: ['timeline', 'memoryCard'],
  sem_fotos: ['image', 'gallery', 'polaroid', 'photoBook'],
  sem_musica: ['music', 'youtube'],
  sem_video: ['video', 'youtube'],
};

function normalizeRestricao(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');
}

/**
 * L0 — hard authorial rules. Invariants that always run first and can never
 * be overridden by scoring or LLM output.
 */
export function applyHardRules(
  brief: CreativeBrief,
  features: Set<BriefFeature>,
): HardRuleOutcome {
  const forbidden = new Set<ModuleType>();
  const notes: string[] = [];

  const hideSender = features.has('anon');
  if (hideSender) {
    notes.push('L0:anon → nome do remetente nunca aparece em props');
  }

  if (brief.momento === 'desculpas') {
    for (const type of PLAYFUL_MODULES) forbidden.add(type);
    notes.push(`L0:desculpas → sem mecânica lúdica (${PLAYFUL_MODULES.join(',')})`);
  }

  for (const raw of brief.restricoes) {
    const key = normalizeRestricao(raw);
    const banned = RESTRICAO_FORBIDDEN[key];
    if (banned) {
      for (const type of banned) forbidden.add(type);
      notes.push(`L0:restricao "${raw}" → proíbe ${banned.join(',')}`);
    } else {
      notes.push(`L0:restricao "${raw}" → sem regra mapeada, ignorada`);
    }
  }

  return { forbidden, hideSender, notes };
}
