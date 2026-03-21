import { z } from 'zod';
import {
  pageLifecycleSchema,
  pageStatusSchema,
  pageVisibilitySchema,
} from '../contracts/page.contract';
import {
  BLOCK_TYPE_VALUES,
  MAX_BLOCKS,
  MAX_PAGE_BYTES,
} from '../services/page.constants';
import {
  ASSET_KIND_VALUES,
  assetKindSchema,
} from '../contracts/asset.contract';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const messageSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem muito longa'),
  recipient: z.string().min(1, 'Destinatário é obrigatório'),
  theme: z.string().default('classic'),
  status: pageStatusSchema.optional(),
  visibility: pageVisibilitySchema.optional(),
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
}).superRefine((value, ctx) => {
  const lifecycle = pageLifecycleSchema.safeParse({
    status: value.status,
    visibility: value.visibility,
    publishedAt: value.publishedAt,
  });

  if (!lifecycle.success) {
    for (const issue of lifecycle.error.issues) {
      ctx.addIssue(issue);
    }
  }
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export const createPaymentSchema = z.object({
  messageId: z
    .string({ required_error: 'messageId é obrigatório' })
    .min(1, 'messageId é obrigatório')
    .regex(/^[a-f\d]{24}$/i, 'messageId inválido'),
  paymentMethod: z.enum(['pix', 'credit_card'], {
    errorMap: () => ({ message: 'Método de pagamento inválido. Use "pix" ou "credit_card".' }),
  }),
});

const blockMetaSchema = z.object({
  createdAt: z.number(),
  updatedAt: z.number(),
});

const blockSchema = z.object({
  id: z.string().min(1, 'Bloco sem id'),
  type: z.enum(BLOCK_TYPE_VALUES, {
    errorMap: () => ({ message: 'Tipo de bloco invalido' }),
  }),
  version: z.number().int().min(1, 'Versao do bloco invalida'),
  props: z.record(z.unknown()),
  meta: blockMetaSchema,
});

const pageContentSchema = z
  .object({
    blocks: z.array(blockSchema).max(MAX_BLOCKS, `Maximo de ${MAX_BLOCKS} blocos por pagina`),
    theme: z.string().max(100, 'Theme muito longo').optional(),
    version: z.number().int().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const bytes = Buffer.byteLength(JSON.stringify(value), 'utf8');
    if (bytes > MAX_PAGE_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Pagina excede o limite de ${MAX_PAGE_BYTES} bytes`,
        path: ['blocks'],
      });
    }
  });

export const createPageSchema = z
  .object({
    content: pageContentSchema,
    status: pageStatusSchema.optional(),
    visibility: pageVisibilitySchema.optional(),
    publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const lifecycle = pageLifecycleSchema.safeParse({
      status: value.status,
      visibility: value.visibility,
      publishedAt: value.publishedAt,
    });

    if (!lifecycle.success) {
      for (const issue of lifecycle.error.issues) {
        ctx.addIssue(issue);
      }
    }
  });

export const updatePageSchema = z
  .object({
    content: pageContentSchema,
    status: pageStatusSchema.optional(),
    visibility: pageVisibilitySchema.optional(),
    publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
    version: z.number().int().min(1, 'Versao da pagina invalida').optional(),
  })
  .superRefine((value, ctx) => {
    const lifecycle = pageLifecycleSchema.safeParse({
      status: value.status,
      visibility: value.visibility,
      publishedAt: value.publishedAt,
    });

    if (!lifecycle.success) {
      for (const issue of lifecycle.error.issues) {
        ctx.addIssue(issue);
      }
    }
  });

export const assetUploadUrlSchema = z.object({
  kind: assetKindSchema,
  fileName: z.string().min(3, 'Nome de arquivo invalido').max(255, 'Nome de arquivo invalido'),
  mimeType: z.string().min(3, 'Mime type obrigatorio').max(120, 'Mime type invalido').toLowerCase(),
  sizeBytes: z.number().int().positive('Tamanho do arquivo invalido'),
});

export const assetCompleteSchema = z.object({
  assetId: z
    .string({ required_error: 'assetId e obrigatorio' })
    .min(1, 'assetId e obrigatorio')
    .regex(/^[a-f\d]{24}$/i, 'assetId invalido'),
});

export const assetListQuerySchema = z.object({
  kind: z.enum(ASSET_KIND_VALUES).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type AssetUploadUrlInput = z.infer<typeof assetUploadUrlSchema>;
export type AssetCompleteInput = z.infer<typeof assetCompleteSchema>;
export type AssetListQueryInput = z.infer<typeof assetListQuerySchema>;
