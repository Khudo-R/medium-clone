import type { Application, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from '@modules/user/user.routes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/api/health-check', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is healthy', status: 'success' });
});

app.use('/api/users', userRoutes);

export default app;
