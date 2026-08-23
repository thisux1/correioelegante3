import jwt from 'jsonwebtoken';

function getJwtSecret(envKey: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`${envKey} é obrigatória. Configure a variável de ambiente.`);
  }
  return value;
}

const JWT_SECRET = getJwtSecret('JWT_SECRET');
const JWT_REFRESH_SECRET = getJwtSecret('JWT_REFRESH_SECRET');

export interface JwtPayloadData {
  userId: string;
  /** Token version — incrementada na troca de senha para revogar tokens antigos */
  tv: number;
}

function parsePayload(payload: string | jwt.JwtPayload): JwtPayloadData {
  if (
    typeof payload === 'string' ||
    typeof payload.userId !== 'string' ||
    typeof payload.tv !== 'number'
  ) {
    throw new Error('Token JWT inválido');
  }
  return { userId: payload.userId, tv: payload.tv };
}

export function generateAccessToken(userId: string, tokenVersion: number = 0): string {
  return jwt.sign({ userId, tv: tokenVersion }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string, tokenVersion: number = 0): string {
  return jwt.sign({ userId, tv: tokenVersion }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): JwtPayloadData {
  const payload = jwt.verify(token, JWT_SECRET);
  return parsePayload(payload);
}

export function verifyRefreshToken(token: string): JwtPayloadData {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET);
  return parsePayload(payload);
}
