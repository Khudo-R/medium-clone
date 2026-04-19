import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { registerSchema, loginSchema, updateUserSchema } from './user.schema';
import {
  createUser,
  loginUser,
  updateUserData,
  getCurrentLoggedInUser,
} from './user.service';
import { catchErrorTyped } from '@utils/save-promise';
import { formatZodErrors } from '@utils/zod-error-formatter';
import { UserExistsError } from './user.errors';
import { prisma } from '@config/db';

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const [zodError, validateData] = await catchErrorTyped(
    registerSchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [createError, newUser] = await catchErrorTyped(
    createUser(validateData.body),
    [UserExistsError],
  );

  if (createError) {
    res.status(409).json({ error: createError.message });
    return;
  }

  res.status(201).json({ user: newUser });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const [zodError, validateData] = await catchErrorTyped(
    loginSchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [loginError, user] = await catchErrorTyped(
    loginUser(validateData.body),
  );

  if (loginError) {
    res.status(401).json({ error: loginError.message });
    return;
  }

  res.status(200).json({ user });
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const [err, user] = await catchErrorTyped(getCurrentLoggedInUser(userId));
  if (err) {
    res.status(500).json({ error: 'Database error' });
    return;
  }
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({ user });
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const [zodError, validateData] = await catchErrorTyped(
    updateUserSchema.parseAsync(req),
    [ZodError],
  );

  if (zodError) {
    res.status(400).json({ errors: formatZodErrors(zodError) });
    return;
  }

  const [updateError, updatedUser] = await catchErrorTyped(
    updateUserData(userId, validateData.body),
  );

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.status(200).json({ user: updatedUser });
};
