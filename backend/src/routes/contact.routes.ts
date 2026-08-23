import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactController } from '../controllers/contact.controller';
import { validate, validateObjectId } from '../middlewares/validate';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middlewares/auth';
import {
  createSupportTicketSchema,
  replySupportTicketSchema,
  updateTicketStatusSchema,
} from '../contracts/contact.contract';

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitos chamados enviados recentemente. Por favor, aguarde alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactRouter = Router();

// Endpoint público para envio de chamados
contactRouter.post(
  '/',
  contactLimiter,
  optionalAuthenticate,
  validate(createSupportTicketSchema),
  contactController.create
);

// Endpoints autenticados para gestão e resposta aos chamados via Resend (Restrito a Admin)
contactRouter.get(
  '/tickets',
  authenticate,
  requireAdmin,
  contactController.list
);

contactRouter.get(
  '/tickets/:id',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  contactController.getById
);

contactRouter.post(
  '/tickets/:id/reply',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  validate(replySupportTicketSchema),
  contactController.reply
);

contactRouter.patch(
  '/tickets/:id/status',
  authenticate,
  requireAdmin,
  validateObjectId('id'),
  validate(updateTicketStatusSchema),
  contactController.updateStatus
);
