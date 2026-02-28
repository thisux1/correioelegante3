import { Router } from 'express';
import express from 'express';
import { createPayment, webhookHandler, getPaymentStatus } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Webhook precisa do rawBody (Buffer) para validar a assinatura do Stripe.
// express.raw() é aplicado ANTES do express.json() global da app.
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.post('/create', authenticate, createPayment);
router.get('/status/:messageId', authenticate, getPaymentStatus);

export { router as paymentRouter };
