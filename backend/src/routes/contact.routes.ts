import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactController } from '../controllers/contact.controller';
import { validate } from '../middlewares/validate';
import { optionalAuthenticate } from '../middlewares/auth';
import { createSupportTicketSchema } from '../contracts/contact.contract';

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitos chamados enviados recentemente. Por favor, aguarde alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactRouter = Router();

contactRouter.post(
  '/',
  contactLimiter,
  optionalAuthenticate,
  validate(createSupportTicketSchema),
  contactController.create
);
