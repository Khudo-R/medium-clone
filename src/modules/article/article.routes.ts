import e, { Router } from 'express';
import { createArticle, update } from './article.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import { validateResource } from '@middleware/validate.middleware';
import { createArticleSchema, updateArticleSchema } from './article.schema';

const router = Router();

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

export default router;
