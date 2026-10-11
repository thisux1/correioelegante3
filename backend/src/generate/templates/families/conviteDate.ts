import type { TemplateFamily } from '../../engine/scoring';

/**
 * convite_date — proposta → convite → plano (taxonomia §5).
 *
 * O convite É o momento: data e lugar do brief viram ticket RSVP + contagem
 * regressiva quando existem (hasEvento). Sem evento, o convite ainda sai como
 * texto — porta aberta, nunca pressão. `ticketRsvp` ainda não é tipo
 * persistido: o compilador degrada para text{title} até o S14, com a decisão
 * registrada em decisions[].
 *
 * No slot `plano`, o texto de roteiro é o primary (base 7): carrega o "plano
 * concreto" que define o momento. O quiz "topa?" fica declarado como
 * alternativa de base menor — em L1v1 nunca supera o texto, mas documenta a
 * mecânica de resposta que ganha peso quando o RSVP real existir.
 */
export const conviteDateFamily: TemplateFamily = {
  id: 'convite_date/porta-aberta',

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
      id: 'proposta',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 9,
          props: () => ({
            category: 'body',
            text: 'copySlot:proposta.narracao',
          }),
        },
      ],
    },
    {
      id: 'convite',
      pick: 2,
      candidates: [
        {
          type: 'ticketRsvp',
          base: 10,
          requiresAll: ['hasEvento'],
          props: ({ brief }) => ({
            title: 'copySlot:rsvp.titulo',
            evento: brief.evento,
          }),
        },
        {
          type: 'timer',
          base: 6,
          requiresAll: ['hasEvento'],
          props: ({ brief }) => ({
            targetDate: brief.evento?.data,
            label: 'copySlot:timer.label',
          }),
        },
        {
          // Sem evento o convite não morre: vira texto com o plano concreto.
          type: 'text',
          base: 4,
          props: () => ({
            category: 'body',
            align: 'center',
            text: 'copySlot:convite.detalhes',
          }),
        },
      ],
    },
    {
      id: 'plano',
      pick: 1,
      candidates: [
        {
          type: 'text',
          base: 7,
          props: () => ({
            category: 'body',
            text: 'copySlot:plano.detalhes',
          }),
        },
        {
          type: 'quiz',
          base: 5,
          props: () => ({
            question: 'copySlot:quiz.pergunta',
            yesButtonText: 'Topa',
            noButtonText: 'Passo',
            successMessage: 'copySlot:quiz.sucesso',
            isPlayfulNo: true,
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
          base: 6,
          props: () => ({ category: 'signature', text: 'copySlot:fecho' }),
        },
      ],
    },
  ],
};
