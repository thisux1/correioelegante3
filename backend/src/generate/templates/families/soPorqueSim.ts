import type { CreativeBrief } from '../../../contracts/generation.contract';
import type { TemplateFamily } from '../../engine/scoring';

/**
 * Seed determinística do buquê — mesma destinatária, mesmo arranjo. Deriva do
 * nome para que briefs diferentes gerem buquês distintos sem depender de
 * aleatoriedade.
 */
function seedFromName(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 10_000) + 1;
}

/**
 * so_porque_sim — "só porque sim": bomba de afeto num dia comum (taxonomia §5).
 *
 * O momento mais leve do catálogo: nenhuma ocasião, nenhuma contagem, nenhum
 * portão — só a vontade boba de melhorar uma terça-feira qualquer. Mecânica
 * lúdica não é só permitida, é encorajada (scratch, quiz). Remetente declarado
 * por padrão; `hideSender` segue respeitado quando o brief pede anonimato.
 *
 * Arco (~5-6 slots):
 *   abertura → surpresa → carta → gesto → fecho
 *
 * Tipos proibidos aqui por natureza: timer/ticketRsvp/togetherCounter (não há
 * ocasião nem data), intimacyGate/memoryCard/hiddenNotes (não é mistério nem
 * prova de intimidade), image/video/youtube (mídia crua fora do arco).
 */
export const soPorqueSimFamily: TemplateFamily = {
  id: 'so_porque_sim/terca-feira-boa',

  theme: (brief: CreativeBrief) => ({
    palette: brief.coresFavoritas.length
      ? brief.coresFavoritas.slice(0, 4)
      : ['#e11d48', '#fff5f7', '#4c0519'],
    typography: 'pixel',
    motionIntensity: 'expressivo',
    atmosphere: 'retro-os',
  }),

  arc: [
    // ── Abertura: o envelope "sem motivo nenhum" ────────────────────────────
    {
      id: 'abertura',
      pick: 1,
      candidates: [
        {
          type: 'envelope',
          base: 10,
          props: ({ brief, hideSender }) => ({
            recipientName: brief.nomes.destinatario,
            senderName: hideSender ? undefined : brief.nomes.remetente,
            sealInitial: brief.nomes.destinatario.slice(0, 1).toUpperCase(),
            messageSnippet: 'copySlot:envelope.teaser',
            isOpen: false,
          }),
        },
      ],
    },

    // ── Surpresa: raspadinha boba, pistas de apelido ou narração leve ───────
    {
      id: 'surpresa',
      pick: 2,
      candidates: [
        {
          type: 'scratch',
          base: 8,
          props: () => ({
            coverText: 'copySlot:scratch.cover',
            secretType: 'text',
            secretText: 'copySlot:scratch.secret',
          }),
        },
        {
          type: 'hints',
          base: 5,
          requiresAll: ['hasApelidos'],
          props: ({ brief }) => ({
            items: brief.apelidos.slice(0, 3),
            intro: 'copySlot:hints.intro',
          }),
        },
        {
          type: 'text',
          base: 4,
          props: () => ({
            category: 'body',
            text: 'copySlot:surpresa.narracao',
          }),
        },
      ],
    },

    // ── Carta: o "lembrei de você no meio da terça" ─────────────────────────
    {
      id: 'carta',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 10,
          props: () => ({
            category: 'body',
            text: 'copySlot:carta.corpo',
          }),
        },
      ],
    },

    // ── Gesto: buquê alegre, quiz bobo e mídia quando houver ────────────────
    {
      id: 'gesto',
      pick: 2,
      candidates: [
        {
          type: 'bouquet',
          base: 8,
          props: ({ brief }) => {
            const corFlor = brief.coresFavoritas[1] ?? brief.coresFavoritas[0];
            return {
              seed: seedFromName(brief.nomes.destinatario),
              flowers: [
                { species: 'girassol' },
                { species: 'margarida' },
                corFlor
                  ? { species: 'tulipa', color: corFlor }
                  : { species: 'tulipa' },
                { species: 'margarida' },
                { species: 'girassol' },
              ],
              wrap: 'juta',
              ribbonColor: brief.coresFavoritas[0] ?? '#e11d48',
              message: 'copySlot:bouquet.message',
            };
          },
        },
        {
          type: 'quiz',
          base: 6,
          props: () => ({
            question: 'copySlot:quiz.pergunta',
            yesButtonText: 'Sim',
            noButtonText: 'Não',
            successMessage: 'copySlot:quiz.sucesso',
            isPlayfulNo: true,
          }),
        },
        {
          type: 'gallery',
          base: 7,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            images: brief.midias.fotos,
            transition: 'fade',
          }),
        },
        {
          type: 'polaroid',
          base: 7,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            photos: brief.midias.fotos.slice(0, 6).map((src, i) => ({
              id: `foto-${i}`,
              src,
            })),
          }),
        },
        {
          type: 'music',
          base: 5,
          requiresAll: ['hasMusica'],
          props: ({ brief }) => ({
            src: brief.midias.musicaUrl,
            title: brief.midias.musicaDedicatoria,
            playerStyle: 'minimal',
          }),
        },
      ],
    },

    // ── Fecho: despedida sem cobrança, porta aberta ─────────────────────────
    {
      id: 'fecho',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 6,
          props: () => ({
            category: 'signature',
            text: 'copySlot:fecho',
          }),
        },
      ],
    },
  ],
};
