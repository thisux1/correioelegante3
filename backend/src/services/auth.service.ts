import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { LEGAL_DOCUMENT_VERSIONS, type LegalDocumentType } from '../constants/legalDocuments';
import { CloudinaryMediaProvider } from './cloudinaryMediaProvider';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from './email.service';
import { isEmailAdmin } from '../utils/admin';


const mediaProvider = new CloudinaryMediaProvider();

function getConsentPayload() {
    return (Object.entries(LEGAL_DOCUMENT_VERSIONS) as [LegalDocumentType, string][]).map(
        ([documentType, version]) => ({
            documentType,
            version,
        }),
    );
}

export async function registerUser(email: string, password: string, age?: number, legalAccepted?: boolean, origin?: string) {
    if (age !== undefined && age < 13) {
        throw new AppError('Idade mínima é 13 anos', 400, 'AUTH_UNDERAGE');
    }

    if (!legalAccepted) {
        throw new AppError('Aceite legal é obrigatório', 400, 'AUTH_LEGAL_ACCEPTANCE_REQUIRED');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new AppError('Este email ja esta cadastrado. Faca login para continuar.', 409, 'AUTH_EMAIL_ALREADY_REGISTERED');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            consents: {
                create: getConsentPayload(),
            },
        },
        select: {
            id: true,
            email: true,
        },
    });

    const accessToken = generateAccessToken(user.id, 0);
    const refreshToken = generateRefreshToken(user.id, 0);

    // E-mail de verificação: token opaco em texto plano no link, SHA-256 no banco (mesmo padrão do reset)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: verificationExpiresAt,
        },
    });

    const baseUrl = origin || process.env.FRONTEND_URL || 'https://www.correioelegante.studio';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    // Falha no envio não deve quebrar o cadastro
    try {
        await sendEmailVerificationEmail({
            to: user.email,
            verifyUrl,
        });
    } catch (err) {
        console.error('[AuthService] Falha ao enviar e-mail de verificação:', err);
    }

    const isSubscribed = false;
    return {
        user: {
            id: user.id,
            email: user.email,
            isAdmin: isEmailAdmin(user.email),
            emailVerified: false,
            isSubscribed,
            subscriptionStatus: 'none',
            subscriptionPlan: null,
            subscriptionExpiresAt: null,
        },
        accessToken,
        refreshToken,
    };
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Mensagem genérica para evitar enumeração de contas
        throw new AppError('Email ou senha incorretos.', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new AppError('Email ou senha incorretos.', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken(user.id, user.tokenVersion ?? 0);
    const refreshToken = generateRefreshToken(user.id, user.tokenVersion ?? 0);

    const isSubscribed = Boolean(
        user.subscriptionStatus === 'active' &&
        user.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt).getTime() > Date.now()
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            isAdmin: isEmailAdmin(user.email),
            emailVerified: user.emailVerified,
            isSubscribed,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
        },
        accessToken,
        refreshToken,
    };
}

export async function refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
        throw new AppError('Usuário não encontrado', 401);
    }

    // Revogação: tokens emitidos antes de uma troca de senha são rejeitados
    const currentTokenVersion = user.tokenVersion ?? 0;
    if (payload.tv !== currentTokenVersion) {
        throw new AppError('Sessão expirada. Faça login novamente.', 401, 'TOKEN_REVOKED');
    }

    const accessToken = generateAccessToken(user.id, currentTokenVersion);
    const newRefreshToken = generateRefreshToken(user.id, currentTokenVersion);

    return { accessToken, refreshToken: newRefreshToken };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            createdAt: true,
            emailVerified: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionExpiresAt: true,
        },
    });

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    const isSubscribed = Boolean(
        user.subscriptionStatus === 'active' &&
        user.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt).getTime() > Date.now()
    );

    return {
        ...user,
        isAdmin: isEmailAdmin(user.email),
        isSubscribed,
    };
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
    // Incrementa tokenVersion para revogar refresh tokens emitidos antes da troca
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            tokenVersion: (user.tokenVersion ?? 0) + 1,
        },
    });
}

export async function deleteUser(userId: string) {
    const assets = await prisma.asset.findMany({
        where: { userId },
        select: { id: true, storageKey: true },
    });

    for (const asset of assets) {
        try {
            await mediaProvider.deleteAsset(asset.storageKey);
        } catch {
            throw new AppError(
                `Falha ao remover asset externo (${asset.id}). Exclusao abortada.`,
                502,
                'ACCOUNT_DELETE_EXTERNAL_ASSET_FAILED',
            );
        }
    }

    await prisma.user.delete({
        where: { id: userId }
    });
}

export async function exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    const [messages, pages, assets, consents, refundRequests] = await Promise.all([
        prisma.message.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.page.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.asset.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.userConsent.findMany({
            where: { userId },
            orderBy: { acceptedAt: 'desc' },
        }),
        prisma.refundRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    return {
        user,
        messages,
        pages,
        assets,
        consents,
        refundRequests,
    };
}

export async function requestPasswordReset(email: string, origin?: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Mensagem genérica para evitar enumeração de contas
    const genericResponse = {
        message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    };

    if (!user) {
        return genericResponse;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: tokenHash,
            resetPasswordExpires: expiresAt,
        },
    });

    const baseUrl = origin || process.env.FRONTEND_URL || 'https://www.correioelegante.studio';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
    });

    return genericResponse;
}

export async function resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: tokenHash,
        },
    });

    if (!user || !user.resetPasswordExpires || new Date(user.resetPasswordExpires).getTime() < Date.now()) {
        throw new AppError('Link de recuperação inválido ou expirado. Solicite uma nova redefinição.', 400, 'AUTH_INVALID_RESET_TOKEN');
    }


    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const nextTokenVersion = (user.tokenVersion ?? 0) + 1;

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            tokenVersion: nextTokenVersion,
        },
    });

    const accessToken = generateAccessToken(user.id, nextTokenVersion);
    const refreshToken = generateRefreshToken(user.id, nextTokenVersion);

    const isSubscribed = Boolean(
        user.subscriptionStatus === 'active' &&
        user.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt).getTime() > Date.now()
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            isSubscribed,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
        },
        accessToken,
        refreshToken,
    };
}

export async function verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: tokenHash,
        },
    });

    // Idempotente: se o e-mail já foi verificado, retorna sucesso sem alterações
    if (user?.emailVerified) {
        return {
            message: 'Este e-mail já foi verificado anteriormente.',
            emailVerified: true,
        };
    }

    if (!user || !user.emailVerificationExpires || new Date(user.emailVerificationExpires).getTime() < Date.now()) {
        throw new AppError('Link de verificação inválido ou expirado. Solicite um novo e-mail de verificação.', 400, 'AUTH_INVALID_VERIFICATION_TOKEN');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });

    return {
        message: 'E-mail verificado com sucesso.',
        emailVerified: true,
    };
}

export async function resendVerificationEmail(userId: string, origin?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError('Usuário não encontrado', 404);
    }

    if (user.emailVerified) {
        return { message: 'Seu e-mail já foi verificado. Não é necessário verificar novamente.' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: verificationExpiresAt,
        },
    });

    const baseUrl = origin || process.env.FRONTEND_URL || 'https://www.correioelegante.studio';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    // Falha no envio não deve propagar erro de servidor para o usuário
    try {
        await sendEmailVerificationEmail({
            to: user.email,
            verifyUrl,
        });
    } catch (err) {
        console.error('[AuthService] Falha ao reenviar e-mail de verificação:', err);
    }

    return { message: 'Se este e-mail estiver cadastrado, você receberá um novo link de verificação.' };
}

