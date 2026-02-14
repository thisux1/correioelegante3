import { Router } from 'express';
import { createPayment, webhookHandler, getPaymentStatus } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/create', authenticate, createPayment);
router.post('/webhook', webhookHandler);
router.get('/status/:messageId', authenticate, getPaymentStatus);

export { router as paymentRouter };
