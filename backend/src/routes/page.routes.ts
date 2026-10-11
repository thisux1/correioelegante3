import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  createPage,
  updatePage,
  getPage,
  getPages,
  deletePage,
} from '../controllers/page.controller';
import {
  createPageResponse,
  getPageResponses,
} from '../controllers/response.controller';
import { createPageReport } from '../controllers/report.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';
import { requireEditorFeature } from '../middlewares/editorFeatureFlag';
import { validate, validateObjectId } from '../middlewares/validate';
import {
  createPageReportSchema,
  createPageResponseSchema,
  createPageSchema,
  updatePageSchema,
} from '../utils/validation';

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

// RSVP público (S13): limite próprio e mais estrito que writes autenticados.
const rsvpResponseRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas respostas enviadas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMITED',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// Denúncia pública (S9): destinatária não é usuária — limite mais estrito.
const reportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas denúncias enviadas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMITED',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const router = Router();

router.post('/', authenticate, requireEditorFeature, writePageRateLimiter, validate(createPageSchema), createPage);
router.put('/:id', authenticate, requireEditorFeature, writePageRateLimiter, validateObjectId('id'), validate(updatePageSchema), updatePage);
router.get('/:id', optionalAuthenticate, validateObjectId('id'), getPage);
router.get('/', authenticate, requireEditorFeature, getPages);
router.delete('/:id', authenticate, requireEditorFeature, validateObjectId('id'), deletePage);

// RSVP — resposta pública (sem authenticate) e listagem restrita ao dono.
router.post('/:pageId/responses', rsvpResponseRateLimiter, validateObjectId('pageId'), validate(createPageResponseSchema), createPageResponse);
router.get('/:pageId/responses', authenticate, validateObjectId('pageId'), getPageResponses);

// Report (S9) — denúncia pública pela destinatária; revisão é admin.
router.post('/:pageId/report', reportRateLimiter, validateObjectId('pageId'), validate(createPageReportSchema), createPageReport);

export { router as pageRouter };
