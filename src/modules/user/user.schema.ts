import { z } from 'zod';
import { registry } from '@config/swagger';

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .openapi({ example: 'johndoe' }),
    email: z
      .string()
      .email('Invalid email address')
      .openapi({ example: 'john@example.com' }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .openapi({ example: 'password123' }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .openapi({ example: 'john@example.com' }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .openapi({ example: 'password123' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

export const updateUserSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters long')
        .optional()
        .openapi({ example: 'johndoe_updated' }),
      email: z
        .string()
        .email('Invalid email address')
        .optional()
        .openapi({ example: 'john_new@example.com' }),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .optional()
        .openapi({ example: 'newpassword123' }),
      bio: z
        .string()
        .max(160, 'Bio must be at most 160 characters long')
        .nullable()
        .optional()
        .openapi({ example: 'I am a software engineer' }),
      image: z
        .string()
        .url('Invalid URL format')
        .nullable()
        .optional()
        .openapi({ example: 'https://example.com/avatar.jpg' }),
    })
    .partial(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export const userIdParamSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
});

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';

registry.register('RegisterInput', registerSchema.shape.body);
registry.register('LoginInput', loginSchema.shape.body);
registry.register('UpdateUserInput', updateUserSchema.shape.body);
registry.register('UserIdParam', userIdParamSchema);
