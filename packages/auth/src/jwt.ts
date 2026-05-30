import jwt from 'jsonwebtoken';
import type { JwtPayload, TokenPair, AuthConfig } from './types';

/**
 * Generate access token
 */
export function generateAccessToken(payload: JwtPayload, secret: string, expiresIn = '15m'): string {
  return jwt.sign(payload as object, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JwtPayload, secret: string, expiresIn = '7d'): string {
  return jwt.sign(payload as object, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

/**
 * Generate token pair
 */
export function generateTokenPair(payload: JwtPayload, config?: AuthConfig): TokenPair {
  const jwtSecret = config?.jwtSecret || process.env['JWT_SECRET'] || 'default-jwt-secret';
  const jwtRefreshSecret = config?.jwtRefreshSecret || process.env['JWT_REFRESH_SECRET'] || 'default-refresh-secret';
  const accessTokenExpiry = config?.accessTokenExpiry || '15m';
  const refreshTokenExpiry = config?.refreshTokenExpiry || '7d';

  return {
    accessToken: generateAccessToken(payload, jwtSecret, accessTokenExpiry),
    refreshToken: generateRefreshToken(payload, jwtRefreshSecret, refreshTokenExpiry),
  };
}

/**
 * Verify token
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as unknown as JwtPayload;
}

/**
 * Decode token without verification
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}
