import type { Block } from '@/editor/types'

const meta = { createdAt: 0, updatedAt: 0 }

// Espelha o arco que o motor de geração produz para crush_secreto:
// envelope → raspadinha → pistas → carta. Mesmos componentes do destinatário.
export const DEMO_PAGE_BLOCKS: Block[] = [
  {
    id: 'demo-envelope',
    type: 'envelope',
    version: 1,
    props: {
      recipientName: 'Pra você, que sabe quem é',
      messageSnippet: 'Tem uma coisa que eu venho ensaiando faz tempo…',
    },
    meta,
  },
  {
    id: 'demo-scratch',
    type: 'scratch',
    version: 1,
    props: {
      coverText: 'Raspa aqui que a primeira pista mora embaixo',
      secretType: 'text',
      secretText: 'Alguém reparou que você sempre pede o mesmo lanche. Alguém acha isso bonito.',
    },
    meta,
  },
  {
    id: 'demo-hints',
    type: 'hints',
    version: 1,
    props: {
      title: 'Três pistas antes do nome',
      hints: [
        { id: 'h1', text: 'A gente já dividiu fone no ônibus sem combinar nada.' },
        { id: 'h2', text: 'Eu decorei o pedido de café que você sempre repete.' },
        { id: 'h3', text: 'Quando você ri, eu finjo que não tava olhando.' },
      ],
    },
    meta,
  },
  {
    id: 'demo-letter',
    type: 'text',
    version: 1,
    props: {
      text: 'Eu podia ter mandado um textão. Mas textão se apaga, print se perde, e o que eu sinto merecia mais do que uma notificação.\n\nEntão eu montei isso aqui. Cada pedaço tem um motivo.',
      category: 'body',
      align: 'left',
    },
    meta,
  },
]

// Blocos avulsos para a vitrine interativa — mesmos componentes do bloco real.
export const DEMO_SHOWCASE_BLOCKS = {
  scratch: {
    id: 'showcase-scratch',
    type: 'scratch',
    version: 1,
    props: {
      coverText: 'Raspa e descobre',
      secretType: 'text',
      secretText: 'Era você o tempo todo.',
    },
    meta,
  } satisfies Block,
  quiz: {
    id: 'showcase-quiz',
    type: 'quiz',
    version: 1,
    props: {
      question: 'Sexta à noite, você e eu. Topa?',
      yesButtonText: 'Topo',
      noButtonText: 'Não',
      successMessage: 'Combinado. Eu passo aí às oito.',
      isPlayfulNo: true,
    },
    meta,
  } satisfies Block,
  hints: {
    id: 'showcase-hints',
    type: 'hints',
    version: 1,
    props: {
      title: 'Quem mandou isso?',
      hints: [
        { id: 'sh1', text: 'Sentei na sua frente o semestre inteiro.' },
        { id: 'sh2', text: 'Ainda lembro da música que você cantarolava.' },
      ],
    },
    meta,
  } satisfies Block,
}
