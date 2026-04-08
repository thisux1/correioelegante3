import { Router } from 'express';
import express from 'express';
import {
  createPayment,
  stripeWebhookHandler,
  mercadopagoWebhookHandler,
  getPaymentStatus,
  getPaymentStatusByResource,
  requestRefund,
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';
import { validate, validateObjectId } from '../middlewares/validate';
import { createPaymentSchema, createRefundRequestSchema } from '../utils/validation';

const router = Router();

// Webhook Stripe — precisa do rawBody (Buffer) para validar assinatura
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Webhook Mercado Pago — recebe JSON normal
router.post('/webhook/mercadopago', express.json(), mercadopagoWebhookHandler);

router.post('/create', authenticate, validate(createPaymentSchema), createPayment);
router.post('/refund', authenticate, validate(createRefundRequestSchema), requestRefund);
router.get('/status/:messageId', authenticate, validateObjectId('messageId'), getPaymentStatus);
router.get(
  '/status/:resourceType/:resourceId',
  authenticate,
  validateObjectId('resourceId'),
  getPaymentStatusByResource,
);

export { router as paymentRouter };
