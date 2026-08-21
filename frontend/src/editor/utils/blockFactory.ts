import {
  BLOCK_VERSION,
  type Block,
  type BlockType,
} from '@/editor/types'

function generateBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createBlock(type: 'text'): Extract<Block, { type: 'text' }>
export function createBlock(type: 'image'): Extract<Block, { type: 'image' }>
export function createBlock(type: 'timer'): Extract<Block, { type: 'timer' }>
export function createBlock(type: 'gallery'): Extract<Block, { type: 'gallery' }>
export function createBlock(type: 'music'): Extract<Block, { type: 'music' }>
export function createBlock(type: 'video'): Extract<Block, { type: 'video' }>
export function createBlock(type: 'envelope'): Extract<Block, { type: 'envelope' }>
export function createBlock(type: 'scratch'): Extract<Block, { type: 'scratch' }>
export function createBlock(type: 'timeline'): Extract<Block, { type: 'timeline' }>
export function createBlock(type: 'quiz'): Extract<Block, { type: 'quiz' }>
export function createBlock(type: 'polaroid'): Extract<Block, { type: 'polaroid' }>
export function createBlock(type: BlockType): Block
export function createBlock(type: BlockType): Block {
  const now = Date.now()

  switch (type) {
    case 'text':
      return {
        id: generateBlockId(),
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Novo texto',
          align: 'left',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'image':
      return {
        id: generateBlockId(),
        type: 'image',
        version: BLOCK_VERSION,
        props: {
          src: '',
          assetId: undefined,
          alt: '',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'timer':
      return {
        id: generateBlockId(),
        type: 'timer',
        version: BLOCK_VERSION,
        props: {
          targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          label: 'Contagem regressiva',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'gallery':
      return {
        id: generateBlockId(),
        type: 'gallery',
        version: BLOCK_VERSION,
        props: {
          images: [],
          items: [],
          transition: 'fade',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'music':
      return {
        id: generateBlockId(),
        type: 'music',
        version: BLOCK_VERSION,
        props: {
          assetId: undefined,
          src: '',
          coverSrc: '',
          coverAssetId: undefined,
          tracks: [],
          title: '',
          artist: '',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'video':
      return {
        id: generateBlockId(),
        type: 'video',
        version: BLOCK_VERSION,
        props: {
          src: '',
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'envelope':
      return {
        id: generateBlockId(),
        type: 'envelope',
        version: BLOCK_VERSION,
        props: {
          recipientName: 'Para o amor da minha vida',
          senderName: 'Com todo o meu amor',
          sealInitial: '💌',
          sealColor: '#e11d48',
          messageSnippet: 'Guardo você no lugar mais especial do meu coração. Cada dia ao seu lado é um presente inesquecível...',
          isOpen: false,
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'scratch':
      return {
        id: generateBlockId(),
        type: 'scratch',
        version: BLOCK_VERSION,
        props: {
          coverText: '✨ Raspe aqui com carinho para descobrir...',
          secretType: 'text',
          secretText: 'Você é a razão do meu sorriso mais sincero todos os dias! Te amo para sempre! ❤️',
          secretImage: '',
          isRevealed: false,
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'timeline':
      return {
        id: generateBlockId(),
        type: 'timeline',
        version: BLOCK_VERSION,
        props: {
          items: [
            {
              id: generateBlockId(),
              date: 'O Começo',
              title: 'Primeiro Olhar',
              description: 'O momento em que nossos olhos se cruzaram e tudo começou a fazer sentido.',
              image: '',
            },
            {
              id: generateBlockId(),
              date: 'Inesquecível',
              title: 'Nosso Primeiro Encontro',
              description: 'Conversas que duraram horas e risadas que ecoam na memória.',
              image: '',
            },
            {
              id: generateBlockId(),
              date: 'Para Sempre',
              title: 'Hoje e o Futuro',
              description: 'A certeza de que escolher você é a melhor decisão de todos os meus dias.',
              image: '',
            },
          ],
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'quiz':
      return {
        id: generateBlockId(),
        type: 'quiz',
        version: BLOCK_VERSION,
        props: {
          question: 'Quer namorar comigo?',
          yesButtonText: 'Sim! Mil vezes sim! ❤️',
          noButtonText: 'Não 🙈',
          successMessage: 'Você me faz a pessoa mais feliz do mundo todo! Prometo te fazer sorrir todos os dias! 🥰💍✨',
          isPlayfulNo: true,
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    case 'polaroid':
      return {
        id: generateBlockId(),
        type: 'polaroid',
        version: BLOCK_VERSION,
        props: {
          photos: [
            {
              id: generateBlockId(),
              src: '',
              caption: 'O melhor sorriso do mundo ✨',
              rotation: -2,
            },
            {
              id: generateBlockId(),
              src: '',
              caption: 'Momentos que guardo no peito 💕',
              rotation: 2.5,
            },
          ],
        },
        meta: {
          createdAt: now,
          updatedAt: now,
        },
      }
    default: {
      const exhaustiveTypeCheck: never = type
      return exhaustiveTypeCheck
    }
  }
}
