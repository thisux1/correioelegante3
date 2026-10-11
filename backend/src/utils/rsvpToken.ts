import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from './AppError';

/**
 * Token RSVP (S13): HMAC-SHA256 sobre `${pageId}.${blockId}`.
 * O token é derivado por leitura — estável entre requests e não falsificável
 * sem o secret — e nunca é persistido em `page.content`.
 */
function getRsvpSecret(): string {
  const secret = process.env.RSVP_TOKEN_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(
      'RSVP_TOKEN_SECRET/JWT_SECRET não configurado',
      500,
      'RSVP_SECRET_MISSING',
    );
  }
  return secret;
}

export function generateRsvpToken(pageId: string, blockId: string): string {
  return createHmac('sha256', getRsvpSecret())
    .update(`${pageId}.${blockId}`)
    .digest('hex');
}

export function verifyRsvpToken(pageId: string, blockId: string, token: string): boolean {
  const expected = generateRsvpToken(pageId, blockId);
  const received = Buffer.from(token, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (received.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(received, expectedBuffer);
}
