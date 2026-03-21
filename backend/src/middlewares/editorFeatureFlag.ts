import { NextFunction, Response } from 'express';
import { resolveEditorAccessForUser } from '../config/featureFlags';
import type { AuthRequest } from './auth';

export function requireEditorFeature(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const decision = resolveEditorAccessForUser(req.userId);

  if (decision.enabled) {
    next();
    return;
  }

  const statusCode = decision.reason === 'global-disabled' ? 503 : 403;
  res.status(statusCode).json({
    error: 'Editor modular indisponivel para este usuario no momento.',
    code: 'EDITOR_MODULAR_FEATURE_DISABLED',
    rolloutPercent: decision.rolloutPercent,
    reason: decision.reason,
  });
}
