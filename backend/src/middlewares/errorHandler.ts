import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { sendCriticalAlert } from '../services/alert.service';

export function errorHandler(
  err: Error,
  req: Request,
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

  // Prisma validation errors (e.g. malformed ObjectId, wrong query shape)
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({
      error: 'Requisição inválida ou identificador mal formatado',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Prisma known request errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code?: string };
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        error: 'Conflito de dados. Verifique se o recurso já existe.',
        code: 'DATABASE_CONFLICT',
      });
      return;
    }
    if (prismaErr.code === 'P2023' || prismaErr.code === 'P2025') {
      res.status(404).json({
        error: 'Recurso não encontrado ou identificador inválido',
        code: 'NOT_FOUND',
      });
      return;
    }
    console.error('Prisma error:', err);
    void sendCriticalAlert({
      context: 'server_error',
      title: `Erro de banco de dados em ${req.method} ${req.path}`,
      error: err,
    });
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'DATABASE_ERROR',
    });
    return;
  }

  console.error('Unexpected error:', err);
  void sendCriticalAlert({
    context: 'server_error',
    title: `Erro interno em ${req.method} ${req.path}`,
    error: err,
  });
  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
