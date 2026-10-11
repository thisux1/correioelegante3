import type { CreativeBrief } from '../../contracts/generation.contract';

/** Signals derived from the brief that drive scoring and rules. */
export type BriefFeature =
  | 'anon'
  | 'hasFotos'
  | 'hasMemorias'
  | 'hasMusica'
  | 'hasEvento'
  | 'hasIntimidade'
  | 'hasApelidos';

export function extractFeatures(brief: CreativeBrief): Set<BriefFeature> {
  const features = new Set<BriefFeature>();

  if (brief.anonimoParaDestinatario || brief.momento === 'anonimo') {
    features.add('anon');
  }
  if (brief.midias.fotos.length > 0) features.add('hasFotos');
  if (brief.memorias.length > 0) features.add('hasMemorias');
  if (brief.midias.musicaUrl) features.add('hasMusica');
  if (brief.evento && (brief.evento.data || brief.evento.lugar)) {
    features.add('hasEvento');
  }
  if (brief.perguntasIntimidade.length > 0) features.add('hasIntimidade');
  if (brief.apelidos.length > 0) features.add('hasApelidos');

  return features;
}
