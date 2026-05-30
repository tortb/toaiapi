import jwt from 'jsonwebtoken';
import type { JwtPayload, TokenPair, AuthConfig } from './types';

/**
 * Generate access token
 */
export function generateAccessToken(payload: JwtPayload, secret: string, expiresIn = '15m'): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JwtPayload, secret: string, expiresIn = '7d'): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Generate token pair
 */
export function generateTokenPair(payload: JwtPayload, config: AuthConfig): TokenPair {
  return {
    accessToken: generateAccessToken(payload, config.jwtSecret, config.accessTokenExpiry),
    refreshToken: generateRefreshToken(payload, config.jwtRefreshSecret, config.refreshTokenExpiry),
  };
}

/**
 * Verify token
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

/**
 * Decode token without verification
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}
