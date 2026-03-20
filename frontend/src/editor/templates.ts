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

function cloneBlockProps<TBlock extends Block>(block: TBlock): TBlock['props'] {
  if (typeof structuredClone === 'function') {
    return structuredClone(block.props)
  }

  return JSON.parse(JSON.stringify(block.props)) as TBlock['props']
}

export function cloneTemplateBlocks(templateBlocks: Block[]): Block[] {
  const baseTimestamp = Date.now()

  return templateBlocks.map((block, index) => {
    const nextMeta = {
      createdAt: baseTimestamp + index,
      updatedAt: baseTimestamp + index,
    }

    switch (block.type) {
      case 'text':
        return {
          ...block,
          id: generateBlockId(),
          version: BLOCK_VERSION,
          props: cloneBlockProps(block),
          meta: nextMeta,
        }
      case 'image':
        return {
          ...block,
          id: generateBlockId(),
          version: BLOCK_VERSION,
          props: cloneBlockProps(block),
          meta: nextMeta,
        }
      case 'timer':
        return {
          ...block,
          id: generateBlockId(),
          version: BLOCK_VERSION,
          props: cloneBlockProps(block),
          meta: nextMeta,
        }
      case 'gallery':
        return {
          ...block,
          id: generateBlockId(),
          version: BLOCK_VERSION,
          props: cloneBlockProps(block),
          meta: nextMeta,
        }
      case 'music':
        return {
          ...block,
          id: generateBlockId(),
          version: BLOCK_VERSION,
          props: cloneBlockProps(block),
          meta: nextMeta,
        }
      default: {
        const exhaustiveTypeCheck: never = block
        return exhaustiveTypeCheck
      }
    }
  })
}

export const templates: Template[] = [
  {
    id: 'romantico-inicial',
    name: 'Romantico inicial',
    description: 'Estrutura curta para uma declaracao com capa e mensagem principal.',
    thumbnail: 'https://placehold.co/640x360/FCE7F3/9D174D?text=Romantico',
    category: 'romantic',
    theme: 'romantic-sunset',
    blocks: [
      {
        id: 'tpl-romantic-title',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Para voce, com carinho',
          align: 'center',
        },
        meta: {
          createdAt: 0,
          updatedAt: 0,
        },
      },
      {
        id: 'tpl-romantic-image',
        type: 'image',
        version: BLOCK_VERSION,
        props: {
          src: 'https://placehold.co/1200x800/FDF2F8/831843?text=Sua+foto+especial',
          alt: 'Imagem especial do casal',
        },
        meta: {
          createdAt: 0,
          updatedAt: 0,
        },
      },
      {
        id: 'tpl-romantic-body',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Obrigado por tornar meus dias mais leves. Este espaco e todo seu.',
          align: 'left',
        },
        meta: {
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ],
  },
  {
    id: 'amizade-memorias',
    name: 'Amizade e memorias',
    description: 'Modelo simples para celebrar historias, gratidao e bons momentos.',
    thumbnail: 'https://placehold.co/640x360/DBEAFE/1E3A8A?text=Amizade',
    category: 'friendship',
    theme: 'ocean-breeze',
    blocks: [
      {
        id: 'tpl-friendship-title',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Uma mensagem para minha pessoa favorita',
          align: 'center',
        },
        meta: {
          createdAt: 0,
          updatedAt: 0,
        },
      },
      {
        id: 'tpl-friendship-body',
        type: 'text',
        version: BLOCK_VERSION,
        props: {
          text: 'Deixo aqui nosso cantinho para lembrar conquistas, risadas e planos.',
          align: 'left',
        },
        meta: {
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ],
  },
]

export function getTemplateById(templateId: string): Template | undefined {
  return templates.find((template) => template.id === templateId)
}
