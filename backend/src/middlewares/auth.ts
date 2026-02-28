import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Token inválido', 401, 'TOKEN_INVALID');
  }
}
