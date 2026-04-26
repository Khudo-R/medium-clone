import { generateOpenApiDocument } from './config/swagger';
import type { Application } from 'express';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorHandler } from '@middleware/error.middleware';
import userRoutes from '@modules/user/user.routes';
import articleRoutes from '@modules/article/article.routes';
import commentRoutes from '@modules/comment/comment.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(generateOpenApiDocument()),
);
app.get('/api-docs.json', (_, res) => {
  res.json(generateOpenApiDocument());
});

app.get('/api/health-check', (_, res) => {
  res.status(200).json({ message: 'Server is healthy', status: 'success' });
});

app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);

app.use((_, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export default app;
