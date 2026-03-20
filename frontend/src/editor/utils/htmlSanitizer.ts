const HTML_TAG_REGEX = /<[^>]*>/g
const MULTIPLE_WHITESPACE_REGEX = /\s+/g

export function stripHtml(html: string): string {
  if (!html) {
    return ''
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return html.replace(HTML_TAG_REGEX, ' ').replace(MULTIPLE_WHITESPACE_REGEX, ' ').trim()
  }

  const container = document.createElement('div')
  container.innerHTML = html

  return (container.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(MULTIPLE_WHITESPACE_REGEX, ' ')
    .trim()
}
