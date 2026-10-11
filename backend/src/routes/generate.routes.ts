import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { generatePage } from '../controllers/generate.controller';
import { validateTurnstile } from '../middlewares/turnstile.middleware';
import { validate } from '../middlewares/validate';
import { generateRequestSchema } from '../utils/validation';

// Public generator (D4): stricter limit than authenticated writes.
const generateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas gerações seguidas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMITED',
  },
});

const router = Router();

router.post('/', generateRateLimiter, validateTurnstile, validate(generateRequestSchema), generatePage);

export { router as generateRouter };
