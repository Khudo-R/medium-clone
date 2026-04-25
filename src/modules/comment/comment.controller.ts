import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as CommentService from './comment.service';
import { catchErrorTyped } from '@utils/save-promise';
import { ForbiddenError, CommentNotFoundError } from './comment.errors';
import { ArticleNotFoundError } from '@modules/article/article.errors';
import { DatabaseError } from '@utils/database.error';
import { formatZodErrors } from '@utils/zod-error-formatter';
import {
  createCommentSchema,
  getCommentsQuerySchema,
  commentIdParamSchema,
} from './comment.schema';

export const create = async (req: Request, res: Response): Promise<void> => {
  const [zodError, validateData] = await catchErrorTyped(
    createCommentSchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [error, comment] = await catchErrorTyped(
    CommentService.createComment(
      req.user!.userId,
      validateData.body.articleId,
      validateData.body.body,
    ),
    [ArticleNotFoundError, DatabaseError],
  );

  if (error instanceof ArticleNotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }
  res.status(201).json({ comment });
};

export const getMany = async (req: Request, res: Response): Promise<void> => {
  const [zodError, validateData] = await catchErrorTyped(
    getCommentsQuerySchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [error, comments] = await catchErrorTyped(
    CommentService.getComments(validateData.query.articleId),
    [DatabaseError],
  );

  if (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
  res.status(200).json({ comments });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const [zodParamError, validateParams] = await catchErrorTyped(
    commentIdParamSchema.parseAsync(req),
    [ZodError],
  );

  if (zodParamError) {
    res.status(400).json({ errors: formatZodErrors(zodParamError) });
    return;
  }

  const [error] = await catchErrorTyped(
    CommentService.deleteComment(
      validateParams.params.id,
      req.user!.userId,
      req.user!.roles,
    ),
    [ForbiddenError, CommentNotFoundError, DatabaseError],
  );

  if (error instanceof ForbiddenError) {
    res.status(403).json({ error: error.message });
    return;
  }

  if (error instanceof CommentNotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }

  res.status(200).json({ message: 'Comment has been deleted' });
};
