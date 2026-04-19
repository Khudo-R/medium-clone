import { Request, Response } from 'express';
import { catchErrorTyped } from '@utils/save-promise';
import { formatZodErrors } from '@utils/zod-error-formatter';
import { ForbiddenError } from './article.error';
import {
  createArticle as createArticleService,
  updateArticle as updateArticleService,
  deleteArticle as deleteArticleService,
  getArticleBySlug,
} from './article.service';
import { DatabaseError } from '@utils/database.error';

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
  );
  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }
  if (error) {
    if (error instanceof Error && error.message === 'Article not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update article' });
    return;
  }

  res.status(200).json({ article });
};

export const deleteArticle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const [error] = await catchErrorTyped(
    deleteArticleService(String(req.params.id), userId, userRoles),
  );

  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }

  if (error) {
    if (error instanceof Error && error.message === 'Article not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to delete article' });
    return;
  }

  res.status(204).send();
};

export const getArticle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const slug = req.params.slug;

  const [error, article] = await catchErrorTyped(
    getArticleBySlug(String(slug)),
  );
  if (error) {
    if (error instanceof DatabaseError) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    res.status(404).json({ error: 'Article not found' });
    return;
  }

  res.status(200).json({ article });
};
