import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '@utils/jwt';
import { env } from '../config/env';
import { UserRole } from '@modules/user/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        roles: UserRole[];
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ error: 'Authorization header missing or malformed' });
    return;
  }

  const token = authHeader?.split(' ')[1];
  try {
    const decoded = verifyJwt(token);

    req.user = decoded as {
      userId: string;
      roles: UserRole[];
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};
