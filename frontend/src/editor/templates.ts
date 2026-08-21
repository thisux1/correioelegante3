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
    name: 'Pedido Especial & Interativo',
    description: 'Envelope com lacre de cera, fotos polaroid, linha do tempo e a pergunta final com botão interativo.',
    thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=640&q=80',
    category: 'romantic',
    theme: 'rose-garden',
    blocks: [
      {
        id: 'tpl-envelope-1',
        type: 'envelope',
        version: BLOCK_VERSION,
        props: {
          recipientName: 'Meu Amor',
          senderName: 'Seu eterno apaixonado',
          sealInitial: '❤️',
          sealColor: '#e11d48',
          messageSnippet: 'Guardo aqui algo que meu coração queria te dizer há muito tempo...',
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
              caption: 'O dia em que tudo começou ✨',
              rotation: -3,
            },
            {
              id: 'photo-2',
              src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
              caption: 'Nossa melhor viagem juntinhos ❤️',
              rotation: 4,
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
              date: 'Primeiro Encontro',
              title: 'Quando tudo mudou',
              description: 'Lembro exatamente do seu sorriso iluminando o lugar.',
            },
            {
              id: 'time-2',
              date: 'Hoje',
              title: 'A certeza do nosso amor',
              description: 'Cada segundo ao seu lado se tornou o meu momento favorito do dia.',
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
          question: 'Quer namorar comigo para sempre?',
          yesButtonText: 'SIM, mil vezes sim! ❤️',
          noButtonText: 'Não...',
          successMessage: 'Você me faz a pessoa mais feliz do mundo! Te amo infinitamente! 💍✨',
          isPlayfulNo: true,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
  {
    id: 'aniversario-memorias',
    name: 'Aniversário & Linha do Tempo',
    description: 'Comemore o tempo juntos com timer, memórias fotográficas e declaração emocionante.',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=640&q=80',
    category: 'classic',
    theme: 'golden-hour',
    blocks: [
      {
        id: 'tpl-aniv-title',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Celebrando Cada Segundo com Você ✨',
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
          label: 'Tempo de pura felicidade juntos',
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
              caption: 'Colecionando sorrisos e momentos.',
              rotation: -2,
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
          text: 'Obrigado por ser meu porto seguro e a minha maior alegria. Feliz aniversário para nós!',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
  {
    id: 'admirador-secreto',
    name: 'Admirador Secreto com Raspadinha',
    description: 'Atmosfera misteriosa de galáxia, mensagem enigmática e raspadinha para revelar o remetente.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=640&q=80',
    category: 'secret',
    theme: 'midnight-galaxy',
    blocks: [
      {
        id: 'tpl-secret-envelope',
        type: 'envelope',
        version: BLOCK_VERSION,
        props: {
          recipientName: 'Você',
          senderName: 'Alguém especial',
          sealInitial: '✨',
          sealColor: '#4338ca',
          messageSnippet: 'Você recebeu um recado de um admirador secreto...',
          isOpen: false,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-secret-text',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Você tem aquele jeito único que ilumina qualquer lugar. Não pude resistir em te mandar esse recado.',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-secret-scratch',
        type: 'scratch',
        version: BLOCK_VERSION,
        props: {
          coverText: '✨ Raspe aqui para descobrir quem eu sou ✨',
          secretType: 'text',
          secretText: 'Sou eu! Sempre admirei você em silêncio. Que tal um café? 😉',
          isRevealed: false,
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
  {
    id: 'declaracao-poetica',
    name: 'Poema Eterno & Pergaminho',
    description: 'Carta clássica com textura de pergaminho vintage, citação poética e estética intimista.',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80',
    category: 'poetic',
    theme: 'vintage-parchment',
    blocks: [
      {
        id: 'tpl-poetic-title',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Nas entrelinhas do meu coração',
          align: 'center',
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
      {
        id: 'tpl-poetic-body',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Se a poesia tivesse um rosto, teria o seu olhar. Que estas palavras guardem para sempre o que sinto por você.',
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
              caption: 'Eternizado no tempo e no coração.',
              rotation: 2,
            },
          ],
        },
        meta: { createdAt: 0, updatedAt: 0 },
      },
    ],
  },
]

export function getTemplateById(templateId: string): Template | undefined {
  return templates.find((template) => template.id === templateId)
}
