import slugify from 'slugify';
import crypto from 'crypto';
import { prisma } from '@config/db';
import { CreateArticleInput, UpdateArticleInput } from './article.schema';
import { catchErrorTyped } from '@utils/save-promise';
import { ForbiddenError } from './article.error';
import { UserRole } from '@modules/user/user.schema';
import { logger } from '@utils/logger';

const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = slugify(title, { lower: true, strict: true, trim: true });
  let slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

  const [prismError, existingArticle] = await catchErrorTyped(
    prisma.article.findUnique({ where: { slug } }),
  );
  if (prismError) {
    throw new Error('Database error');
  }

  if (existingArticle) {
    slug = `${baseSlug}-${crypto.randomBytes(4).toString('hex')}`;
  }

  return slug;
};

export const createArticle = async (
  authorId: string,
  data: CreateArticleInput,
) => {
  const { tagList, ...articleData } = data;
  const slug = await generateUniqueSlug(data.title);
  const tagsQuery = (tagList ?? []).map((name) => ({
    where: { name },
    create: { name },
  }));
  logger.info(`Creating article with slug: ${slug} for authorId: ${authorId}`);
  const [prismError, newArticle] = await catchErrorTyped(
    prisma.article.create({
      data: {
        ...articleData,
        slug,
        author: { connect: { id: authorId } },
        tags: {
          connectOrCreate: tagsQuery,
        },
      },
      include: {
        author: { select: { username: true, bio: true } },
        tags: true,
      },
    }),
  );

  if (prismError) {
    logger.error(prismError, 'Error creating article:');
    throw new Error('Database error');
  }
  return newArticle;
};

export const getArticleBySlug = async (slug: string) => {
  const [prismError, article] = await catchErrorTyped(
    prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { username: true, bio: true, image: true } },
        tags: true,
      },
    }),
  );

  if (prismError) {
    throw new Error('Database error');
  }
  if (!article) {
    throw new Error('Article not found');
  }

  return article;
};

export const updateArticle = async (
  articleId: string,
  userId: string,
  userRole: UserRole[],
  data: UpdateArticleInput,
) => {
  const [prismError, article] = await catchErrorTyped(
    prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    }),
  );

  if (prismError) {
    throw new Error('Database error');
  }
  if (!article) {
    throw new Error('Article not found');
  }

  const isAuthor = article.authorId === userId;
  const isAdmin = userRole.includes('ADMIN');

  if (!isAuthor && !isAdmin) {
    throw new ForbiddenError(
      'You do not have permission to update this article',
    );
  }

  const { tagList, ...updateData } = data;
  const tagsQuery = tagList
    ? {
        set: [],
        connectOrCreate: tagList.map((name) => ({
          where: { name },
          create: { name },
        })),
      }
    : undefined;

  const [prismUpdateError, updatedArticle] = await catchErrorTyped(
    prisma.article.update({
      where: { id: articleId },
      data: {
        ...updateData,
        tags: tagsQuery,
      },
      include: { author: { select: { username: true } }, tags: true },
    }),
  );

  if (prismUpdateError) {
    throw new Error('Database error');
  }

  return updatedArticle;
};
