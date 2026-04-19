import { z } from 'zod';

const articleBodySchema = z.object({
  title: z
    .string()
    .min(5)
    .max(100, 'Title must be between 5 and 100 characters long'),
  description: z
    .string()
    .min(10)
    .max(300, 'Description must be between 10 and 300 characters long'),
  body: z.string().min(20, 'Body must be at least 20 characters long'),
  tagList: z
    .array(
      z
        .string()
        .min(1, 'Tag must be at least 1 character long')
        .max(30, 'Tag must be at most 30 characters long'),
    )
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, 'Tag must be at least 1 character long')
        .max(30, 'Tag must be at most 30 characters long'),
    )
    .optional(),
});

export const createArticleSchema = z.object({
  body: articleBodySchema.transform((data) => {
    const { tags, ...rest } = data;
    return {
      ...rest,
      tagList: rest.tagList || tags || [],
    };
  }),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>['body'];

export const updateArticleSchema = z.object({
  body: articleBodySchema
    .partial()
    .omit({ tags: true }) // tags is only for creation convenience here
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>['body'];
