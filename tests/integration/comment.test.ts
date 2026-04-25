import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/db';
import { signJwt } from '../../src/utils/jwt';

describe('Comment Module Integration Tests', () => {
  let testUserToken: string;
  let testUserId: string;
  let testArticleId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'comment_test@example.com',
        username: 'commenter',
        passwordHash: 'hashed',
      },
    });
    testUserId = user.id;
    testUserToken = signJwt({ userId: user.id, roles: ['USER'] });

    const article = await prisma.article.create({
      data: {
        title: 'Article for Comments',
        description: 'Test description',
        body: 'Test body content with enough length.',
        slug: 'article-for-comments',
        authorId: testUserId,
      },
    });
    testArticleId = article.id;
  });

  describe('POST /api/comments', () => {
    it('should create a comment successfully', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          body: 'This is a test comment',
          articleId: testArticleId,
        });

      expect(res.status).toBe(201);
      expect(res.body.comment).toHaveProperty('id');
      expect(res.body.comment.body).toBe('This is a test comment');
      expect(res.body.comment.authorId).toBe(testUserId);
      expect(res.body.comment.articleId).toBe(testArticleId);
    });

    it('should return 400 if body is empty', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          body: '',
          articleId: testArticleId,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('body');
    });

    it('should return 404 if article does not exist', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          body: 'Comment for non-existent article',
          articleId: '00000000-0000-0000-0000-000000000000',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/comments', () => {
    it('should get comments for an article', async () => {
      const res = await request(app)
        .get('/api/comments')
        .query({ articleId: testArticleId });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid articleId format', async () => {
      const res = await request(app)
        .get('/api/comments')
        .query({ articleId: 'invalid-uuid' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let commentId: string;

    beforeAll(async () => {
      const comment = await prisma.comment.create({
        data: {
          body: 'Comment to delete',
          authorId: testUserId,
          articleId: testArticleId,
        },
      });
      commentId = comment.id;
    });

    it('should delete a comment successfully', async () => {
      const res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Comment has been deleted');

      const deletedComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      expect(deletedComment).toBeNull();
    });

    it('should return 403 if user is not the author', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other_user@example.com',
          username: 'otheruser',
          passwordHash: 'hashed',
        },
      });
      const otherToken = signJwt({ userId: otherUser.id, roles: ['USER'] });

      const comment = await prisma.comment.create({
        data: {
          body: 'Not your comment',
          authorId: testUserId,
          articleId: testArticleId,
        },
      });

      const res = await request(app)
        .delete(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });
});
