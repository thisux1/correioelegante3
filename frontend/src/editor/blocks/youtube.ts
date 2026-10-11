/**
 * Helpers puros para o bloco de YouTube.
 *
 * Nao buscam nada da API do YouTube: apenas extraem o ID do video
 * a partir das formas comuns de URL (watch, youtu.be, shorts, embed,
 * live, music, mobile) ou de um ID de 11 caracteres colado direto.
 */

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//

const PATH_PREFIXES = new Set(['embed', 'shorts', 'live', 'v'])

/**
 * Fallback para quando o valor colado nao e uma URL limpa
 * (ex.: texto com link no meio). Captura o ID depois de
 * youtu.be/, /embed|shorts|live|v/ ou de um parametro ?v=|&v=.
 */
const LOOSE_PATTERN =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/|youtube(?:-nocookie)?\.com\/\S*[?&]v=)([A-Za-z0-9_-]{11})/

function sanitizeVideoId(candidate: string | null | undefined): string | null {
  if (!candidate) {
    return null
  }
  const trimmed = candidate.trim()
  return VIDEO_ID_PATTERN.test(trimmed) ? trimmed : null
}

function isYoutubeHost(hostname: string): boolean {
  return (
    hostname === 'youtube.com' ||
    hostname === 'youtube-nocookie.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname.endsWith('.youtube-nocookie.com')
  )
}

function isYouTubeShortHost(hostname: string): boolean {
  return hostname === 'youtu.be' || hostname.endsWith('.youtu.be')
}

function extractFromUrl(parsed: URL): string | null {
  const hostname = parsed.hostname.toLowerCase()

  if (isYouTubeShortHost(hostname)) {
    const [firstSegment] = parsed.pathname.split('/').filter(Boolean)
    return sanitizeVideoId(firstSegment)
  }

  if (!isYoutubeHost(hostname)) {
    return null
  }

  // youtube.com/watch?v=ID (inclui music.youtube.com e m.youtube.com)
  const vParam = sanitizeVideoId(parsed.searchParams.get('v'))
  if (vParam) {
    return vParam
  }

  const segments = parsed.pathname.split('/').filter(Boolean)
  const prefix = segments[0]?.toLowerCase()
  if (prefix && PATH_PREFIXES.has(prefix)) {
    return sanitizeVideoId(segments[1])
  }

  return null
}

/**
 * Extrai o ID (11 caracteres) de um video do YouTube a partir de
 * qualquer forma comum de URL ou de um ID colado diretamente.
 * Retorna null quando nao reconhece o valor.
 */
export function extractYoutubeVideoId(rawValue: string): string | null {
  const value = rawValue.trim()
  if (!value) {
    return null
  }

  // ID de 11 caracteres colado diretamente.
  if (VIDEO_ID_PATTERN.test(value)) {
    return value
  }

  const withScheme = SCHEME_PATTERN.test(value) ? value : `https://${value}`

  try {
    const parsed = new URL(withScheme)
    const fromUrl = extractFromUrl(parsed)
    if (fromUrl) {
      return fromUrl
    }
  } catch {
    // Nao e uma URL parseavel; tenta o padrao flexivel abaixo.
  }

  const looseMatch = value.match(LOOSE_PATTERN)
  return looseMatch?.[1] ?? null
}

/** Monta a URL de embed usando o host sem cookies. */
export function buildYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
}

/** URL da miniatura publica do video (preview leve no editor). */
export function buildYoutubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
}
