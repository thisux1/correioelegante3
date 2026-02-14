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
