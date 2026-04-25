import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { signJwt } from '../../src/utils/jwt';
import { prisma } from '../../src/config/db';

describe('POST /api/articles - Article Creation', () => {
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
      },
    });
    testUserId = user.id;
    testUserToken = signJwt({ userId: user.id, roles: ['USER'] });
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).post('/api/articles').send({
      title: 'Test Article',
      description: 'This is a test article',
      body: 'Lorem ipsum dolor sit amet.',
    });

    expect(res.status).toBe(401);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        title: 'Test Article',
        // description is missing
        body: 'Lorem ipsum dolor sit amet.',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('description');
  });

  it('should create an article successfully', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        title: 'Test Article',
        description: 'This is a test article',
        body: 'Lorem ipsum dolor sit amet.',
      });

    expect(res.status).toBe(201);
    expect(res.body.article).toHaveProperty('id');
    expect(res.body.article.title).toBe('Test Article');
    expect(res.body.article.authorId).toBe(testUserId);
  });

  describe('GET /api/articles/:slug', () => {
    let slug: string;

    beforeAll(async () => {
      const article = await prisma.article.create({
        data: {
          title: 'Article to Fetch',
          description: 'A fetchable article',
          body: 'Content for the fetchable article.',
          slug: 'article-to-fetch',
          authorId: testUserId,
        },
      });
      slug = article.slug;
    });

    it('should fetch an article by slug', async () => {
      const res = await request(app).get(`/api/articles/${slug}`);

      expect(res.status).toBe(200);
      expect(res.body.article.slug).toBe(slug);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/articles/non-existent-slug');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/articles/:id', () => {
    let articleId: string;

    beforeAll(async () => {
      const article = await prisma.article.create({
        data: {
          title: 'Article to Update',
          description: 'Old description',
          body: 'Old body content for update.',
          slug: 'article-to-update',
          authorId: testUserId,
        },
      });
      articleId = article.id;
    });

    it('should update article successfully', async () => {
      const res = await request(app)
        .put(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.article.title).toBe('Updated Title');
    });

    it('should return 403 if not the author', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other_author@example.com',
          username: 'otherauthor',
          passwordHash: 'hashed',
        },
      });
      const otherToken = signJwt({ userId: otherUser.id, roles: ['USER'] });

      const res = await request(app)
        .put(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized update' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/articles/:id', () => {
    let articleId: string;

    beforeAll(async () => {
      const article = await prisma.article.create({
        data: {
          title: 'Article to Delete',
          description: 'To be deleted',
          body: 'Content for deletion test.',
          slug: 'article-to-delete',
          authorId: testUserId,
        },
      });
      articleId = article.id;
    });

    it('should delete an article successfully', async () => {
      const res = await request(app)
        .delete(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(204);

      const deletedArticle = await prisma.article.findUnique({
        where: { id: articleId },
      });
      expect(deletedArticle).toBeNull();
    });
  });

  describe('GET /api/articles - List Articles', () => {
    beforeAll(async () => {
      await prisma.article.createMany({
        data: [
          {
            title: 'List Article 1',
            description: 'Desc 1',
            body: 'Body content 1 with enough length.',
            slug: 'list-article-1',
            authorId: testUserId,
          },
          {
            title: 'List Article 2',
            description: 'Desc 2',
            body: 'Body content 2 with enough length.',
            slug: 'list-article-2',
            authorId: testUserId,
          },
        ],
      });
    });

    it('should return a list of articles with default pagination', async () => {
      const res = await request(app).get('/api/articles');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('articles');
      expect(res.body).toHaveProperty('articlesCount');
      expect(Array.isArray(res.body.articles)).toBe(true);
      expect(res.body.articlesCount).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit and offset query parameters', async () => {
      const res = await request(app).get('/api/articles?limit=1&offset=1');

      expect(res.status).toBe(200);
      expect(res.body.articles.length).toBe(1);
    });

    it('should filter articles by author', async () => {
      const res = await request(app).get(`/api/articles?author=testuser`);

      expect(res.status).toBe(200);
      expect(
        res.body.articles.every((a: any) => a.author.username === 'testuser'),
      ).toBe(true);
    });
  });
});
