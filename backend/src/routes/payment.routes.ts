import { Router } from 'express';
import express from 'express';
import {
  createPayment,
  stripeWebhookHandler,
  mercadopagoWebhookHandler,
  pagbankWebhookHandler,
  getPaymentStatus,
  getPaymentStatusByResource,
  requestRefund,
  simulatePaymentApproval,
  createSubscriptionPayment,
  getSubscriptionStatus,
  simulateSubscriptionApproval,
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';
import { validate, validateObjectId } from '../middlewares/validate';
import { createPaymentSchema, createRefundRequestSchema, createSubscriptionPaymentSchema } from '../utils/validation';

const router = Router();

// Webhook PagBank — recebe JSON de notificações de orders e charges
router.post('/webhook/pagbank', express.json(), pagbankWebhookHandler);

// Webhook Stripe — precisa do rawBody (Buffer) para validar assinatura
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Webhook Mercado Pago — recebe JSON normal (preservado como legado)
router.post('/webhook/mercadopago', express.json(), mercadopagoWebhookHandler);


router.post('/create', authenticate, validate(createPaymentSchema), createPayment);
router.post('/refund', authenticate, validate(createRefundRequestSchema), requestRefund);
router.post('/simulate-approval', authenticate, simulatePaymentApproval);
router.post('/subscription/checkout', authenticate, validate(createSubscriptionPaymentSchema), createSubscriptionPayment);
router.get('/subscription/status', authenticate, getSubscriptionStatus);
router.post('/simulate-subscription', authenticate, simulateSubscriptionApproval);
router.get('/status/:messageId', authenticate, validateObjectId('messageId'), getPaymentStatus);
router.get(
  '/status/:resourceType/:resourceId',
  authenticate,
  validateObjectId('resourceId'),
  getPaymentStatusByResource,
);

export { router as paymentRouter };
