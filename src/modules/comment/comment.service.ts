import { prisma } from '@config/db';
import { ArticleNotFoundError } from '@modules/article/article.errors';
import { ForbiddenError, CommentNotFoundError } from './comment.errors';
import { UserRole } from '@modules/user/user.schema';
import { catchErrorTyped } from '@utils/save-promise';

export const createComment = async (
  authorId: string,
  articleId: string,
  body: string,
) => {
  const [error, article] = await catchErrorTyped(
    prisma.article.findUnique({
      where: { id: articleId },
    }),
  );

  if (error) {
    throw new Error('Failed to fetch article');
  }

  if (!article) {
    throw new ArticleNotFoundError('Article not found');
  }

  return prisma.comment.create({
    data: {
      body,
      author: {
        connect: { id: authorId },
      },
      article: {
        connect: { id: articleId },
      },
    },
    include: {
      author: {
        select: {
          username: true,
          image: true,
        },
      },
    },
  });
};

export const getComments = async (articleId: string) => {
  return prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          username: true,
          image: true,
        },
      },
    },
  });
};

export const deleteComment = async (
  commentId: string,
  userId: string,
  userRoles: UserRole[],
) => {
  const [error, comment] = await catchErrorTyped(
    prisma.comment.findUnique({
      where: { id: commentId },
    }),
  );
  if (error) {
    throw new Error('Failed to fetch comment');
  }

  if (!comment) {
    throw new CommentNotFoundError('Comment not found');
  }

  const isAuthor = comment.authorId === userId;
  const isAdmin = userRoles.includes('ADMIN');

  if (!isAuthor && !isAdmin) {
    throw new ForbiddenError(
      'You do not have permission to delete this comment',
    );
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
};
