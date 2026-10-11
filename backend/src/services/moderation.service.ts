/**
 * Moderação L1 determinística (§10.3) — roda na entrada do gerador público e
 * na publicação. Calibrada para abuso/doxxing/exposição de dados de terceiros,
 * NÃO para romantismo: "amo você" nunca pode ser barrado.
 *
 * verdict:
 *  - 'blocked': abuso explícito — ameaça, slur, sexualização de menor. Recusa.
 *  - 'flagged': possível dado pessoal (telefone, CPF, email, cartão). Permite,
 *    mas registra — o destinatário pode estar sendo doxxado pelo remetente.
 *  - 'pass': limpo.
 */
export type ModerationFlag =
  | 'pii_phone'
  | 'pii_cpf'
  | 'pii_email'
  | 'pii_card'
  | 'abuse_threat'
  | 'abuse_slur'
  | 'sexual_minor'

export interface ModerationResult {
  verdict: 'pass' | 'flagged' | 'blocked'
  flags: ModerationFlag[]
}

const PHONE_RE = /\(?\d{2}\)?\s?9?\d{4}[\s-]?\d{4}/
const CPF_RE = /\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[\s-]?\d{2}\b/
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const CARD_RE = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/

// Ameaça/perseguição — padrões que não têm leitura romântica possível.
const THREAT_RES = [
  /vou\s+(te\s+)?(matar|machucar|encontrar|pegar)\b/i,
  /te\s+acho\s+onde\s+(você|vc)\s+(mora|estuda|trabalha)/i,
  /sei\s+onde\s+(você|vc)\s+(mora|estuda|trabalha)/i,
  /(você|vc)\s+vai\s+pagar\b/i,
]

// Slurs/abuse — lista curta e inequívoca; nomes próprios não entram.
const SLUR_RES = [
  /\b(vagabunda|vadia|puta)\b/i,
  /\b(fracassad[oa]|inútil|lixo\s+humano)\b/i,
]

// Sexualização de menor — termos sem leitura alternativa.
const MINOR_RES = [
  /\bmenor\s+de\s+idade.{0,30}(gostosa|delicia|nude)/i,
  /\bnudes?\s+de\s+(menor|criança|adolescente)/i,
]

const BLOCKING_FLAGS: ReadonlySet<ModerationFlag> = new Set([
  'abuse_threat',
  'abuse_slur',
  'sexual_minor',
])

const PII_CHECKS: Array<[ModerationFlag, RegExp]> = [
  ['pii_card', CARD_RE],
  ['pii_cpf', CPF_RE],
  ['pii_email', EMAIL_RE],
  ['pii_phone', PHONE_RE],
]

function collectFlags(text: string, out: Set<ModerationFlag>): void {
  const normalized = text.normalize('NFC')
  for (const re of THREAT_RES) {
    if (re.test(normalized)) out.add('abuse_threat')
  }
  for (const re of SLUR_RES) {
    if (re.test(normalized)) out.add('abuse_slur')
  }
  for (const re of MINOR_RES) {
    if (re.test(normalized)) out.add('sexual_minor')
  }
  for (const [flag, re] of PII_CHECKS) {
    if (re.test(normalized)) out.add(flag)
  }
}

export function scanText(text: string): ModerationResult {
  const flags = new Set<ModerationFlag>()
  collectFlags(text, flags)
  const list = [...flags]
  const verdict = list.some((f) => BLOCKING_FLAGS.has(f))
    ? 'blocked'
    : list.length > 0
      ? 'flagged'
      : 'pass'
  return { verdict, flags: list }
}

/** Varre todos os campos de texto livre do brief. */
export function scanBriefText(fields: Array<string | undefined>): ModerationResult {
  const flags = new Set<ModerationFlag>()
  for (const field of fields) {
    if (typeof field === 'string' && field.length > 0) {
      collectFlags(field, flags)
    }
  }
  const list = [...flags]
  const verdict = list.some((f) => BLOCKING_FLAGS.has(f))
    ? 'blocked'
    : list.length > 0
      ? 'flagged'
      : 'pass'
  return { verdict, flags: list }
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out)
  } else if (value !== null && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, out)
  }
}

/** Moderação pré-publicação: varre todo texto dos props de todos os blocos. */
export function scanPageContent(content: { blocks?: Array<{ props?: unknown }> }): ModerationResult {
  const fields: string[] = []
  for (const block of content.blocks ?? []) {
    collectStrings(block.props, fields)
  }
  return scanBriefText(fields)
}
