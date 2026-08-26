export function formatLetterUrl(pageId?: string, customUrl?: string): string {
  if (customUrl) return customUrl
  if (!pageId) return ''

  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    if (isLocal) {
      return `${window.location.origin}/p/${pageId}`
    }

    const origin = window.location.origin.includes('correioelegante')
      ? 'https://www.correioelegante.studio'
      : window.location.origin

    return `${origin}/p/${pageId}`
  }

  return `https://www.correioelegante.studio/p/${pageId}`
}
