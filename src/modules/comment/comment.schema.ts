import { z } from 'zod';
import { registry } from '@config/swagger';

export const createCommentSchema = z.object({
  body: z.object({
    body: z
      .string()
      .min(1, 'Comment body cannot be empty')
      .openapi({ example: 'This is a comment.' }),
    articleId: z
      .uuid('Incorrect article ID')
      .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  }),
});

export const getCommentsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .default(20)
      .openapi({ example: 20, description: 'Number of comments to return' }),
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .openapi({ example: 0, description: 'Number of comments to skip' }),
    articleId: z
      .uuid('Incorrect article ID')
      .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: z
      .uuid('Incorrect comment ID')
      .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  }),
});

registry.register('CreateCommentInput', createCommentSchema.shape.body);
registry.register('GetCommentsQuery', getCommentsQuerySchema.shape.query);
registry.register('CommentIdParam', commentIdParamSchema.shape.params);

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type GetCommentsQuery = z.infer<typeof getCommentsQuerySchema>['query'];
export type CommentIdParam = z.infer<typeof commentIdParamSchema>['params'];
