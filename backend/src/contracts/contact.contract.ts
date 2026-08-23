import { z } from 'zod';

export const createSupportTicketSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .email('E-mail em formato inválido'),
  subject: z
    .string({ required_error: 'Assunto é obrigatório' })
    .trim()
    .min(2, 'Selecione um assunto'),
  orderRef: z
    .string()
    .trim()
    .max(100, 'Referência deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  message: z
    .string({ required_error: 'Mensagem é obrigatória' })
    .trim()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(3000, 'Mensagem deve ter no máximo 3000 caracteres'),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;

export const replySupportTicketSchema = z.object({
  replyMessage: z
    .string({ required_error: 'Mensagem de resposta é obrigatória' })
    .trim()
    .min(5, 'A resposta deve ter no mínimo 5 caracteres')
    .max(5000, 'A resposta deve ter no máximo 5000 caracteres'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
});

export type ReplySupportTicketInput = z.infer<typeof replySupportTicketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed'], {
    required_error: 'Status é obrigatório',
  }),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
