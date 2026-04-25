import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/db';

describe('User Module Integration Tests', () => {
  const testUser = {
    username: 'testuser_auth',
    email: 'auth_test@example.com',
    password: 'password123',
  };

  describe('POST /api/users - Registration', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/users').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 409 if user already exists', async () => {
      const res = await request(app).post('/api/users').send(testUser);
      expect(res.status).toBe(409);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app).post('/api/users').send({
        ...testUser,
        email: 'invalid-email',
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('email');
    });
  });

  describe('POST /api/users/login - Login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/me - Current User', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      token = res.body.user.token;
    });

    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe(testUser.username);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/update/:id - Update User', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      token = res.body.user.token;
      userId = res.body.user.id;
    });

    it('should update user bio and image', async () => {
      const updateData = {
        bio: 'New bio content',
        image: 'https://example.com/new-image.jpg',
      };

      const res = await request(app)
        .patch(`/api/users/update/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.user.bio).toBe(updateData.bio);
      expect(res.body.user.image).toBe(updateData.image);
    });
  });
});
