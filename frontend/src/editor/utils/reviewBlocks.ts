import type { Block, BlockType } from '@/editor/types'

/**
 * Checklist pré-publicação: detecta blocos que vão renderizar vazios ou
 * quebrados para o destinatário. Cada problema aponta o bloco para pular
 * direto até ele no canvas. Avisos, não bloqueadores — publicar mesmo
 * assim continua possível.
 */
export interface ReviewIssue {
  blockId: string
  blockLabel: string
  problem: string
}

const BLOCK_LABELS: Partial<Record<BlockType, string>> = {
  text: 'Texto',
  image: 'Imagem',
  polaroid: 'Polaroid',
  envelope: 'Envelope',
  scratch: 'Raspadinha',
  timeline: 'Linha do Tempo',
  quiz: 'Pergunta',
  timer: 'Contagem regressiva',
  gallery: 'Galeria',
  music: 'Música',
  video: 'Vídeo',
  youtube: 'YouTube',
  photoBook: 'Livro de Fotos',
  bouquet: 'Buquê',
  hints: 'Dicas',
  intimacyGate: 'Pergunta Secreta',
  ticketRsvp: 'Convite RSVP',
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function reviewBlocks(blocks: Block[]): ReviewIssue[] {
  const issues: ReviewIssue[] = []
  const push = (block: Block, problem: string) => {
    issues.push({
      blockId: block.id,
      blockLabel: BLOCK_LABELS[block.type] ?? 'Bloco',
      problem,
    })
  }

  for (const block of blocks) {
    const props = block.props as Record<string, unknown>

    switch (block.type) {
      case 'text':
        if (!hasText(props.text) && !hasText(props.html)) {
          push(block, 'texto vazio — não aparece nada para quem recebe')
        }
        break
      case 'image':
        if (!hasText(props.src)) push(block, 'imagem sem arquivo nem link')
        break
      case 'polaroid': {
        const photos = Array.isArray(props.photos) ? props.photos : []
        if (photos.length === 0) push(block, 'polaroid sem fotos')
        break
      }
      case 'scratch':
        if (!hasText(props.secretText) && !hasText(props.secretImage)) {
          push(block, 'raspadinha sem segredo embaixo')
        }
        break
      case 'timeline': {
        const items = Array.isArray(props.items) ? props.items : []
        if (items.length === 0) push(block, 'linha do tempo sem marcos')
        break
      }
      case 'quiz':
        if (!hasText(props.question)) push(block, 'pergunta vazia')
        break
      case 'timer':
        if (!hasText(props.targetDate)) {
          push(block, 'contagem regressiva sem data marcada')
        }
        break
      case 'gallery': {
        const images = Array.isArray(props.images) ? props.images : []
        const items = Array.isArray(props.items) ? props.items : []
        if (images.length === 0 && items.length === 0) {
          push(block, 'galeria sem fotos')
        }
        break
      }
      case 'music': {
        const tracks = Array.isArray(props.tracks) ? props.tracks : []
        if (!hasText(props.src) && tracks.length === 0) {
          push(block, 'música sem arquivo nem faixa')
        }
        break
      }
      case 'video':
        if (!hasText(props.src)) push(block, 'vídeo sem arquivo nem link')
        break
      case 'youtube':
        if (!hasText(props.url)) push(block, 'vídeo do YouTube sem link')
        break
      case 'photoBook': {
        const pages = Array.isArray(props.pages) ? props.pages : []
        if (pages.length === 0) {
          push(block, 'livro de fotos sem páginas')
        } else if (pages.every((p) => !hasText((p as { src?: string }).src))) {
          push(block, 'livro de fotos sem nenhuma foto')
        }
        break
      }
      case 'hints': {
        const hints = Array.isArray(props.hints) ? props.hints : []
        const filled = hints.filter((h) => hasText((h as { text?: string }).text))
        if (filled.length === 0) push(block, 'jogo de pistas sem nenhuma dica')
        break
      }
      case 'intimacyGate': {
        const answers = Array.isArray(props.answers) ? props.answers : []
        const filled = answers.filter((a) => hasText(a))
        if (filled.length === 0) {
          push(block, 'pergunta secreta sem resposta aceita — ninguém consegue abrir')
        }
        break
      }
      case 'ticketRsvp': {
        const evento = props.evento as { data?: string; lugar?: string; descricao?: string } | undefined
        if (!evento || (!hasText(evento.data) && !hasText(evento.lugar) && !hasText(evento.descricao))) {
          push(block, 'convite sem data nem lugar — quem recebe não sabe quando e onde')
        }
        break
      }
      default:
        break
    }
  }

  return issues
}
