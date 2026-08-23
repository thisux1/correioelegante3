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
