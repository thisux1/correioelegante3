import type { TemplateFamily } from '../../engine/scoring';

/**
 * desculpas — abertura honesta → contexto → a carta → memória compartilhada →
 * porta aberta (taxonomia §5).
 *
 * Zero mecânica lúdica por desenho: o L0 já bane quiz/scratch/hints/
 * intimacyGate/hiddenNotes para este momento, e este arco não os declara —
 * pedido de desculpas não é festa, é carta sincera. Sem timer/ticketRsvp
 * também: contagem regressiva e RSVP são pressão disfarçada, e pressão é o
 * oposto de desculpa.
 *
 * O slot `memorias` é todo opcional acima do fallback: foto e música só
 * entram quando o brief traz a mídia, e o texto garante que nenhum brief
 * minimal fica com seção vazia.
 */
export const desculpasFamily: TemplateFamily = {
  id: 'desculpas/carta-sincera',

  theme: (brief) => ({
    palette: brief.coresFavoritas.length
      ? brief.coresFavoritas.slice(0, 4)
      : ['#881337', '#fff5f7', '#4c0519'],
    typography: 'serifada',
    motionIntensity: 'sutil',
    atmosphere: 'carta-sincera',
  }),

  arc: [
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
    {
      id: 'contexto',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 8,
          props: () => ({
            category: 'body',
            text: 'copySlot:contexto.narracao',
          }),
        },
      ],
    },
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
    {
      id: 'memorias',
      pick: 1,
      candidates: [
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
          base: 6,
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
            title: brief.midias.musicaDedicatoria ?? 'copySlot:music.titulo',
            playerStyle: 'minimal',
          }),
        },
        {
          // Rede de segurança: lembrança em texto quando o brief não traz
          // mídia nenhuma — o slot nunca fica vazio.
          type: 'text',
          base: 3,
          props: () => ({
            category: 'quote',
            text: 'copySlot:memorias.legenda',
          }),
        },
      ],
    },
    {
      id: 'fecho',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 8,
          props: () => ({
            category: 'signature',
            text: 'copySlot:fecho.abertura',
          }),
        },
      ],
    },
  ],
};
