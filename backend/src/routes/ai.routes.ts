import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { rewrite } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { REWRITE_ACTIONS } from '../services/rewrite.service';

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas reescritas seguidas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMITED',
  },
});

const rewriteSchema = z.object({
  text: z.string().min(1, 'Nada pra reescrever ainda.').max(2_000),
  action: z.enum(REWRITE_ACTIONS),
});

const router = Router();

router.post('/rewrite', aiRateLimiter, authenticate, validate(rewriteSchema), rewrite);

export { router as aiRouter };
