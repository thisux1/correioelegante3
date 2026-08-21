const HTML_TAG_REGEX = /<[^>]*>/g
const SCRIPT_STYLE_REGEX = /<(script|style|iframe|object|embed|applet|form|svg|math)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi
const MULTIPLE_WHITESPACE_REGEX = /\s+/g

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'div',
  'span',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'del',
  'mark',
  'font',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'small',
  'sub',
  'sup',
  'hr',
])

const DANGEROUS_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'link',
  'meta',
  'base',
  'svg',
  'math',
  'template',
  'dialog',
])

const SAFE_CSS_PROPERTIES = new Set([
  'color',
  'background-color',
  'background',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-decoration-line',
  'text-align',
  'letter-spacing',
  'line-height',
  'padding',
  'padding-left',
  'padding-right',
  'padding-top',
  'padding-bottom',
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'border-radius',
])

function sanitizeCssValue(value: string): boolean {
  const normalized = value.toLowerCase()
  if (
    normalized.includes('javascript:')
    || normalized.includes('expression(')
    || normalized.includes('url(')
    || normalized.includes('@import')
    || normalized.includes('-moz-binding')
    || normalized.includes('behavior:')
  ) {
    return false
  }
  return true
}

function sanitizeStyleAttribute(styleValue: string): string {
  if (!styleValue) {
    return ''
  }

  const declarations = styleValue.split(';')
  const safeDeclarations: string[] = []

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':')
    if (colonIndex === -1) {
      continue
    }

    const prop = declaration.slice(0, colonIndex).trim().toLowerCase()
    const val = declaration.slice(colonIndex + 1).trim()

    if (SAFE_CSS_PROPERTIES.has(prop) && sanitizeCssValue(val)) {
      safeDeclarations.push(`${prop}: ${val}`)
    }
  }

  return safeDeclarations.join('; ')
}

export function sanitizeHtml(html: string): string {
  if (!html) {
    return ''
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return html
      .replace(SCRIPT_STYLE_REGEX, '')
      .replace(/<([a-z0-9]+)\b([^>]*)>/gi, (_match, tag, attrs) => {
        const lowerTag = tag.toLowerCase()
        if (DANGEROUS_TAGS.has(lowerTag) || !ALLOWED_TAGS.has(lowerTag)) {
          return ''
        }
        const cleanedAttrs = attrs.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
        return `<${lowerTag}${cleanedAttrs}>`
      })
  }

  const container = document.createElement('div')
  container.innerHTML = html

  function cleanNode(node: Node): void {
    const childNodes = Array.from(node.childNodes)

    for (const child of childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement
        const tagName = element.tagName.toLowerCase()

        if (DANGEROUS_TAGS.has(tagName)) {
          element.remove()
          continue
        }

        if (!ALLOWED_TAGS.has(tagName)) {
          // Replace tag with its text/children
          while (element.firstChild) {
            element.parentNode?.insertBefore(element.firstChild, element)
          }
          element.remove()
          continue
        }

        // Clean attributes
        const attributes = Array.from(element.attributes)
        for (const attr of attributes) {
          const name = attr.name.toLowerCase()

          if (name.startsWith('on') || name.startsWith('data-on')) {
            element.removeAttribute(attr.name)
            continue
          }

          if (name === 'style') {
            const sanitizedStyle = sanitizeStyleAttribute(attr.value)
            if (sanitizedStyle) {
              element.setAttribute('style', sanitizedStyle)
            } else {
              element.removeAttribute('style')
            }
          } else if (tagName === 'a' && name === 'href') {
            const val = attr.value.trim().toLowerCase()
            if (val.startsWith('javascript:') || val.startsWith('vbscript:') || val.startsWith('data:')) {
              element.removeAttribute('href')
            } else {
              element.setAttribute('target', '_blank')
              element.setAttribute('rel', 'noopener noreferrer')
            }
          } else if (tagName === 'font' && (name === 'color' || name === 'face' || name === 'size')) {
            // Keep safe font attributes
          } else if (name === 'class' || name === 'id') {
            // Drop custom IDs/classes to avoid clashes
            element.removeAttribute(attr.name)
          } else if (tagName === 'a' && (name === 'target' || name === 'rel' || name === 'title')) {
            // Keep safe link attributes
          } else if (name !== 'style') {
            element.removeAttribute(attr.name)
          }
        }

        // Recursively clean children
        cleanNode(element)
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
      }
    }
  }

  cleanNode(container)
  return container.innerHTML
}

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

