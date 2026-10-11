import { creativeBriefSchema } from '../contracts/generation.contract';
import type { PageSpec } from '../contracts/generation.contract';
import { decide } from '../generate/engine';
import { compilePageSpec } from '../generate/compile';
import { resolveCopySlots } from '../generate/copy/resolve';
import { getCopyBank } from '../generate/copy/banks';
import { sanitizePageContent } from './page.sanitizer';
import type { PersistedPageContent } from './page.migration';
import { AppError } from '../utils/AppError';

export interface GenerateResult {
  spec: PageSpec;
  content: PersistedPageContent;
  notes: string[];
}

/**
 * Path A generation: brief → decide (L0+L1v1) → PageSpec → compiled content.
 * Returns the compiled page without persisting — anonymous drafts live in the
 * editor's localStorage draft flow; publishing follows the normal auth path.
 */
export function generateFromBrief(rawBrief: unknown): GenerateResult {
  const parsed = creativeBriefSchema.safeParse(rawBrief);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AppError(
      issue?.message ?? 'Brief inválido.',
      400,
      'INVALID_BRIEF',
    );
  }

  const rawSpec = decide(parsed.data);

  const { spec, missingSlots } = resolveCopySlots(
    rawSpec,
    getCopyBank(rawSpec.templateFamily),
    {
      nome: parsed.data.nomes.destinatario,
      remetente: parsed.data.nomes.remetente ?? '',
    },
  );
  const notes = [...spec.decisions];
  if (missingSlots.length > 0) {
    notes.push(`copy:slots sem variante no banco → ${missingSlots.join(',')}`);
  }

  const { content, notes: compileNotes } = compilePageSpec(spec);

  return {
    spec,
    content: sanitizePageContent(content),
    notes: [...notes, ...compileNotes],
  };
}
