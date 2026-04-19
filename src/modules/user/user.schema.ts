import { email, z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];

export const loginSchema = z.object({
  body: z.object({
    email: email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

export const updateUserSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters long')
        .optional(),
      email: email('Invalid email address').optional(),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .optional(),
      bio: z
        .string()
        .max(160, 'Bio must be at most 160 characters long')
        .nullable()
        .optional(),
      image: z.url('Invalid URL format').nullable().optional(),
    })
    .partial(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
