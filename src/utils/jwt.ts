import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  roles: string[];
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'super-secret-fallback-key-for-dev';

export const signJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyJwt = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
