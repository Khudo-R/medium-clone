import { Router } from 'express';
import {
  login,
  registerUser,
  getCurrentUser,
  updateCurrentUser,
} from './user.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.post('/', registerUser);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.patch('/update/:id', authMiddleware, updateCurrentUser);

export default router;
