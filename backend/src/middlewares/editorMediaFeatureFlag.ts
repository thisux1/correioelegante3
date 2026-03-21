import { NextFunction, Response } from 'express';
import { resolveEditorMediaUploadAccessForUser } from '../config/featureFlags';
import type { AuthRequest } from './auth';

export function requireEditorMediaUploadFeature(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const decision = resolveEditorMediaUploadAccessForUser(req.userId);

  if (decision.enabled) {
    next();
    return;
  }

  const statusCode = decision.reason === 'global-disabled' ? 503 : 403;
  res.status(statusCode).json({
    error: 'Upload de midia indisponivel para este usuario no momento.',
    code: 'EDITOR_MEDIA_UPLOAD_FEATURE_DISABLED',
    rolloutPercent: decision.rolloutPercent,
    reason: decision.reason,
  });
}
