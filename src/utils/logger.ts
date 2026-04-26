import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

export const logger = pino({
  level: nodeEnv === 'development' ? 'debug' : 'info',
  transport:
    nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
          },
        }
      : undefined,
});
