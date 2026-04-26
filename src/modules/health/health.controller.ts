import { Request, Response } from 'express';
import { prisma } from '@config/db';
import { redisClient } from '@config/redis';
import { logger } from '@utils/logger';

export const checkHealth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    services: {
      database: 'UNKNOWN',
      redis: 'UNKNOWN',
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'OK';
  } catch (error) {
    health.services.database = 'ERROR';
    health.status = 'ERROR';
    logger.error(error, 'HealthCheck: Database is down');
  }

  try {
    const redisPing = await redisClient.ping();
    if (redisPing === 'PONG') {
      health.services.redis = 'OK';
    } else {
      throw new Error('Redis ping failed');
    }
  } catch (error) {
    health.services.redis = 'ERROR';
    health.status = 'ERROR';
    logger.error(error, 'HealthCheck: Redis is down');
  }

  if (health.status === 'ERROR') {
    res.status(503).json(health);
    return;
  }

  res.status(200).json(health);
};

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};
