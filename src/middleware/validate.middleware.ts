import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateResource = (schema: z.ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed: any = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;

      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          error: 'Ошибка валидации данных',
          details: formattedErrors,
        });
        return;
      }

      res
        .status(500)
        .json({ error: 'Внутренняя ошибка сервера при валидации' });
      return;
    }
  };
};
