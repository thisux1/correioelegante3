import type { TemplateFamily } from '../../engine/scoring';

/**
 * crush_secreto — mystery → tension → opening (taxonomia §5).
 * Copy here is placeholder scaffolding; the curated pt-BR bank lands in S4
 * under copySlots keys.
 */
export const crushSecretoFamily: TemplateFamily = {
  id: 'crush_secreto/misterio-leve',

  theme: (brief) => ({
    palette: brief.coresFavoritas.length
      ? brief.coresFavoritas.slice(0, 4)
      : ['#e11d48', '#fff5f7', '#4c0519'],
    typography: 'pixel',
    motionIntensity: brief.tom === 'cinematico' ? 'cinematografico' : 'expressivo',
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
      id: 'misterio',
      pick: 2,
      candidates: [
        {
          type: 'scratch',
          base: 8,
          boosts: { anon: 2 },
          props: ({ brief, hideSender }) => ({
            coverText: 'copySlot:scratch.cover',
            secretType: 'text',
            secretText: hideSender
              ? 'copySlot:scratch.secret.anon'
              : brief.nomes.remetente ?? 'copySlot:scratch.secret.fallback',
          }),
        },
        {
          type: 'hints',
          base: 6,
          requiresAll: ['hasApelidos'],
          boosts: { anon: 3, hasIntimidade: 1 },
          props: ({ brief }) => ({
            items: brief.apelidos.slice(0, 3),
            intro: 'copySlot:hints.intro',
          }),
        },
        {
          type: 'text',
          base: 3,
          props: () => ({ category: 'body', text: 'copySlot:misterio.narracao' }),
        },
      ],
    },
    {
      id: 'intimidade',
      pick: 1,
      candidates: [
        {
          type: 'intimacyGate',
          base: 9,
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
    {
      id: 'memorias',
      pick: 2,
      candidates: [
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
          base: 7,
          requiresAll: ['hasMusica'],
          props: ({ brief }) => ({
            src: brief.midias.musicaUrl,
            title: brief.midias.musicaDedicatoria,
            playerStyle: 'minimal',
          }),
        },
      ],
    },
    {
      id: 'convite',
      pick: 1,
      candidates: [
        {
          type: 'ticketRsvp',
          base: 9,
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
