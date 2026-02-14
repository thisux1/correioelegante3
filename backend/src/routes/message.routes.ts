import { Router } from 'express';
import { createMessage, getMessages, getMessage, getPublicCard, deleteMessage } from '../controllers/message.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { messageSchema } from '../utils/validation';

const router = Router();

router.post('/', authenticate, validate(messageSchema), createMessage);
router.get('/', authenticate, getMessages);
router.get('/card/:id', getPublicCard);
router.get('/:id', authenticate, getMessage);
router.delete('/:id', authenticate, deleteMessage);

export { router as messageRouter };
