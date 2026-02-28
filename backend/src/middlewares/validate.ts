import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map(e => e.message).join(', ');
      throw new AppError(messages, 400, 'VALIDATION_ERROR');
    }
    req.body = result.data;
    next();
  };
}

// MongoDB ObjectId: 24-character hex string
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function validateObjectId(...paramNames: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const param of paramNames) {
      const value = req.params[param];
      const id = Array.isArray(value) ? value[0] : value;
      if (!id || !OBJECT_ID_REGEX.test(id)) {
        throw new AppError(`Identificador inválido: ${param}`, 400, 'INVALID_ID');
      }
    }
    next();
  };
}
