import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/db';
import { catchErrorTyped } from '@utils/save-promise';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${env.PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`\n Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed. Closing database connection...');

    const [dbCloseError] = await catchErrorTyped(prisma.$disconnect());
    if (dbCloseError) {
      logger.error(dbCloseError, 'Error closing database connection:');
      process.exit(1);
    }
    logger.info('Database connection closed. Shutdown complete.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
