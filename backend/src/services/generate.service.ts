import { creativeBriefSchema } from '../contracts/generation.contract';
import type { PageSpec } from '../contracts/generation.contract';
import { decide } from '../generate/engine';
import { compilePageSpec } from '../generate/compile';
import { resolveCopySlots } from '../generate/copy/resolve';
import { getCopyBank } from '../generate/copy/banks';
import { sanitizePageContent } from './page.sanitizer';
import { scanBriefText } from './moderation.service';
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

  // L1 de moderação (§10.3): texto livre do brief é varrido antes de gerar.
  // 'blocked' recusa; 'flagged' segue — PII pode ser legítimo (telefone do
  // próprio remetente num convite) e falso-positivo é o pior modo de falha.
  const scan = scanBriefText([
    parsed.data.contexto,
    parsed.data.nomes.destinatario,
    parsed.data.nomes.remetente,
    parsed.data.evento?.descricao,
    parsed.data.evento?.lugar,
    ...parsed.data.apelidos,
    ...parsed.data.interesses,
    ...parsed.data.memorias.flatMap((m) => [m.titulo, m.descricao, m.lugar]),
    ...parsed.data.perguntasIntimidade.flatMap((p) => [p.pergunta, p.resposta, p.dica]),
    parsed.data.midias?.musicaDedicatoria,
  ]);
  if (scan.verdict === 'blocked') {
    throw new AppError(
      'O conteúdo enviado não pode ser usado para gerar uma página.',
      422,
      'BRIEF_BLOCKED',
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

  const notes2 = [...notes, ...compileNotes];
  if (scan.verdict === 'flagged') {
    notes2.push(`moderation:flagged → ${scan.flags.join(',')}`);
  }

  return {
    spec,
    content: sanitizePageContent(content),
    notes: notes2,
  };
}
