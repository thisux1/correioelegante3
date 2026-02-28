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

function parsePayload(payload: string | jwt.JwtPayload): { userId: string } {
  if (typeof payload === 'string' || typeof payload.userId !== 'string') {
    throw new Error('Token JWT inválido');
  }
  return { userId: payload.userId };
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { userId: string } {
  const payload = jwt.verify(token, JWT_SECRET);
  return parsePayload(payload);
}

export function verifyRefreshToken(token: string): { userId: string } {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET);
  return parsePayload(payload);
}
