import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(err.stack || err.message);

  const statusCode = err.status || 500;

  const response = {
    error: {
      message: statusCode === 500 ? 'Internal Server Error' : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
};
