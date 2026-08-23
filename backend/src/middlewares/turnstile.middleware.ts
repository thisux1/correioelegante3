import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';


export async function validateTurnstile(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET;

  // Fail-closed em produção: sem secret configurado, a proteção contra bots
  // ficaria indisponível — a requisição é rejeitada (pode desativar
  // explicitamente com TURNSTILE_DISABLED=true em casos excepcionais).
  if (!secret) {
    if (process.env.NODE_ENV === 'production' && process.env.TURNSTILE_DISABLED !== 'true') {
      throw new AppError(
        'Serviço de verificação de segurança indisponível. Tente novamente mais tarde.',
        503,
        'TURNSTILE_NOT_CONFIGURED'
      );
    }
    return next();
  }

  const token = (
    req.body?.['cf-turnstile-response'] ||
    req.body?.turnstileToken ||
    req.headers['cf-turnstile-response']
  );

  if (process.env.NODE_ENV === 'test' && !token) {
    return next();
  }

  if (typeof token !== 'string' || token.trim().length === 0 || token.length > 2048) {
    throw new AppError(
      'Validação de segurança obrigatória não informada ou inválida.',
      403,
      'TURNSTILE_TOKEN_REQUIRED'
    );
  }

  const clientIp = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    ''
  );

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret,
        response: token.trim(),
        remoteip: clientIp,
      }),
    });

    if (!response.ok) {
      throw new Error(`siteverify returned HTTP ${response.status}`);
    }

    const result = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
      challenge_ts?: string;
      hostname?: string;
      action?: string;
      cdata?: string;
    };

    if (!result.success) {
      throw new AppError(
        'Falha na validação de segurança. Por favor, tente novamente.',
        403,
        'TURNSTILE_FAILED'
      );
    }

    return next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Não foi possível concluir a verificação de segurança com a Cloudflare.',
      502,
      'TURNSTILE_SERVICE_ERROR'
    );
  }
}
