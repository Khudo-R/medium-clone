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
import { registry } from '@config/swagger';

const router = Router();

registry.registerPath({
  method: 'post',
  path: '/api/articles',
  tags: ['Articles'],
  summary: 'Create a new article',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createArticleSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: { description: 'Article created successfully' },
    400: { description: 'Validation error' },
    401: { description: 'Not authorized' },
  },
});

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
