import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { catchErrorTyped } from '@utils/save-promise';
import { ForbiddenError, ArticleNotFoundError } from './article.errors';
import {
  createArticle as createArticleService,
  updateArticle as updateArticleService,
  deleteArticle as deleteArticleService,
  getArticleBySlug,
} from './article.service';
import { DatabaseError } from '@utils/database.error';
import { formatZodErrors } from '@utils/zod-error-formatter';
import {
  createArticleSchema,
  updateArticleSchema,
  articleSlugParamSchema,
  articleIdParamSchema,
} from './article.schema';

export const createArticle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const [zodError, validateData] = await catchErrorTyped(
    createArticleSchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [createError, article] = await catchErrorTyped(
    createArticleService(userId, validateData.body),
    [DatabaseError],
  );

  if (createError) {
    res.status(500).json({ error: 'Failed to create article' });
    return;
  }

  res.status(201).json({ article });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const [zodParamError, validateParams] = await catchErrorTyped(
    articleIdParamSchema.parseAsync(req.params),
    [ZodError],
  );

  if (zodParamError) {
    res.status(400).json({ errors: formatZodErrors(zodParamError) });
    return;
  }

  const [zodError, validateData] = await catchErrorTyped(
    updateArticleSchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [error, article] = await catchErrorTyped(
    updateArticleService(
      validateParams.id,
      userId,
      req.user!.roles,
      validateData.body,
    ),
    [ForbiddenError, ArticleNotFoundError, DatabaseError],
  );

  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }
  if (error instanceof ArticleNotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }
  if (error) {
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

  const [zodParamError, validateParams] = await catchErrorTyped(
    articleIdParamSchema.parseAsync(req.params),
    [ZodError],
  );

  if (zodParamError) {
    res.status(400).json({ errors: formatZodErrors(zodParamError) });
    return;
  }

  const [error] = await catchErrorTyped(
    deleteArticleService(validateParams.id, userId, userRoles),
    [ForbiddenError, ArticleNotFoundError, DatabaseError],
  );

  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }

  if (error instanceof ArticleNotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error) {
    res.status(500).json({ error: 'Failed to delete article' });
    return;
  }

  res.status(204).send();
};

export const getArticle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const [zodParamError, validateParams] = await catchErrorTyped(
    articleSlugParamSchema.parseAsync(req.params),
    [ZodError],
  );

  if (zodParamError) {
    res.status(400).json({ errors: formatZodErrors(zodParamError) });
    return;
  }

  const [error, article] = await catchErrorTyped(
    getArticleBySlug(validateParams.slug),
    [ArticleNotFoundError, DatabaseError],
  );

  if (error instanceof ArticleNotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error) {
    res.status(500).json({ error: 'Database error' });
    return;
  }

  res.status(200).json({ article });
};
