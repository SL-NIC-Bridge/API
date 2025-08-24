import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors';


interface JwtPayload {
  userId: string;
  email: string;
}

// Safely extract environment variables as strings
const JWT_SECRET = process.env['JWT_SECRET'] || '';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || '';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }
};
