import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Already sent a response — nothing to do
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map(e => e.message).join(', ');
    res.status(400).json({
      error: messages,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Prisma known request errors (e.g. unique constraint violation)
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(409).json({
      error: 'Conflito de dados. Verifique se o recurso já existe.',
      code: 'DATABASE_CONFLICT',
    });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
  });
}
