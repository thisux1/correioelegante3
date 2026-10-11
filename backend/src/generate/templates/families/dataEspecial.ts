import type { TemplateFamily } from '../../engine/scoring';

/**
 * data_especial — "hoje é dia nosso" (taxonomia: celebração + retrospecto).
 * O casal já se conhece e o remetente é declarado (hideSender ainda é
 * respeitado). Estrutura do arco:
 * abertura → "hoje faz tempo" → história compartilhada → festa → carta.
 *
 * Regras do arco:
 * - Todo slot tem ≥1 candidato incondicional: brief sem evento/memórias/
 *   fotos ainda gera página completa.
 * - `contagem` prefere timer real quando há evento (nada de togetherCounter —
 *   ele degrada pra timer no compile e é contagem, não comemoração).
 * - `memorias` mapeia memoria.lugar → nada: `image` em timeline é URL, não
 *   nome de lugar. O campo fica de fora.
 * - Nada de mecânica de mistério (scratch/hints/intimacyGate): aqui o
 *   remetente é conhecido, a surpresa é a festa.
 */
export const dataEspecialFamily: TemplateFamily = {
  id: 'data_especial/dia-nosso',

  theme: (brief) => ({
    palette: brief.coresFavoritas.length
      ? brief.coresFavoritas.slice(0, 4)
      : ['#e11d48', '#fff5f7', '#4c0519'],
    typography: 'pixel',
    motionIntensity: 'cinematografico',
    atmosphere: 'retro-os',
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
      id: 'contagem',
      pick: 1,
      candidates: [
        {
          type: 'timer',
          base: 9,
          requiresAll: ['hasEvento'],
          props: ({ brief }) => ({
            targetDate: brief.evento?.data,
            label: 'copySlot:timer.label',
          }),
        },
        {
          type: 'text',
          base: 6,
          props: () => ({
            category: 'body',
            align: 'center',
            text: 'copySlot:contagem.narracao',
          }),
        },
      ],
    },
    {
      id: 'memorias',
      pick: 2,
      candidates: [
        {
          type: 'timeline',
          base: 9,
          requiresAll: ['hasMemorias'],
          props: ({ brief }) => ({
            items: brief.memorias.map((m, i) => ({
              id: `mem-${i}`,
              date: m.data ?? '',
              title: m.titulo,
              description: m.descricao,
              // image é campo de URL — m.lugar é nome de lugar, não URL.
            })),
          }),
        },
        {
          type: 'photoBook',
          base: 8,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            pages: brief.midias.fotos.map((src, i) => ({
              id: `pag-${i}`,
              src,
            })),
            coverTitle: 'copySlot:photoBook.coverTitle',
            coverSubtitle: 'copySlot:photoBook.coverSubtitle',
          }),
        },
        {
          type: 'gallery',
          base: 7,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            images: brief.midias.fotos,
            transition: 'slide',
          }),
        },
        {
          type: 'music',
          base: 7,
          requiresAll: ['hasMusica'],
          props: ({ brief }) => ({
            src: brief.midias.musicaUrl,
            title: brief.midias.musicaDedicatoria ?? 'copySlot:music.titulo',
            playerStyle: 'vinyl',
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
          type: 'text',
          base: 3,
          props: () => ({
            category: 'body',
            text: 'copySlot:memorias.narracao',
          }),
        },
      ],
    },
    {
      id: 'celebracao',
      pick: 1,
      candidates: [
        {
          type: 'bouquet',
          base: 9,
          props: ({ brief }) => ({
            seed: 14,
            flowers: [
              { species: 'girassol' },
              { species: 'rosa' },
              { species: 'cravo' },
            ],
            wrap: 'celofane',
            ribbonColor: brief.coresFavoritas[0] ?? '#e11d48',
            message: 'copySlot:bouquet.message',
          }),
        },
        {
          // Fallback leve: só aparece se bouquet for proibido por regra futura.
          type: 'quiz',
          base: 4,
          props: () => ({
            question: 'copySlot:quiz.pergunta',
            yesButtonText: 'Sim',
            noButtonText: 'Não',
            successMessage: 'copySlot:quiz.sucesso',
            isPlayfulNo: true,
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
          props: () => ({ category: 'body', text: 'copySlot:carta.corpo' }),
        },
      ],
    },
  ],
};
