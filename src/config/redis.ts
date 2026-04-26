import { createClient } from 'redis';
import { logger } from '@utils/logger';
import { catchErrorTyped } from '@utils/save-promise';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});
redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

export const connectRedis = async () => {
  const [error] = await catchErrorTyped(redisClient.connect());
  if (error) {
    logger.error(error, 'Failed to connect to Redis');
    process.exit(1);
  }
};
