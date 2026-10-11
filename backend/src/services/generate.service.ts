import { creativeBriefSchema } from '../contracts/generation.contract';
import type { PageSpec } from '../contracts/generation.contract';
import { decide } from '../generate/engine';
import { compilePageSpec } from '../generate/compile';
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

  const spec = decide(parsed.data);
  const { content, notes } = compilePageSpec(spec);

  return {
    spec,
    content: sanitizePageContent(content),
    notes,
  };
}
