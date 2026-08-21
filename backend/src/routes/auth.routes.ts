import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login, refresh, logout, me, changePassword, deleteAccount, exportAccountData } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { registerSchema, loginSchema, changePasswordSchema } from '../utils/validation';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas contas criadas. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.get('/export', authenticate, exportAccountData);
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);
router.delete('/account', authenticate, deleteAccount);

export { router as authRouter };
