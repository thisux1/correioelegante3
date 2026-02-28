import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export async function registerUser(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new AppError('Email já cadastrado', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, password: hashedPassword },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user: { id: user.id, email: user.email }, accessToken, refreshToken };
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError('Credenciais inválidas', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new AppError('Credenciais inválidas', 401);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user: { id: user.id, email: user.email }, accessToken, refreshToken };
}

export async function refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
        throw new AppError('Usuário não encontrado', 401);
    }

    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    return user;
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
        throw new AppError('Senha atual incorreta', 400);
    }

    if (oldPassword === newPassword) {
        throw new AppError('A nova senha deve ser diferente da senha atual', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
}

export async function deleteUser(userId: string) {
    // Delete user. Messages will be cascade-deleted by Prisma schema configuration.
    await prisma.user.delete({
        where: { id: userId }
    });
}
