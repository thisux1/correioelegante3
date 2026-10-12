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
  memoryCard: 'Memória',
  hiddenNotes: 'Bilhetes Escondidos',
  togetherCounter: 'Tempo Juntos',
}

/**
 * O que quem recebe faz em cada parte — usado na matriz de completude da
 * etapa "Testar" (mesmo modelo mental do meupresente.app).
 */
const BLOCK_EXPERIENCE: Partial<Record<BlockType, string>> = {
  text: 'lê a mensagem',
  image: 'vê a imagem',
  polaroid: 'folheia as polaroids',
  envelope: 'abre o envelope',
  scratch: 'raspa pra revelar o segredo',
  timeline: 'percorre a linha do tempo',
  quiz: 'responde a pergunta',
  timer: 'vê a contagem regressiva',
  gallery: 'vê a galeria de fotos',
  music: 'ouve a música',
  video: 'assiste o vídeo',
  youtube: 'assiste o vídeo do YouTube',
  photoBook: 'abre o livro de fotos',
  bouquet: 'vê o buquê',
  hints: 'descobre as pistas',
  intimacyGate: 'responde pra destravar',
  ticketRsvp: 'responde ao convite',
  memoryCard: 'vê a memória',
  hiddenNotes: 'procura os bilhetes escondidos',
  togetherCounter: 'vê o tempo de história juntos',
}

/** Uma parte da página na matriz de completude. */
export interface BlockReview {
  blockId: string
  blockLabel: string
  /** O que quem recebe faz nesta parte. */
  experience: string
  /** Presente quando a parte está incompleta. */
  problem?: string
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function blockProblems(block: Block): string[] {
  const problems: string[] = []
  const props = block.props as Record<string, unknown>
  const push = (problem: string) => problems.push(problem)

  switch (block.type) {
    case 'text':
      if (!hasText(props.text) && !hasText(props.html)) {
        push('texto vazio — não aparece nada para quem recebe')
      }
      break
    case 'image':
      if (!hasText(props.src)) push('imagem sem arquivo nem link')
      break
    case 'polaroid': {
      const photos = Array.isArray(props.photos) ? props.photos : []
      if (photos.length === 0) push('polaroid sem fotos')
      break
    }
    case 'scratch':
      if (!hasText(props.secretText) && !hasText(props.secretImage)) {
        push('raspadinha sem segredo embaixo')
      }
      break
    case 'timeline': {
      const items = Array.isArray(props.items) ? props.items : []
      if (items.length === 0) push('linha do tempo sem marcos')
      break
    }
    case 'quiz':
      if (!hasText(props.question)) push('pergunta vazia')
      break
    case 'timer':
      if (!hasText(props.targetDate)) {
        push('contagem regressiva sem data marcada')
      }
      break
    case 'gallery': {
      const images = Array.isArray(props.images) ? props.images : []
      const items = Array.isArray(props.items) ? props.items : []
      if (images.length === 0 && items.length === 0) {
        push('galeria sem fotos')
      }
      break
    }
    case 'music': {
      const tracks = Array.isArray(props.tracks) ? props.tracks : []
      if (!hasText(props.src) && tracks.length === 0) {
        push('música sem arquivo nem faixa')
      }
      break
    }
    case 'video':
      if (!hasText(props.src)) push('vídeo sem arquivo nem link')
      break
    case 'youtube':
      if (!hasText(props.url)) push('vídeo do YouTube sem link')
      break
    case 'photoBook': {
      const pages = Array.isArray(props.pages) ? props.pages : []
      if (pages.length === 0) {
        push('livro de fotos sem páginas')
      } else if (pages.every((p) => !hasText((p as { src?: string }).src))) {
        push('livro de fotos sem nenhuma foto')
      }
      break
    }
    case 'hints': {
      const hints = Array.isArray(props.hints) ? props.hints : []
      const filled = hints.filter((h) => hasText((h as { text?: string }).text))
      if (filled.length === 0) push('jogo de pistas sem nenhuma dica')
      break
    }
    case 'intimacyGate': {
      const answers = Array.isArray(props.answers) ? props.answers : []
      const filled = answers.filter((a) => hasText(a))
      if (filled.length === 0) {
        push('pergunta secreta sem resposta aceita — ninguém consegue abrir')
      }
      break
    }
    case 'ticketRsvp': {
      const evento = props.evento as { data?: string; lugar?: string; descricao?: string } | undefined
      if (!evento || (!hasText(evento.data) && !hasText(evento.lugar) && !hasText(evento.descricao))) {
        push('convite sem data nem lugar — quem recebe não sabe quando e onde')
      }
      break
    }
    case 'memoryCard': {
      const hasContent =
        hasText(props.title) ||
        hasText(props.text) ||
        hasText(props.imageSrc) ||
        hasText(props.date) ||
        hasText(props.place)
      if (!hasContent) {
        push('memória vazia — não aparece nada para quem recebe')
      }
      break
    }
    case 'hiddenNotes': {
      const notes = Array.isArray(props.notes) ? props.notes : []
      const filled = notes.filter((n) => hasText((n as { text?: string }).text))
      if (filled.length === 0) {
        push('bilhetes escondidos sem nenhum texto — não aparece nada')
      }
      break
    }
    case 'togetherCounter':
      if (!hasText(props.startDate)) {
        push('contador sem data de início — não aparece nada')
      }
      break
    default:
      break
  }

  return problems
}

export function reviewBlocks(blocks: Block[]): ReviewIssue[] {
  return blocks.flatMap((block) =>
    blockProblems(block).map((problem) => ({
      blockId: block.id,
      blockLabel: BLOCK_LABELS[block.type] ?? 'Bloco',
      problem,
    })),
  )
}

/**
 * Matriz de completude da etapa "Testar": uma linha por parte da página,
 * na ordem em que quem recebe vai viver. `problem` ausente = parte pronta.
 */
export function reviewPage(blocks: Block[]): BlockReview[] {
  return blocks.map((block) => ({
    blockId: block.id,
    blockLabel: BLOCK_LABELS[block.type] ?? 'Bloco',
    experience: BLOCK_EXPERIENCE[block.type] ?? 'aparece na página',
    problem: blockProblems(block)[0],
  }))
}
