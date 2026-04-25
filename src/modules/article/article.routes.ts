import { Router } from 'express';
import {
  createArticle,
  update,
  deleteArticle,
  getArticle,
  getAll,
} from './article.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticlesQuerySchema,
  articleSlugParamSchema,
  articleIdParamSchema,
} from './article.schema';
import { registry } from '@config/swagger';
import { validateResource } from '@middleware/validate.middleware';

const router = Router();

registry.registerPath({
  method: 'get',
  path: '/api/articles',
  tags: ['Articles'],
  summary: 'Get all articles',
  request: {
    query: getArticlesQuerySchema.shape.query,
  },
  responses: {
    200: { description: 'Articles retrieved successfully' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/articles/{slug}',
  tags: ['Articles'],
  summary: 'Get article by slug',
  request: {
    params: articleSlugParamSchema,
  },
  responses: {
    200: { description: 'Article retrieved successfully' },
    404: { description: 'Article not found' },
  },
});

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

registry.registerPath({
  method: 'put',
  path: '/api/articles/{id}',
  tags: ['Articles'],
  summary: 'Update article',
  security: [{ bearerAuth: [] }],
  request: {
    params: articleIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: updateArticleSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: { description: 'Article updated successfully' },
    400: { description: 'Validation error' },
    401: { description: 'Not authorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Article not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/articles/{id}',
  tags: ['Articles'],
  summary: 'Delete article',
  security: [{ bearerAuth: [] }],
  request: {
    params: articleIdParamSchema,
  },
  responses: {
    204: { description: 'Article deleted successfully' },
    401: { description: 'Not authorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Article not found' },
  },
});

router.get('/', validateResource(getArticlesQuerySchema), getAll);
router.get('/:slug', getArticle);
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, deleteArticle);

export default router;
