const HTML_TAG_REGEX = /<[^>]*>/g
const SCRIPT_STYLE_REGEX = /<(script|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi
const MULTIPLE_WHITESPACE_REGEX = /\s+/g

export function stripHtml(html: string): string {
  if (!html) {
    return ''
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return html
      .replace(SCRIPT_STYLE_REGEX, ' ')
      .replace(HTML_TAG_REGEX, ' ')
      .replace(MULTIPLE_WHITESPACE_REGEX, ' ')
      .trim()
  }

  const container = document.createElement('div')
  container.innerHTML = html.replace(SCRIPT_STYLE_REGEX, ' ')

  return (container.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(MULTIPLE_WHITESPACE_REGEX, ' ')
    .trim()
}
