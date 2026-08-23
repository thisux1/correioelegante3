import { Router } from 'express';
import express from 'express';
import {
  createPayment,
  stripeWebhookHandler,
  // mercadopagoWebhookHandler, // Mercado Pago desativado (ver controller)
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
import { validateTurnstile } from '../middlewares/turnstile.middleware';
import { createPaymentSchema, createRefundRequestSchema, createSubscriptionPaymentSchema } from '../utils/validation';

const router = Router();

// Webhook PagBank — recebe JSON de notificações de orders e charges
router.post('/webhook/pagbank', express.json(), pagbankWebhookHandler);

// Webhook Stripe — precisa do rawBody (Buffer) para validar assinatura
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Webhook Mercado Pago — DESATIVADO: provedor fora de uso.
// router.post('/webhook/mercadopago', express.json(), mercadopagoWebhookHandler);


router.post('/create', authenticate, validateTurnstile, validate(createPaymentSchema), createPayment);
router.post('/refund', authenticate, validate(createRefundRequestSchema), requestRefund);

// Endpoints de simulação — registrados APENAS fora de produção (defesa em
// profundidade: o controller também bloqueia, mas aqui nem existem em prod).
if (process.env.NODE_ENV !== 'production') {
  router.post('/simulate-approval', authenticate, simulatePaymentApproval);
  router.post('/simulate-subscription', authenticate, simulateSubscriptionApproval);
}

router.post('/subscription/checkout', authenticate, validateTurnstile, validate(createSubscriptionPaymentSchema), createSubscriptionPayment);

router.get('/subscription/status', authenticate, getSubscriptionStatus);
router.get('/status/:messageId', authenticate, validateObjectId('messageId'), getPaymentStatus);
router.get(
  '/status/:resourceType/:resourceId',
  authenticate,
  validateObjectId('resourceId'),
  getPaymentStatusByResource,
);

export { router as paymentRouter };
