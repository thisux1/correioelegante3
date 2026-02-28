import { Router } from 'express';
import { createMessage, getMessages, getMessage, getPublicCard, deleteMessage } from '../controllers/message.controller';
import { validate, validateObjectId } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { messageSchema } from '../utils/validation';

const router = Router();

router.post('/', authenticate, validate(messageSchema), createMessage);
router.get('/', authenticate, getMessages);
router.get('/card/:id', validateObjectId('id'), getPublicCard);
router.get('/:id', authenticate, validateObjectId('id'), getMessage);
router.delete('/:id', authenticate, validateObjectId('id'), deleteMessage);

export { router as messageRouter };
