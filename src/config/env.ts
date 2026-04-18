import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
  JWT_SECRET: z
    .string()
    .min(10, { message: 'JWT_SECRET must be at least 10 characters long' }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    'Environment variable validation failed:',
    parsedEnv.error.format(),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
