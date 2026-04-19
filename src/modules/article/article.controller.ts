import { Request, Response } from 'express';
import { catchErrorTyped } from '@utils/save-promise';
import { formatZodErrors } from '@utils/zod-error-formatter';
import { ForbiddenError } from './article.error';
import {
  createArticle as createArticleService,
  updateArticle as updateArticleService,
  getArticleBySlug,
} from './article.service';

export const createArticle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const [createError, article] = await catchErrorTyped(
    createArticleService(userId, req.body),
  );

  if (createError) {
    res.status(500).json({ error: createError });
    return;
  }

  res.status(201).json({ article });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const [error, article] = await catchErrorTyped(
    updateArticleService(
      String(req.params.id),
      req.user!.userId,
      req.user!.roles,
      req.body,
    ),
    [ForbiddenError],
  );
  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }
  if (error) {
    res.status(500).json({ error: 'Failed to update article' });
    return;
  }

  res.status(200).json({ article });
};
