import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import * as authService from '../services/auth.service';

function setCookieRefreshToken(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.registerUser(email, password);
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
  res.clearCookie('refreshToken');
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
  res.clearCookie('refreshToken');
  res.json({ message: 'Conta excluída com sucesso' });
}
