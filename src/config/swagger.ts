import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Security Scheme
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// Common Schemas
const ErrorSchema = registry.register(
  'Error',
  z.object({
    error: z.string().openapi({ example: 'Something went wrong' }),
  }),
);

// User Schemas
const UserSchema = registry.register(
  'User',
  z.object({
    username: z.string().openapi({ example: 'johndoe' }),
    email: z.string().email().openapi({ example: 'john@example.com' }),
    token: z.string().optional().openapi({ example: 'eyJhbGciOiJIUzI1Ni...' }),
    bio: z.string().nullable().openapi({ example: 'I am a software engineer' }),
    image: z
      .string()
      .nullable()
      .openapi({ example: 'https://example.com/image.png' }),
  }),
);

const UserResponseSchema = registry.register(
  'UserResponse',
  z.object({
    user: UserSchema,
  }),
);

// Article Schemas
const ArticleSchema = registry.register(
  'Article',
  z.object({
    slug: z.string().openapi({ example: 'how-to-build-a-medium-clone' }),
    title: z.string().openapi({ example: 'How to Build a Medium Clone' }),
    description: z
      .string()
      .openapi({ example: 'A brief summary of the article' }),
    body: z.string().openapi({ example: 'The full content of the article' }),
    tagList: z.array(z.string()).openapi({ example: ['Node.js', 'Express'] }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: '2023-10-27T10:00:00Z' }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: '2023-10-27T10:00:00Z' }),
    author: UserSchema,
  }),
);

const ArticleResponseSchema = registry.register(
  'ArticleResponse',
  z.object({
    article: ArticleSchema,
  }),
);

// User Routes
registry.registerPath({
  method: 'post',
  path: '/users',
  summary: 'Register a new user',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            username: z.string().min(3),
            email: z.string().email(),
            password: z.string().min(6),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    400: {
      description: 'Invalid input',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/users/login',
  summary: 'Login an existing user',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(6),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/me',
  summary: 'Get current user information',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user details',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/update/{id}',
  summary: 'Update current user',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            username: z.string().optional(),
            email: z.string().email().optional(),
            password: z.string().min(6).optional(),
            bio: z.string().optional(),
            image: z.string().url().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
  },
});

// Article Routes
registry.registerPath({
  method: 'post',
  path: '/articles',
  summary: 'Create a new article',
  tags: ['Articles'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string().min(5),
            description: z.string().min(10),
            body: z.string().min(20),
            tags: z.array(z.string()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Article created successfully',
      content: { 'application/json': { schema: ArticleResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/articles/{slug}',
  summary: 'Get an article by slug',
  tags: ['Articles'],
  parameters: [
    {
      name: 'slug',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  ],
  responses: {
    200: {
      description: 'Article details',
      content: { 'application/json': { schema: ArticleResponseSchema } },
    },
    404: {
      description: 'Article not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/articles/update/{id}',
  summary: 'Update an article',
  tags: ['Articles'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            body: z.string().optional(),
            tags: z.array(z.string()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Article updated successfully',
      content: { 'application/json': { schema: ArticleResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/articles/{id}',
  summary: 'Delete an article',
  tags: ['Articles'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  ],
  responses: {
    204: {
      description: 'Article deleted successfully',
    },
  },
});

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Medium Clone API',
      version: '1.0.0',
      description: 'API documentation for the Medium Clone application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server',
      },
    ],
  });
};
