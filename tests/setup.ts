import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/config/db';

beforeAll(async () => {
  await Promise.all([
    prisma.comment.deleteMany(),
    prisma.article.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
