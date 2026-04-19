import { Router } from 'express';
import {
  createArticle,
  update,
  deleteArticle,
  getArticle,
} from './article.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validateResource } from '@middleware/validate.middleware';
import { createArticleSchema, updateArticleSchema } from './article.schema';

const router = Router();

router.get('/:slug', getArticle);
router.post(
  '/',
  authMiddleware,
  validateResource(createArticleSchema),
  createArticle,
);
router.patch(
  '/update/:id',
  authMiddleware,
  validateResource(updateArticleSchema),
  update,
);
router.delete('/:id', authMiddleware, deleteArticle);

export default router;
