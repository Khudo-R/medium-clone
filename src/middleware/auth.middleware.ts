import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

  const [_, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      roles: UserRole[];
    };

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};
