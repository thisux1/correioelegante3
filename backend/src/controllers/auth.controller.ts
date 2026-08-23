import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import * as authService from '../services/auth.service';

function setCookieRefreshToken(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, age, legalAccepted } = req.body;
  const origin = req.headers.origin as string | undefined || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
  const { user, accessToken, refreshToken } = await authService.registerUser(email, password, age, legalAccepted, origin);
  setCookieRefreshToken(res, refreshToken);
  res.status(201).json({ user, accessToken });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
  setCookieRefreshToken(res, refreshToken);
  res.json({ user, accessToken });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('Refresh token não fornecido', 401, 'TOKEN_MISSING');
  }
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  setCookieRefreshToken(res, refreshToken);
  res.json({ accessToken });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logout realizado com sucesso' });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const user = await authService.getMe(req.userId!);
  res.json({ user });
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.userId!, oldPassword, newPassword);
  res.json({ message: 'Senha atualizada com sucesso' });
}

export async function deleteAccount(req: AuthRequest, res: Response): Promise<void> {
  await authService.deleteUser(req.userId!);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Conta excluída com sucesso' });
}

export async function exportAccountData(req: AuthRequest, res: Response): Promise<void> {
  const data = await authService.exportUserData(req.userId!);
  res.json(data);
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const origin = req.headers.origin as string | undefined || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
  const result = await authService.requestPasswordReset(email, origin);
  res.json(result);
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.resetPassword(token, password);
  setCookieRefreshToken(res, refreshToken);
  res.json({ user, accessToken, message: 'Senha redefinida com sucesso!' });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body;
  const result = await authService.verifyEmail(token);
  res.json(result);
}

export async function resendVerification(req: AuthRequest, res: Response): Promise<void> {
  const origin = req.headers.origin as string | undefined || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
  const result = await authService.resendVerificationEmail(req.userId!, origin);
  res.json(result);
}

