import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  createPage,
  updatePage,
  getPage,
  getPages,
  deletePage,
} from '../controllers/page.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';
import { validate, validateObjectId } from '../middlewares/validate';
import { createPageSchema, updatePageSchema } from '../utils/validation';

const writePageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de salvar pagina. Tente novamente em alguns minutos.',
    code: 'RATE_LIMITED',
  },
});

const router = Router();

router.post('/', authenticate, writePageRateLimiter, validate(createPageSchema), createPage);
router.put('/:id', authenticate, writePageRateLimiter, validateObjectId('id'), validate(updatePageSchema), updatePage);
router.get('/:id', optionalAuthenticate, validateObjectId('id'), getPage);
router.get('/', authenticate, getPages);
router.delete('/:id', authenticate, validateObjectId('id'), deletePage);

export { router as pageRouter };
