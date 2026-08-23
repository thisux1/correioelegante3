import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import { messageRouter } from './routes/message.routes';
import { paymentRouter } from './routes/payment.routes';
import { uploadRouter } from './routes/upload.routes';
import { pageRouter } from './routes/page.routes';
import { assetRouter } from './routes/asset.routes';
import { contactRouter } from './routes/contact.routes';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from './utils/prisma';

const app = express();
app.set('trust proxy', 1); // Confia no proxy da Vercel para ler IPs reais

// Allowed CORS origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://correioelegante.studio',
  'https://www.correioelegante.studio',
].filter(Boolean) as string[];

const vercelRegex = /^https:\/\/[a-zA-Z0-9-_]+\.vercel\.app$/;
const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://challenges.cloudflare.com',
          'https://js.stripe.com',
          'https://sdk.mercadopago.com',
          'https://http2.mlstatic.com',
          'https://assets.pagseguro.com.br',
          'https://assets.pagbank.com.br',
          'https://*.pagseguro.com',
          'https://*.pagbank.com.br',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://*.stripe.com',
          'https://*.mercadopago.com',
          'https://http2.mlstatic.com',
          'https://*.pagseguro.com',
          'https://*.pagbank.com.br',
          'https://sandbox.api.pagseguro.com',
          'https://api.pagseguro.com',
        ],
        connectSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://api.stripe.com',
          'https://api.mercadopago.com',
          'https://*.mercadopago.com',
          'https://api.pagseguro.com',
          'https://sandbox.api.pagseguro.com',
          'https://*.pagbank.com.br',
          'https://res.cloudinary.com',
          'https://api.cloudinary.com',
        ],
        frameSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://js.stripe.com',
          'https://hooks.stripe.com',
          'https://www.mercadopago.com',
          'https://www.mercadopago.com.br',
          'https://*.mercadopago.com',
          'https://*.mercadopago.com.br',
          'https://*.pagseguro.com',
          'https://*.pagbank.com.br',
        ],

        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },

    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    } : false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (
        allowedOrigins.includes(origin) ||
        vercelRegex.test(origin) ||
        localhostRegex.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

// Rate Limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Aumentado para 1000 para evitar alarmes falsos em SPA com polling
  standardHeaders: true,
  legacyHeaders: false,
}));

// Parsing — express.json() com rawBody capture para webhooks e limite seguro de 2mb
app.use(
  express.json({
    limit: '2mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/pages', pageRouter);
app.use('/api/assets', assetRouter);
app.use('/api/contact', contactRouter);

// Health check — includes DB connectivity test (safe, read-only)
app.get('/api/health', async (_req, res) => {
  try {
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
