import { UserRole } from '@modules/user/user.schema';
import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRoles = req.user?.roles || [];

    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      res.status(403).json({ error: 'Доступ запрещен. Недостаточно прав.' });
      return;
    }

    next();
  };
};
