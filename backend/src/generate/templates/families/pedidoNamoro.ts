import type { TemplateFamily } from '../../engine/scoring';

/**
 * pedido_namoro — abertura → recapitulação → memórias → PERGUNTA → carta →
 * celebração. É o arco mais cheio do produto: o casal já tem história e a
 * página a recapitula antes da pergunta (taxonomia §5).
 *
 * O slot `pergunta` é o clímax: o quiz sempre vence quando permitido; o
 * intimacyGate é o caminho alternativo quando o brief proíbe mecânica de
 * quiz mas trouxe perguntas de intimidade; o texto é a rede de segurança —
 * a pergunta nunca sai da página. A `carta` repete o pedido em prosa para
 * quem rola a página e passa direto pelo quiz.
 */
export const pedidoNamoroFamily: TemplateFamily = {
  id: 'pedido_namoro/grande-pergunta',

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
      id: 'narrativa',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 8,
          props: () => ({ category: 'body', text: 'copySlot:narrativa' }),
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
            items: brief.memorias.map((memoria, index) => {
              const detalhe = [memoria.lugar, memoria.descricao]
                .filter((parte): parte is string => Boolean(parte))
                .join(' — ');
              return {
                id: `memoria-${index}`,
                date: memoria.data ?? '',
                title: memoria.titulo,
                description: detalhe || undefined,
              };
            }),
          }),
        },
        {
          type: 'gallery',
          base: 8,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            images: brief.midias.fotos,
            transition: 'fade',
          }),
        },
        {
          type: 'photoBook',
          base: 7,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            pages: brief.midias.fotos.slice(0, 24).map((src, index) => ({
              id: `pagina-${index}`,
              src,
            })),
            coverTitle: 'copySlot:photoBook.titulo',
            coverSubtitle: 'copySlot:photoBook.subtitulo',
          }),
        },
        {
          type: 'polaroid',
          base: 6,
          requiresAll: ['hasFotos'],
          boosts: { hasMemorias: 3 },
          props: ({ brief }) => ({
            photos: brief.midias.fotos.slice(0, 6).map((src, index) => ({
              id: `foto-${index}`,
              src,
              caption: brief.memorias[index]?.titulo,
            })),
          }),
        },
        {
          type: 'music',
          base: 6,
          requiresAll: ['hasMusica'],
          props: ({ brief }) => ({
            src: brief.midias.musicaUrl,
            title: brief.midias.musicaDedicatoria,
            playerStyle: 'vinyl',
          }),
        },
        {
          type: 'text',
          base: 3,
          props: () => ({
            category: 'body',
            text: 'copySlot:memorias.fallback',
          }),
        },
      ],
    },
    {
      id: 'pergunta',
      pick: 1,
      candidates: [
        {
          type: 'quiz',
          base: 10,
          props: () => ({
            question: 'copySlot:quiz.pergunta',
            yesButtonText: 'copySlot:quiz.sim',
            noButtonText: 'copySlot:quiz.nao',
            successMessage: 'copySlot:quiz.sucesso',
            isPlayfulNo: true,
          }),
        },
        {
          type: 'intimacyGate',
          base: 6,
          requiresAll: ['hasIntimidade'],
          props: ({ brief }) => ({
            question: brief.perguntasIntimidade[0].pergunta,
            answer: brief.perguntasIntimidade[0].resposta,
            hint: brief.perguntasIntimidade[0].dica,
            allowSkip: true,
            intro: 'copySlot:intimacyGate.intro',
          }),
        },
        {
          type: 'text',
          base: 2,
          props: () => ({
            category: 'quote',
            align: 'center',
            text: 'copySlot:pergunta.texto',
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
    {
      id: 'celebracao',
      pick: 2,
      candidates: [
        {
          type: 'bouquet',
          base: 8,
          props: ({ brief }) => ({
            seed:
              ([...brief.nomes.destinatario].reduce(
                (acc, ch) => acc + ch.charCodeAt(0),
                0,
              ) %
                997) +
              1,
            flowers: [
              { species: 'rosa' },
              { species: 'rosa' },
              { species: 'rosa' },
              { species: 'girassol' },
              { species: 'girassol' },
            ],
            wrap: 'celofane',
            ribbonColor: brief.coresFavoritas[0] ?? '#e11d48',
            message: 'copySlot:bouquet.message',
          }),
        },
        {
          type: 'ticketRsvp',
          base: 6,
          requiresAll: ['hasEvento'],
          props: ({ brief }) => ({
            title: 'copySlot:rsvp.titulo',
            evento: brief.evento,
          }),
        },
        {
          type: 'timer',
          base: 5,
          requiresAll: ['hasEvento'],
          props: ({ brief }) => ({
            targetDate: brief.evento?.data,
            label: 'copySlot:timer.label',
          }),
        },
      ],
    },
  ],
};
