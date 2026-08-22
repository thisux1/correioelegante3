export function formatLetterUrl(pageId?: string, customUrl?: string): string {
  if (customUrl) return customUrl
  if (!pageId) return ''

  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    if (isLocal) {
      return `${window.location.origin}/card/page/${pageId}`
    }
  }

  return `https://correioelegante.studio/p/${pageId}`
}
