import type { TemplateFamily } from '../../engine/scoring';

/**
 * anonimo — o correio elegante clássico: um bilhete sem remetente
 * (taxonomia §5). O remetente está sempre oculto (`hideSender` vem do
 * feature `anon`, auto-derivado quando momento === 'anonimo'), então a
 * mecânica de mistério (raspadinha, pistas) fica a serviço do calor
 * "alguém te vê" — admiração, gratidão, solidariedade — e não da
 * confissão romântica do crush_secreto.
 *
 * Arco: abertura → misterio → intimidade → carta → fecho.
 */
export const anonimoFamily: TemplateFamily = {
  id: 'anonimo/alguem-te-ve',

  theme: (brief) => ({
    palette: brief.coresFavoritas.length
      ? brief.coresFavoritas.slice(0, 4)
      : ['#e11d48', '#fff5f7', '#4c0519'],
    typography: 'pixel',
    motionIntensity: 'expressivo',
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
          // A raspadinha guarda uma pista anônima, nunca o nome — o segredo
          // do anonimo é "alguém te vê", não "eu gosto de você".
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
          base: 6,
          requiresAll: ['hasApelidos'],
          boosts: { hasIntimidade: 1 },
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
      id: 'fecho',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 6,
          props: () => ({ category: 'signature', text: 'copySlot:fecho' }),
        },
        {
          // Quiz de despedida só quando o brief trouxe intimidade — o gate
          // já venceu o slot do meio, então aqui a pergunta nunca duplica.
          type: 'quiz',
          base: 7,
          requiresAll: ['hasIntimidade'],
          props: () => ({
            question: 'copySlot:quiz.fecho.pergunta',
            yesButtonText: 'Sim',
            noButtonText: 'Não',
            successMessage: 'copySlot:quiz.fecho.sucesso',
            isPlayfulNo: true,
          }),
        },
      ],
    },
  ],
};
