import { z } from 'zod';

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
