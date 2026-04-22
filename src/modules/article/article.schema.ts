import { z } from 'zod';
import { registry } from '@config/swagger';

const articleBodySchema = z.object({
  title: z
    .string()
    .min(5)
    .max(120, 'Title must be between 5 and 120 characters long')
    .openapi({
      example: 'How to Build a Medium Clone with Node.js and Express',
    }),
  description: z
    .string()
    .min(10)
    .max(300, 'Description must be between 10 and 300 characters long')
    .openapi({ example: 'A brief summary of the article' }),
  body: z
    .string()
    .min(20, 'Body must be at least 20 characters long')
    .openapi({ example: 'The full content of the article' }),
  tags: z
    .array(
      z
        .string()
        .min(1, 'Tag must be at least 1 character long')
        .max(30, 'Tag must be at most 30 characters long'),
    )
    .optional()
    .default([])
    .openapi({
      example: ['Node.js', 'Express', 'Backend Development'],
    }),
});

export const createArticleSchema = z.object({
  body: articleBodySchema,
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>['body'];

export const updateArticleSchema = z.object({
  body: articleBodySchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>['body'];

export const getArticlesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(20)
    .openapi({ example: 20, description: 'Number of articles to return' }),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .openapi({ example: 0, description: 'Number of articles to skip' }),
  tag: z
    .string()
    .optional()
    .openapi({ example: 'Node.js', description: 'Filter by tag' }),
  author: z
    .string()
    .optional()
    .openapi({ example: 'johndoe', description: 'Filter by author username' }),
});

export const articleSlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({ example: 'how-to-build-a-medium-clone-with-node-js' }),
});

export const articleIdParamSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
});

registry.register('CreateArticleInput', createArticleSchema.shape.body);
registry.register('UpdateArticleInput', updateArticleSchema.shape.body);
registry.register('GetArticlesQuery', getArticlesQuerySchema);
registry.register('ArticleSlugParam', articleSlugParamSchema);
registry.register('ArticleIdParam', articleIdParamSchema);
