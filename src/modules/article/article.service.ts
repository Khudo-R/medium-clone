import slugify from 'slugify';
import crypto from 'crypto';
import { prisma } from '@config/db';
import { CreateArticleInput, UpdateArticleInput } from './article.schema';
import { catchErrorTyped } from '@utils/save-promise';
import { ForbiddenError, ArticleNotFoundError } from './article.errors';
import { DatabaseError } from '@utils/database.error';
import { UserRole } from '@modules/user/user.schema';
import { logger } from '@utils/logger';
import { Prisma } from '@prisma/client';

export const formatArticle = (article: any) => {
  const { tags, ...rest } = article;
  return {
    ...rest,
    tags: tags ? tags.map((t: any) => t.name) : [],
  };
};

const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = slugify(title, { lower: true, strict: true, trim: true });
  let slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

  const [prismError, existingArticle] = await catchErrorTyped(
    prisma.article.findUnique({ where: { slug } }),
  );
  if (prismError) {
    throw new DatabaseError();
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
  const { tags, ...articleData } = data;
  const slug = await generateUniqueSlug(data.title);
  const tagsQuery = (tags ?? []).map((name) => ({
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
    throw new DatabaseError();
  }
  return formatArticle(newArticle);
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
    throw new DatabaseError();
  }
  if (!article) {
    throw new ArticleNotFoundError('Article not found');
  }

  return formatArticle(article);
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
    throw new DatabaseError();
  }
  if (!article) {
    throw new ArticleNotFoundError('Article not found');
  }

  const isAuthor = article.authorId === userId;
  const isAdmin = userRole.includes('ADMIN');

  if (!isAuthor && !isAdmin) {
    throw new ForbiddenError(
      'You do not have permission to update this article',
    );
  }

  const { tags, ...updateData } = data;
  const tagsQuery = tags
    ? {
        set: [],
        connectOrCreate: tags.map((name) => ({
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
    throw new DatabaseError();
  }

  return formatArticle(updatedArticle);
};

export const deleteArticle = async (
  articleId: string,
  userId: string,
  userRoles: UserRole[],
) => {
  const [prismGetError, article] = await catchErrorTyped(
    prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    }),
  );

  if (prismGetError) {
    throw new DatabaseError();
  }

  if (!article) {
    throw new ArticleNotFoundError('Article not found');
  }

  const isAuthor = article.authorId === userId;
  const isAdmin = userRoles.includes('ADMIN');
  if (!isAuthor && !isAdmin) {
    throw new ForbiddenError(
      'You do not have permission to delete this article',
    );
  }

  const [prismError, deletedArticle] = await catchErrorTyped(
    prisma.article.delete({ where: { id: articleId } }),
  );

  if (prismError) {
    throw new DatabaseError();
  }

  return deletedArticle;
};

export const getArticles = async (query: {
  limit: number;
  offset: number;
  tag?: string;
  author?: string;
}) => {
  const { limit, offset, tag, author } = query;

  const where: Prisma.ArticleWhereInput = {};

  if (tag) {
    where.tags = { some: { name: tag } };
  }

  if (author) {
    where.author = { username: author };
  }

  const [articles, articlesCount] = await Promise.all([
    prisma.article.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true, bio: true, image: true } },
        tags: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    articlesCount,
  };
};
