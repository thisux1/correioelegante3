import { BLOCK_VERSION, type Block } from '@/editor/types'

export type TemplateCategory = 'romantic' | 'friendship' | 'secret' | 'classic' | 'poetic'

export interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  category: TemplateCategory
  blocks: Block[]
  theme?: string
}

function generateBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function cloneBlock(block: Block, nextMeta: { createdAt: number; updatedAt: number }): Block {
  const clonedProps = (
    typeof structuredClone === 'function'
      ? structuredClone(block.props)
      : JSON.parse(JSON.stringify(block.props))
  ) as typeof block.props

  return {
    ...block,
    id: generateBlockId(),
    version: BLOCK_VERSION,
    props: clonedProps,
    meta: nextMeta,
  } as Block
}

export function cloneTemplateBlocks(templateBlocks: Block[]): Block[] {
  const baseTimestamp = Date.now()

  return templateBlocks.map((block, index) => {
    const nextMeta = {
      createdAt: baseTimestamp + index,
      updatedAt: baseTimestamp + index,
    }

    return cloneBlock(block, nextMeta)
  })
}

export const templates: Template[] = [
  {
    id: 'pedido-especial',
    name: 'Pedido Especial & Compromisso',
    description: 'Carta intimista com lacre de cera, memórias fotográficas, marcos da nossa caminhada e a pergunta definitiva.',
    thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=640&q=80',
    category: 'romantic',
    theme: 'rose-garden',
    blocks: [
      {
        id: 'tpl-envelope-1',
        type: 'envelope',
        version: BLOCK_VERSION,
        props: {
          recipientName: 'Para Helena',
          senderName: 'Com todo meu afeto, Gabriel',
          sealInitial: 'G',
          sealColor: '#be123c',
          messageSnippet: 'Guardei neste envelope aquilo que meus olhos tentam lhe dizer em silêncio todos os dias. A nossa história se tornou o meu lugar favorito no mundo.',
          isOpen: false,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-polaroids-1',
        type: 'polaroid',
        version: BLOCK_VERSION,
        props: {
          photos: [
            {
              id: 'photo-1',
              src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
              caption: 'Primeiro café',
              rotation: -3,
            },
            {
              id: 'photo-2',
              src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
              caption: 'Nosso cantinho',
              rotation: 3.5,
            },
          ],
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-timeline-1',
        type: 'timeline',
        version: BLOCK_VERSION,
        props: {
          items: [
            {
              id: 'time-1',
              date: '14 de Outubro',
              title: 'O primeiro café',
              description: 'Uma conversa despretensiosa na esquina que se estendeu até as luzes da cidade se acenderem.',
            },
            {
              id: 'time-2',
              date: '28 de Julho',
              title: 'A viagem para a serra',
              description: 'A neblina na estrada, a música baixa no rádio e a certeza de que qualquer caminho contigo basta.',
            },
            {
              id: 'time-3',
              date: 'Hoje',
              title: 'O próximo passo',
              description: 'Não consigo mais imaginar os meus dias sem a sua presença ao meu lado.',
            },
          ],
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-quiz-1',
        type: 'quiz',
        version: BLOCK_VERSION,
        props: {
          question: 'Aceita dividir a vida inteira comigo?',
          yesButtonText: 'Sim, com todo o coração',
          noButtonText: 'Não',
          successMessage: 'Prometo honrar cada um dos nossos dias, no silêncio e na festa, com todo o amor e cumplicidade que trago no peito.',
          isPlayfulNo: true,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
  {
    id: 'aniversario-memorias',
    name: 'Aniversário de Relacionamento',
    description: 'Contador do tempo compartilhado, registros visuais e declaração sobre a beleza da cumplicidade cotidiana.',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=640&q=80',
    category: 'classic',
    theme: 'golden-hour',
    blocks: [
      {
        id: 'tpl-aniv-title',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Descobrir que o amor verdadeiro se constrói na calma dos dias comuns.',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-aniv-timer',
        type: 'timer',
        version: BLOCK_VERSION,
        props: {
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          label: 'Tempo da nossa caminhada juntos',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-aniv-polaroids',
        type: 'polaroid',
        version: BLOCK_VERSION,
        props: {
          photos: [
            {
              id: 'aniv-p1',
              src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80',
              caption: 'Aquele domingo',
              rotation: -2.5,
            },
            {
              id: 'aniv-p2',
              src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
              caption: 'Para sempre',
              rotation: 2,
            },
          ],
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-aniv-text',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Obrigado pela paciência nos momentos difíceis, pela ternura nos pequenos detalhes e pela cumplicidade que nunca nos faltou. Que venham os próximos anos com a mesma calma com que você segura a minha mão.',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
  {
    id: 'admirador-secreto',
    name: 'Admirador Secreto',
    description: 'Carta enigmática sob atmosfera noturna, texto charmoso e raspadinha para revelar a identidade.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=640&q=80',
    category: 'secret',
    theme: 'midnight-galaxy',
    blocks: [
      {
        id: 'tpl-secret-envelope',
        type: 'envelope',
        version: BLOCK_VERSION,
        props: {
          recipientName: 'Para você',
          senderName: 'De alguém que observa seus passos',
          sealInitial: 'S',
          sealColor: '#1e1b4b',
          messageSnippet: 'Há pessoas que apenas passam pela rotina. Você, sem nenhum esforço aparente, transforma todo o espaço ao seu redor.',
          isOpen: false,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-secret-text',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Há semanas procuro o momento e a coragem certa para dizer o quanto admiro a sua presença e o seu jeito singular de ver o mundo. Como as palavras nem sempre saem com facilidade ao vivo, deixo aqui este pequeno mistério.',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-secret-scratch',
        type: 'scratch',
        version: BLOCK_VERSION,
        props: {
          coverText: 'Raspe suavemente aqui para descobrir quem escreveu',
          secretType: 'text',
          secretText: 'Sou eu, Lucas. Se você permitir, gostaria de lhe convidar para um café amanhã e conversar olhando nos seus olhos.',
          isRevealed: false,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
  {
    id: 'declaracao-poetica',
    name: 'Declaração Poética & Pergaminho',
    description: 'Carta literária intimista em pergaminho clássico, inspirada na prosa poética brasileira contemporânea.',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80',
    category: 'poetic',
    theme: 'vintage-parchment',
    blocks: [
      {
        id: 'tpl-poetic-title',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Carta em tom maior',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-poetic-body',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Sei que o mundo tem pressa e que quase tudo se dissolve na velocidade dos dias. Mas quando penso em você, o tempo ganha outra textura, como quem desacelera o passo para escutar a chuva cair na janela.\n\nVocê trouxe para a minha vida uma delicadeza que eu já não esperava encontrar. Não se trata de grandes promessas ou discursos decorados, mas da tranquilidade de saber que, no meio de tanto ruído, existe alguém que me devolve o silêncio e a paz.',
          align: 'left',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-poetic-polaroid',
        type: 'polaroid',
        version: BLOCK_VERSION,
        props: {
          photos: [
            {
              id: 'poetic-p1',
              src: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
              caption: 'Instante eterno',
              rotation: 1.8,
            },
          ],
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-poetic-footer',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Que estas linhas guardem com carinho aquilo que nem a distância nem a passagem do tempo poderão apagar.',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
]

export function getTemplateById(templateId: string): Template | undefined {
  return templates.find((template) => template.id === templateId)
}
