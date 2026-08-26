import 'dotenv/config';
import app from './app';
import { prisma } from './utils/prisma';

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} received. Shutting down gracefully...`);

  const forceTimeout = setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded (10s). Forcing shutdown.');
    process.exit(1);
  }, 10000);
  forceTimeout.unref();

  server.close(async (err) => {
    if (err) {
      console.error('Error closing HTTP server:', err);
    }
    try {
      await prisma.$disconnect();
      console.log('Database disconnected successfully.');
    } catch (dbErr) {
      console.error('Error disconnecting database:', dbErr);
    }
    clearTimeout(forceTimeout);
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  gracefulShutdown('uncaughtException');
});
