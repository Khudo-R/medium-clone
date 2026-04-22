import { Router } from 'express';
import {
  login,
  registerUser,
  getCurrentUser,
  updateCurrentUser,
} from './user.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  userIdParamSchema,
} from './user.schema';
import { registry } from '@config/swagger';

const router = Router();

registry.registerPath({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: { description: 'User registered successfully' },
    400: { description: 'Validation error' },
    409: { description: 'User already exists' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users/login',
  tags: ['Users'],
  summary: 'Login user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: { description: 'Login successful' },
    400: { description: 'Validation error' },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/me',
  tags: ['Users'],
  summary: 'Get current user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Current user retrieved successfully' },
    401: { description: 'Not authorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/users/update/{id}',
  tags: ['Users'],
  summary: 'Update current user',
  security: [{ bearerAuth: [] }],
  request: {
    params: userIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: updateUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: { description: 'User updated successfully' },
    400: { description: 'Validation error' },
    401: { description: 'Not authorized' },
    404: { description: 'User not found' },
  },
});

router.post('/', registerUser);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.patch('/update/:id', authMiddleware, updateCurrentUser);

export default router;
