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
