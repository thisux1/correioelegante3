import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import { messageRouter } from './routes/message.routes';
import { paymentRouter } from './routes/payment.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL é obrigatório em produção');
}

// Security
app.use(helmet());
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);
app.use('/api/payments', paymentRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export default app;
