import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, './src/modules'),
      '@config': path.resolve(__dirname, './src/config'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@middleware': path.resolve(__dirname, './src/middleware'),
    },
  },
});
