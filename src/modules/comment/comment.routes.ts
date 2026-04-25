import { Router } from 'express';
import { create, getMany, remove } from './comment.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import {
  createCommentSchema,
  getCommentsQuerySchema,
  commentIdParamSchema,
} from './comment.schema';
import { registry } from '../../config/swagger';

const router = Router();

registry.registerPath({
  method: 'post',
  path: '/api/comments',
  tags: ['Comments'],
  summary: 'Create a new comment',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createCommentSchema.shape.body },
      },
    },
  },
  responses: { 201: { description: 'Comment has been created' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/comments',
  tags: ['Comments'],
  summary: 'Get comments for an article',
  request: { query: getCommentsQuerySchema.shape.query },
  responses: { 200: { description: 'Success' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/comments/{id}',
  tags: ['Comments'],
  summary: 'Delete a comment',
  security: [{ bearerAuth: [] }],
  request: { params: commentIdParamSchema.shape.params },
  responses: {
    200: { description: 'Success' },
    403: { description: 'Forbidden' },
  },
});

router.get('/', getMany);
router.post('/', authMiddleware, create);
router.delete('/:id', authMiddleware, remove);

export default router;
