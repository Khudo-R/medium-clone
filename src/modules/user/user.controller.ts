import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { registerSchema, loginSchema } from './user.schema';
import { createUser, loginUser } from './user.service';
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({ user });
};
