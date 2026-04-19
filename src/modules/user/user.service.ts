import type { RegisterInput, LoginInput, UpdateUserInput } from './user.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@config/db';
import { env } from '@config/env';
import { catchErrorTyped } from '@utils/save-promise';
import { UserExistsError, InvalidCredentialsError } from './user.errors';

export const updateUserData = async (userId: string, data: UpdateUserInput) => {
  const [prismError, updatedUser] = await catchErrorTyped(
    prisma.user.update({
      where: { id: userId },
      data: { ...data },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        image: true,
        roles: true,
      },
    }),
  );
  if (prismError) {
    throw new Error('Database error');
  }
  return updatedUser;
};

export const createUser = async (data: RegisterInput) => {
  const [prismError, existingUser] = await catchErrorTyped(
    prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    }),
  );
  if (prismError) {
    throw new Error('Database error');
  }
  if (existingUser) {
    throw new UserExistsError(
      'User with this email or username already exists',
    );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const [createError, newUser] = await catchErrorTyped(
    prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        image: true,
        roles: true,
      },
    }),
  );
  if (createError) {
    throw new Error('Database error');
  }
  return newUser;
};

export const loginUser = async (data: LoginInput) => {
  const [prismError, user] = await catchErrorTyped(
    prisma.user.findUnique({
      where: { email: data.email },
    }),
  );

  if (prismError) {
    throw new Error('Database error');
  }

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const token = jwt.sign(
    { userId: user.id, roles: user.roles },
    env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );

  return {
    ...user,
    token,
  };
};

export const getCurrentLoggedInUser = async (userId: string) => {
  const [prismError, user] = await catchErrorTyped(
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        roles: true,
      },
    }),
  );
  if (prismError) {
    throw new Error('Database error');
  }
  return user;
};
