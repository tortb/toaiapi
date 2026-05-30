import type { JwtPayload, TokenPair, AuthConfig } from './types';
/**
 * Generate access token
 */
export declare function generateAccessToken(payload: JwtPayload, secret: string, expiresIn?: string): string;
/**
 * Generate refresh token
 */
export declare function generateRefreshToken(payload: JwtPayload, secret: string, expiresIn?: string): string;
/**
 * Generate token pair
 */
export declare function generateTokenPair(payload: JwtPayload, config: AuthConfig): TokenPair;
/**
 * Verify token
 */
export declare function verifyToken(token: string, secret: string): JwtPayload;
/**
 * Decode token without verification
 */
export declare function decodeToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map