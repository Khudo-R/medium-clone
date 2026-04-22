# Swagger/OpenAPI Documentation Guide

This project uses `@asteasolutions/zod-to-openapi` to automatically generate OpenAPI 3.0 documentation from Zod schemas. 

## Core Principles

1.  **Zod-First**: Define your data structures using Zod.
2.  **OpenAPI Metadata**: Use the `.openapi()` extension to add descriptions and examples.
3.  **Central Registry**: All schemas and paths must be registered with the central `registry` imported from `@config/swagger`.

---

## Step 1: Updating Schemas (`*.schema.ts`)

Every schema intended for API use should have examples and be registered as a component.

### Example: Defining a Schema
```typescript
import { z } from 'zod';
import { registry } from '@config/swagger';

export const myResourceSchema = z.object({
  title: z.string().min(5).openapi({ example: 'My Resource Title' }),
  description: z.string().openapi({ example: 'A detailed description' }),
});

// Register the component for re-use in the documentation
registry.register('MyResource', myResourceSchema);
```

### Tips:
- Use `z.coerce` for query parameters (e.g., `z.coerce.number()`).
- Use `.partial()` for update (PATCH/PUT) schemas.
- Always provide an `example` for every field to make the Swagger UI interactive and helpful.

---

## Step 2: Registering Routes (`*.routes.ts`)

Routes must be registered with the OpenAPI registry to appear in the documentation.

### Example: Registering a Path
```typescript
import { registry } from '@config/swagger';
import { myResourceSchema, myParamSchema } from './my.schema';

registry.registerPath({
  method: 'post',
  path: '/api/my-resource/{id}',
  tags: ['My Category'],
  summary: 'Create or update a resource',
  security: [{ bearerAuth: [] }], // Only if protected
  request: {
    params: myParamSchema,
    body: {
      content: {
        'application/json': {
          schema: myResourceSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Success' },
    400: { description: 'Validation Error' },
    401: { description: 'Unauthorized' },
  },
});
```

### Constraints:
- **Paths**: Ensure path parameters in the URL (e.g., `{id}`) match the keys in the `params` Zod schema.
- **Tags**: Group related endpoints using the same tag (e.g., `['Articles']`, `['Users']`).
- **Security**: Reference `bearerAuth` for endpoints requiring a JWT.

---

## Step 3: Verification

After making changes, start the development server and visit:
- **UI**: `http://localhost:3000/api-docs`
- **JSON**: `http://localhost:3000/api-docs.json`

Check for:
- Correct parameter types (path vs query).
- Accurate response codes.
- Working examples in the "Try it out" section.
