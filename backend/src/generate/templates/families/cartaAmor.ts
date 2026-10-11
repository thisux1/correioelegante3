import type { TemplateFamily } from '../../engine/scoring';

/**
 * carta_amor — declared-sender love letter. Sincerity over mystery: the
 * sender is known (their name rides on the envelope) unless the brief asks
 * for anonymity. The letter itself is the centerpiece — every other slot is
 * setting: inside-knowledge beats, shared memories, a small gesture and a
 * signed close. No guessing games, no "descubra quem" mechanics.
 */
export const cartaAmorFamily: TemplateFamily = {
  id: 'carta_amor/declaracao-direta',

  theme: (brief) => ({
    palette: brief.coresFavoritas.length
      ? brief.coresFavoritas.slice(0, 4)
      : ['#e11d48', '#fff5f7', '#4c0519'],
    typography: 'manuscrita',
    motionIntensity:
      brief.tom === 'celebratorio' || brief.tom === 'cinematico'
        ? 'expressivo'
        : 'sutil',
    atmosphere: 'carta-de-amor',
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
            // wax seal carries the sender's initial on a declared letter;
            // falls back to the recipient's when the sender stays hidden
            sealInitial: (
              hideSender
                ? brief.nomes.destinatario
                : (brief.nomes.remetente ?? brief.nomes.destinatario)
            )
              .slice(0, 1)
              .toUpperCase(),
            messageSnippet: 'copySlot:envelope.teaser',
            isOpen: false,
          }),
        },
      ],
    },
    {
      id: 'leitura',
      pick: 1,
      candidates: [
        {
          // the letter body — the single load-bearing block of the page
          type: 'text',
          base: 10,
          props: () => ({ category: 'body', text: 'copySlot:carta.corpo' }),
        },
      ],
    },
    {
      id: 'cumplicidade',
      pick: 1,
      candidates: [
        {
          // "só você sabe essa" — intimacy as complicity, not as gatekeeping
          type: 'intimacyGate',
          base: 8,
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
          // shared nicknames: proof of closeness, offered openly
          type: 'hints',
          base: 7,
          requiresAll: ['hasApelidos'],
          props: ({ brief }) => ({
            items: brief.apelidos.slice(0, 5),
            intro: 'copySlot:hints.intro',
          }),
        },
        {
          type: 'text',
          base: 3,
          props: () => ({
            category: 'quote',
            text: 'copySlot:cumplicidade.frase',
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
            items: brief.memorias.map((memoria, index) => {
              const description = [memoria.lugar, memoria.descricao]
                .filter(Boolean)
                .join(' — ');
              return {
                id: `mem-${index}`,
                date: memoria.data ?? '',
                title: memoria.titulo,
                description: description || undefined,
              };
            }),
          }),
        },
        {
          type: 'photoBook',
          base: 8,
          requiresAll: ['hasFotos'],
          props: ({ brief, hideSender }) => ({
            pages: brief.midias.fotos.slice(0, 24).map((src, index) => ({
              id: `page-${index}`,
              src,
            })),
            coverTitle: 'copySlot:photobook.capa',
            coverSubtitle: hideSender
              ? 'feito à mão'
              : brief.nomes.remetente
                ? `de ${brief.nomes.remetente} pra você`
                : 'feito à mão',
          }),
        },
        {
          type: 'music',
          base: 8,
          requiresAll: ['hasMusica'],
          props: ({ brief }) => ({
            src: brief.midias.musicaUrl,
            title: brief.midias.musicaDedicatoria ?? 'copySlot:music.titulo',
            playerStyle: 'vinyl',
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
          base: 6,
          requiresAll: ['hasFotos'],
          props: ({ brief }) => ({
            photos: brief.midias.fotos.slice(0, 6).map((src, index) => ({
              id: `foto-${index}`,
              src,
              caption: brief.memorias[index]?.titulo,
              rotation: [2, -3, 3, -2, 1, -1][index],
            })),
          }),
        },
        {
          // safety net: a memory-flavored line when the brief has no media
          type: 'text',
          base: 3,
          props: () => ({
            category: 'quote',
            text: 'copySlot:memorias.narracao',
          }),
        },
      ],
    },
    {
      id: 'gesto',
      pick: 2,
      candidates: [
        {
          // roses-dominant fixed arrangement — the classic gesture, delivered
          type: 'bouquet',
          base: 8,
          props: ({ brief }) => ({
            seed: 19,
            flowers: [
              { species: 'rosa', color: '#e11d48' },
              { species: 'rosa', color: '#be123c' },
              { species: 'rosa', color: '#f43f5e' },
              { species: 'rosa' },
              { species: 'cravo' },
              { species: 'margarida' },
              { species: 'lavanda' },
            ],
            wrap: 'papel',
            ribbonColor: brief.coresFavoritas[0] ?? '#e11d48',
            message: 'copySlot:bouquet.recado',
          }),
        },
        {
          // light promise-shaped quiz — "me promete um abraço?", never pressure
          type: 'quiz',
          base: 6,
          props: () => ({
            question: 'copySlot:quiz.pergunta',
            yesButtonText: 'Prometo',
            noButtonText: 'Vou pensar',
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
          props: () => ({
            category: 'signature',
            text: 'copySlot:fecho.assinatura',
          }),
        },
      ],
    },
  ],
};
