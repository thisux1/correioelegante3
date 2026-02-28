import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import { messageRouter } from './routes/message.routes';
import { paymentRouter } from './routes/payment.routes';
import { uploadRouter } from './routes/upload.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.set('trust proxy', 1); // Confia no proxy da Vercel para ler IPs reais

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('[WARN] FRONTEND_URL not set in production. Using default CORS origin.');
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

// Parsing — express.json() é aplicado globalmente.
// ATENÇÃO: a rota POST /api/payments/webhook usa express.raw() próprio
// e é registrada ANTES deste middleware para que o rawBody seja preservado.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/upload', uploadRouter);

// Health check — includes DB connectivity test (safe, read-only)
app.get('/api/health', async (_req, res) => {
  try {
    const { prisma } = await import('./utils/prisma');
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(503).json({ status: 'error', db: 'disconnected', error: msg, timestamp: new Date().toISOString() });
  }
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
